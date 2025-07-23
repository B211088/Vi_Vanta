// middleware/validation.js
import { body, validationResult } from "express-validator";
import { ApiError } from "../utils/apiError.js";

// Validation cho appointment
export const validateAppointment = [
  body("doctorId")
    .notEmpty()
    .withMessage("ID bác sĩ là bắt buộc")
    .isMongoId()
    .withMessage("ID bác sĩ không hợp lệ"),

  body("date")
    .notEmpty()
    .withMessage("Ngày khám là bắt buộc")
    .isISO8601()
    .withMessage("Định dạng ngày không hợp lệ")
    .custom((value) => {
      const appointmentDate = new Date(value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (appointmentDate < today) {
        throw new Error("Không thể đặt lịch cho ngày đã qua");
      }

      // Không cho đặt quá xa (ví dụ: 3 tháng)
      const maxDate = new Date();
      maxDate.setMonth(maxDate.getMonth() + 3);

      if (appointmentDate > maxDate) {
        throw new Error("Không thể đặt lịch quá 3 tháng từ hôm nay");
      }

      return true;
    }),

  body("time")
    .notEmpty()
    .withMessage("Giờ khám là bắt buộc")
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage("Định dạng giờ không hợp lệ (HH:mm)"),

  body("services")
    .isArray({ min: 1 })
    .withMessage("Phải chọn ít nhất một dịch vụ"),

  body("services.*.name").notEmpty().withMessage("Tên dịch vụ là bắt buộc"),

  body("services.*.price").notEmpty().withMessage("Giá dịch vụ là bắt buộc"),

  body("paymentMethod")
    .isIn(["cash", "momo", "banking", "vnpay"])
    .withMessage("Phương thức thanh toán không hợp lệ"),

  body("note")
    .optional()
    .isLength({ max: 500 })
    .withMessage("Ghi chú không được quá 500 ký tự"),

  // Middleware xử lý lỗi validation
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errorMessages = errors.array().map((error) => error.msg);
      throw new ApiError(400, errorMessages.join(", "));
    }
    next();
  },
];

// Validation cho cập nhật trạng thái appointment
export const validateAppointmentStatus = [
  body("status")
    .isIn(["pending", "confirmed", "completed", "canceled"])
    .withMessage("Trạng thái không hợp lệ"),

  body("result")
    .optional()
    .isLength({ max: 1000 })
    .withMessage("Kết quả khám không được quá 1000 ký tự"),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errorMessages = errors.array().map((error) => error.msg);
      throw new ApiError(400, errorMessages.join(", "));
    }
    next();
  },
];

// Validation cho thanh toán
export const validatePayment = [
  body("paymentMethod")
    .isIn(["cash", "momo", "banking", "vnpay"])
    .withMessage("Phương thức thanh toán không hợp lệ"),

  body("amount")
    .optional()
    .isNumeric()
    .withMessage("Số tiền phải là số")
    .custom((value) => {
      if (value <= 0) {
        throw new Error("Số tiền phải lớn hơn 0");
      }
      return true;
    }),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errorMessages = errors.array().map((error) => error.msg);
      throw new ApiError(400, errorMessages.join(", "));
    }
    next();
  },
];

// middleware/auth.js
import jwt from "jsonwebtoken";
import { ApiError } from "../utils/apiError.js";
import User from "../models/User.js";

// Xác thực token
export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

    if (!token) {
      throw new ApiError(401, "Access token is required");
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      throw new ApiError(401, "Invalid token");
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      throw new ApiError(401, "Invalid token");
    }
    if (error.name === "TokenExpiredError") {
      throw new ApiError(401, "Token expired");
    }
    next(error);
  }
};

// Phân quyền
export const authorizeRoles = (roles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      throw new ApiError(401, "Authentication required");
    }

    if (roles.length && !roles.includes(req.user.role)) {
      throw new ApiError(403, "Insufficient permissions");
    }

    next();
  };
};

// utils/apiResponse.js
export class ApiResponse {
  constructor(statusCode, data, message = "Success") {
    this.statusCode = statusCode;
    this.data = data;
    this.message = message;
    this.success = statusCode < 400;
  }
}

// utils/apiError.js
export class ApiError extends Error {
  constructor(statusCode, message, errors = [], stack = "") {
    super(message);
    this.statusCode = statusCode;
    this.data = null;
    this.success = false;
    this.errors = errors;

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

// utils/asyncHandler.js
export const asyncHandler = (requestHandler) => {
  return (req, res, next) => {
    Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err));
  };
};

// middleware/errorHandler.js
import { ApiError } from "../utils/apiError.js";

export const errorHandler = (error, req, res, next) => {
  let err = error;

  // Mongoose bad ObjectId
  if (error.name === "CastError") {
    const message = "Resource not found";
    err = new ApiError(404, message);
  }

  // Mongoose duplicate key
  if (error.code === 11000) {
    const message = "Duplicate field value entered";
    err = new ApiError(400, message);
  }

  // Mongoose validation error
  if (error.name === "ValidationError") {
    const message = Object.values(error.errors).map((val) => val.message);
    err = new ApiError(400, message.join(", "));
  }

  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Server Error",
    errors: err.errors || [],
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

// Cron job cho nhắc nhở lịch khám
// utils/scheduler.js
import cron from "node-cron";
import Appointment from "../models/Appointment.js";
import { notificationService } from "../services/notificationService.js";

// Chạy mỗi giờ để kiểm tra lịch khám cần nhắc nhở
export const scheduleAppointmentReminders = () => {
  cron.schedule("0 * * * *", async () => {
    try {
      console.log("Checking for appointment reminders...");

      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);

      const dayAfterTomorrow = new Date(tomorrow);
      dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1);

      // Lấy các lịch khám ngày mai chưa gửi reminder
      const appointments = await Appointment.find({
        date: {
          $gte: tomorrow,
          $lt: dayAfterTomorrow,
        },
        status: { $in: ["confirmed", "pending"] },
        reminderSent: { $ne: true },
      }).populate("userId", "name");

      for (const appointment of appointments) {
        await notificationService.sendAppointmentReminder(appointment);

        // Đánh dấu đã gửi reminder
        appointment.reminderSent = true;
        await appointment.save();
      }

      console.log(`Sent ${appointments.length} appointment reminders`);
    } catch (error) {
      console.error("Error in appointment reminder scheduler:", error);
    }
  });
};

// utils/dateUtils.js
export const formatDate = (date, locale = "vi-VN") => {
  return new Date(date).toLocaleDateString(locale);
};

export const formatTime = (time) => {
  return time;
};

export const formatDateTime = (date, time, locale = "vi-VN") => {
  return `${formatTime(time)} ${formatDate(date, locale)}`;
};

export const isValidTimeSlot = (time) => {
  const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
  return timeRegex.test(time);
};

export const getTimeSlots = (startTime, endTime, duration = 15) => {
  const slots = [];
  const start = new Date(`2000-01-01T${startTime}:00`);
  const end = new Date(`2000-01-01T${endTime}:00`);

  let current = new Date(start);

  while (current < end) {
    const timeStr = current.toTimeString().substring(0, 5);
    slots.push({
      startTime: timeStr,
      endTime: new Date(current.getTime() + duration * 60000)
        .toTimeString()
        .substring(0, 5),
      isAvailable: true,
    });

    current.setMinutes(current.getMinutes() + duration);
  }

  return slots;
};

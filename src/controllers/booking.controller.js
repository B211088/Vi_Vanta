// controllers/booking.controller.js
import Appointment from "../models/appointment.model.js";
import Doctor from "../models/doctor.model.js";
import User from "../models/user.model.js";
import Payment from "../models/payment.model.js";
import PaymentService from "../services/payment.service.js";
import BookingAppointmentService from "../services/booking.service.js";
import mongoose from "mongoose";
import { ApiError } from "../utils/ApiResponse.js";
import Notification from "../models/notification.model.js";
import { notificationService } from "../services/notifycation.service.js";
import { formatDateDDMMYY } from "../utils/formatDate.js";
const paymentService = new PaymentService();
const bookingAppointmentService = new BookingAppointmentService();
export const getDoctorSlots = async (req, res) => {
  const { doctorId } = req.params;
  const { date, type = "all" } = req.query;

  if (!date) {
    throw new ApiError(400, "Vui lòng cung cấp ngày cần kiểm tra");
  }

  const queryDate = new Date(date);
  if (isNaN(queryDate.getTime())) {
    throw new ApiError(400, "Định dạng ngày không hợp lệ");
  }

  let result;

  switch (type) {
    case "available":
      result = await bookingAppointmentService.getDoctorAvailableSlots(
        doctorId,
        queryDate
      );
      break;
    case "all":
    default:
      result = await bookingAppointmentService.getDoctorAllSlots(
        doctorId,
        queryDate
      );
      break;
  }

  res.json({
    success: true,
    data: result,
    message: "Lấy thông tin lịch khám thành công",
  });
};
// Lấy slot trống của bác sĩ theo ngày
export const getDoctorAvailableSlots = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng cung cấp ngày cần kiểm tra",
      });
    }

    // Kiểm tra doctor tồn tại
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy bác sĩ",
      });
    }

    // Lấy lịch làm việc của bác sĩ
    const dayOfWeek = new Date(date).getDay();
    const schedule = doctor.schedule.find((s) => s.dayOfWeek === dayOfWeek);

    if (!schedule || !schedule.isAvailable) {
      return res.status(200).json({
        success: true,
        data: {
          availableSlots: [],
          message: "Bác sĩ không làm việc trong ngày này",
        },
      });
    }

    // Lấy các appointment đã đặt trong ngày
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const bookedAppointments = await Appointment.find({
      doctorId,
      date: {
        $gte: startOfDay,
        $lte: endOfDay,
      },
      status: { $ne: "canceled" },
    }).select("time");

    // Tạo danh sách slot có sẵn
    const allSlots = generateTimeSlots(
      schedule.startTime,
      schedule.endTime,
      15
    ); // 15 phút/slot
    const bookedTimes = bookedAppointments.map((apt) => apt.time);
    const availableSlots = allSlots.filter(
      (slot) => !bookedTimes.includes(slot)
    );

    res.status(200).json({
      success: true,
      data: {
        availableSlots,
        schedule: {
          startTime: schedule.startTime,
          endTime: schedule.endTime,
          breakTime: schedule.breakTime,
        },
      },
    });
  } catch (error) {
    console.error("Error getting available slots:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi lấy slot trống",
    });
  }
};

// Tạo appointment mới
export const createAppointment = async (req, res) => {
  try {
    const {
      doctorId,
      date,
      timeSlots,
      services,
      patientInfo,
      // Không cần paymentMethod ở đây nữa
    } = req.body;

    const userId = req.user.userId;

    // Validate timeSlots
    if (!timeSlots || !timeSlots.startTime || !timeSlots.endTime) {
      return res.status(400).json({
        success: false,
        message: "Thông tin thời gian không hợp lệ",
      });
    }

    const appointmentData = {
      userId,
      doctorId,
      date,
      timeSlots: {
        startTime: timeSlots.startTime,
        endTime: timeSlots.endTime,
      },
      services,
      patientInfo,
      paymentStatus: "unpaid",
      status: "pending",
    };

    const appointment = await bookingAppointmentService.createAppointment(
      appointmentData
    );

    res.status(201).json({
      success: true,
      message: "Đặt lịch thành công. Vui lòng thanh toán để xác nhận.",
      data: {
        appointment,
        nextStep: "payment", // Cho frontend biết bước tiếp theo
        paymentRequired: true,
      },
    });
  } catch (error) {
    console.error("Error creating appointment:", error);

    if (error instanceof ApiError) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    }

    res.status(500).json({
      success: false,
      message: "Lỗi server khi tạo lịch khám",
    });
  }
};

// Lấy thông tin appointment theo ID
export const getAppointmentById = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const userId = req.user.userId;
    const userRole = req.user.role;

    const appointment = await Appointment.findById(appointmentId)
      .populate({
        path: "doctorId",
        select: "name specialty infoClinic consultationFee userId",
        populate: {
          path: "userId",
          select: "avatar",
        },
      })
      .populate("userId", "fullName phone email");

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy lịch khám",
      });
    }

    // Kiểm tra quyền truy cập
    if (
      userRole !== "admin" &&
      appointment.userId._id.toString() !== userId &&
      appointment.doctorId._id.toString() !== userId
    ) {
      return res.status(403).json({
        success: false,
        message: "Không có quyền truy cập lịch khám này",
      });
    }

    res.status(200).json({
      success: true,
      data: appointment,
    });
  } catch (error) {
    console.error("Error getting appointment:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi lấy thông tin lịch khám",
    });
  }
};

// Cập nhật trạng thái appointment
export const updateAppointmentPaymentStatus = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const { paymentStatus, doctorId } = req.body;

    const validStatuses = ["unpaid", "paid"];
    if (!validStatuses.includes(paymentStatus)) {
      return res.status(400).json({
        success: false,
        message: "Trạng thái không hợp lệ",
      });
    }

    const appointment =
      await bookingAppointmentService.updateAppointmentPaymentStatus(
        appointmentId,
        paymentStatus,
        doctorId
      );

    res.status(200).json({
      success: true,
      message: "Cập nhật trạng thái thành công",
      data: appointment,
    });
  } catch (error) {
    console.error("Error updating appointment status:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi cập nhật trạng thái",
    });
  }
};

export const updateAppointmentStatus = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const { status, note, cancelReason } = req.body;

    const validStatuses = [
      "pending",
      "confirmed",
      "in-progress",
      "completed",
      "canceled",
    ];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Trạng thái không hợp lệ",
      });
    }

    const appointment = await Appointment.findById(appointmentId)
      .populate("services")
      .populate({
        path: "doctorId",
        select: "name specialty infoClinic rate",
        populate: {
          path: "infoClinic.address.wardId infoClinic.address.districtId infoClinic.address.provinceId",
          select: "name",
        },
      });
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy lịch khám",
      });
    }

    appointment.status = status;
    if (note) appointment.note = note;
    if (status === "confirmed") {
      notificationService.createNotification({
        userId: appointment.userId,
        title: "Thông báo đặt khám!",
        message: `Lịch khám của bạn với bác sĩ ${
          appointment.doctorId.name
        } đã được bác sĩ xác nhận, thời gian khám lúc: ${
          appointment.timeSlots.startTime
        } -  ${appointment.timeSlots.endTime}, Ngày: ${formatDateDDMMYY(
          appointment.date
        )} vui lòng đến trước 30 phút!`,
        type: "appointment",
      });
    }

    if (status === "completed") {
      appointment.completedAt = new Date();
      notificationService.createNotification({
        userId: appointment.userId,
        title: "Thông báo lịch khám!",
        message: `Lịch khám của bạn với bác sĩ ${appointment.doctorId.name} đã hoàn thành!`,
        type: "appointment",
      });
    }

    if (status === "canceled") {
      appointment.cancelReason = cancelReason;
      notificationService.createNotification({
        userId: appointment.userId,
        title: "Thông báo lịch khám!",
        message: `Lịch khám của bạn đã bị hủy!`,
        type: "appointment",
      });
    }

    await appointment.save();

    res.status(200).json({
      success: true,
      message: "Cập nhật trạng thái thành công",
      data: appointment,
    });
  } catch (error) {
    console.error("Error updating appointment status:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi cập nhật trạng thái",
    });
  }
};

// Hủy appointment
export const cancelAppointment = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { appointmentId } = req.params;
    const userId = req.user.userId;
    const { reason } = req.body;

    const appointment = await Appointment.findById(appointmentId).session(
      session
    );
    if (!appointment) {
      throw new ApiError(404, "Không tìm thấy lịch khám");
    }

    // Kiểm tra quyền hủy
    if (appointment.userId.toString() !== userId && req.user.role !== "admin") {
      throw new ApiError(403, "Không có quyền hủy lịch khám này");
    }

    // Kiểm tra thời gian hủy (ví dụ: phải hủy trước 2 giờ)
    const appointmentDateTime = new Date(appointment.date);
    const [hours, minutes] = appointment.time.split(":");
    appointmentDateTime.setHours(parseInt(hours), parseInt(minutes));

    const now = new Date();
    const timeDiff = appointmentDateTime.getTime() - now.getTime();
    const hoursDiff = timeDiff / (1000 * 3600);

    if (hoursDiff < 2) {
      throw new ApiError(400, "Không thể hủy lịch khám trong vòng 2 giờ tới");
    }

    // Cập nhật trạng thái
    appointment.status = "canceled";
    appointment.canceledAt = new Date();
    appointment.cancelReason = reason;
    await appointment.save({ session });

    // Xử lý hoàn tiền nếu đã thanh toán
    if (appointment.paymentStatus === "paid") {
      const payment = await Payment.findOne({ appointmentId }).session(session);
      if (payment) {
        await paymentService.refundPayment(
          payment._id,
          reason || "Hủy lịch khám"
        );
      }
    }

    await session.commitTransaction();

    res.status(200).json({
      success: true,
      message: "Hủy lịch khám thành công",
      data: appointment,
    });
  } catch (error) {
    await session.abortTransaction();

    if (error instanceof ApiError) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    }

    console.error("Error canceling appointment:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi hủy lịch khám",
    });
  } finally {
    session.endSession();
  }
};

// Lấy danh sách appointment của user
export const getUserAppointments = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { page = 1, limit = 10, status, startDate, endDate } = req.query;

    // Kiểm tra quyền truy cập

    const skip = (page - 1) * limit;
    const filter = { userId };

    // Thêm filter theo status
    if (status) {
      filter.status = status;
    }

    // Thêm filter theo ngày
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }

    const appointments = await bookingAppointmentService.getUserAppointments(
      userId,
      page,
      limit,
      { status, startDate, endDate }
    );
    res.status(200).json({
      success: true,
      data: appointments,
    });
  } catch (error) {
    console.error("Error getting user appointments:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi lấy danh sách lịch khám",
    });
  }
};

// Lấy danh sách appointment của doctor
export const getDoctorAppointments = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { page = 1, limit = 10, status, date } = req.query;

    const skip = (page - 1) * limit;
    const filter = { doctorId };

    // Thêm filter theo status
    if (status) {
      filter.status = status;
    }

    // Thêm filter theo ngày
    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      filter.date = {
        $gte: startOfDay,
        $lte: endOfDay,
      };
    }

    const [appointments, total] = await Promise.all([
      Appointment.find(filter)
        .populate("userId", "fullName phone email avatar")
        .populate("services")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Appointment.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: {
        appointments,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total,
        },
      },
    });
  } catch (error) {
    console.error("Error getting doctor appointments:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi lấy danh sách lịch khám",
    });
  }
};
function calculateTotalFee(appointment) {
  let total = 0;

  // Phí khám của bác sĩ
  if (appointment.doctorId?.consultationFee) {
    total += appointment.doctorId.consultationFee;
  }

  // Phí dịch vụ
  if (appointment.services?.length > 0) {
    total += appointment.services.reduce(
      (sum, service) => sum + (service.price || 0),
      0
    );
  }

  return total;
}

export const getPaymentInfo = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const userId = req.user.userId;

    const appointment = await Appointment.findById(appointmentId)
      .populate("services", "name price")
      .populate("doctorId", "name consultationFee");

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy lịch khám",
      });
    }

    if (appointment.userId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "Không có quyền truy cập",
      });
    }

    const totalFee = calculateTotalFee(appointment);

    res.status(200).json({
      success: true,
      data: {
        appointmentId,
        totalFee,
        breakdown: {
          consultationFee: appointment.doctorId?.consultationFee || 0,
          services:
            appointment.services?.map((s) => ({
              name: s.name,
              price: s.price,
            })) || [],
        },
        paymentStatus: appointment.paymentStatus,
        paymentMethods: ["cash", "vnpay", "momo", "banking"], // Available methods
      },
    });
  } catch (error) {
    console.error("Error getting payment info:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi lấy thông tin thanh toán",
    });
  }
};
// Xử lý thanh toán
export const processPayment = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const { paymentMethod } = req.body; // Chỉ cần paymentMethod
    const userId = req.user.userId;
    const ip = req.ip;

    // Lấy thông tin appointment để tính amount
    const appointment = await Appointment.findById(appointmentId)
      .populate("services")
      .populate("doctorId");

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy lịch khám",
      });
    }

    // Kiểm tra quyền
    if (appointment.userId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "Không có quyền thanh toán cho lịch khám này",
      });
    }

    // Kiểm tra trạng thái
    if (appointment.paymentStatus === "paid") {
      return res.status(400).json({
        success: false,
        message: "Lịch khám đã được thanh toán",
      });
    }

    // Tính amount từ appointment (không cần client gửi)
    const amount = appointment.totalFee || calculateTotalFee(appointment);

    const payment = await paymentService.processPayment({
      appointmentId,
      userId,
      doctorId: appointment.doctorId,
      paymentMethod,
      amount, // Server tự tính
      clientIp: ip,
    });

    res.status(200).json({
      success: true,
      message:
        paymentMethod === "cash"
          ? "Đặt lịch thành công. Vui lòng thanh toán tại phòng khám."
          : "Vui lòng hoàn tất thanh toán.",
      data: payment,
    });
  } catch (error) {
    if (error instanceof ApiError) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    }

    console.error("Error processing payment:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi xử lý thanh toán",
    });
  }
};
export const vnpayReturnHandler = async (req, res) => {
  try {
    // Lấy toàn bộ tham số VNPay gửi về từ query string
    const vnp_Params = { ...req.query };

    const result = await paymentService.handleVNPayReturn(vnp_Params);

    if (result.success) {
      return res.status(200).json({
        success: true,
        message: result.message,
        data: {
          transactionId: result.transactionId,
          payment: result.payment,
        },
      });
    } else {
      return res.status(400).json({
        success: false,
        message: result.message,
        responseCode: result.responseCode,
        transactionId: result.transactionId,
      });
    }
  } catch (error) {
    console.error("VNPay return controller error:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi xử lý phản hồi từ VNPay",
    });
  }
};

// Lấy lịch sử thanh toán
export const getPaymentHistory = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    // Kiểm tra quyền truy cập
    if (req.user.userId !== userId && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Không có quyền truy cập",
      });
    }

    const paymentHistory = await paymentService.getPaymentHistory(
      userId,
      parseInt(page),
      parseInt(limit)
    );

    res.status(200).json({
      success: true,
      data: paymentHistory,
    });
  } catch (error) {
    console.error("Error getting payment history:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi lấy lịch sử thanh toán",
    });
  }
};

// Helper function: Tạo time slots
function generateTimeSlots(startTime, endTime, intervalMinutes) {
  const slots = [];
  const start = new Date(`2000-01-01 ${startTime}`);
  const end = new Date(`2000-01-01 ${endTime}`);

  let current = new Date(start);

  while (current < end) {
    const timeString = current.toTimeString().slice(0, 5);
    slots.push(timeString);
    current.setMinutes(current.getMinutes() + intervalMinutes);
  }

  return slots;
}

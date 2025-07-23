// controllers/bookingController.js

import { ApiError, ApiResponse } from "../middlewares/booking.validation.js";
import { bookingService } from "../services/booking.service.js";
import { paymentService } from "../services/payment.service.js";

// Lấy slot trống của bác sĩ theo ngày
export const getDoctorAvailableSlots = async (req, res, next) => {
  try {
    const { doctorId } = req.params;
    const { date } = req.query;

    if (!date) {
      throw new ApiError(400, "Ngày khám là bắt buộc");
    }

    const availableSlots = await bookingService.getDoctorAvailableSlots(
      doctorId,
      new Date(date)
    );

    res.json(new ApiResponse(200, availableSlots, "Lấy slot trống thành công"));
  } catch (error) {
    next(error);
  }
};

// Tạo appointment mới
export const createAppointment = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const appointmentData = {
      ...req.body,
      userId,
    };

    const appointment = await bookingService.createAppointment(appointmentData);

    // Gửi notification
    await notificationService.createNotification({
      userId,
      title: "Đặt lịch thành công",
      message: `Bạn đã đặt lịch khám với bác sĩ thành công cho ngày ${appointment.date}`,
      type: "appointment",
      relatedId: appointment._id,
      relatedModel: "Appointment",
    });

    res
      .status(201)
      .json(new ApiResponse(201, appointment, "Đặt lịch thành công"));
  } catch (error) {
    next(error);
  }
};

// Lấy thông tin appointment
export const getAppointmentById = async (req, res, next) => {
  try {
    const { appointmentId } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    const appointment = await bookingService.getAppointmentById(
      appointmentId,
      userId,
      userRole
    );

    res.json(new ApiResponse(200, appointment, "Lấy thông tin thành công"));
  } catch (error) {
    next(error);
  }
};

// Cập nhật trạng thái appointment
export const updateAppointmentStatus = async (req, res, next) => {
  try {
    const { appointmentId } = req.params;
    const { status, result } = req.body;
    const doctorId = req.user.doctorId;

    const updatedAppointment = await bookingService.updateAppointmentStatus(
      appointmentId,
      status,
      result,
      doctorId
    );

    // Gửi notification cho user
    await notificationService.createNotification({
      userId: updatedAppointment.userId,
      title: "Cập nhật lịch khám",
      message: `Trạng thái lịch khám của bạn đã được cập nhật: ${status}`,
      type: "appointment",
      relatedId: appointmentId,
      relatedModel: "Appointment",
    });

    res.json(
      new ApiResponse(200, updatedAppointment, "Cập nhật trạng thái thành công")
    );
  } catch (error) {
    next(error);
  }
};

// Hủy appointment
export const cancelAppointment = async (req, res, next) => {
  try {
    const { appointmentId } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    const canceledAppointment = await bookingService.cancelAppointment(
      appointmentId,
      userId,
      userRole
    );

    res.json(
      new ApiResponse(200, canceledAppointment, "Hủy lịch khám thành công")
    );
  } catch (error) {
    next(error);
  }
};

// Lấy danh sách appointment của user
export const getUserAppointments = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 10, status, startDate, endDate } = req.query;

    // Kiểm tra quyền truy cập
    if (req.user.id !== userId && req.user.role !== "admin") {
      throw new ApiError(403, "Không có quyền truy cập");
    }

    const filters = { status, startDate, endDate };
    const appointments = await bookingService.getUserAppointments(
      userId,
      parseInt(page),
      parseInt(limit),
      filters
    );

    res.json(new ApiResponse(200, appointments, "Lấy danh sách thành công"));
  } catch (error) {
    next(error);
  }
};

// Lấy danh sách appointment của doctor
export const getDoctorAppointments = async (req, res, next) => {
  try {
    const { doctorId } = req.params;
    const { page = 1, limit = 10, status, date } = req.query;

    // Kiểm tra quyền truy cập
    if (req.user.doctorId !== doctorId && req.user.role !== "admin") {
      throw new ApiError(403, "Không có quyền truy cập");
    }

    const filters = { status, date };
    const appointments = await bookingService.getDoctorAppointments(
      doctorId,
      parseInt(page),
      parseInt(limit),
      filters
    );

    res.json(new ApiResponse(200, appointments, "Lấy danh sách thành công"));
  } catch (error) {
    next(error);
  }
};

// Xác nhận thanh toán
export const confirmPayment = async (req, res, next) => {
  try {
    const { appointmentId } = req.params;
    const { paymentMethod, amount } = req.body;
    const userId = req.user.id;

    const payment = await paymentService.processPayment({
      appointmentId,
      userId,
      paymentMethod,
      amount,
    });

    res.json(new ApiResponse(200, payment, "Thanh toán thành công"));
  } catch (error) {
    next(error);
  }
};

// Lịch sử thanh toán
export const getPaymentHistory = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    // Kiểm tra quyền truy cập
    if (req.user.id !== userId && req.user.role !== "admin") {
      throw new ApiError(403, "Không có quyền truy cập");
    }

    const payments = await paymentService.getPaymentHistory(
      userId,
      parseInt(page),
      parseInt(limit)
    );

    res.json(
      new ApiResponse(200, payments, "Lấy lịch sử thanh toán thành công")
    );
  } catch (error) {
    next(error);
  }
};

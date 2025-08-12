import mongoose from "mongoose";
import Doctor from "../models/doctor.model.js";
import WorkingHour from "../models/workingHour.model.js";
import Appointment from "../models/appointment.model.js";
import { ApiError } from "../utils/ApiResponse.js";
import BookingService from "../models/bookingService.model.js";
import { EXPIRE_MINUTES } from "../config/appointment.config.js";
import { notificationService } from "./notifycation.service.js";

class BookingAppointmentService {
  async getDoctorAllSlots(doctorId, date) {
    try {
      const doctor = await Doctor.findById(doctorId);
      if (!doctor) {
        throw new ApiError(404, "Không tìm thấy bác sĩ");
      }

      const dayOfWeek = date.getDay();
      const currentDate = new Date(date);
      currentDate.setHours(0, 0, 0, 0);

      // Lấy lịch làm việc hợp lệ
      const workingHour = await WorkingHour.findOne({
        doctorId,
        dayOfWeek,
        isActive: true,
        startDate: { $lte: currentDate },
        endDate: { $gte: currentDate },
      });

      if (!workingHour) {
        return {
          date: currentDate,
          doctorId,
          dayOfWeek,
          hasWorkingHours: false,
          totalSlots: 0,
          availableSlots: [],
          bookedSlots: [],
          message: "Bác sĩ không có lịch làm việc trong ngày này",
        };
      }

      const startOfDay = new Date(currentDate);
      const endOfDay = new Date(currentDate);
      endOfDay.setHours(23, 59, 59, 999);

      // Lấy các appointment đã đặt trong ngày
      const appointments = await Appointment.find({
        doctorId,
        date: { $gte: startOfDay, $lte: endOfDay },
        status: { $in: ["pending", "confirmed", "in-progress"] },
      })
        .populate("userId", "fullName phone email")
        .populate("services", "name price");

      // Tạo map các slot đã được đặt với thông tin chi tiết
      const bookedSlotsMap = new Map();
      appointments.forEach((appt) => {
        bookedSlotsMap.set(appt.timeSlots.startTime, {
          appointmentId: appt._id,
          startTime: appt.timeSlots.startTime,
          endTime: appt.timeSlots.endTime,
          patientName: appt.patientInfo.fullName,
          patientPhone: appt.patientInfo.phone,
          status: appt.status,
          services: appt.services,
          totalFee: appt.totalFee,
          paymentStatus: appt.paymentStatus,
          bookingUser: appt.userId,
          isOtherUser: appt.patientInfo.isOtherUser,
        });
      });

      // Phân loại các time slots
      const availableSlots = [];
      const bookedSlots = [];
      const unavailableSlots = [];

      workingHour.timeSlots.forEach((slot) => {
        const slotInfo = {
          startTime: slot.startTime,
          endTime: slot.endTime,
          isAvailable: slot.isAvailable,
        };

        if (!slot.isAvailable) {
          // Slot bị vô hiệu hóa bởi bác sĩ
          unavailableSlots.push({
            ...slotInfo,
            reason: "Bác sĩ không khả dụng trong khung giờ này",
          });
        } else if (bookedSlotsMap.has(slot.startTime)) {
          // Slot đã được đặt
          bookedSlots.push({
            ...slotInfo,
            ...bookedSlotsMap.get(slot.startTime),
            reason: "Đã có bệnh nhân đặt lịch",
          });
        } else {
          // Slot khả dụng
          availableSlots.push(slotInfo);
        }
      });

      return {
        date: currentDate,
        doctorId,
        doctorInfo: {
          name: doctor.fullName,
          specialization: doctor.specialization,
          department: doctor.department,
        },
        dayOfWeek,
        hasWorkingHours: true,
        totalSlots: workingHour.timeSlots.length,
        availableCount: availableSlots.length,
        bookedCount: bookedSlots.length,
        unavailableCount: unavailableSlots.length,
        availableSlots,
        bookedSlots,
        unavailableSlots,
        workingHourInfo: {
          startDate: workingHour.startDate,
          endDate: workingHour.endDate,
          isActive: workingHour.isActive,
        },
      };
    } catch (error) {
      throw new ApiError(
        500,
        `Lỗi khi lấy thông tin lịch khám: ${error.message}`
      );
    }
  }
  // Lấy slot trống của bác sĩ theo ngày
  async getDoctorAvailableSlots(doctorId, date) {
    const result = await this.getDoctorAllSlots(doctorId, date);
    return result.availableSlots;
  }
  // Tạo appointment mới
  async createAppointment(appointmentData) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const {
        userId,
        doctorId,
        date,
        timeSlots,
        services,
        patientInfo,
        paymentMethod = "cash",
      } = appointmentData;

      // Kiểm tra doctor tồn tại
      const doctor = await Doctor.findById(doctorId).session(session);
      if (!doctor) {
        throw new ApiError(404, "Không tìm thấy bác sĩ");
      }

      // Kiểm tra slot còn trống
      const existingAppointment = await Appointment.findOne({
        doctorId,
        date: new Date(date),
        "timeSlots.startTime": timeSlots.startTime,
        "timeSlots.endTime": timeSlots.endTime,
        status: { $ne: "canceled" },
      }).session(session);

      if (existingAppointment) {
        throw new ApiError(400, "Slot thời gian này đã được đặt");
      }

      // Tính tổng phí
      let totalFee = 0;
      let serviceDetails = [];

      if (services && services.length > 0) {
        // Lấy thông tin chi tiết các dịch vụ
        const servicePromises = services.map((serviceId) =>
          BookingService.findById(serviceId).session(session)
        );
        serviceDetails = await Promise.all(servicePromises);

        // Kiểm tra tất cả services có tồn tại không
        if (serviceDetails.some((service) => !service)) {
          throw new ApiError(404, "Một hoặc nhiều dịch vụ không tồn tại");
        }

        // Tính tổng phí
        totalFee = serviceDetails.reduce(
          (sum, service) => sum + (service.price || 0),
          0
        );
      } else {
        totalFee = doctor.consultationFee || 200000; // Phí mặc định
      }

      notificationService.createNotification({
        userId: doctor.userId,
        title: "Thông báo đặt khám!",
        message: `Bạn có một lịch khám mới với bệnh nhân ${patientInfo.fullName}, sdt: ${patientInfo.phone} vui lòng xác nhận lịch khám`,
        type: "appointment",
      });

      // Tạo appointment
      const appointment = new Appointment({
        userId,
        doctorId,
        date: new Date(date),
        timeSlots: {
          startTime: timeSlots.startTime,
          endTime: timeSlots.endTime,
          isAvailable: false,
        },
        services: services || [],
        patientInfo: {
          fullName: patientInfo.fullName,
          phone: patientInfo.phone,
          email: patientInfo.email,
          gender: patientInfo.gender,
          dateOfBirth: new Date(patientInfo.dateOfBirth),
          address: patientInfo.address || "",
          reason: patientInfo.reason || "",
          patientType: patientInfo.patientType || "benhNhanMoi",
          zalo: patientInfo.zalo || "",
          isOtherUser: patientInfo.isOtherUser || false,
        },
        totalFee,
        paymentMethod,
        paymentStatus: "unpaid",
        status: "pending",
        paymentExpireAt: new Date(Date.now() + EXPIRE_MINUTES * 60 * 1000),
      });

      await appointment.save({ session });

      // Populate thông tin để trả về
      await appointment.populate([
        {
          path: "doctorId",
          select: "name specialty infoClinic consultationFee userId",
          populate: {
            path: "userId",
            select: "avatar",
          },
        },
        {
          path: "services",
          select: "name price description duration",
        },
        {
          path: "userId",
          select: "fullName phone email",
        },
        {
          path: "doctorId",
          select: "name specialty infoClinic rate avatar",
          populate: {
            path: "infoClinic.address.wardId infoClinic.address.districtId infoClinic.address.provinceId",
            select: "name",
          },
        },
      ]);

      await session.commitTransaction();
      return appointment;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  // Lấy thông tin appointment
  async getAppointmentById(appointmentId, userId, userRole) {
    const appointment = await Appointment.findById(appointmentId)
      .populate("doctorId", "name specialty infoClinic rate")
      .populate("userId", "name phone email");

    if (!appointment) {
      throw new ApiError(404, "Không tìm thấy lịch khám");
    }

    // Kiểm tra quyền truy cập
    if (
      userRole !== "admin" &&
      appointment.userId._id.toString() !== userId &&
      appointment.doctorId.userId.toString() !== userId
    ) {
      throw new ApiError(403, "Không có quyền truy cập");
    }

    return appointment;
  }

  // Cập nhật trạng thái appointment
  async updateAppointmentStatus(appointmentId, status, result, doctorId) {
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      throw new ApiError(404, "Không tìm thấy lịch khám");
    }

    // Kiểm tra quyền (chỉ bác sĩ của appointment mới được cập nhật)
    if (appointment.doctorId.toString() !== doctorId) {
      throw new ApiError(403, "Không có quyền cập nhật");
    }

    appointment.status = status;
    if (result) {
      appointment.result = result;
    }

    await appointment.save();
    return appointment.populate("userId", "name phone email");
  }

  // Cập nhật trạng thái appointment
  async updateAppointmentPaymentStatus(appointmentId, paymentStatus, doctorId) {
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      throw new ApiError(404, "Không tìm thấy lịch khám");
    }

    // Kiểm tra quyền (chỉ bác sĩ của appointment mới được cập nhật)
    if (appointment.doctorId.toString() !== doctorId) {
      throw new ApiError(403, "Không có quyền cập nhật");
    }

    appointment.paymentStatus = paymentStatus;

    await appointment.save();
    return appointment.populate("userId", "name phone email");
  }

  // Hủy appointment
  async cancelAppointment(appointmentId, userId, userRole) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const appointment = await Appointment.findById(appointmentId).session(
        session
      );
      if (!appointment) {
        throw new ApiError(404, "Không tìm thấy lịch khám");
      }

      // Kiểm tra quyền hủy
      if (userRole !== "admin" && appointment.userId.toString() !== userId) {
        throw new ApiError(403, "Không có quyền hủy lịch khám");
      }

      // Kiểm tra trạng thái có thể hủy không
      if (!["pending", "confirmed"].includes(appointment.status)) {
        throw new ApiError(400, "Không thể hủy lịch khám này");
      }

      // Cập nhật trạng thái
      appointment.status = "canceled";
      await appointment.save({ session });

      // Giải phóng time slot
      await this.releaseTimeSlot(
        appointment.doctorId,
        appointment.date,
        appointment.time,
        session
      );

      await session.commitTransaction();
      return appointment;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  // Lấy appointment của user
  async getUserAppointments(userId, page, limit, filters) {
    const query = { userId };

    if (filters.status) {
      query.status = filters.status;
    }

    if (filters.startDate || filters.endDate) {
      query.date = {};
      if (filters.startDate) {
        query.date.$gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        query.date.$lte = new Date(filters.endDate);
      }
    }

    const skip = (page - 1) * limit;

    const [appointments, total] = await Promise.all([
      Appointment.find(query)
        .populate("services")
        .populate({
          path: "doctorId",
          select: "name specialty infoClinic rate",
          populate: {
            path: "infoClinic.address.wardId infoClinic.address.districtId infoClinic.address.provinceId",
            select: "name",
          },
        })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Appointment.countDocuments(query),
    ]);

    return {
      appointments,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total,
      },
    };
  }

  // Lấy appointment của doctor
  async getDoctorAppointments(doctorId, page, limit, filters) {
    const query = { doctorId };

    if (filters.status) {
      query.status = filters.status;
    }

    if (filters.date) {
      const date = new Date(filters.date);
      query.date = {
        $gte: new Date(date.setHours(0, 0, 0, 0)),
        $lt: new Date(date.setHours(23, 59, 59, 999)),
      };
    }

    const skip = (page - 1) * limit;

    const [appointments, total] = await Promise.all([
      Appointment.find(query)
        .populate("userId", "name phone email")
        .sort({ date: 1, time: 1 })
        .skip(skip)
        .limit(limit),
      Appointment.countDocuments(query),
    ]);

    return {
      appointments,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total,
      },
    };
  }
}
export default BookingAppointmentService;

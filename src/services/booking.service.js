// services/bookingService.js

import mongoose from "mongoose";
import Doctor from "../models/doctor.model";
import TimeSlot from "../models/timeSlot.model";
import WorkingHour from "../models/workingHour.model";
import Appointment from "../models/appointment.model";
import { ApiError } from "../middlewares/booking.validation";

class BookingService {
  // Lấy slot trống của bác sĩ theo ngày
  async getDoctorAvailableSlots(doctorId, date) {
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      throw new ApiError(404, "Không tìm thấy bác sĩ");
    }

    const dayOfWeek = date.getDay();

    // Lấy lịch làm việc của bác sĩ
    const workingHour = await WorkingHour.findOne({
      doctorId,
      dayOfWeek,
      isActive: true,
    });

    if (!workingHour) {
      return [];
    }

    // Lấy các slot đã đặt trong ngày
    let timeSlot = await TimeSlot.findOne({
      doctorId,
      date: {
        $gte: new Date(date.setHours(0, 0, 0, 0)),
        $lt: new Date(date.setHours(23, 59, 59, 999)),
      },
    });

    const bookedSlots = timeSlot
      ? timeSlot.timeSlots.filter((slot) => slot.isBooked)
      : [];
    const bookedTimes = bookedSlots.map((slot) => slot.time);

    // Filter available slots
    const availableSlots = workingHour.timeSlots.filter(
      (slot) => slot.isAvailable && !bookedTimes.includes(slot.startTime)
    );

    return availableSlots;
  }

  // Tạo appointment mới
  async createAppointment(appointmentData) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const { userId, doctorId, date, time, services, paymentMethod, note } =
        appointmentData;

      // Kiểm tra bác sĩ tồn tại
      const doctor = await Doctor.findById(doctorId).session(session);
      if (!doctor) {
        throw new ApiError(404, "Không tìm thấy bác sĩ");
      }

      // Kiểm tra slot còn trống
      const appointmentDate = new Date(date);
      const isSlotAvailable = await this.checkSlotAvailability(
        doctorId,
        appointmentDate,
        time,
        session
      );

      if (!isSlotAvailable) {
        throw new ApiError(400, "Slot này đã được đặt");
      }

      // Tính tổng phí
      const totalFee = services.reduce(
        (sum, service) => sum + parseFloat(service.price.replace(/[^\d]/g, "")),
        0
      );

      // Tạo appointment
      const appointment = new Appointment({
        userId,
        doctorId,
        date: appointmentDate,
        time,
        services,
        paymentMethod,
        totalFee,
        note,
      });

      await appointment.save({ session });

      // Cập nhật TimeSlot
      await this.updateTimeSlot(
        doctorId,
        appointmentDate,
        time,
        appointment._id,
        session
      );

      await session.commitTransaction();

      return await Appointment.findById(appointment._id)
        .populate("doctorId", "name specialty infoClinic")
        .populate("userId", "name phone email");
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  // Kiểm tra slot có sẵn không
  async checkSlotAvailability(doctorId, date, time, session = null) {
    const timeSlot = await TimeSlot.findOne({
      doctorId,
      date: {
        $gte: new Date(date.setHours(0, 0, 0, 0)),
        $lt: new Date(date.setHours(23, 59, 59, 999)),
      },
    }).session(session);

    if (!timeSlot) return true;

    const bookedSlot = timeSlot.timeSlots.find(
      (slot) => slot.time === time && slot.isBooked
    );

    return !bookedSlot;
  }

  // Cập nhật TimeSlot
  async updateTimeSlot(doctorId, date, time, appointmentId, session) {
    const filter = {
      doctorId,
      date: {
        $gte: new Date(date.setHours(0, 0, 0, 0)),
        $lt: new Date(date.setHours(23, 59, 59, 999)),
      },
    };

    const update = {
      $push: {
        timeSlots: {
          time,
          isBooked: true,
          appointmentId,
        },
      },
    };

    const options = {
      upsert: true,
      new: true,
      session,
    };

    await TimeSlot.findOneAndUpdate(filter, update, options);
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

  // Giải phóng time slot
  async releaseTimeSlot(doctorId, date, time, session) {
    await TimeSlot.updateOne(
      {
        doctorId,
        date: {
          $gte: new Date(date.setHours(0, 0, 0, 0)),
          $lt: new Date(date.setHours(23, 59, 59, 999)),
        },
      },
      {
        $pull: {
          timeSlots: { time, isBooked: true },
        },
      },
      { session }
    );
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
        .populate("doctorId", "name specialty infoClinic rate")
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

export const bookingService = new BookingService();

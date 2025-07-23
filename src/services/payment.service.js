// services/paymentService.js

import mongoose from "mongoose";
import Appointment from "../models/appointment.model";
import { ApiError } from "../middlewares/booking.validation";

class PaymentService {
  // Xử lý thanh toán
  async processPayment({ appointmentId, userId, paymentMethod, amount }) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Kiểm tra appointment
      const appointment = await Appointment.findById(appointmentId).session(
        session
      );
      if (!appointment) {
        throw new ApiError(404, "Không tìm thấy lịch khám");
      }

      if (appointment.userId.toString() !== userId) {
        throw new ApiError(403, "Không có quyền thanh toán cho lịch khám này");
      }

      if (appointment.paymentStatus === "paid") {
        throw new ApiError(400, "Lịch khám đã được thanh toán");
      }

      // Tạo payment record
      const payment = new Payment({
        appointmentId,
        userId,
        amount: amount || appointment.totalFee,
        paymentMethod,
        status: paymentMethod === "cash" ? "completed" : "pending",
      });

      await payment.save({ session });

      // Cập nhật appointment
      appointment.paymentStatus = paymentMethod === "cash" ? "paid" : "unpaid";
      appointment.paymentMethod = paymentMethod;

      if (paymentMethod === "cash") {
        payment.paidAt = new Date();
        await payment.save({ session });
      }

      await appointment.save({ session });

      // Xử lý thanh toán online nếu cần
      if (paymentMethod !== "cash") {
        await this.processOnlinePayment(payment, session);
      }

      await session.commitTransaction();
      return payment.populate("appointmentId", "date time services");
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  // Xử lý thanh toán online (VNPay, MoMo, etc.)
  async processOnlinePayment(payment, session) {
    // Implementation sẽ depend vào payment gateway được chọn
    // Đây là skeleton cho integration

    switch (payment.paymentMethod) {
      case "vnpay":
        return await this.processVNPayPayment(payment, session);
      case "momo":
        return await this.processMoMoPayment(payment, session);
      case "banking":
        return await this.processBankingPayment(payment, session);
      default:
        throw new ApiError(400, "Phương thức thanh toán không được hỗ trợ");
    }
  }

  // Xử lý VNPay
  async processVNPayPayment(payment, session) {
    // VNPay integration code here
    // Return payment URL or process result

    // Placeholder implementation
    payment.transactionId = `VNP_${Date.now()}`;
    payment.status = "pending";
    await payment.save({ session });

    return {
      paymentUrl: `https://vnpay.vn/payment?id=${payment.transactionId}`,
      transactionId: payment.transactionId,
    };
  }

  // Xử lý MoMo
  async processMoMoPayment(payment, session) {
    // MoMo integration code here
    payment.transactionId = `MOMO_${Date.now()}`;
    payment.status = "pending";
    await payment.save({ session });

    return {
      paymentUrl: `https://momo.vn/payment?id=${payment.transactionId}`,
      transactionId: payment.transactionId,
    };
  }

  // Xử lý Banking
  async processBankingPayment(payment, session) {
    // Banking integration code here
    payment.transactionId = `BANK_${Date.now()}`;
    payment.status = "pending";
    await payment.save({ session });

    return {
      bankInfo: {
        accountNumber: "1234567890",
        accountName: "CONG TY TNHH ABC",
        bankName: "Vietcombank",
        transferContent: `THANHTOAN ${payment._id}`,
      },
      transactionId: payment.transactionId,
    };
  }

  // Xác nhận thanh toán từ webhook/callback
  async confirmPayment(transactionId, gatewayResponse) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const payment = await Payment.findOne({ transactionId }).session(session);
      if (!payment) {
        throw new ApiError(404, "Không tìm thấy giao dịch");
      }

      // Cập nhật payment
      payment.status = "completed";
      payment.paidAt = new Date();
      payment.paymentGatewayResponse = gatewayResponse;
      await payment.save({ session });

      // Cập nhật appointment
      await Appointment.findByIdAndUpdate(
        payment.appointmentId,
        {
          paymentStatus: "paid",
          status: "confirmed", // Tự động confirm khi thanh toán thành công
        },
        { session }
      );

      await session.commitTransaction();
      return payment;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  // Lấy lịch sử thanh toán
  async getPaymentHistory(userId, page, limit) {
    const skip = (page - 1) * limit;

    const [payments, total] = await Promise.all([
      Payment.find({ userId })
        .populate({
          path: "appointmentId",
          populate: {
            path: "doctorId",
            select: "name specialty infoClinic",
          },
        })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Payment.countDocuments({ userId }),
    ]);

    return {
      payments,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total,
      },
    };
  }

  // Hoàn tiền
  async refundPayment(paymentId, reason) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const payment = await Payment.findById(paymentId).session(session);
      if (!payment) {
        throw new ApiError(404, "Không tìm thấy giao dịch");
      }

      if (payment.status !== "completed") {
        throw new ApiError(
          400,
          "Chỉ có thể hoàn tiền cho giao dịch đã hoàn thành"
        );
      }

      // Cập nhật payment
      payment.status = "refunded";
      payment.refundedAt = new Date();
      payment.note = reason;
      await payment.save({ session });

      // Cập nhật appointment
      await Appointment.findByIdAndUpdate(
        payment.appointmentId,
        {
          paymentStatus: "refunded",
          status: "canceled",
        },
        { session }
      );

      await session.commitTransaction();
      return payment;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }
}

import mongoose from "mongoose";
import Payment from "../models/payment.model.js";
import Appointment from "../models/appointment.model.js";
import { ApiError } from "../utils/ApiResponse.js";
import VNPayService from "./vnpay.service.js"; // ✅ Static import
import { updateWalletDoctor } from "./doctor.service.js";

const vnpayService = new VNPayService();
class PaymentService {
  // Xử lý thanh toán
  async processPayment({
    appointmentId,
    userId,
    doctorId,
    paymentMethod,
    amount,
    clientIp = "127.0.0.1",
  }) {
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
        doctorId,
        amount: amount || appointment.totalFee,
        paymentMethod,
        status: paymentMethod === "cash" ? "completed" : "pending",
      });

      await payment.save({ session });

      // Cập nhật appointment
      if (paymentMethod === "cash") {
        appointment.paymentStatus = "paid";
        payment.paidAt = new Date();
        await payment.save({ session });
      } else {
        appointment.paymentStatus = "pending"; // ✅ Set "pending" cho online payment
      }

      appointment.paymentMethod = paymentMethod;
      await appointment.save({ session });

      // Xử lý thanh toán online nếu cần
      let paymentResult = null;
      if (paymentMethod !== "cash") {
        paymentResult = await this.processOnlinePayment(
          payment,
          session,
          clientIp
        );
      }

      const populatedPayment = await payment.populate(
        "appointmentId",
        "date timeSlots services"
      );

      await session.commitTransaction();

      // ✅ Trả về cả payment info và payment URL
      return {
        payment: populatedPayment,
        ...paymentResult, // Spread paymentUrl và transactionId nếu có
      };
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  // Xử lý thanh toán online (VNPay, MoMo, etc.)
  async processOnlinePayment(payment, session, clientIp = "127.0.0.1") {
    switch (payment.paymentMethod) {
      case "vnpay":
        return await this.processVNPayPayment(payment, session, clientIp);
      case "momo":
        return await this.processMoMoPayment(payment, session);
      case "banking":
        return await this.processBankingPayment(payment, session);
      default:
        throw new ApiError(400, "Phương thức thanh toán không được hỗ trợ");
    }
  }

  // ✅ Updated: Xử lý VNPay với vnpay library
  async processVNPayPayment(payment, session, clientIp = "127.0.0.1") {
    try {
      // ✅ Generate unique transaction ID
      payment.transactionId = `VNP_${Date.now()}_${Math.random()
        .toString(36)
        .substr(2, 9)}`;
      payment.status = "pending";
      await payment.save({ session });

      // ✅ Validate client IP
      const validatedIp = this.validateClientIp(clientIp);

      // ✅ Create payment URL với vnpay library
      const paymentUrl = await vnpayService.createPaymentUrl(
        payment,
        validatedIp
      );

      console.log("✅ Generated VNPay URL successfully:", {
        paymentUrl: paymentUrl,
        transactionId: payment.transactionId,
        amount: payment.amount,
        paymentId: payment._id,
      });

      return {
        paymentUrl,
        transactionId: payment.transactionId,
      };
    } catch (error) {
      console.error("❌ VNPay payment error:", error);

      // ✅ Update payment status on error
      if (payment && payment._id) {
        try {
          payment.status = "failed";
          payment.note = `VNPay error: ${error.message}`;
          await payment.save({ session });
        } catch (saveError) {
          console.error("Failed to update payment status:", saveError);
        }
      }

      throw new Error(`VNPay payment error: ${error.message}`);
    }
  }

  // ✅ Helper method để validate IP
  validateClientIp(clientIp) {
    // Basic IP validation
    const ipRegex =
      /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;

    if (
      !clientIp ||
      clientIp === "::1" ||
      clientIp === "127.0.0.1" ||
      !ipRegex.test(clientIp)
    ) {
      return "127.0.0.1"; // Default fallback
    }

    return clientIp;
  }

  // Xử lý MoMo
  async processMoMoPayment(payment, session) {
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

      // ✅ Kiểm tra trạng thái hiện tại
      if (payment.status === "completed") {
        console.log("Payment already completed:", transactionId);
        await session.abortTransaction();
        return payment;
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
      console.log("✅ Payment confirmed successfully:", transactionId);
      return payment;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  // ✅ Updated: Xử lý VNPay return callback với vnpay library
  async handleVNPayReturn(vnp_Params) {
    try {
      console.log("🔍 Processing VNPay return with params:", vnp_Params);

      const verification = await vnpayService.verifyReturnUrl(vnp_Params);
      if (!verification.isVerified) {
        console.error("❌ Invalid VNPay signature");
        throw new Error("Invalid VNPay signature");
      }

      console.log("✅ VNPay signature verified successfully");

      const txnRef = vnp_Params.vnp_TxnRef;
      const responseCode = vnp_Params.vnp_ResponseCode;
      const transactionNo = vnp_Params.vnp_TransactionNo;
      const amount = parseInt(vnp_Params.vnp_Amount) / 100;

      console.log("📊 VNPay return params:", {
        txnRef,
        responseCode,
        transactionNo,
        amount,
        isSuccess: verification.isSuccess,
      });
      // ✅ Tìm payment bằng ID (txnRef chính là payment._id)
      const payment = await Payment.findById(txnRef);
      if (!payment) {
        throw new Error(`Payment not found for txnRef: ${txnRef}`);
      }

      console.log("💳 Found payment:", {
        id: payment._id,
        amount: payment.amount,
        status: payment.status,
        transactionId: payment.transactionId,
      });

      // ✅ Kiểm tra amount matching
      if (Math.abs(payment.amount - amount) > 0.01) {
        throw new Error(
          `Amount mismatch: expected ${payment.amount}, got ${amount}`
        );
      }

      // ✅ Kiểm tra kết quả thanh toán với vnpay library response
      if (responseCode === "00" && verification.isSuccess) {
        // Thanh toán thành công - gọi confirmPayment
        const result = await this.confirmPayment(payment.transactionId, {
          vnp_TransactionNo: transactionNo,
          vnp_ResponseCode: responseCode,
          vnp_Amount: amount,
          vnp_TxnRef: txnRef,
          success: true,
          processedAt: new Date().toISOString(),
          verification: verification,
        });

        console.log("✅ Payment confirmed successfully");
        await updateWalletDoctor(payment.doctorId, amount);
        return {
          success: true,
          message: "Payment successful",
          payment: result,
          transactionId: payment.transactionId,
        };
      } else {
        // ✅ Thanh toán thất bại với better error handling
        console.log("❌ Payment failed with response code:", responseCode);

        payment.status = "failed";
        payment.paymentGatewayResponse = vnp_Params;
        payment.note = vnpayService.parseResponseCode(responseCode);
        payment.failedAt = new Date();
        await payment.save();

        return {
          success: false,
          message: vnpayService.parseResponseCode(responseCode),
          responseCode,
          transactionId: payment.transactionId,
        };
      }
    } catch (error) {
      console.error("❌ VNPay return processing error:", error);

      // ✅ Log detailed error for debugging
      console.error("Error details:", {
        message: error.message,
        stack: error.stack,
        vnpParams: vnp_Params,
      });

      throw error;
    }
  }

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
}
// Lấy lịch sử thanh toán

export default PaymentService;

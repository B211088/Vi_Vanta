// services/vnpay.service.js - Sử dụng vnpay library
import { VNPay } from "vnpay";

class VNPayService {
  constructor() {
    this.vnpay = new VNPay({
      tmnCode: process.env.VNP_TMN_CODE || "4JHEJJJJ",
      secureSecret:
        process.env.VNP_HASH_SECRET || "28N5AKVVUE2VJOO4V8LOHVY405OEBA0F",
      vnpayHost:
        process.env.NODE_ENV === "production"
          ? "https://vnpayment.vn"
          : "https://sandbox.vnpayment.vn",
      hashAlgorithm: "SHA512",
      enableLog: process.env.NODE_ENV !== "production",
      loggerFn: (data) => {
        console.log("VNPay Debug:", JSON.stringify(data, null, 2));
      },
    });
  }

  // ✅ Fixed: Tạo payment URL với vnpay library
  createPaymentUrl(payment, clientIp = "127.0.0.1") {
    try {
      console.log("Creating VNPay URL with payment:", {
        id: payment._id,
        amount: payment.amount,
        clientIp,
      });

      // ✅ Validate payment data
      this.validatePaymentData(payment);

      const paymentUrl = this.vnpay.buildPaymentUrl({
        vnp_Amount: payment.amount, // Library tự động nhân 100
        vnp_IpAddr: clientIp,
        vnp_ReturnUrl:
          process.env.VNP_RETURN_URL ||
          "http://localhost:5173/payment/vnpay-return",
        vnp_TxnRef: payment._id.toString(), // Sử dụng payment ID làm txnRef
        vnp_OrderInfo: this.normalizeVietnamese(
          `Thanh toan lich kham ${payment._id}`
        ),
        vnp_Locale: "vn",
        // ✅ Optional: Thêm các params khác nếu cần
        vnp_OrderType: "other",
        vnp_CreateDate: this.formatVNPayDate(new Date()),
      });

      console.log("✅ Generated VNPay URL successfully:", paymentUrl);
      return paymentUrl;
    } catch (error) {
      console.error("❌ Payment URL creation failed:", error);
      throw new Error(`VNPay URL creation failed: ${error.message}`);
    }
  }

  // ✅ Fixed: Verify return URL với vnpay library
  verifyReturnUrl(queryParams) {
    const vnp_Params = Object.fromEntries(Object.entries(queryParams));
    try {
      const verification = this.vnpay.verifyReturnUrl(vnp_Params);

      if (!verification.isVerified) {
        console.error("❌ Signature verification failed:", {
          isVerified: verification.isVerified,
          isSuccess: verification.isSuccess,
          params: queryParams,
        });
      } else {
        console.log("✅ VNPay signature verified successfully");
      }

      return verification;
    } catch (error) {
      console.error("❌ Return URL verification error:", error);
      throw error;
    }
  }

  // ✅ Helper: Validate payment data
  validatePaymentData(payment) {
    if (!payment || !payment._id) {
      throw new Error("Payment object is required with valid ID");
    }
    if (!payment.amount || payment.amount <= 0) {
      throw new Error("Invalid payment amount");
    }
    if (payment.amount < 5000) {
      throw new Error("Payment amount must be at least 5,000 VND");
    }
    if (payment.amount > 500000000) {
      throw new Error("Payment amount exceeds maximum limit");
    }
  }

  // ✅ Helper: Normalize Vietnamese text
  normalizeVietnamese(text) {
    if (!text) return "";

    return text
      .normalize("NFD") // Canonical Decomposition
      .replace(/[\u0300-\u036f]/g, "") // Remove diacritics
      .replace(/đ/g, "d")
      .replace(/Đ/g, "D")
      .normalize("NFC") // Canonical Composition
      .replace(/[^a-zA-Z0-9\s]/g, "") // Remove special characters
      .trim();
  }

  // ✅ Helper: Format date for VNPay
  formatVNPayDate(date) {
    // VNPay yêu cầu format: yyyyMMddHHmmss (GMT+7)
    const vietnamTime = new Date(date.getTime() + 7 * 60 * 60 * 1000);
    return vietnamTime.toISOString().replace(/[-:T]/g, "").slice(0, 14);
  }

  // ✅ Helper: Parse response code
  parseResponseCode(code) {
    const codes = {
      "00": "Giao dịch thành công",
      "07": "Trừ tiền thành công. Giao dịch bị nghi ngờ (liên quan tới lừa đảo, giao dịch bất thường).",
      "09": "Giao dịch không thành công do: Thẻ/Tài khoản của khách hàng chưa đăng ký dịch vụ InternetBanking tại ngân hàng.",
      10: "Giao dịch không thành công do: Khách hàng xác thực thông tin thẻ/tài khoản không đúng quá 3 lần",
      11: "Giao dịch không thành công do: Đã hết hạn chờ thanh toán. Xin quý khách vui lòng thực hiện lại giao dịch.",
      12: "Giao dịch không thành công do: Thẻ/Tài khoản của khách hàng bị khóa.",
      13: "Giao dịch không thành công do Quý khách nhập sai mật khẩu xác thực giao dịch (OTP).",
      24: "Giao dịch không thành công do: Khách hàng hủy giao dịch",
      51: "Giao dịch không thành công do: Tài khoản của quý khách không đủ số dư để thực hiện giao dịch.",
      65: "Giao dịch không thành công do: Tài khoản của Quý khách đã vượt quá hạn mức giao dịch trong ngày.",
      75: "Ngân hàng thanh toán đang bảo trì.",
      79: "Giao dịch không thành công do: KH nhập sai mật khẩu thanh toán quá số lần quy định.",
      99: "Các lỗi khác (lỗi còn lại, không có trong danh sách mã lỗi đã liệt kê)",
    };

    return codes[code] || "Lỗi không xác định";
  }

  // ✅ Static methods để sử dụng từ PaymentService
  static async createPaymentUrl(payment, clientIp) {
    const instance = new VNPayService();
    return instance.createPaymentUrl(payment, clientIp);
  }

  static async verifyReturnUrl(queryParams) {
    const instance = new VNPayService();
    return instance.verifyReturnUrl(queryParams);
  }

  static parseResponseCode(code) {
    const instance = new VNPayService();
    return instance.parseResponseCode(code);
  }
}

export default VNPayService;

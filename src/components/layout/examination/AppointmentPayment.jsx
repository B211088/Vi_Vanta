import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import Header from "../Header";
import Footer from "../../../pages/user/Footer";
import { processPayment } from "../../../services/booking.service";
import { formatDateDDMMYY } from "../../../utils/formatDate";

const AppointmentPayment = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
  const { loading } = useSelector((state) => state.booking);

  const { appointmentId, appointmentData, totalAmount } = location.state || {};

  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("vnpay");
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState("");

  // Countdown timer states
  const [timeLeft, setTimeLeft] = useState(0);
  const [isExpired, setIsExpired] = useState(false);

  console.log({ appointmentId, appointmentData, totalAmount });

  // Initialize countdown timer
  useEffect(() => {
    if (appointmentData?.paymentExpireAt) {
      const calculateTimeLeft = () => {
        const now = new Date().getTime();
        const expireTime = new Date(appointmentData.paymentExpireAt).getTime();
        const difference = expireTime - now;

        if (difference > 0) {
          setTimeLeft(difference);
          setIsExpired(false);
        } else {
          setTimeLeft(0);
          setIsExpired(true);
        }
      };

      // Calculate initial time
      calculateTimeLeft();

      // Update every second
      const timer = setInterval(calculateTimeLeft, 1000);

      return () => clearInterval(timer);
    }
  }, [appointmentData?.paymentExpireAt]);

  // Handle expiration
  useEffect(() => {
    if (isExpired && appointmentData?.paymentExpireAt) {
      setPaymentError(
        "Thời gian thanh toán đã hết hạn. Vui lòng đặt lịch hẹn mới."
      );
    }
  }, [isExpired, appointmentData?.paymentExpireAt]);

  // Format time display
  const formatTimeLeft = (milliseconds) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN").format(price);
  };

  const formatVietnameseDate = (dateStr) => {
    const daysOfWeek = [
      "Chủ Nhật",
      "Thứ Hai",
      "Thứ Ba",
      "Thứ Tư",
      "Thứ Năm",
      "Thứ Sáu",
      "Thứ Bảy",
    ];
    const date = new Date(dateStr);
    const dayName = daysOfWeek[date.getDay()];
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    return `${dayName}, ${day} tháng ${month} năm ${year}`;
  };

  const handlePaymentMethodChange = (method) => {
    setSelectedPaymentMethod(method);
    setPaymentError("");
  };

  const handleConfirmPayment = async () => {
    if (isExpired) {
      setPaymentError(
        "Thời gian thanh toán đã hết hạn. Vui lòng đặt lịch hẹn mới."
      );
      return;
    }

    if (!selectedPaymentMethod) {
      setPaymentError("Vui lòng chọn phương thức thanh toán");
      return;
    }

    setIsProcessing(true);
    setPaymentError("");

    try {
      console.log("Processing payment for appointment:", appointmentId);

      const paymentData = {
        paymentMethod: selectedPaymentMethod,
        amount: totalAmount,
      };

      console.log("Payment data:", paymentData);

      const response = await dispatch(
        processPayment(appointmentId, paymentData)
      );

      if (response.success) {
        const { paymentUrl, transactionId } = response.data;

        if (paymentUrl) {
          console.log("Redirecting to payment URL:", paymentUrl);
          window.location.href = paymentUrl;
        } else {
          // Handle non-redirect payment methods (if any)
          navigate("/payment/success", {
            state: {
              transactionId,
              appointmentId,
              amount: totalAmount,
            },
          });
        }
      } else {
        throw new Error(response.message || "Không thể xử lý thanh toán");
      }
    } catch (error) {
      console.error("Payment processing error:", error);
      setPaymentError(
        error.response?.data?.message ||
          error.message ||
          "Có lỗi xảy ra khi xử lý thanh toán. Vui lòng thử lại."
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBackToBooking = () => {
    navigate(-1);
  };

  if (!appointmentData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải thông tin thanh toán...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-nunito">
      <Header />

      {/* Back Navigation */}
      <div className="container mx-auto py-3 px-4 mt-2">
        <div className="flex items-center gap-2">
          <button
            onClick={handleBackToBooking}
            className="w-8 h-8 flex items-center justify-center border border-gray-700 rounded-full cursor-pointer hover:bg-gray-100 transition"
            disabled={isProcessing}
          >
            <i className="fa-solid fa-arrow-left"></i>
          </button>
          <span>Quay lại</span>
        </div>
      </div>

      <div className="container mx-auto py-6 px-4">
        <div className="w-full mx-auto">
          {/* Page Title */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Thanh toán lịch hẹn
            </h1>
            <p className="text-gray-600">
              Vui lòng chọn phương thức thanh toán và xác nhận
            </p>

            {/* Countdown Timer */}
            {appointmentData?.paymentExpireAt && (
              <div
                className={`mt-4 p-4 rounded-lg border-2 ${
                  isExpired
                    ? "bg-red-50 border-red-200"
                    : timeLeft < 300000 // Less than 5 minutes
                    ? "bg-orange-50 border-orange-200"
                    : "bg-blue-50 border-blue-200"
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <i
                    className={`fa-solid fa-clock ${
                      isExpired
                        ? "text-red-500"
                        : timeLeft < 300000
                        ? "text-orange-500"
                        : "text-blue-500"
                    }`}
                  ></i>
                  <span
                    className={`font-semibold ${
                      isExpired
                        ? "text-red-700"
                        : timeLeft < 300000
                        ? "text-orange-700"
                        : "text-blue-700"
                    }`}
                  >
                    {isExpired
                      ? "Thời gian thanh toán đã hết hạn"
                      : "Thời gian thanh toán còn lại:"}
                  </span>
                  {!isExpired && (
                    <span
                      className={`text-2xl font-bold ${
                        timeLeft < 300000 ? "text-orange-600" : "text-blue-600"
                      }`}
                    >
                      {formatTimeLeft(timeLeft)}
                    </span>
                  )}
                </div>
                {!isExpired && timeLeft < 300000 && (
                  <p className="text-orange-600 text-sm mt-1">
                    ⚠️ Vui lòng hoàn tất thanh toán trước khi hết thời gian
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Payment Methods */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="font-bold text-xl mb-6 flex items-center gap-2">
                  <i className="fa-solid fa-credit-card text-blue-500"></i>
                  Chọn phương thức thanh toán
                </h3>

                <div className="space-y-4">
                  {/* VNPay */}
                  <div
                    className={`border-2 rounded-lg p-4 cursor-pointer transition ${
                      selectedPaymentMethod === "vnpay"
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    } ${isExpired ? "opacity-50 pointer-events-none" : ""}`}
                    onClick={() =>
                      !isExpired && handlePaymentMethodChange("vnpay")
                    }
                  >
                    <div className="flex items-center gap-4">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="vnpay"
                        checked={selectedPaymentMethod === "vnpay"}
                        onChange={() => handlePaymentMethodChange("vnpay")}
                        className="w-5 h-5 text-blue-600 focus:ring-blue-500"
                        disabled={isProcessing || isExpired}
                      />
                      <img
                        src="/images/vnpay-logo.png"
                        alt="VNPay"
                        className="w-16 h-10 object-contain"
                        onError={(e) => {
                          e.target.style.display = "none";
                          e.target.nextSibling.style.display = "block";
                        }}
                      />
                      <span
                        className="text-2xl font-bold text-blue-600 hidden"
                        style={{ display: "none" }}
                      >
                        VNPAY
                      </span>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-800">VNPay</h4>
                        <p className="text-sm text-gray-600">
                          Thanh toán qua thẻ ATM, Internet Banking,
                          Visa/MasterCard
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* MoMo */}
                  <div
                    className={`border-2 rounded-lg p-4 cursor-pointer transition ${
                      selectedPaymentMethod === "momo"
                        ? "border-pink-500 bg-pink-50"
                        : "border-gray-200 hover:border-gray-300"
                    } ${isExpired ? "opacity-50 pointer-events-none" : ""}`}
                    onClick={() =>
                      !isExpired && handlePaymentMethodChange("momo")
                    }
                  >
                    <div className="flex items-center gap-4">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="momo"
                        checked={selectedPaymentMethod === "momo"}
                        onChange={() => handlePaymentMethodChange("momo")}
                        className="w-5 h-5 text-pink-600 focus:ring-pink-500"
                        disabled={isProcessing || isExpired}
                      />
                      <div className="w-16 h-10 bg-pink-600 rounded flex items-center justify-center">
                        <span className="text-white font-bold text-sm">
                          MoMo
                        </span>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-800">MoMo</h4>
                        <p className="text-sm text-gray-600">
                          Thanh toán qua ví điện tử MoMo
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Banking */}
                  <div
                    className={`border-2 rounded-lg p-4 cursor-pointer transition ${
                      selectedPaymentMethod === "banking"
                        ? "border-green-500 bg-green-50"
                        : "border-gray-200 hover:border-gray-300"
                    } ${isExpired ? "opacity-50 pointer-events-none" : ""}`}
                    onClick={() =>
                      !isExpired && handlePaymentMethodChange("banking")
                    }
                  >
                    <div className="flex items-center gap-4">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="banking"
                        checked={selectedPaymentMethod === "banking"}
                        onChange={() => handlePaymentMethodChange("banking")}
                        className="w-5 h-5 text-green-600 focus:ring-green-500"
                        disabled={isProcessing || isExpired}
                      />
                      <div className="w-16 h-10 bg-green-600 rounded flex items-center justify-center">
                        <i className="fa-solid fa-university text-white text-lg"></i>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-800">
                          Chuyển khoản ngân hàng
                        </h4>
                        <p className="text-sm text-gray-600">
                          Chuyển khoản trực tiếp qua ngân hàng
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Error Message */}
                {paymentError && (
                  <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center gap-2">
                      <i className="fa-solid fa-exclamation-circle text-red-500"></i>
                      <span className="text-red-700">{paymentError}</span>
                    </div>
                  </div>
                )}

                {/* Security Info */}
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-start gap-3">
                    <i className="fa-solid fa-shield-halved text-green-500 text-lg mt-1"></i>
                    <div>
                      <h5 className="font-semibold text-gray-800 mb-1">
                        Thanh toán an toàn & bảo mật
                      </h5>
                      <p className="text-sm text-gray-600">
                        Thông tin thanh toán của bạn được mã hóa và bảo mật
                        tuyệt đối. Chúng tôi không lưu trữ thông tin thẻ của
                        bạn.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-md p-6 sticky top-6">
                <h3 className="font-bold text-lg mb-4">Thông tin lịch hẹn</h3>

                {/* Doctor Info */}
                <div className="flex items-center gap-3 mb-4 pb-4 border-b">
                  <img
                    className="w-12 h-12 rounded-full object-cover"
                    src={appointmentData.doctorId?.userId?.avatar?.url}
                    alt="Doctor"
                  />
                  <div>
                    <h4 className="font-semibold text-gray-800">
                      {appointmentData.doctorId?.name || "Bác sĩ"}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {appointmentData.doctorId?.specialty?.join(", ") ||
                        "Chuyên khoa"}
                    </p>
                  </div>
                </div>

                {/* Appointment Details */}
                <div className="space-y-3 mb-4 pb-4 border-b">
                  <div className="flex items-center gap-2 text-sm">
                    <i className="fa-solid fa-calendar text-gray-500 w-4"></i>
                    <span className="text-gray-700">
                      {formatVietnameseDate(appointmentData.date)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <i className="fa-solid fa-clock text-gray-500 w-4"></i>
                    <span className="text-gray-700">
                      {appointmentData.timeSlots?.startTime} -{" "}
                      {appointmentData.timeSlots?.endTime}
                    </span>
                  </div>
                  <div className="flex items-start gap-2 text-sm">
                    <i className="fa-solid fa-location-dot text-gray-500 w-4 mt-1"></i>
                    <div>
                      <p className="text-gray-700 font-medium">
                        {appointmentData.doctorId?.infoClinic?.name ||
                          "Phòng khám"}
                      </p>
                      <p className="text-gray-600">
                        {appointmentData.doctorId?.infoClinic?.address ||
                          "Địa chỉ"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Services */}
                {appointmentData.services &&
                  appointmentData.services.length > 0 && (
                    <div className="mb-4 pb-4 border-b">
                      <h5 className="font-medium text-gray-800 mb-2">
                        Dịch vụ
                      </h5>
                      <div className="space-y-1">
                        {appointmentData.services.map((service, index) => (
                          <div key={index} className="text-sm text-gray-600">
                            • {service.name || "Dịch vụ khám"}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                {/* Total Amount */}
                <div className="mb-6">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-gray-800">
                      Tổng cần thanh toán:
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-bold text-red-500">
                      {formatPrice(totalAmount || 0)} đ
                    </span>
                  </div>
                </div>

                {/* Confirm Button */}
                <button
                  onClick={handleConfirmPayment}
                  disabled={isProcessing || !selectedPaymentMethod || isExpired}
                  className="w-full bg-blue-500 text-white py-3 rounded-lg font-semibold hover:bg-blue-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isProcessing ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Đang xử lý...
                    </div>
                  ) : isExpired ? (
                    "Thời gian thanh toán đã hết hạn"
                  ) : (
                    `Xác nhận thanh toán ${formatPrice(totalAmount || 0)} đ`
                  )}
                </button>

                <p className="text-xs text-gray-500 text-center mt-3">
                  Bằng cách nhấn "Xác nhận thanh toán", bạn đồng ý với{" "}
                  <a href="/terms" className="text-blue-500 hover:underline">
                    điều khoản dịch vụ
                  </a>{" "}
                  của chúng tôi.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default AppointmentPayment;

import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  CheckCircle,
  Calendar,
  Clock,
  MapPin,
  User,
  ArrowRight,
  Home,
} from "lucide-react";
import Header from "../Header";
import Footer from "../../../pages/user/Footer";

const BookingSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSelector((state) => state.auth);

  const { message, appointmentId, appointmentData } = location.state || {};

  const [countdown, setCountdown] = useState(500);

  // Auto redirect countdown
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      navigate("/account/appointment");
    }
  }, [countdown, navigate]);

  const formatDate = (dateStr) => {
    if (!dateStr) return "Chưa xác định";
    const date = new Date(dateStr);
    return date.toLocaleDateString("vi-VN", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };
  console.log({ appointmentData });

  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  return (
    <div className="min-h-screen w-full flex flex-col justify-center ">
      <Header />
      <div className="container mx-auto  py-20">
        {/* Success Animation */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-500 rounded-full mb-6 animate-bounce">
            <CheckCircle className="w-10 h-10 text-white" />
          </div>

          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Đặt lịch thành công! 🎉
          </h1>

          <p className="text-lg text-gray-600 mb-6">
            {message || "Lịch hẹn của bạn đã được xác nhận thành công"}
          </p>

          {/* Countdown */}
          <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm mb-8">
            <Clock className="w-4 h-4" />
            <span>Tự động chuyển đến trang lịch hẹn sau {countdown}s</span>
          </div>
        </div>

        {/* Appointment Summary */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
            Thông tin lịch hẹn
          </h2>

          {/* Appointment ID */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6 text-center">
            <span className="text-sm text-gray-600 block mb-1">
              Mã lịch hẹn
            </span>
            <span className="text-2xl font-bold text-green-600 font-mono">
              #{appointmentId?.slice(-8)?.toUpperCase() || "N/A"}
            </span>
          </div>

          {/* Appointment Details */}
          <div className="space-y-4">
            {/* Doctor */}
            {appointmentData?.doctorId && (
              <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-lg">
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                  <img
                    src={appointmentData?.doctorId.userId.avatar.url}
                    alt=""
                    className="rounded-full object-cover aspect-square"
                  />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">
                    {appointmentData.doctorId.name || "Bác sĩ"}
                  </h3>
                  <p className="text-blue-600 text-sm">
                    {appointmentData.doctorId.specialty?.join(", ") ||
                      "Chuyên khoa"}
                  </p>
                </div>
              </div>
            )}

            {/* Date & Time */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-lg">
                <Calendar className="w-6 h-6 text-purple-500" />
                <div>
                  <span className="text-sm text-gray-600 block">Ngày khám</span>
                  <span className="font-semibold text-gray-800">
                    {formatDate(appointmentData?.date)}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-orange-50 rounded-lg">
                <Clock className="w-6 h-6 text-orange-500" />
                <div>
                  <span className="text-sm text-gray-600 block">Giờ khám</span>
                  <span className="font-semibold text-gray-800">
                    {appointmentData?.timeSlots?.startTime} -{" "}
                    {appointmentData?.timeSlots?.endTime || "Chưa xác định"}
                  </span>
                </div>
              </div>
            </div>

            {/* Location */}
            <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg">
              <MapPin className="w-6 h-6 text-green-500 mt-1" />
              <div>
                <span className="text-sm text-gray-600 block">Địa điểm</span>
                <h4 className="font-semibold text-gray-800">
                  {appointmentData?.doctorId?.infoClinic?.name || "Phòng khám"}
                </h4>
                <p className="text-gray-600 text-sm">
                  {appointmentData?.doctorId?.infoClinic?.address ||
                    "Địa chỉ phòng khám"}
                </p>
              </div>
            </div>

            {/* Services */}
            {appointmentData?.services &&
              appointmentData.services.length > 0 && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-600 block mb-2">
                    Dịch vụ đã chọn
                  </span>
                  <div className="space-y-2">
                    {appointmentData.services.map((service, index) => (
                      <div
                        key={index}
                        className="flex justify-between items-center"
                      >
                        <span className="text-gray-800">
                          {service.name || `Dịch vụ ${index + 1}`}
                        </span>
                        {service.price && (
                          <span className="font-semibold text-gray-800">
                            {formatPrice(service.price)}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={() => navigate("/account/appointment")}
            className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
          >
            Xem lịch hẹn
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => navigate("/")}
            className="flex-1 border border-gray-300 text-gray-700 py-3 px-6 rounded-lg font-semibold hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4" />
            Về trang chủ
          </button>
        </div>

        {/* Simple Note */}
        <div className="text-center mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
          <p className="text-sm text-yellow-800">
            <strong>Lưu ý:</strong> Vui lòng có mặt tại phòng khám 15 phút trước
            giờ hẹn và mang theo CMND/CCCD
          </p>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default BookingSuccess;

import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Header from "../Header";
import Footer from "../../../pages/user/Footer";
import { useSelector } from "react-redux";
import { formatDateDDMMYY } from "../../../utils/formatDate";

const AppointmentBookingForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { loading, error, user } = useSelector((state) => state.auth);
  const { selectedServices, doctor, selectedDate, selectedTime, totalPrices } =
    location.state || {};
  console.log({ selectedServices, doctor, selectedDate, selectedTime, user });

  const [formData, setFormData] = useState({
    userType: "banThan", // 'banThan' or 'nguoiKhac'
    name: "",
    phone: "",
    email: "",
    patientType: "benhNhanMoi", // 'benhNhanMoi' or 'benhNhanCu'
    zalo: "",
    usePhoneAsZalo: false,
    address: "",
    reason: "",
    paymentMethod: "COD",
    otherUser: {
      fullName: "",
      gender: "",
      dateOfBirth: "",
      phone: "",
      email: "",
    },
  });

  const [promoCode, setPromoCode] = useState("");

  // Mock data from previous booking - in real app this would come from props/state
  const appointmentData = {
    doctor: {
      name: "TS.BS Trần Lệ Thủy",
      specialty: "Sản - Phụ khoa",
      avatar: null,
    },
    appointment: {
      time: "10:00 - 10:15",
      date: "CN, 13 tháng 7, 2025",
      clinic: "Phòng khám Sản Phụ - Nội Khoa Phúc Ngọc",
      address:
        "91 Công chúa Ngọc Hân, Phường 12, Quận 11, Ho Chi Minh City, Vietnam",
      directions: "Chỉ đường",
    },
    pricing: {
      fee: 200000,
      discount: 0,
      total: 200000,
    },
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === "userType") {
      setFormData((prev) => ({
        ...prev,
        userType: value,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        otherUser: {
          ...prev.otherUser,
          [name]: value,
        },
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
    // Handle form submission here
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN").format(price);
  };

  function formatVietnameseDate(dateStr) {
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
    const month = date.getMonth() + 1; // Tháng tính từ 0
    const year = date.getFullYear();

    return `${dayName}, ${day} tháng ${month} năm ${year}`;
  }

  return (
    <div className="min-h-screen bg-gray-50 font-nunito">
      <Header />
      <div className="container mx-auto py-3 px-4 mt-2">
        <div className="flex items-center gap-2 border-r-1 border-dark-700 pr-2">
          <div
            onClick={() => navigate(-1)}
            className="w-8 h-8 flex items-center justify-center border border-dark-700 rounded-full cursor-pointer"
          >
            <i className="fa-solid fa-arrow-left"></i>
          </div>
          <span>Quay lại</span>
        </div>
      </div>
      <div className="container mx-auto py-6 px-4 mt-2">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Booking Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* User Type Selection */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <i className="fa-solid fa-user text-blue-500"></i>
                  Người sử dụng dịch vụ
                </h3>
                <p className="text-gray-600 text-sm mb-4">
                  Bạn đang đặt lịch hẹn cho
                </p>
                <div className="flex gap-6 mb-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="userType"
                      value="banThan"
                      checked={formData.userType === "banThan"}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-gray-700">Bản thân</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="userType"
                      value="nguoiKhac"
                      checked={formData.userType === "nguoiKhac"}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-gray-700">Người khác</span>
                  </label>
                </div>

                {/* User Info */}
                <div className="bg-gray-50 rounded-lg p-4">
                  {formData.userType === "nguoiKhac" ? (
                    <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                      {/* Form nhập người khác */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm text-gray-600">
                            Họ và tên
                          </label>
                          <input
                            type="text"
                            name="fullName"
                            value={formData.otherUser.fullName}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>

                        <div>
                          <label className="text-sm text-gray-600">
                            Giới tính
                          </label>
                          <select
                            name="gender"
                            value={formData.otherUser.gender}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="">Chọn giới tính</option>
                            <option value="male">Nam</option>
                            <option value="female">Nữ</option>
                          </select>
                        </div>

                        <div>
                          <label className="text-sm text-gray-600">
                            Ngày sinh
                          </label>
                          <input
                            type="date"
                            name="dateOfBirth"
                            value={formData.otherUser.dateOfBirth}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>

                        <div>
                          <label className="text-sm text-gray-600">
                            Số điện thoại
                          </label>
                          <input
                            type="tel"
                            name="phone"
                            value={formData.otherUser.phone}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>

                        <div className="sm:col-span-2">
                          <label className="text-sm text-gray-600">Email</label>
                          <input
                            type="email"
                            name="email"
                            value={formData.otherUser.email}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div>
                      {/* Hiển thị thông tin bản thân */}
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                          <span className="text-white font-bold text-lg">
                            T
                          </span>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-800">
                            {user?.fullName}
                          </h4>
                          <p className="text-gray-600 text-sm">
                            {user?.gender === "male" ? "Nam" : "Nữ"} -{" "}
                            {formatDateDDMMYY(user?.dateOfBirth)}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <i className="fa-solid fa-phone text-gray-500"></i>
                          <span className="text-gray-700">{user?.phone}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <i className="fa-solid fa-envelope text-gray-500"></i>
                          <span className="text-gray-700">{user?.email}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-start gap-2">
                      <i className="fa-solid fa-info-circle text-blue-500 mt-1"></i>
                      <div className="text-sm">
                        <p className="text-blue-700 font-medium">
                          Thông tin khách hàng được bảo mật và dùng cho mục đích
                          hỗ trợ dịch vụ
                        </p>
                        <p className="text-blue-600 mt-1">
                          Cập nhật thông tin có thể hỗ trợ của bạn hoặc đăng ký
                          tài khoản một cách dễ dàng
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Survey Questions */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <i className="fa-solid fa-clipboard-question text-green-500"></i>
                  Câu hỏi khảo sát
                </h3>

                <div className="space-y-6">
                  {/* Question 1 */}
                  <div>
                    <label className="block text-gray-700 font-medium mb-3">
                      1. Bạn đã từng sử dụng dịch vụ của phòng khám này chưa?
                    </label>
                    <div className="flex gap-6 mb-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="patientType"
                          value="benhNhanMoi"
                          checked={formData.patientType === "benhNhanMoi"}
                          onChange={handleInputChange}
                          className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-gray-700">Bệnh nhân mới</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="patientType"
                          value="benhNhanCu"
                          checked={formData.patientType === "benhNhanCu"}
                          onChange={handleInputChange}
                          className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-gray-700">Bệnh nhân cũ</span>
                      </label>
                    </div>

                    {/* Zalo */}
                    <div className="mb-4">
                      <label className="block text-gray-700 font-medium mb-2">
                        Zalo
                      </label>
                      <input
                        type="text"
                        name="zalo"
                        value={formData.zalo}
                        onChange={handleInputChange}
                        placeholder="Zalo"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    {/* Phone as Zalo checkbox */}
                    <div className="mb-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          name="usePhoneAsZalo"
                          checked={formData.usePhoneAsZalo}
                          onChange={handleInputChange}
                          className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-gray-700">
                          Dùng số điện thoại trong Hồ sơ người dùng
                        </span>
                      </label>
                    </div>

                    {/* Address */}
                    <div className="mb-4">
                      <label className="block text-gray-700 font-medium mb-2">
                        Địa chỉ chi tiết
                      </label>
                      <input
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        placeholder="Địa chỉ chi tiết"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>

                  {/* Question 2 */}
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">
                      2. Lí do tới thăm khám của bạn?
                    </label>
                    <textarea
                      name="reason"
                      value={formData.reason}
                      onChange={handleInputChange}
                      placeholder="Nhập lí do..."
                      rows="4"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>
            </form>
          </div>

          {/* Right Column - Appointment Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-6 space-y-6">
              {/* Appointment Details */}
              <div>
                <h3 className="font-bold text-lg mb-4">Lịch hẹn của bạn</h3>

                <div className="flex items-center gap-3 mb-4">
                  <div className="flex justify-center py-3">
                    <img
                      className="w-12 h-12 aspect-square object-cover rounded-full"
                      src={doctor.userId.avatar.url}
                      alt=""
                    />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800">
                      {doctor.name}
                    </h4>
                    <div className="text-xs py-1">
                      {doctor.specialty.map((spec, index) => (
                        <span key={index}>
                          {spec}
                          {index !== doctor.specialty.length - 1 && ", "}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <h5 className="font-medium text-gray-800 mb-2">
                      THÔNG TIN LỊCH HẸN
                    </h5>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <i className="fa-solid fa-clock text-gray-500"></i>
                        <span className="text-gray-700">
                          Lịch hẹn: {selectedTime}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <i className="fa-solid fa-calendar text-gray-500"></i>
                        <span className="text-gray-700">
                          {formatVietnameseDate(selectedDate)}
                        </span>
                      </div>
                      <div className="flex items-start gap-2">
                        <i className="fa-solid fa-location-dot text-gray-500 mt-1"></i>
                        <div>
                          <p className="text-gray-700 font-medium">
                            {appointmentData.appointment.clinic}
                          </p>
                          <p className="text-gray-600">
                            {doctor.infoClinic.address}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-3">
                    <h5 className="font-medium text-gray-800 mb-2">Mức phí</h5>
                    <div className="text-right">
                      <span className="text-2xl font-bold text-red-500">
                        {formatPrice(totalPrices)} đ
                      </span>
                    </div>
                  </div>
                </div>

                {/* Promo Code */}
                <div className="mb-4">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      placeholder="Thêm mã giảm giá"
                      className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <button className="bg-blue-500 text-white px-4 py-3 rounded-lg hover:bg-blue-600 transition font-medium">
                      Áp dụng
                    </button>
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div>
                <h3 className="font-bold text-lg mb-4">
                  Phương thức thanh toán
                </h3>
                <div className="border rounded-lg p-4">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="COD"
                      checked={formData.paymentMethod === "COD"}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                    />
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">💳</span>
                      <span className="text-gray-700 font-medium">
                        Thanh toán bằng tiền mặt (COD)
                      </span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Confirm Button */}
              <button
                onClick={handleSubmit}
                className="w-full bg-blue-500 text-white py-3 rounded-lg font-semibold hover:bg-blue-600 transition"
              >
                Xác nhận đặt lịch
              </button>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default AppointmentBookingForm;

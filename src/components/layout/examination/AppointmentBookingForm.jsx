import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Header from "../Header";
import Footer from "../../../pages/user/Footer";
import { useDispatch, useSelector } from "react-redux";
import {
  formatDateDDMMYY,
  formatDateYYYYMMDD,
} from "../../../utils/formatDate";
import { createAppointment } from "../../../services/booking.service";

const AppointmentBookingForm = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
  const { loading, error, user, address } = useSelector((state) => state.auth);

  const { selectedServices, doctor, selectedDate, selectedTime, totalPrices } =
    location.state || {};

  const [formData, setFormData] = useState({
    userType: "banThan", // 'banThan' or 'nguoiKhac'
    name: "",
    phone: "",
    email: "",
    gender: "",
    dateOfBirth: "",
    patientType: "benhNhanMoi", // 'benhNhanMoi' or 'benhNhanCu'
    zalo: "",
    usePhoneAsZalo: false,
    address: "",
    note: "",
    paymentMethod: "",
    otherUser: {
      fullName: "",
      gender: "",
      dateOfBirth: "",
      phone: "",
      email: "",
    },
  });

  const [promoCode, setPromoCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  console.log({ formData, user, address });
  // Initialize form data when component mounts or user changes
  useEffect(() => {
    if (user && formData.userType === "banThan") {
      setFormData((prev) => ({
        ...prev,
        name: user.fullName || "",
        phone: user.phone || "",
        email: user.email || "",
        gender: user.gender || "",
        address: `${address.specificAddress} -${address.ward.name} - ${address.district.name} - ${address.province.name}`,
        dateOfBirth: user.dateOfBirth
          ? formatDateYYYYMMDD(user.dateOfBirth)
          : "",
      }));
    } else if (formData.userType === "nguoiKhac") {
      // Reset form when switching to other user
      setFormData((prev) => ({
        ...prev,
        name: "",
        phone: "",
        email: "",
        address: "",
        gender: "",
        dateOfBirth: "",
      }));
    }
  }, [user, formData.userType]);

  // Auto-fill Zalo with phone number when checkbox is checked
  useEffect(() => {
    if (formData.usePhoneAsZalo) {
      const phoneToUse =
        formData.userType === "banThan"
          ? user?.phone || ""
          : formData.otherUser.phone;
      setFormData((prev) => ({
        ...prev,
        zalo: phoneToUse,
      }));
    }
  }, [
    formData.usePhoneAsZalo,
    formData.userType,
    user?.phone,
    formData.otherUser.phone,
  ]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name === "userType") {
      setFormData((prev) => ({
        ...prev,
        userType: value,
      }));
    } else if (name === "usePhoneAsZalo") {
      setFormData((prev) => ({
        ...prev,
        usePhoneAsZalo: checked,
        zalo: checked
          ? prev.userType === "banThan"
            ? user?.phone || ""
            : prev.otherUser.phone
          : prev.zalo,
      }));
    } else if (
      ["fullName", "gender", "dateOfBirth", "phone", "email"].includes(name) &&
      formData.userType === "nguoiKhac"
    ) {
      // Handle other user fields
      setFormData((prev) => ({
        ...prev,
        otherUser: {
          ...prev.otherUser,
          [name]: value,
        },
      }));
    } else {
      // Handle regular form fields
      setFormData((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
    }
  };

  const validateForm = () => {
    const errors = [];

    if (formData.userType === "nguoiKhac") {
      if (!formData.otherUser.fullName.trim())
        errors.push("Họ và tên là bắt buộc");
      if (!formData.otherUser.phone.trim())
        errors.push("Số điện thoại là bắt buộc");
      if (!formData.otherUser.email.trim()) errors.push("Email là bắt buộc");
      if (!formData.otherUser.gender) errors.push("Giới tính là bắt buộc");
      if (!formData.otherUser.dateOfBirth) errors.push("Ngày sinh là bắt buộc");
    }

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const errors = validateForm();
    if (errors.length > 0) {
      alert("Vui lòng điền đầy đủ thông tin:\n" + errors.join("\n"));
      return;
    }

    // ✅ Validate payment method
    if (!formData.paymentMethod) {
      alert("Vui lòng chọn phương thức thanh toán");
      return;
    }

    setIsSubmitting(true);

    try {
      const patientInfo =
        formData.userType === "banThan"
          ? {
              fullName: user?.fullName || formData.name,
              phone: user?.phone || formData.phone,
              email: user?.email || formData.email,
              gender: user?.gender || formData.gender,
              dateOfBirth: user?.dateOfBirth || formData.dateOfBirth,
              zalo: formData.zalo,
              address: formData.address,
            }
          : {
              fullName: formData.otherUser.fullName,
              phone: formData.otherUser.phone,
              email: formData.otherUser.email,
              gender: formData.otherUser.gender,
              dateOfBirth: formData.otherUser.dateOfBirth,
              zalo: formData.zalo,
              address: formData.address,
            };

      const appointmentData = {
        doctorId: doctor?._id,
        date: selectedDate,
        timeSlots: {
          startTime: selectedTime?.startTime,
          endTime: selectedTime?.endTime,
        },
        services: selectedServices?.map((item) => item._id) || [],
        patientInfo,
        note: formData.note,
        additionalInfo: {
          patientType: formData.patientType,
          zalo: formData.zalo,
          address: formData.address,
          promoCode: promoCode.trim() || null,
        },
      };

      console.log("Creating appointment with data:", appointmentData);
      const response = await dispatch(createAppointment(appointmentData));

      if (response.success) {
        console.log("Appointment created successfully:", response.data);
        console.log("formData.paymentMethod", formData.paymentMethod);
        // ✅ Check payment method
        if (formData.paymentMethod === "cash") {
          // Cash payment - navigate to success page
          navigate("/booking-appointment-success", {
            state: {
              message:
                "Đặt lịch thành công! Bạn sẽ thanh toán bằng tiền mặt tại phòng khám.",
              appointmentId: response.data.appointment._id,
              appointmentData: response.data.appointment,
              paymentMethod: "cash",
            },
          });
        } else {
          // Online payment - navigate to payment page
          navigate("/appointment-payment", {
            state: {
              appointmentId: response.data.appointment._id,
              appointmentData: response.data.appointment,
              totalAmount: totalPrices,
            },
          });
        }
      } else {
        throw new Error(
          response.payload?.message || "Có lỗi xảy ra khi đặt lịch"
        );
      }
    } catch (error) {
      console.error("Booking error:", error);
      alert(error.message || "Có lỗi xảy ra. Vui lòng thử lại.");
    } finally {
      setIsSubmitting(false);
    }
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

  // Show loading or error states
  if (!doctor || !selectedDate || !selectedTime) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Thiếu thông tin đặt lịch</p>
          <button
            onClick={() => navigate(-1)}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
          >
            Quay lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-nunito">
      <Header />

      {/* Back Navigation */}
      <div className="container mx-auto py-3 px-4 mt-2">
        <div className="flex items-center gap-2 border-r-1 border-dark-700 pr-2">
          <button
            onClick={() => navigate(-1)}
            className="w-8 h-8 flex items-center justify-center border border-dark-700 rounded-full cursor-pointer hover:bg-gray-100 transition"
            disabled={isSubmitting}
          >
            <i className="fa-solid fa-arrow-left"></i>
          </button>
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
                      disabled={isSubmitting}
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
                      disabled={isSubmitting}
                    />
                    <span className="text-gray-700">Người khác</span>
                  </label>
                </div>

                {/* User Info */}
                <div className="bg-gray-50 rounded-lg p-4">
                  {formData.userType === "nguoiKhac" ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm text-gray-600 mb-1">
                            Họ và tên <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            name="fullName"
                            value={formData.otherUser.fullName}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            disabled={isSubmitting}
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm text-gray-600 mb-1">
                            Giới tính <span className="text-red-500">*</span>
                          </label>
                          <select
                            name="gender"
                            value={formData.otherUser.gender}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            disabled={isSubmitting}
                            required
                          >
                            <option value="">Chọn giới tính</option>
                            <option value="male">Nam</option>
                            <option value="female">Nữ</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm text-gray-600 mb-1">
                            Ngày sinh <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="date"
                            name="dateOfBirth"
                            value={formData.otherUser.dateOfBirth}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            disabled={isSubmitting}
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm text-gray-600 mb-1">
                            Số điện thoại{" "}
                            <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="tel"
                            name="phone"
                            value={formData.otherUser.phone}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            disabled={isSubmitting}
                            required
                          />
                        </div>

                        <div className="sm:col-span-2">
                          <label className="block text-sm text-gray-600 mb-1">
                            Email <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="email"
                            name="email"
                            value={formData.otherUser.email}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            disabled={isSubmitting}
                            required
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div>
                      {/* Display user info */}
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                          <span className="text-white font-bold text-lg">
                            {user?.fullName?.charAt(0)?.toUpperCase() || "U"}
                          </span>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-800">
                            {user?.fullName || "Chưa có tên"}
                          </h4>
                          <p className="text-gray-600 text-sm">
                            {user?.gender === "male"
                              ? "Nam"
                              : user?.gender === "female"
                              ? "Nữ"
                              : "Chưa xác định"}{" "}
                            -{" "}
                            {user?.dateOfBirth
                              ? formatDateDDMMYY(user.dateOfBirth)
                              : "Chưa có ngày sinh"}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <i className="fa-solid fa-phone text-gray-500"></i>
                          <span className="text-gray-700">
                            {user?.phone || "Chưa có số điện thoại"}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <i className="fa-solid fa-envelope text-gray-500"></i>
                          <span className="text-gray-700">
                            {user?.email || "Chưa có email"}
                          </span>
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
                          Cập nhật thông tin có thể giúp bạn được hỗ trợ tốt hơn
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
                  Thông tin bổ sung
                </h3>

                <div className="space-y-6">
                  {/* Patient Type */}
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
                          disabled={isSubmitting}
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
                          disabled={isSubmitting}
                        />
                        <span className="text-gray-700">Bệnh nhân cũ</span>
                      </label>
                    </div>

                    {/* Zalo */}
                    <div className="mb-4">
                      <label className="block text-gray-700 font-medium mb-2">
                        2. Zalo - bác sĩ sẽ hỗ trợ bạn thông qua zalo
                      </label>
                      <input
                        type="text"
                        name="zalo"
                        value={formData.zalo}
                        onChange={handleInputChange}
                        placeholder="Số Zalo để liên hệ"
                        className="w-full p-3 border border-gray-300 rounded-lg f focus:border-blue-500"
                        disabled={isSubmitting}
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
                          disabled={isSubmitting}
                        />
                        <span className="text-gray-700">
                          Dùng số điện thoại làm Zalo
                        </span>
                      </label>
                    </div>

                    {/* Address */}
                    <div className="mb-4">
                      <label className="block text-gray-700 font-medium mb-2">
                        3. Địa chỉ chi tiết
                      </label>
                      <input
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        placeholder="Địa chỉ chi tiết của bạn"
                        className="w-full p-3 border border-gray-300 rounded-lg  focus:border-blue-500"
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-gray-700 font-medium mb-2">
                      4. Một số lưu ý cho bác sĩ?{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      name="note"
                      value={formData.note}
                      onChange={handleInputChange}
                      placeholder="Mô tả triệu chứng hoặc lý do bạn muốn khám..."
                      rows="4"
                      className="w-full p-3 border border-gray-300 rounded-lg  focus:border-blue-500"
                      disabled={isSubmitting}
                      required
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
                      src={doctor?.userId?.avatar?.url || "/default-avatar.png"}
                      alt="Doctor avatar"
                      onError={(e) => {
                        e.target.src = "/default-avatar.png";
                      }}
                    />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800">
                      {doctor?.name || "Bác sĩ"}
                    </h4>
                    <div className="text-xs py-1">
                      {doctor?.specialty?.map((spec, index) => (
                        <span key={index}>
                          {spec}
                          {index !== doctor.specialty.length - 1 && ", "}
                        </span>
                      )) || "Chưa có chuyên khoa"}
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
                          Lịch hẹn: {selectedTime?.startTime} -{" "}
                          {selectedTime?.endTime}
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
                            {doctor?.infoClinic?.name || "Phòng khám"}
                          </p>
                          <p className="text-gray-600">
                            {doctor?.infoClinic?.address ||
                              "Địa chỉ phòng khám"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-3">
                    <h5 className="font-medium text-gray-800 mb-2">Mức phí</h5>
                    <div className="text-right">
                      <span className="text-2xl font-bold text-red-500">
                        {formatPrice(totalPrices || 0)} đ
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
                      disabled={isSubmitting}
                    />
                    <button
                      type="button"
                      className="bg-blue-500 text-white px-4 py-3 rounded-lg hover:bg-blue-600 transition font-medium disabled:opacity-50"
                      disabled={isSubmitting || !promoCode.trim()}
                    >
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
                <div className="space-y-3">
                  {" "}
                  {doctor?.paymentMethods?.map((menthod, index) => {
                    return (
                      <div
                        key={index}
                        className="border border-gray-300 rounded-lg p-4 hover:border-blue-500 transition"
                      >
                        <label className="flex items-center gap-3 cursor-pointer">
                          <input
                            type="radio"
                            name="paymentMethod"
                            value={menthod}
                            checked={formData.paymentMethod === menthod}
                            onChange={handleInputChange}
                            className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                            disabled={isSubmitting}
                          />
                          {menthod === "cash" ? (
                            <div className="flex items-center gap-3">
                              <span className="text-2xl">💵</span>
                              <div>
                                <span className="text-gray-800 font-medium block">
                                  Thanh toán bằng tiền mặt
                                </span>
                                <span className="text-gray-500 text-sm">
                                  Thanh toán trực tiếp tại phòng khám
                                </span>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center gap-3">
                              <span className="text-2xl">💳</span>
                              <div>
                                <span className="text-gray-800 font-medium block">
                                  Thanh toán trực tuyến
                                </span>
                                <span className="text-gray-500 text-sm">
                                  VNPay, MoMo, Chuyển khoản ngân hàng
                                </span>
                              </div>
                            </div>
                          )}
                        </label>
                      </div>
                    );
                  })}
                </div>
                {/* Payment Method Warning */}
                {!formData.paymentMethod && (
                  <div className="mt-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                    <div className="flex items-center gap-2">
                      <i className="fa-solid fa-exclamation-triangle text-orange-500"></i>
                      <span className="text-orange-700 text-sm">
                        Vui lòng chọn phương thức thanh toán
                      </span>
                    </div>
                  </div>
                )}

                {/* Payment Info */}
                {formData.paymentMethod === "cash" && (
                  <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-start gap-2">
                      <i className="fa-solid fa-info-circle text-blue-500 mt-1"></i>
                      <div className="text-sm">
                        <p className="text-blue-700 font-medium">
                          Thanh toán tiền mặt
                        </p>
                        <p className="text-blue-600 mt-1">
                          Bạn sẽ thanh toán trực tiếp tại phòng khám. Vui lòng
                          đến đúng giờ hẹn.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {formData.paymentMethod === "online" && (
                  <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-start gap-2">
                      <i className="fa-solid fa-credit-card text-green-500 mt-1"></i>
                      <div className="text-sm">
                        <p className="text-green-700 font-medium">
                          Thanh toán trực tuyến
                        </p>
                        <p className="text-green-600 mt-1">
                          Bạn sẽ được chuyển đến trang thanh toán an toàn để
                          hoàn tất giao dịch.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm Button */}
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="w-full bg-blue-500 text-white py-3 rounded-lg font-semibold hover:bg-blue-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Đang xử lý...
                  </div>
                ) : (
                  "Xác nhận đặt lịch"
                )}
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

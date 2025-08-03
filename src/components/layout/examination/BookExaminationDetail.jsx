import React, { useState } from "react";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Header from "../Header";
import Footer from "../../../pages/user/Footer";

import { useNotify } from "../../../hook/useNotify";
import { ArrowRight, Lock, User } from "lucide-react";
import RequireLogin from "../../modals/examination/RequireLogin";
import {
  fetchDoctorById,
  getAvailableSlots,
} from "../../../services/booking.service";
import Loading from "../../../pages/Loading";
import { formatAddress } from "../../../utils/formatAddress";

const BookExaminationDetail = () => {
  const location = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { notifyWarning } = useNotify();
  fetchDoctorById;
  const { loading, error, doctor, workingHour, availableSlots } = useSelector(
    (state) => state.booking
  );
  const { user } = useSelector((state) => state.auth);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState({
    startTime: "",
    endTime: "",
  });
  const [selectedTab, setSelectedTab] = useState("info");
  const [selectedServices, setSelectedServices] = useState([]);
  const [totalPrices, setTotalPrices] = useState(0);
  const [currentMonth, setCurrentMonth] = useState(new Date(2025, 6)); // Tháng 7/2025

  const [showRequireLogin, setShowRequireLogin] = useState(false);
  const [timeSlots, setTimeSlots] = useState([]);
  console.log({ availableSlots, workingHour, doctor });

  // Tách query string
  const searchParams = new URLSearchParams(location.search);
  const id = searchParams.get("id");

  const getDayOfWeekNumber = (dateString) => {
    const date = new Date(dateString);
    const dayNumber = date.getDay(); // 0: Chủ nhật, 1: Thứ 2, ..., 6: Thứ 7
    return dayNumber;
  };

  useEffect(() => {
    const timeSlot = getTimeSlotsByDay(getDayOfWeekNumber(selectedDate));

    setTimeSlots(timeSlot);
  }, [selectedDate]);

  useEffect(() => {
    if (id && selectedDate) {
      dispatch(getAvailableSlots(id, { date: selectedDate }));
    }
  }, [selectedDate, id]);

  const isSelected = (service) => {
    selectedServices.some((s) => s.name === service.name);
  };

  const getTimeSlotsByDay = (targetDayOfWeek) => {
    const dayItem = workingHour.find(
      (item) => item.dayOfWeek === targetDayOfWeek
    );
    return dayItem ? dayItem.timeSlots : [];
  };

  const toggleService = (service) => {
    setSelectedServices((prev) => {
      const isAlreadySelected = prev.some((s) => s.name === service.name);
      let newSelected;

      if (isAlreadySelected) {
        newSelected = prev.filter((s) => s.name !== service.name);
      } else {
        newSelected = [...prev, service];
      }

      // Tính tổng giá mới
      const newTotal = newSelected.reduce((sum, s) => sum + s.price, 0);
      setTotalPrices(newTotal);

      return newSelected;
    });
  };

  const handleBooking = () => {
    if (selectedServices.length === 0) {
      notifyWarning("Hãy chọn dịch vụ!");
      return;
    }

    if (!selectedDate) {
      notifyWarning("Hãy chọn ngày khám!");
      return;
    }

    // Kiểm tra ngày không phải quá khứ
    const today = new Date();
    const selected = new Date(selectedDate);
    today.setHours(0, 0, 0, 0);
    selected.setHours(0, 0, 0, 0);

    if (selected < today) {
      notifyWarning("Không thể chọn ngày đã qua!");
      return;
    }

    if (!selectedTime) {
      notifyWarning("Hãy chọn giờ khám!");
      return;
    }

    if (!user) {
      setShowRequireLogin(true);
      return;
    }
    navigate("/book-examination/confirm", {
      state: {
        selectedServices,
        doctor,
        selectedDate,
        selectedTime,
        totalPrices,
      },
    });
  };

  useEffect(() => {
    dispatch(fetchDoctorById(id));
  }, [id]);

  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN").format(price);
  };

  // Thêm các helper functions
  const getMonthName = (month) => {
    const monthNames = [
      "Tháng 1",
      "Tháng 2",
      "Tháng 3",
      "Tháng 4",
      "Tháng 5",
      "Tháng 6",
      "Tháng 7",
      "Tháng 8",
      "Tháng 9",
      "Tháng 10",
      "Tháng 11",
      "Tháng 12",
    ];
    return monthNames[month];
  };

  const unavailableTimes = ["08:15 - 08:30", "14:30 - 14:45", "15:00 - 15:15"];

  const getDaysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year, month) => {
    return new Date(year, month, 1).getDay();
  };

  const formatFullDate = (year, month, day) => {
    return `${year}-${String(month + 1).padStart(2, "0")}-${String(
      day
    ).padStart(2, "0")}`;
  };

  const navigateMonth = (direction) => {
    setCurrentMonth((prev) => {
      const newMonth = new Date(prev);
      newMonth.setMonth(prev.getMonth() + direction);
      return newMonth;
    });
    // Reset selected date when changing month
    setSelectedDate("");
  };

  const handleDateSelect = (day) => {
    const fullDate = formatFullDate(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      day
    );
    setSelectedTime(null);
    setSelectedDate(fullDate);
  };

  const handleTimeSelect = (time) => {
    setSelectedTime({ startTime: time.startTime, endTime: time.endTime });
  };

  const isDateSelected = (day) => {
    const fullDate = formatFullDate(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      day
    );
    return selectedDate === fullDate;
  };

  const isToday = (day) => {
    const today = new Date();
    return (
      currentMonth.getFullYear() === today.getFullYear() &&
      currentMonth.getMonth() === today.getMonth() &&
      day === today.getDate()
    );
  };

  // Render calendar days
  const renderCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);

    // Adjust for Vietnamese week (Monday = 0, Sunday = 6)
    const adjustedFirstDay = firstDay === 0 ? 6 : firstDay - 1;

    const days = [];

    // Empty cells for days before the first day of month
    for (let i = 0; i < adjustedFirstDay; i++) {
      days.push(<div key={`empty-${i}`} className="p-2"></div>);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const isCurrentDay = isToday(day);
      const isSelectedDay = isDateSelected(day);

      days.push(
        <button
          key={day}
          onClick={() => handleDateSelect(day)}
          className={`
          p-2 text-sm rounded-lg border transition-all duration-200 hover:scale-105
          ${
            isCurrentDay
              ? "bg-blue-500 text-white border-blue-500 shadow-md"
              : isSelectedDay
              ? "bg-blue-100 text-blue-600 border-blue-300 shadow-sm"
              : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50 hover:border-gray-300"
          }
        `}
        >
          {day}
        </button>
      );
    }

    return days;
  };

  if (!doctor) {
    return <Loading />;
  }

  return (
    <div className="min-h-screen bg-gray-50 font-nunito">
      {showRequireLogin && (
        <RequireLogin closeModal={() => setShowRequireLogin(false)} />
      )}
      <Header />{" "}
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
        {doctor && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Doctor Info */}
            <div className="lg:col-span-2">
              {/* Doctor Profile Card */}
              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                    <img
                      className="object-cover aspect-square h-full w-full"
                      src={
                        doctor?.userId?.avatar?.url ||
                        doctor?.avatar?.url ||
                        "/default-avatar.jpg"
                      }
                      alt="Doctor Avatar"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h2 className="text-2xl font-bold text-gray-800">
                        {doctor.name}
                      </h2>
                      <div className="flex items-center gap-1">
                        <span className="text-yellow-500">★</span>
                        <span className="text-sm text-gray-600">
                          {doctor.rate}/5
                        </span>
                      </div>
                    </div>
                    <div className="mb-3">
                      {doctor.specialty &&
                        doctor.specialty.map((spec, index) => (
                          <span
                            key={index}
                            className="inline-block bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm mr-2 mb-1"
                          >
                            {spec}
                          </span>
                        ))}
                    </div>
                    <div className="flex items-center gap-2  mb-3">
                      <button className="border-1 border-vivanta-600 bg-vivanta-50 font-semibold px-4 py-1 rounded-full text-sm hover:bg-blue-600 transition">
                        Đặt lịch khám
                      </button>
                      <span className="text-gray-600 text-sm">
                        {doctor.targetPatients &&
                          doctor.targetPatients.join(", ")}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              {doctor.info && (
                <div className="shadow-md rounded-lg p-6 mb-6">
                  <h3 className="font-bold text-lg mb-3 text-blue-800">
                    Thông tin mô tả
                  </h3>
                  <div className="space-y-2">
                    <div className="flex  gap-2">
                      <span className="text-blue-600 font-bold text-[0.4rem] mt-[5px]">
                        <i className="fa-solid fa-circle"></i>
                      </span>
                      <span className="text-gray-700 text-sm text-justify">
                        {doctor.info}
                      </span>
                    </div>
                  </div>
                </div>
              )}{" "}
              {doctor.highlights && (
                <div className="shadow-md rounded-lg p-6 mb-6">
                  <h3 className="font-bold text-lg mb-3 text-blue-800">
                    Điểm nổi bật
                  </h3>
                  <div className="space-y-2">
                    <div className="flex  gap-2">
                      <span className="text-blue-600 font-bold text-[0.4rem] mt-[5px]">
                        <i className="fa-solid fa-circle"></i>
                      </span>
                      <span className="text-gray-700 text-sm text-justify">
                        {doctor.highlights}
                      </span>
                    </div>
                  </div>
                </div>
              )}
              {/* Highlights Section - Only show if strengths exist */}
              {doctor.strengths && doctor.strengths.length > 0 && (
                <div className="bg-blue-50 rounded-lg p-6 mb-6">
                  <h3 className="font-bold text-lg mb-3 text-blue-800">
                    Điểm mạnh
                  </h3>
                  <div className="space-y-2">
                    {doctor.strengths.map((strength, index) => (
                      <div key={index} className="flex  gap-2">
                        <span className="text-blue-600 font-bold text-[0.4rem] mt-[5px]">
                          <i className="fa-solid fa-circle"></i>
                        </span>
                        <span className="text-gray-700 text-sm">
                          {strength}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {/* Tab Navigation */}
              <div className="bg-white rounded-lg shadow-md mb-6">
                <div className="flex border-b border-dark-700   ">
                  <button
                    onClick={() => setSelectedTab("info")}
                    className={`px-4 py-3 text-sm font-medium ${
                      selectedTab === "info"
                        ? "border-b-2 border-blue-500 text-blue-600"
                        : "text-gray-600 hover:text-gray-800"
                    }`}
                  >
                    Thông tin cơ bản
                  </button>
                  <button
                    onClick={() => setSelectedTab("doctor")}
                    className={`px-4 py-3 text-sm font-medium ${
                      selectedTab === "doctor"
                        ? "border-b-2 border-blue-500 text-blue-600"
                        : "text-gray-600 hover:text-gray-800"
                    }`}
                  >
                    Đánh giá (0)
                  </button>
                </div>

                <div className="p-6">
                  {selectedTab === "info" && (
                    <div>
                      <h3 className="font-bold text-lg mb-4">
                        Thông tin bác sĩ
                      </h3>
                      <div className="prose text-gray-700 mb-6 text-sm text-justify">
                        <p>
                          {doctor.info ||
                            "Chưa có thông tin chi tiết về bác sĩ."}
                        </p>
                      </div>
                    </div>
                  )}
                  {selectedTab === "doctor" && (
                    <div>
                      <h3 className="font-bold text-lg mb-4">
                        Đánh giá từ bệnh nhân
                      </h3>
                      <p className="text-gray-600">Chưa có đánh giá nào.</p>
                    </div>
                  )}
                </div>
              </div>
              {/* Strengths Section */}
              {doctor.strengths && doctor.strengths.length > 0 && (
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                  <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                    <i className="fa-solid fa-shield-heart text-blue-500"></i>
                    Thế mạnh chuyên môn
                  </h3>
                  <div className="space-y-4">
                    {doctor.strengths.map((strength, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-3 py-1 px-2 text-sm bg-gray-50 rounded-lg"
                      >
                        <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                          <i className="fa-solid fa-check text-blue-600 text-sm"></i>
                        </div>
                        <span className="text-gray-700">{strength}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {/* Experience & Education */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Experience */}
                {doctor.experiences && doctor.experiences.length > 0 && (
                  <div className="bg-white rounded-lg shadow-md p-6">
                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                      <i className="fa-solid fa-briefcase text-green-500"></i>
                      Kinh nghiệm làm việc
                    </h3>
                    <div className="space-y-3">
                      {doctor.experiences.map((exp, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <span className="text-green-600 font-bold text-xs">
                            {" "}
                            <i className="fa-regular fa-circle-dot"></i>
                          </span>
                          <span className="text-gray-700 text-sm">{exp}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Education */}
                {doctor.educations && doctor.educations.length > 0 && (
                  <div className="bg-white rounded-lg shadow-md p-6">
                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                      <i className="fa-solid fa-graduation-cap text-purple-500"></i>
                      Quá trình đào tạo
                    </h3>
                    <div className="space-y-3">
                      {doctor.educations.map((edu, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <span className="text-purple-600 font-bold text-xs">
                            <i className="fa-regular fa-circle-dot"></i>
                          </span>
                          <span className="text-gray-700 text-sm">{edu}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* If no experience or education, show message */}
                {(!doctor.experiences || doctor.experiences.length === 0) &&
                  (!doctor.educations || doctor.educations.length === 0) && (
                    <div className="col-span-2 bg-white rounded-lg shadow-md p-6">
                      <p className="text-gray-500 text-center">
                        Chưa có thông tin về kinh nghiệm và quá trình đào tạo.
                      </p>
                    </div>
                  )}
              </div>
              {/* Languages */}
              {doctor.languages && doctor.languages.length > 0 && (
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                    <i className="fa-solid fa-language text-orange-500"></i>
                    Ngôn ngữ
                  </h3>
                  <div className="flex gap-2">
                    {doctor.languages.map((lang, index) => (
                      <span
                        key={index}
                        className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-sm"
                      >
                        {lang}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {/* Clinic Info */}
              {doctor.infoClinic && (
                <div className="bg-white rounded-lg shadow-md p-6 mt-6">
                  <h3 className="font-bold text-lg mb-4">Thông tin địa chỉ</h3>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <i className="fa-solid fa-hospital text-blue-500 mt-1"></i>
                      <div>
                        <p className="font-semibold text-gray-800">
                          {doctor.infoClinic.clinicName}
                        </p>
                        <p className="text-gray-600 text-sm py-2">
                          {formatAddress(doctor.infoClinic.address) || ""}
                        </p>
                        {doctor.infoClinic.phone && (
                          <p className="w-fit text-gray-600 text-sm px-2 py-1 border-1 border-dark-800 rounded-md">
                            <i className="fa-solid fa-phone mr-2"></i>
                            {doctor.infoClinic.phone}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column - Booking */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-md p-6 sticky top-6">
                <h3 className="font-bold text-lg mb-4">Đặt lịch hẹn</h3>

                {/* Service Selection */}
                <div className="mb-6">
                  <h4 className="font-semibold mb-3">Chọn dịch vụ</h4>
                  {doctor.services && doctor.services.length > 0 ? (
                    <div className="space-y-2">
                      {doctor.services.map((service, index) => (
                        <div
                          key={index}
                          className={`cursor-pointer border-1 rounded-lg p-3 ${
                            isSelected(service)
                              ? "border-blue-600 bg-blue-50"
                              : "border-gray-300"
                          }`}
                          onClick={() => toggleService(service)}
                        >
                          <div className="flex justify-between items-start text-sm">
                            <div>
                              <h5 className="font-bold text-gray-800">
                                {service.name}
                              </h5>
                              <p className="text-sm text-gray-600 mt-1 line-clamp-5">
                                {service.description}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-blue-600 truncate">
                                {formatPrice(service.price)} đ
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center text-gray-500 py-4">
                      Chưa có dịch vụ nào được cung cấp
                    </div>
                  )}

                  {/* Nếu bạn cần xem các dịch vụ đã chọn */}
                  {selectedServices.length > 0 && (
                    <div className="mt-4 text-sm text-gray-700">
                      <strong>Dịch vụ đã chọn:</strong>{" "}
                      {selectedServices
                        .map((service) => service.name)
                        .join(", ")}
                    </div>
                  )}
                </div>

                <div className="mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                      <i className="fa-solid fa-calendar-days text-blue-500"></i>
                      Chọn ngày khám
                    </h4>
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <span className="text-xs text-gray-500">Hôm nay</span>
                    </div>
                  </div>

                  {/* Month Navigation */}
                  <div className="flex items-center justify-between mb-4 bg-gray-50 rounded-lg p-3">
                    <button
                      onClick={() => navigateMonth(-1)}
                      className="p-2 text-gray-500 hover:text-blue-600 hover:bg-white rounded-lg transition-all duration-200"
                    >
                      <i className="fa-solid fa-chevron-left"></i>
                    </button>
                    <div className="text-center">
                      <h5 className="font-semibold text-gray-800">
                        {getMonthName(currentMonth.getMonth())}{" "}
                        {currentMonth.getFullYear()}
                      </h5>
                    </div>
                    <button
                      onClick={() => navigateMonth(1)}
                      className="p-2 text-gray-500 hover:text-blue-600 hover:bg-white rounded-lg transition-all duration-200"
                    >
                      <i className="fa-solid fa-chevron-right"></i>
                    </button>
                  </div>

                  {/* Day Headers */}
                  <div className="grid grid-cols-7 gap-1 mb-3">
                    {["T2", "T3", "T4", "T5", "T6", "T7", "CN"].map(
                      (day, index) => (
                        <div
                          key={index}
                          className="text-center text-xs font-medium text-gray-500 py-2"
                        >
                          {day}
                        </div>
                      )
                    )}
                  </div>

                  {/* Calendar Grid */}
                  <div className="grid grid-cols-7 gap-1">
                    {renderCalendarDays()}
                  </div>

                  {/* Selected Date Display */}
                  {selectedDate && (
                    <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-center gap-2">
                        <i className="fa-solid fa-calendar-check text-blue-600"></i>
                        <span className="text-sm text-blue-800 font-medium">
                          Ngày đã chọn:{" "}
                          {new Date(selectedDate).toLocaleDateString("vi-VN")}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Time Selection - Improved */}
                {selectedDate ? (
                  availableSlots?.length > 0 ? (
                    <div className="mb-6">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                          <i className="fa-solid fa-clock text-green-500"></i>
                          Chọn giờ khám
                        </h4>
                      </div>

                      {/* Time Grid */}
                      <div className="grid grid-cols-2 gap-2">
                        {availableSlots?.map((time, index) => {
                          const isUnavailable = unavailableTimes.includes(time);
                          const isSelected =
                            `${selectedTime?.startTime} - ${selectedTime?.endTime}` ===
                            `${time.startTime} - ${time.endTime}`;

                          return (
                            <button
                              key={index}
                              onClick={() =>
                                !isUnavailable && handleTimeSelect(time)
                              }
                              title={
                                time.isBooked && "Thời gian này đã được đặt"
                              }
                              disabled={isUnavailable || time.isBooked}
                              className={`p-3 text-sm rounded-lg border text-center transition-all duration-200 
                ${
                  isUnavailable
                    ? "bg-gray-200 text-gray-400 border-gray-300 cursor-not-allowed "
                    : isSelected
                    ? "bg-blue-500 text-white border-blue-500 shadow-md cursor-pointer"
                    : time.isBooked
                    ? "bg-red-200 border-red-400 text-light-50"
                    : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50 cursor-pointer hover:border-gray-300"
                }
              `}
                            >
                              {time.startTime} - {time.endTime}
                            </button>
                          );
                        })}
                      </div>

                      {/* Selected Time Display */}
                      {selectedTime && (
                        <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
                          <div className="flex items-center gap-2">
                            <i className="fa-solid fa-clock text-green-600"></i>
                            <span className="text-sm text-green-800 font-medium">
                              Giờ đã chọn: {selectedTime.startTime} -{" "}
                              {selectedTime.endTime}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                        <i className="fa-solid fa-clock text-green-500"></i>
                        Chọn giờ khám
                      </h4>
                      <div className="text-red-600 p-3 text-sm">
                        Ngày này không làm việc
                      </div>
                    </div>
                  )
                ) : (
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                      <i className="fa-solid fa-clock text-green-500"></i>
                      Chọn giờ khám
                    </h4>
                    <div className="text-red-600 p-3 text-sm">
                      Chọn ngày khám
                    </div>
                  </div>
                )}

                {/* Price and Book Button */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-gray-600">Giá</span>
                    <span className="text-xl font-bold text-blue-600">
                      {formatPrice(totalPrices || 0)} đ
                    </span>
                  </div>
                  <div
                    onClick={handleBooking}
                    className="w-full flex items-center justify-center bg-blue-500 text-white py-2 rounded-lg font-semibold text-sm hover:bg-blue-600 transition cursor-pointer"
                  >
                    <span> TIẾP TỤC ĐẶT LỊCH</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default BookExaminationDetail;

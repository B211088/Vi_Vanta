import React from "react";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getUserAppointments } from "../../services/booking.service";
import { useState } from "react";
import {
  Calendar,
  Clock,
  MapPin,
  Phone,
  Mail,
  User,
  CreditCard,
  FileText,
  Filter,
  Search,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { formatAddress } from "../../utils/formatAddress";
import { convertMarkdownToJSX } from "../../utils/convertMarkdownToJSX";

const Appointment = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { userAppointments } = useSelector((state) => state.booking);
  const { user } = useSelector((state) => state.auth);
  const [appointments, setAppointments] = useState(userAppointments);
  const [filteredAppointments, setFilteredAppointments] =
    useState(appointments);
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("desc"); // 'asc', 'desc', 'none'
  const [sortField, setSortField] = useState("date"); // 'date', 'time', 'created'

  useEffect(() => {
    if (user) {
      dispatch(getUserAppointments(user?._id));
    }
  }, []);

  useEffect(() => {
    if (userAppointments.length > 0) {
      setAppointments(userAppointments);
    }
  }, [userAppointments]);

  console.log({ userAppointments });

  // Hàm sắp xếp appointments
  const sortAppointments = (appointmentsToSort) => {
    if (sortOrder === "none") return appointmentsToSort;

    return [...appointmentsToSort].sort((a, b) => {
      let compareValue = 0;

      switch (sortField) {
        case "date":
          // Sắp xếp theo ngày hẹn
          const dateA = new Date(a.date);
          const dateB = new Date(b.date);
          compareValue = dateA.getTime() - dateB.getTime();
          break;

        case "time":
          // Sắp xếp theo giờ bắt đầu trong ngày
          const timeA = a.timeSlots.startTime;
          const timeB = b.timeSlots.startTime;
          compareValue = timeA.localeCompare(timeB);
          break;

        case "created":
          // Sắp xếp theo ngày tạo appointment
          const createdA = new Date(a.createdAt || a._id);
          const createdB = new Date(b.createdAt || b._id);
          compareValue = createdA.getTime() - createdB.getTime();
          break;

        default:
          compareValue = 0;
      }

      return sortOrder === "asc" ? compareValue : -compareValue;
    });
  };

  useEffect(() => {
    let filtered = appointments;

    // Lọc theo trạng thái
    if (filterStatus !== "all") {
      filtered = filtered.filter((apt) => apt.status === filterStatus);
    }

    // Lọc theo từ khóa tìm kiếm
    if (searchTerm) {
      filtered = filtered.filter(
        (apt) =>
          apt.patientInfo.fullName
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          apt.doctorId.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sắp xếp kết quả
    const sortedFiltered = sortAppointments(filtered);
    setFilteredAppointments(sortedFiltered);
  }, [filterStatus, searchTerm, appointments, sortOrder, sortField]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "confirmed":
        return "bg-green-100 text-green-800 border-green-200";
      case "completed":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "unpaid":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Handler để chuyển hướng đến trang thanh toán
  const handlePayment = (appointment) => {
    navigate("/appointment-payment", {
      state: {
        appointmentId: appointment._id,
        appointmentData: appointment,
        totalAmount: appointment.totalFee,
      },
    });
  };

  // Handler để thay đổi sắp xếp
  const handleSortChange = (field) => {
    if (sortField === field) {
      // Nếu đang sort theo field này, thay đổi thứ tự
      if (sortOrder === "desc") {
        setSortOrder("asc");
      } else if (sortOrder === "asc") {
        setSortOrder("none");
      } else {
        setSortOrder("desc");
      }
    } else {
      // Nếu chuyển sang field khác, bắt đầu với desc
      setSortField(field);
      setSortOrder("desc");
    }
  };

  // Helper để hiển thị icon sort
  const getSortIcon = (field) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-4 h-4 text-gray-400" />;
    }

    if (sortOrder === "desc") {
      return <ArrowDown className="w-4 h-4 text-blue-500" />;
    } else if (sortOrder === "asc") {
      return <ArrowUp className="w-4 h-4 text-blue-500" />;
    } else {
      return <ArrowUpDown className="w-4 h-4 text-gray-400" />;
    }
  };

  return (
    <div className="min-h-screen p-6">
      <div className="w-full mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Quản lý lịch hẹn
          </h1>
          <p className="text-gray-600">
            Theo dõi và quản lý tất cả các cuộc hẹn của bạn
          </p>
        </div>

        {/* Filters, Search and Sort */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col gap-4">
            {/* Search và Filter row */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Tìm kiếm theo tên bác sĩ..."
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <select
                    className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                  >
                    <option value="all">Tất cả trạng thái</option>
                    <option value="pending">Đang chờ</option>
                    <option value="confirmed">Đã xác nhận</option>
                    <option value="completed">Hoàn thành</option>
                    <option value="cancelled">Đã hủy</option>
                  </select>
                </div>
              </div>

              <div className="text-sm text-gray-600">
                Tổng cộng:{" "}
                <span className="font-semibold">
                  {filteredAppointments.length}
                </span>{" "}
                lịch hẹn
              </div>
            </div>

            {/* Sort options row */}
            <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
              <span className="text-sm font-medium text-gray-700 mb-2 sm:mb-0">
                Sắp xếp theo:
              </span>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleSortChange("date")}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm transition-colors ${
                    sortField === "date" && sortOrder !== "none"
                      ? "bg-blue-50 border-blue-200 text-blue-700"
                      : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <Calendar className="w-4 h-4" />
                  Ngày hẹn
                  {getSortIcon("date")}
                </button>

                <button
                  onClick={() => handleSortChange("time")}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm transition-colors ${
                    sortField === "time" && sortOrder !== "none"
                      ? "bg-blue-50 border-blue-200 text-blue-700"
                      : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <Clock className="w-4 h-4" />
                  Giờ hẹn
                  {getSortIcon("time")}
                </button>

                <button
                  onClick={() => handleSortChange("created")}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm transition-colors ${
                    sortField === "created" && sortOrder !== "none"
                      ? "bg-blue-50 border-blue-200 text-blue-700"
                      : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  Ngày tạo
                  {getSortIcon("created")}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Appointments Grid */}
        <div className="grid gap-6">
          {filteredAppointments.map((appointment) => (
            <div
              key={appointment._id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
            >
              <div className="p-6">
                <div className="flex flex-col gap-6">
                  {/* Left Side - Main Info */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-1">
                          {appointment.patientInfo.fullName}
                        </h3>
                        <p className="text-gray-600">
                          Bệnh nhân{" "}
                          {appointment.patientInfo.gender === "male"
                            ? "nam"
                            : "nữ"}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(
                            appointment.status
                          )}`}
                        >
                          {appointment.status === "pending"
                            ? "Đang chờ xác nhận "
                            : appointment.status === "in-progress"
                            ? "Đang thực hiện"
                            : appointment.status === "confirmed"
                            ? "Đã Xác nhận"
                            : appointment.status === "completed"
                            ? "Đã hoàn thành"
                            : "Đã hủy"}
                        </span>
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium ${getPaymentStatusColor(
                            appointment.paymentStatus
                          )}`}
                        >
                          {appointment.paymentStatus === "paid"
                            ? "Đã thanh toán"
                            : appointment.paymentStatus === "pending"
                            ? "Chờ thanh toán"
                            : "Chưa thanh toán"}
                        </span>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4 mb-4">
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <Calendar className="w-4 h-4 text-blue-500" />
                          <span className="text-gray-700">
                            {formatDate(appointment.date)}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <Clock className="w-4 h-4 text-green-500" />
                          <span className="text-gray-700">
                            {appointment.timeSlots.startTime} -{" "}
                            {appointment.timeSlots.endTime}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <Phone className="w-4 h-4 text-purple-500" />
                          <span className="text-gray-700">
                            {appointment.patientInfo.phone}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <Mail className="w-4 h-4 text-red-500" />
                          <span className="text-gray-700">
                            {appointment.patientInfo.email}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <MapPin className="w-4 h-4 text-orange-500" />
                          <span className="text-gray-700">
                            {appointment.patientInfo.address || "Chưa cập nhật"}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <CreditCard className="w-4 h-4 text-indigo-500" />
                          <span className="text-gray-700">
                            {formatCurrency(appointment.totalFee)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Side - Doctor & Service Info */}
                  <div className="w-full bg-gray-50 rounded-lg p-4">
                    <div className="mb-4">
                      <h4 className="font-semibold text-gray-900 mb-2">
                        Thông tin bác sĩ
                      </h4>
                      <div className="flex items-center gap-3 mb-2">
                        <User className="w-4 h-4 text-blue-500" />
                        <span className="text-gray-700">
                          {appointment.doctorId.name}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 ml-7">
                        Chuyên khoa: {appointment.doctorId.specialty.join(", ")}
                      </p>
                    </div>

                    <div className="mb-4">
                      <h4 className="font-semibold text-gray-900 mb-2">
                        Phòng khám
                      </h4>
                      <p className="text-sm text-gray-700">
                        {appointment.doctorId.infoClinic.clinicName}
                      </p>
                      <p className="text-sm text-gray-600">
                        {formatAddress(appointment.doctorId.infoClinic.address)}
                      </p>
                      <p className="text-sm text-gray-600">
                        {appointment.doctorId.infoClinic.phone}
                      </p>
                    </div>

                    {appointment.services.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">
                          Dịch vụ
                        </h4>
                        {appointment.services.map((service, index) => (
                          <div
                            key={index}
                            className="bg-white rounded p-3 mb-2"
                          >
                            <div className="flex items-center gap-2 mb-1">
                              <FileText className="w-4 h-4 text-green-500" />
                              <span className="text-sm font-medium">
                                {service.name}
                              </span>
                            </div>
                            {service.description && (
                              <p className="text-xs text-gray-600 ml-6">
                                {convertMarkdownToJSX(service.description)}
                              </p>
                            )}
                            <p className="text-sm font-semibold text-blue-600 ml-6">
                              {formatCurrency(service.price)}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-6 pt-4 border-t border-gray-200 flex flex-wrap gap-3">
                  {appointment.status === "pending" && (
                    <>
                      <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                        Hủy lịch
                      </button>
                    </>
                  )}
                  {((appointment.paymentMethod !== "cash" &&
                    appointment.paymentStatus === "unpaid") ||
                    appointment.paymentStatus === "pending") && (
                    <button
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                      onClick={() => handlePayment(appointment)}
                    >
                      Thanh toán
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredAppointments.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Calendar className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Không tìm thấy lịch hẹn
            </h3>
            <p className="text-gray-600">
              Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Appointment;

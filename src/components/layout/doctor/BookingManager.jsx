import React from "react";
import { useEffect } from "react";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Outlet, useNavigate } from "react-router-dom";
import {
  fetchDoctorByUserId,
  getDoctorAppointments,
} from "../../../services/doctor.service";
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
  CheckCircle,
  XCircle,
  Eye,
  AlertCircle,
  Users,
  DollarSign,
  Activity,
  Clipboard,
  RefreshCcwIcon,
  RotateCcw,
} from "lucide-react";
import {
  updateAppointmentPaymentStatus,
  updateAppointmentStatus,
} from "../../../services/booking.service";
import { useNotify } from "../../../hook/useNotify";
import AppointmentDetailModal from "../../modals/doctor/AppointmentDetailModal";
import { convertMarkdownToJSX } from "../../../utils/convertMarkdownToJSX";

const BookingManager = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { doctorAppointments, doctor } = useSelector((state) => state.doctor);
  const { user } = useSelector((state) => state.auth);
  const [appointments, setAppointments] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [detailAppointmentModal, setDetailAppointmentModal] = useState(false);
  const [detailAppointmentData, setDetailAppointmentData] = useState(null);
  const { notifySuccess, notifyWarning, notifyError, notifyConfirm } =
    useNotify();

  useEffect(() => {
    dispatch(fetchDoctorByUserId());
  }, [dispatch]);

  useEffect(() => {
    if (doctor) {
      dispatch(getDoctorAppointments(doctor._id));
    }
  }, [doctor, dispatch]);

  useEffect(() => {
    if (doctorAppointments && doctorAppointments.length >= 0) {
      setAppointments(doctorAppointments);
      setIsLoading(false);
    }
  }, [doctorAppointments]);

  // Filter appointments based on search criteria
  useEffect(() => {
    let filtered = appointments;

    if (filterStatus !== "all") {
      filtered = filtered.filter((apt) => apt.status === filterStatus);
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (apt) =>
          apt.patientInfo?.fullName
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          apt.patientInfo?.phone?.includes(searchTerm) ||
          apt.patientInfo?.reason
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase())
      );
    }

    if (selectedDate) {
      filtered = filtered.filter((apt) => {
        const appointmentDate = new Date(apt.date).toISOString().split("T")[0];
        return appointmentDate === selectedDate;
      });
    }

    setFilteredAppointments(filtered);
  }, [filterStatus, searchTerm, selectedDate, appointments]);

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

  const getStatusText = (status) => {
    const statusMap = {
      pending: "Đang chờ",
      confirmed: "Đã xác nhận",
      completed: "Hoàn thành",
      cancelled: "Đã hủy",
    };
    return statusMap[status] || status;
  };

  const getPaymentStatusText = (status) => {
    const statusMap = {
      paid: "Đã thanh toán",
      pending: "Chờ thanh toán",
      unpaid: "Chưa thanh toán",
    };
    return statusMap[status] || status;
  };

  const getPaymentMethodText = (method) => {
    const methodMap = {
      vnpay: "VNPAY",
      COD: "Tiền mặt (COD)",
      cash: "Tiền mặt",
    };
    return methodMap[method] || method;
  };

  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return "N/A";
    const birth = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birth.getDate())
    ) {
      age--;
    }
    return age;
  };

  const handleConfirmAppointment = async (appointmentId) => {
    try {
      await dispatch(
        updateAppointmentStatus(appointmentId, { status: "confirmed" })
      );
      // Update local state
      setAppointments((prev) =>
        prev.map((apt) =>
          apt._id === appointmentId
            ? {
                ...apt,
                status: "confirmed",
                confirmedAt: new Date().toISOString(),
              }
            : apt
        )
      );
    } catch (error) {
      console.error("Error confirming appointment:", error);
      alert("Có lỗi xảy ra khi xác nhận lịch hẹn");
    }
  };

  const handleCancelAppointment = async (appointmentId) => {
    try {
      const confirm = await notifyConfirm(
        "Bạn có chắc chắn muốn hủy lịch hẹn này!"
      );
      if (confirm) {
        await dispatch(
          updateAppointmentStatus(appointmentId, { status: "canceled" })
        );
        setAppointments((prev) =>
          prev.map((apt) =>
            apt._id === appointmentId
              ? {
                  ...apt,
                  status: "cancelled",
                  cancelledAt: new Date().toISOString(),
                }
              : apt
          )
        );
      }
      return;
    } catch (error) {
      console.error("Error cancelling appointment:", error);
      alert("Có lỗi xảy ra khi hủy lịch hẹn");
    }
  };

  const handleCompleteAppointment = async (appointmentId) => {
    try {
      const confirm = await notifyConfirm(
        "Bạn có chắc chắn muốn hoàn thành đặt khám này không!"
      );
      if (confirm) {
        await dispatch(
          updateAppointmentStatus(appointmentId, { status: "completed" })
        );
        setAppointments((prev) =>
          prev.map((apt) =>
            apt._id === appointmentId
              ? {
                  ...apt,
                  status: "completed",
                  completedAt: new Date().toISOString(),
                }
              : apt
          )
        );
      }
    } catch (error) {
      console.error("Error completing appointment:", error);
      alert("Có lỗi xảy ra khi hoàn thành lịch hẹn");
    }
  };

  // Statistics calculations
  const totalAppointments = appointments.length;
  const todayAppointments = appointments.filter((apt) => {
    const appointmentDate = new Date(apt.date).toISOString().split("T")[0];
    const today = new Date().toISOString().split("T")[0];
    return appointmentDate === today;
  }).length;
  const pendingAppointments = appointments.filter(
    (apt) => apt.status === "pending"
  ).length;
  const totalRevenue = appointments
    .filter((apt) => apt.paymentStatus === "paid")
    .reduce((sum, apt) => sum + (apt.totalFee || 0), 0);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }
  // Thêm vào component BookingManager

  // Helper function để kiểm tra thời gian
  const isAppointmentTimeReached = (appointmentDate, timeSlot) => {
    if (!appointmentDate || !timeSlot?.startTime) return false;

    const now = new Date();
    const appointmentDateTime = new Date(appointmentDate);

    // Parse time từ string "HH:MM"
    const [hours, minutes] = timeSlot.startTime.split(":");
    appointmentDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

    return now >= appointmentDateTime;
  };

  // Helper function để kiểm tra xem có thể hoàn thành không
  const canCompleteAppointment = (appointment) => {
    const isTimeReached = isAppointmentTimeReached(
      appointment.date,
      appointment.timeSlots
    );
    const isConfirmed = appointment.status === "confirmed";

    // Nếu thanh toán tiền mặt, cần phải xác nhận đã thanh toán trước
    if (
      appointment.paymentMethod === "cash" ||
      appointment.paymentMethod === "COD"
    ) {
      return (
        isTimeReached && isConfirmed && appointment.paymentStatus === "paid"
      );
    }

    // Nếu thanh toán online, cần đã thanh toán
    return isTimeReached && isConfirmed && appointment.paymentStatus === "paid";
  };

  // Helper function để xác định các nút cần hiển thị
  const getAvailableActions = (appointment) => {
    const actions = [];
    const now = new Date();
    const appointmentDate = new Date(appointment.date);
    const isTimeReached = isAppointmentTimeReached(
      appointment.date,
      appointment.timeSlots
    );

    // Luôn có nút xem chi tiết
    actions.push("view_detail");

    switch (appointment.status) {
      case "pending":
        // Chỉ cho phép xác nhận/từ chối nếu chưa quá thời gian khám
        if (appointmentDate >= now.setHours(0, 0, 0, 0)) {
          actions.push("confirm", "cancel");
        } else {
          // Nếu đã quá ngày thì tự động hủy hoặc chỉ cho phép hủy
          actions.push("cancel");
        }
        break;

      case "confirmed":
        // Nút xác nhận thanh toán cho tiền mặt
        if (
          (appointment.paymentMethod === "cash" ||
            appointment.paymentMethod === "COD") &&
          appointment.paymentStatus !== "paid"
        ) {
          actions.push("confirm_payment");
        }

        // Nút in hóa đơn nếu đã thanh toán
        if (appointment.paymentStatus === "paid") {
          actions.push("print_invoice");
        }

        // Nút hoàn thành khám nếu đủ điều kiện
        if (canCompleteAppointment(appointment)) {
          actions.push("complete");
        }

        // Nút hủy nếu chưa đến giờ khám
        if (!isTimeReached) {
          actions.push("cancel");
        }

        // Nút báo vắng nếu đã quá giờ khám 30 phút mà chưa hoàn thành
        if (isTimeReached) {
          const [hours, minutes] = appointment.timeSlots.startTime.split(":");
          const appointmentDateTime = new Date(appointment.date);
          appointmentDateTime.setHours(
            parseInt(hours),
            parseInt(minutes),
            0,
            0
          );
          const timeDiff = now - appointmentDateTime;
          const thirtyMinutes = 30 * 60 * 1000;

          if (timeDiff > thirtyMinutes) {
            actions.push("mark_absent");
          }
        }
        break;

      case "completed":
        // Chỉ có nút xem chi tiết và in hóa đơn
        actions.push("print_invoice");
        break;

      case "cancelled":
        const cancelTime = new Date(
          appointment.cancelledAt || appointment.updatedAt
        );
        const hoursSinceCanceled = (now - cancelTime) / (1000 * 60 * 60);

        if (hoursSinceCanceled < 24 && appointmentDate > now) {
          actions.push("reactivate");
        }
        break;

      default:
        break;
    }

    // Luôn có nút gọi điện
    if (appointment.patientInfo?.phone) {
      actions.push("call");
    }

    return actions;
  };

  // Hàm xử lý xác nhận thanh toán
  const handleConfirmPayment = async (appointmentId) => {
    try {
      const confirm = await notifyConfirm(
        "Xác nhận bệnh nhân đã thanh toán tiền mặt?"
      );
      if (confirm) {
        await dispatch(
          updateAppointmentPaymentStatus(appointmentId, {
            paymentStatus: "paid",
            doctorId: doctor._id,
          })
        );
        setAppointments((prev) =>
          prev.map((apt) =>
            apt._id === appointmentId
              ? {
                  ...apt,
                  paymentStatus: "paid",
                  paidAt: new Date().toISOString(),
                }
              : apt
          )
        );
        notifySuccess("Đã xác nhận thanh toán thành công!");
      }
    } catch (error) {
      console.error("Error confirming payment:", error);
      notifyError("Có lỗi xảy ra khi xác nhận thanh toán");
    }
  };

  // Hàm xử lý báo vắng
  const handleMarkAbsent = async (appointmentId) => {
    try {
      const confirm = await notifyConfirm(
        "Xác nhận bệnh nhân vắng mặt? Lịch hẹn sẽ được đánh dấu là đã hủy."
      );
      if (confirm) {
        await dispatch(
          updateAppointmentStatus(appointmentId, {
            status: "cancelled",
            cancelReason: "Bệnh nhân vắng mặt",
            absentMarked: true,
          })
        );
        setAppointments((prev) =>
          prev.map((apt) =>
            apt._id === appointmentId
              ? {
                  ...apt,
                  status: "cancelled",
                  cancelReason: "Bệnh nhân vắng mặt",
                  absentMarked: true,
                  cancelledAt: new Date().toISOString(),
                }
              : apt
          )
        );
        notifyWarning("Đã đánh dấu bệnh nhân vắng mặt");
      }
    } catch (error) {
      console.error("Error marking absent:", error);
      notifyError("Có lỗi xảy ra khi đánh dấu vắng mặt");
    }
  };

  // Hàm xử lý tái kích hoạt
  const handleReactivateAppointment = async (appointmentId) => {
    try {
      const confirm = await notifyConfirm(
        "Tái kích hoạt lịch hẹn này? Trạng thái sẽ chuyển về chờ xác nhận."
      );
      if (confirm) {
        await dispatch(
          updateAppointmentStatus(appointmentId, {
            status: "pending",
            cancelReason: null,
            reactivatedAt: new Date().toISOString(),
          })
        );
        setAppointments((prev) =>
          prev.map((apt) =>
            apt._id === appointmentId
              ? {
                  ...apt,
                  status: "pending",
                  cancelReason: null,
                  reactivatedAt: new Date().toISOString(),
                }
              : apt
          )
        );
        notifySuccess("Đã tái kích hoạt lịch hẹn thành công!");
      }
    } catch (error) {
      console.error("Error reactivating appointment:", error);
      notifyError("Có lỗi xảy ra khi tái kích hoạt lịch hẹn");
    }
  };
  const handlePrintInvoice = (appointment) => {
    // Logic in hóa đơn - có thể mở window mới hoặc tải PDF
    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
    <html>
      <head>
        <title>Hóa đơn khám bệnh</title>
        <style>
          body { font-family: Arial, sans-serif; }
          .invoice { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .info { margin-bottom: 20px; }
          .services { width: 100%; border-collapse: collapse; }
          .services th, .services td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        </style>
      </head>
      <body>
        <div class="invoice">
          <div class="header">
            <h2>HÓA ĐƠN KHÁM BỆNH</h2>
            <p>Mã lịch hẹn: ${appointment._id}</p>
          </div>
          <div class="info">
            <p><strong>Bệnh nhân:</strong> ${
              appointment.patientInfo?.fullName
            }</p>
            <p><strong>Ngày khám:</strong> ${formatDate(appointment.date)}</p>
            <p><strong>Giờ khám:</strong> ${
              appointment.timeSlots?.startTime
            } - ${appointment.timeSlots?.endTime}</p>
            <p><strong>Phương thức thanh toán:</strong> ${getPaymentMethodText(
              appointment.paymentMethod
            )}</p>
          </div>
          <table class="services">
            <tr><th>Dịch vụ</th><th>Giá tiền</th></tr>
            ${
              appointment.services
                ?.map(
                  (service) =>
                    `<tr><td>${service.name}</td><td>${formatCurrency(
                      service.price
                    )}</td></tr>`
                )
                .join("") || ""
            }
            <tr><td><strong>Tổng cộng</strong></td><td><strong>${formatCurrency(
              appointment.totalFee
            )}</strong></td></tr>
          </table>
        </div>
      </body>
    </html>
  `);
    printWindow.document.close();
    printWindow.print();
  };

  // Component render nút actions được cập nhật
  const renderActionButtons = (appointment) => {
    const availableActions = getAvailableActions(appointment);

    return (
      <div className="mt-6 pt-4 border-t border-gray-200 flex flex-wrap gap-3">
        {availableActions.includes("view_detail") && (
          <button
            onClick={() => {
              setDetailAppointmentData(appointment);
              setDetailAppointmentModal(true);
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Eye className="w-4 h-4" />
            Xem chi tiết
          </button>
        )}

        {availableActions.includes("confirm") && (
          <button
            onClick={() => handleConfirmAppointment(appointment._id)}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
          >
            <CheckCircle className="w-4 h-4" />
            Xác nhận
          </button>
        )}

        {availableActions.includes("cancel") && (
          <button
            onClick={() => handleCancelAppointment(appointment._id)}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
          >
            <XCircle className="w-4 h-4" />
            {appointment.status === "pending" ? "Từ chối" : "Hủy lịch"}
          </button>
        )}

        {availableActions.includes("confirm_payment") && (
          <button
            onClick={() => handleConfirmPayment(appointment._id)}
            className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors flex items-center gap-2"
          >
            <DollarSign className="w-4 h-4" />
            Xác nhận đã thanh toán
          </button>
        )}

        {availableActions.includes("print_invoice") && (
          <button
            onClick={() => handlePrintInvoice(appointment)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
          >
            <FileText className="w-4 h-4" />
            In hóa đơn
          </button>
        )}

        {availableActions.includes("complete") && (
          <button
            onClick={() => handleCompleteAppointment(appointment._id)}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
          >
            <CheckCircle className="w-4 h-4" />
            Hoàn thành khám
          </button>
        )}

        {availableActions.includes("mark_absent") && (
          <button
            onClick={() => handleMarkAbsent(appointment._id)}
            className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors flex items-center gap-2"
          >
            <AlertCircle className="w-4 h-4" />
            Báo vắng
          </button>
        )}

        {availableActions.includes("reactivate") && (
          <button
            onClick={() => handleReactivateAppointment(appointment._id)}
            className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Tái kích hoạt
          </button>
        )}

        {availableActions.includes("call") && (
          <button
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
            onClick={() =>
              window.open(`tel:${appointment.patientInfo?.phone}`, "_self")
            }
          >
            <Phone className="w-4 h-4" />
            Gọi điện
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen w-full bg-light-50 p-6 rounded-lg ">
      <div className="w-full ">
        <div className="flex items-center justify-between pb-10">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-teal-500 rounded-xl">
              <Clipboard className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Lịch hẹn</h1>
              <p className="text-gray-600">Quản lý lịch hẹn với bệnh nhân</p>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Tổng lịch hẹn
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {totalAppointments}
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Hôm nay</p>
                <p className="text-2xl font-bold text-gray-900">
                  {todayAppointments}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <Calendar className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Chờ xác nhận
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {pendingAppointments}
                </p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-full">
                <AlertCircle className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Doanh thu</p>
                <p className="text-2xl font-bold text-gray-900">
                  {new Intl.NumberFormat("vi-VN", {
                    style: "currency",
                    currency: "VND",
                  }).format(doctor?.wallet)}
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <DollarSign className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Tìm kiếm theo tên, SĐT, lý do khám..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full sm:w-80"
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

              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="date"
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                />
              </div>
              <div
                onClick={() => {
                  dispatch(getDoctorAppointments(doctor._id));
                }}
                className="border-1 border-dark-800 flex items-center justify-center px-3 rounded-lg cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
              </div>
            </div>

            <div className="text-sm text-gray-600">
              Hiển thị:{" "}
              <span className="font-semibold text-blue-600">
                {filteredAppointments.length}
              </span>{" "}
              / {appointments.length} lịch hẹn
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
                  {/* Patient Info */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                          {appointment.userId?.avatar?.url ? (
                            <img
                              src={appointment.userId.avatar.url}
                              alt="Patient avatar"
                              className="w-12 h-12 rounded-full object-cover"
                              onError={(e) => {
                                e.target.style.display = "none";
                                e.target.nextSibling.style.display = "flex";
                              }}
                            />
                          ) : (
                            <User className="w-6 h-6 text-blue-600" />
                          )}
                          <div className="w-12 h-12 bg-blue-100 rounded-full items-center justify-center hidden">
                            <User className="w-6 h-6 text-blue-600" />
                          </div>
                        </div>
                        <div>
                          <h3 className="text-xl font-semibold text-gray-900 mb-1">
                            {appointment.patientInfo?.fullName || "Chưa có tên"}
                          </h3>
                          <p className="text-gray-600">
                            {appointment.patientInfo?.gender === "male"
                              ? "Nam"
                              : appointment.patientInfo?.gender === "female"
                              ? "Nữ"
                              : "Chưa xác định"}{" "}
                            •{" "}
                            {calculateAge(appointment.patientInfo?.dateOfBirth)}{" "}
                            tuổi
                          </p>
                          <p className="text-sm text-blue-600">
                            {appointment.patientInfo?.patientType ===
                            "benhNhanMoi"
                              ? "Bệnh nhân mới"
                              : "Bệnh nhân cũ"}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(
                            appointment.status
                          )}`}
                        >
                          {getStatusText(appointment.status)}
                        </span>
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium ${getPaymentStatusColor(
                            appointment.paymentStatus
                          )}`}
                        >
                          {getPaymentStatusText(appointment.paymentStatus)}
                        </span>
                      </div>
                    </div>

                    {/* Appointment Details */}
                    <div className="grid md:grid-cols-2 gap-6 mb-4">
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <Calendar className="w-4 h-4 text-blue-500" />
                          <span className="text-gray-700 font-medium">
                            {formatDate(appointment.date)}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <Clock className="w-4 h-4 text-green-500" />
                          <span className="text-gray-700">
                            {appointment.timeSlots?.startTime} -{" "}
                            {appointment.timeSlots?.endTime}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <Phone className="w-4 h-4 text-purple-500" />
                          <span className="text-gray-700">
                            {appointment.patientInfo?.phone || "Chưa có SĐT"}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <Mail className="w-4 h-4 text-red-500" />
                          <span className="text-gray-700">
                            {appointment.patientInfo?.email || "Chưa có email"}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <MapPin className="w-4 h-4 text-orange-500" />
                          <span className="text-gray-700">
                            {appointment.patientInfo?.address ||
                              "Chưa cập nhật địa chỉ"}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <CreditCard className="w-4 h-4 text-indigo-500" />
                          <span className="text-gray-700 font-semibold">
                            {formatCurrency(appointment.totalFee || 0)}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <CreditCard className="w-4 h-4 text-green-500" />
                          <span className="text-gray-700">
                            {getPaymentMethodText(appointment.paymentMethod)}
                          </span>
                        </div>
                        {appointment.patientInfo?.reason && (
                          <div className="flex items-start gap-3">
                            <Activity className="w-4 h-4 text-pink-500 mt-0.5" />
                            <div>
                              <p className="text-sm text-gray-600">
                                Lý do khám:
                              </p>
                              <p className="text-gray-700">
                                {appointment.patientInfo.note}
                              </p>
                            </div>
                          </div>
                        )}
                        {appointment.patientInfo?.zalo && (
                          <div className="flex items-center gap-3">
                            <Phone className="w-4 h-4 text-blue-500" />
                            <span className="text-gray-700">
                              Zalo: {appointment.patientInfo.zalo}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Notes */}
                    {appointment.notes && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                        <div className="flex items-start gap-2">
                          <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-yellow-800">
                              Ghi chú quan trọng:
                            </p>
                            <p className="text-sm text-yellow-700">
                              {appointment.notes}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Services */}
                  {appointment.services && appointment.services.length > 0 && (
                    <div className="w-full bg-gray-50 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900 mb-3">
                        Dịch vụ khám ({appointment.services.length})
                      </h4>
                      <div className="space-y-2">
                        {appointment.services.map((service, index) => (
                          <div
                            key={service._id || index}
                            className="bg-white rounded-lg p-3 border border-gray-200"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <FileText className="w-4 h-4 text-green-500" />
                                <span className="font-medium text-gray-900">
                                  {service.name}
                                </span>
                              </div>
                              <span className="font-semibold text-blue-600">
                                {formatCurrency(service.price)}
                              </span>
                            </div>
                            {service.description && (
                              <p className="text-sm text-gray-600 mt-1 ml-6">
                                {convertMarkdownToJSX(service.description)}
                              </p>
                            )}
                            <div className="flex items-center gap-4 mt-2 ml-6 text-xs text-gray-500">
                              {service.followUpRequired && (
                                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                  Yêu cầu tái khám
                                </span>
                              )}
                              {service.isPopular && (
                                <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                                  Phổ biến
                                </span>
                              )}
                              <span>
                                Số lượt đặt: {service.bookingCount || 0}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                {renderActionButtons(appointment)}

                {/* Timestamps */}
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                    <span>Tạo: {formatDate(appointment.createdAt)}</span>
                    <span>Cập nhật: {formatDate(appointment.updatedAt)}</span>
                    {appointment.confirmedAt && (
                      <span>
                        Xác nhận: {formatDate(appointment.confirmedAt)}
                      </span>
                    )}
                    {appointment.completedAt && (
                      <span>
                        Hoàn thành: {formatDate(appointment.completedAt)}
                      </span>
                    )}
                    {appointment.cancelledAt && (
                      <span>Hủy: {formatDate(appointment.cancelledAt)}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        {detailAppointmentModal && (
          <AppointmentDetailModal
            appointmentData={detailAppointmentData}
            closeModal={() => setDetailAppointmentModal(false)}
          />
        )}
        {/* Empty State */}
        {filteredAppointments.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Calendar className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Không tìm thấy lịch hẹn
            </h3>
            <p className="text-gray-600">
              {appointments.length === 0
                ? "Chưa có lịch hẹn nào được tạo"
                : "Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingManager;

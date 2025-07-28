import React, { useState } from "react";
import {
  Calendar,
  Clock,
  MapPin,
  Phone,
  Mail,
  User,
  CreditCard,
  FileText,
  X,
  AlertCircle,
  Activity,
  Users,
  DollarSign,
  CheckCircle,
  XCircle,
  Eye,
  Building2,
  Heart,
  Stethoscope,
  CalendarCheck,
  Timer,
  Receipt,
  UserCheck,
  BadgeCheck,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useNotify } from "../../../hook/useNotify";
import { updateAppointmentStatus } from "../../../services/doctor.service";

// Mock data based on your structure

const AppointmentDetailModal = ({ appointmentData, closeModal }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [appointment] = useState(appointmentData);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { doctorAppointments, doctor } = useSelector((state) => state.doctor);
  const { user } = useSelector((state) => state.auth);
  const [appointments, setAppointments] = useState([]);

  const { notifySuccess, notifyWarning, notifyError, notifyConfirm } =
    useNotify();
  console.log({ appointment });
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      weekday: "long",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
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
      pending: "Đang chờ xác nhận",
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

  const getGenderText = (gender) => {
    return gender === "male"
      ? "Nam"
      : gender === "female"
      ? "Nữ"
      : "Chưa xác định";
  };

  const getPatientTypeText = (type) => {
    return type === "benhNhanMoi" ? "Bệnh nhân mới" : "Bệnh nhân cũ";
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
    } catch (error) {
      console.error("Error completing appointment:", error);
      alert("Có lỗi xảy ra khi hoàn thành lịch hẹn");
    }
  };

  return (
    <div
      onClick={closeModal}
      className="fixed inset-0 bg-[#00000011]  flex items-center justify-center p-4 z-50"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white shadow-2xl max-w-6xl w-full max-h-[90vh] rounded-lg overflow-hidden"
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white bg-opacity-20 rounded-lg">
                <Calendar className="w-6 h-6 text-blue-500" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">
                  Chi tiết lịch hẹn
                </h2>
                <p className="text-blue-100 text-sm">
                  Mã lịch hẹn: {appointment._id.slice(-8).toUpperCase()}
                </p>
              </div>
            </div>
            <button
              onClick={closeModal}
              className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
            >
              <X className="w-6 h-6 text-white" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1  max-h-[70vh]  p-6 overflow-y-auto">
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Left Column - Patient Info */}
              <div className="lg:col-span-2 space-y-6">
                {/* Patient Information */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <User className="w-5 h-5 text-blue-600" />
                    <h3 className="text-lg font-semibold text-gray-900">
                      Thông tin bệnh nhân
                    </h3>
                  </div>

                  <div className="flex items-start gap-4 mb-6">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center overflow-hidden">
                      {appointment.userId?.avatar?.url ? (
                        <img
                          src={appointment.userId.avatar.url}
                          alt="Patient avatar"
                          className="w-16 h-16 rounded-full object-cover"
                        />
                      ) : (
                        <User className="w-8 h-8 text-blue-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="text-xl font-semibold text-gray-900 mb-1">
                        {appointment.patientInfo?.fullName || "Chưa có tên"}
                      </h4>
                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                        <span>
                          {getGenderText(appointment.patientInfo?.gender)}
                        </span>
                        <span>•</span>
                        <span>
                          {calculateAge(appointment.patientInfo?.dateOfBirth)}{" "}
                          tuổi
                        </span>
                        <span>•</span>
                        <span className="text-blue-600 font-medium">
                          {getPatientTypeText(
                            appointment.patientInfo?.patientType
                          )}
                        </span>
                      </div>
                      <div className="text-sm text-gray-500">
                        Sinh ngày:{" "}
                        {new Date(
                          appointment.patientInfo?.dateOfBirth
                        ).toLocaleDateString("vi-VN")}
                      </div>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <Phone className="w-4 h-4 text-green-600" />
                        <div>
                          <p className="text-sm text-gray-500">Số điện thoại</p>
                          <p className="font-medium text-gray-900">
                            {appointment.patientInfo?.phone || "Chưa có SĐT"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Mail className="w-4 h-4 text-red-600" />
                        <div>
                          <p className="text-sm text-gray-500">Email</p>
                          <p className="font-medium text-gray-900">
                            {appointment.patientInfo?.email || "Chưa có email"}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <MapPin className="w-4 h-4 text-orange-600" />
                        <div>
                          <p className="text-sm text-gray-500">Địa chỉ</p>
                          <p className="font-medium text-gray-900">
                            {appointment.patientInfo?.address ||
                              "Chưa cập nhật địa chỉ"}
                          </p>
                        </div>
                      </div>
                      {appointment.patientInfo?.zalo && (
                        <div className="flex items-center gap-3">
                          <Phone className="w-4 h-4 text-blue-600" />
                          <div>
                            <p className="text-sm text-gray-500">Zalo</p>
                            <p className="font-medium text-gray-900">
                              {appointment.patientInfo.zalo}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Appointment Information */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <CalendarCheck className="w-5 h-5 text-green-600" />
                    <h3 className="text-lg font-semibold text-gray-900">
                      Thông tin lịch hẹn
                    </h3>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <Calendar className="w-5 h-5 text-blue-600" />
                        <div>
                          <p className="text-sm text-gray-500">Ngày khám</p>
                          <p className="font-semibold text-gray-900">
                            {formatDate(appointment.date)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Clock className="w-5 h-5 text-green-600" />
                        <div>
                          <p className="text-sm text-gray-500">Giờ khám</p>
                          <p className="font-semibold text-gray-900">
                            {appointment.timeSlots?.startTime} -{" "}
                            {appointment.timeSlots?.endTime}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(
                            appointment.status
                          )}`}
                        >
                          {getStatusText(appointment.status)}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Timer className="w-5 h-5 text-purple-600" />
                        <div>
                          <p className="text-sm text-gray-500">
                            Thời hạn thanh toán
                          </p>
                          <p className="font-medium text-gray-900">
                            {formatDateTime(appointment.paymentExpireAt)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Reason for visit */}
                  {appointment.patientInfo?.reason && (
                    <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-start gap-3">
                        <Activity className="w-5 h-5 text-blue-600 mt-0.5" />
                        <div className="flex-1">
                          <p className="font-medium text-blue-900 mb-1">
                            Lý do khám bệnh
                          </p>
                          <p className="text-blue-800">
                            {appointment.patientInfo.reason}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Important Notes */}
                  {appointment.notes && (
                    <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                        <div className="flex-1">
                          <p className="font-medium text-yellow-900 mb-1">
                            Ghi chú quan trọng
                          </p>
                          <p className="text-yellow-800">{appointment.notes}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Services */}
                {appointment.services && appointment.services.length > 0 && (
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <Stethoscope className="w-5 h-5 text-purple-600" />
                      <h3 className="text-lg font-semibold text-gray-900">
                        Dịch vụ khám ({appointment.services.length})
                      </h3>
                    </div>

                    <div className="space-y-4">
                      {appointment.services.map((service, index) => (
                        <div
                          key={service._id || index}
                          className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <FileText className="w-5 h-5 text-green-600" />
                                <h4 className="font-semibold text-gray-900">
                                  {service.name}
                                </h4>
                              </div>
                              {service.description && (
                                <p className="text-gray-600 text-sm mb-3">
                                  {service.description}
                                </p>
                              )}
                            </div>
                            <div className="text-right ml-4">
                              <p className="text-2xl font-bold text-blue-600">
                                {formatCurrency(service.price)}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-4 text-xs">
                            {service.followUpRequired && (
                              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                                <Heart className="w-3 h-3 inline mr-1" />
                                Yêu cầu tái khám
                              </span>
                            )}
                            {service.isPopular && (
                              <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                                <BadgeCheck className="w-3 h-3 inline mr-1" />
                                Phổ biến
                              </span>
                            )}
                            <span className="text-gray-500">
                              <Users className="w-3 h-3 inline mr-1" />
                              {service.bookingCount || 0} lượt đặt
                            </span>
                            <span
                              className={`px-2 py-1 rounded-full ${
                                service.isActive
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {service.isActive ? "Đang hoạt động" : "Tạm dừng"}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column - Payment & Actions */}
              <div className="space-y-6">
                {/* Payment Information */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Receipt className="w-5 h-5 text-green-600" />
                    <h3 className="text-lg font-semibold text-gray-900">
                      Thông tin thanh toán
                    </h3>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-600">Tổng tiền dịch vụ:</span>
                      <span className="font-semibold text-gray-900">
                        {formatCurrency(appointment.totalFee || 0)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between py-2">
                      <span className="text-gray-600">Phương thức:</span>
                      <span className="font-medium text-gray-900">
                        {getPaymentMethodText(appointment.paymentMethod)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between py-2">
                      <span className="text-gray-600">Trạng thái:</span>
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${getPaymentStatusColor(
                          appointment.paymentStatus
                        )}`}
                      >
                        {getPaymentStatusText(appointment.paymentStatus)}
                      </span>
                    </div>

                    <div className="pt-4 border-t border-gray-200">
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-semibold text-gray-900">
                          Tổng cộng:
                        </span>
                        <span className="text-2xl font-bold text-blue-600">
                          {formatCurrency(appointment.totalFee || 0)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Thao tác
                  </h3>

                  <div className="space-y-3">
                    {appointment.status === "pending" && (
                      <>
                        <button
                          onClick={() =>
                            handleConfirmAppointment(appointment._id)
                          }
                          className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                        >
                          <CheckCircle className="w-5 h-5" />
                          Xác nhận lịch hẹn
                        </button>
                        <button
                          onClick={() =>
                            handleCancelAppointment(appointment._id)
                          }
                          className="w-full px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                        >
                          <XCircle className="w-5 h-5" />
                          Từ chối lịch hẹn
                        </button>
                      </>
                    )}

                    {appointment.status === "confirmed" && (
                      <button className="w-full px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-2">
                        <CheckCircle className="w-5 h-5" />
                        Hoàn thành khám
                      </button>
                    )}

                    <button className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
                      <Phone className="w-5 h-5" />
                      Gọi điện thoại
                    </button>

                    <button className="w-full px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center justify-center gap-2">
                      <FileText className="w-5 h-5" />
                      In phiếu khám
                    </button>
                  </div>
                </div>

                {/* Timeline */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Activity className="w-5 h-5 text-blue-600" />
                    <h3 className="text-lg font-semibold text-gray-900">
                      Lịch sử thay đổi
                    </h3>
                  </div>

                  <div className="space-y-3 text-sm">
                    <div className="flex items-center gap-3 text-gray-600">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <div>
                        <p className="font-medium">Lịch hẹn được tạo</p>
                        <p className="text-xs text-gray-500">
                          {formatDateTime(appointment.createdAt)}
                        </p>
                      </div>
                    </div>

                    {appointment.updatedAt !== appointment.createdAt && (
                      <div className="flex items-center gap-3 text-gray-600">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                        <div>
                          <p className="font-medium">Cập nhật thông tin</p>
                          <p className="text-xs text-gray-500">
                            {formatDateTime(appointment.updatedAt)}
                          </p>
                        </div>
                      </div>
                    )}

                    {appointment.confirmedAt && (
                      <div className="flex items-center gap-3 text-gray-600">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <div>
                          <p className="font-medium">Đã xác nhận</p>
                          <p className="text-xs text-gray-500">
                            {formatDateTime(appointment.confirmedAt)}
                          </p>
                        </div>
                      </div>
                    )}

                    {appointment.completedAt && (
                      <div className="flex items-center gap-3 text-gray-600">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <div>
                          <p className="font-medium">Hoàn thành khám</p>
                          <p className="text-xs text-gray-500">
                            {formatDateTime(appointment.completedAt)}
                          </p>
                        </div>
                      </div>
                    )}

                    {appointment.cancelledAt && (
                      <div className="flex items-center gap-3 text-gray-600">
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        <div>
                          <p className="font-medium">Đã hủy</p>
                          <p className="text-xs text-gray-500">
                            {formatDateTime(appointment.cancelledAt)}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
            <div className="flex justify-end gap-3">
              <button
                onClick={closeModal}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppointmentDetailModal;

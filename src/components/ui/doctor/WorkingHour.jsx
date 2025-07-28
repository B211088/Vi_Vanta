import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchMySchedule,
  createMyWorkingHour,
  updateMyWorkingHour,
  deleteHardWorkingHour,
  toggleWorkingHourStatus,
  fetchDoctorByUserId,
} from "../../../services/doctor.service";
import { clearMessages } from "../../../store/slices/doctor.slice";
import {
  Clock,
  Calendar,
  Edit2,
  Plus,
  Trash2,
  X,
  Save,
  AlertCircle,
} from "lucide-react";
import {
  formatDateDDMMYY,
  formatDateYYYYMMDD,
} from "../../../utils/formatDate";

const WorkingHour = () => {
  const dispatch = useDispatch();
  const { workingHour, workingHourLoading, error, successMessage, doctor } =
    useSelector((state) => state.doctor);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    if (!doctor) {
      dispatch(fetchDoctorByUserId());
    }
  }, []);

  // Form state for creating/editing
  const [formData, setFormData] = useState({
    dayOfWeek: 1,
    timeSlots: [],
    isActive: true,
    endDate: "",
    startDate: "",
  });

  // Days of week mapping
  const daysOfWeek = {
    1: "Thứ Hai",
    2: "Thứ Ba",
    3: "Thứ Tư",
    4: "Thứ Năm",
    5: "Thứ Sáu",
    6: "Thứ Bảy",
    0: "Chủ Nhật",
  };

  useEffect(() => {
    dispatch(fetchMySchedule());
  }, [dispatch]);

  console.log({ workingHour, formData });

  // Handle success/error messages
  useEffect(() => {
    if (successMessage) {
      setNotification({ type: "success", message: successMessage });
      setTimeout(() => {
        setNotification(null);
        dispatch(clearMessages());
      }, 3000);
    }
    if (error) {
      setNotification({ type: "error", message: error });
      setTimeout(() => {
        setNotification(null);
        dispatch(clearMessages());
      }, 3000);
    }
  }, [successMessage, error, dispatch]);

  // Group schedules by day of week
  const groupedSchedules =
    workingHour?.reduce((acc, schedule) => {
      const day = schedule.dayOfWeek;
      if (!acc[day]) {
        acc[day] = [];
      }
      acc[day].push(schedule);
      return acc;
    }, {}) || {};

  // Merge time slots for same day
  const mergedSchedules = Object.keys(groupedSchedules)
    .map((day) => {
      const daySchedules = groupedSchedules[day];
      const allTimeSlots = daySchedules.flatMap(
        (schedule) => schedule.timeSlots
      );

      // Remove duplicates and sort
      const uniqueSlots = allTimeSlots
        .filter(
          (slot, index, self) =>
            index ===
            self.findIndex(
              (s) =>
                s.startTime === slot.startTime && s.endTime === slot.endTime
            )
        )
        .sort((a, b) => a.startTime.localeCompare(b.startTime));

      // Lấy startDate sớm nhất và endDate trễ nhất (trực tiếp vì là Date)
      const startDate = daySchedules.reduce(
        (min, s) => (s.startDate < min ? s.startDate : min),
        daySchedules[0].startDate
      );
      const endDate = daySchedules.reduce(
        (max, s) => (s.endDate > max ? s.endDate : max),
        daySchedules[0].endDate
      );

      return {
        dayOfWeek: parseInt(day),
        dayName: daysOfWeek[day],
        timeSlots: uniqueSlots,
        isActive: daySchedules.some((s) => s.isActive),
        scheduleIds: daySchedules.map((s) => s._id),
        startDate,
        endDate,
      };
    })
    .sort((a, b) => a.dayOfWeek - b.dayOfWeek);

  const formatTime = (time) => {
    return time;
  };

  const getAvailableCount = (timeSlots) => {
    return timeSlots.filter((slot) => slot.isAvailable).length;
  };

  const getTotalSlots = (timeSlots) => {
    return timeSlots.length;
  };

  // Add new time slot to form
  const addTimeSlot = () => {
    setFormData((prev) => ({
      ...prev,
      timeSlots: [
        ...prev.timeSlots,
        {
          startTime: "08:00",
          endTime: "08:30",
          isAvailable: true,
        },
      ],
    }));
  };

  // Remove time slot from form
  const removeTimeSlot = (index) => {
    setFormData((prev) => ({
      ...prev,
      timeSlots: prev.timeSlots.filter((_, i) => i !== index),
    }));
  };

  // Update time slot in form
  const updateTimeSlot = (index, field, value) => {
    setFormData((prev) => ({
      ...prev,
      timeSlots: prev.timeSlots.map((slot, i) =>
        i === index ? { ...slot, [field]: value } : slot
      ),
    }));
  };

  // Handle create working hour
  const handleCreate = async () => {
    try {
      await dispatch(createMyWorkingHour(formData));
      setShowCreateModal(false);
      setFormData({ dayOfWeek: 1, timeSlots: [], isActive: true });
      dispatch(fetchMySchedule()); // Refresh data
    } catch (error) {
      console.error("Error creating working hour:", error);
    }
  };

  // Handle edit working hour
  const handleEdit = (daySchedule) => {
    setEditingSchedule(daySchedule);
    setFormData({
      dayOfWeek: daySchedule.dayOfWeek,
      timeSlots: daySchedule.timeSlots,
      isActive: daySchedule.isActive,
      startDate: daySchedule.startDate,
      endDate: daySchedule.endDate,
    });
    setShowEditModal(true);
  };

  // Handle update working hour
  const handleUpdate = async () => {
    try {
      if (editingSchedule.scheduleIds.length > 0) {
        // Update the first schedule (or you might want to handle multiple schedules differently)
        await dispatch(
          updateMyWorkingHour(editingSchedule.scheduleIds[0], {
            ...formData,
            doctorId: doctor._id,
          })
        );
        setShowEditModal(false);
        setEditingSchedule(null);
        setFormData({ dayOfWeek: 1, timeSlots: [], isActive: true });
        dispatch(fetchMySchedule()); // Refresh data
      }
    } catch (error) {
      console.error("Error updating working hour:", error);
    }
  };

  // Handle delete time slot
  const handleDeleteTimeSlot = async (timeSlotId, daySchedule) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa ca làm việc này?")) {
      try {
        // Filter out the time slot to be deleted
        const updatedTimeSlots = daySchedule.timeSlots.filter(
          (slot) => slot._id !== timeSlotId
        );

        // If no time slots left, you might want to delete the entire working hour
        if (updatedTimeSlots.length === 0) {
          if (
            window.confirm(
              "Đây là ca cuối cùng. Bạn có muốn xóa toàn bộ ngày làm việc này không?"
            )
          ) {
            const scheduleId = daySchedule.scheduleIds[0];
            await dispatch(deleteHardWorkingHour(scheduleId));
            dispatch(fetchMySchedule());
            return;
          } else {
            return; // User cancelled, don't delete anything
          }
        }

        // Update the working hour with remaining time slots
        const updateData = {
          dayOfWeek: daySchedule.dayOfWeek,
          timeSlots: updatedTimeSlots,
          isActive: daySchedule.isActive,
        };

        // Use the first schedule ID for the day
        const scheduleId = daySchedule.scheduleIds[0];

        await dispatch(
          updateMyWorkingHour(scheduleId, {
            ...updateData,
            doctorId: doctor._id,
          })
        );
        dispatch(fetchMySchedule()); // Refresh data
      } catch (error) {
        console.error("Error deleting time slot:", error);
      }
    }
  };

  // Handle delete entire working day
  const handleDeleteWorkingDay = async (scheduleId) => {
    if (
      window.confirm("Bạn có chắc chắn muốn xóa toàn bộ ngày làm việc này?")
    ) {
      try {
        await dispatch(deleteHardWorkingHour(scheduleId));
        dispatch(fetchMySchedule()); // Refresh data
      } catch (error) {
        console.error("Error deleting working day:", error);
      }
    }
  };

  // Handle toggle status
  const handleToggleStatus = async (scheduleId, currentStatus) => {
    try {
      await dispatch(toggleWorkingHourStatus(scheduleId, currentStatus));
      dispatch(fetchMySchedule()); // Refresh data
    } catch (error) {
      console.error("Error toggling status:", error);
    }
  };

  // Time options for select
  const timeOptions = [];
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const time = `${hour.toString().padStart(2, "0")}:${minute
        .toString()
        .padStart(2, "0")}`;
      timeOptions.push(time);
    }
  }

  return (
    <div className="p-3 w-full min-h-screen">
      <div className="w-full">
        {/* Notification */}
        {notification && (
          <div
            className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg ${
              notification.type === "success" ? "bg-green-500" : "bg-red-500"
            } text-white`}
          >
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              <span>{notification.message}</span>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-500 rounded-xl">
                <Calendar className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Giờ Làm Việc
                </h1>
                <p className="text-gray-600">Quản lý lịch làm việc hàng tuần</p>
              </div>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              disabled={workingHourLoading.create}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
            >
              <Plus className="h-4 w-4" />
              {workingHourLoading.create ? "Đang tạo..." : "Thêm Ca Làm"}
            </button>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Tổng Ngày Làm</p>
                <p className="text-2xl font-bold text-gray-900">
                  {mergedSchedules.length}
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Calendar className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Tổng Ca Làm</p>
                <p className="text-2xl font-bold text-gray-900">
                  {mergedSchedules.reduce(
                    (total, day) => total + day.timeSlots.length,
                    0
                  )}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <Clock className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Ca Sẵn Sàng</p>
                <p className="text-2xl font-bold text-green-600">
                  {mergedSchedules.reduce(
                    (total, day) => total + getAvailableCount(day.timeSlots),
                    0
                  )}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <Clock className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Ngày Hoạt Động</p>
                <p className="text-2xl font-bold text-blue-600">
                  {mergedSchedules.filter((day) => day.isActive).length}
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Calendar className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Schedule Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6">
          {mergedSchedules.map((daySchedule) => (
            <div
              key={daySchedule.dayOfWeek}
              className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
            >
              {/* Day Header */}
              <div
                className={`p-4 ${
                  daySchedule.isActive ? "bg-blue-50" : "bg-gray-50"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-3 h-3 rounded-full ${
                        daySchedule.isActive ? "bg-green-500" : "bg-gray-400"
                      }`}
                    ></div>
                    <h3 className="font-semibold text-gray-900">
                      {daySchedule.dayName}
                    </h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        handleToggleStatus(
                          daySchedule.scheduleIds[0],
                          daySchedule.isActive
                        )
                      }
                      className={`px-2 py-1 text-xs rounded-full transition-colors ${
                        daySchedule.isActive
                          ? "bg-green-100 text-green-700 hover:bg-green-200"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      {daySchedule.isActive ? "Hoạt động" : "Tạm ngưng"}
                    </button>
                    <button
                      onClick={() => handleEdit(daySchedule)}
                      className="p-1 text-gray-400 hover:text-gray-600"
                      title="Chỉnh sửa ngày làm việc"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() =>
                        handleDeleteWorkingDay(daySchedule.scheduleIds[0])
                      }
                      disabled={workingHourLoading.delete}
                      className="p-1 text-gray-400 hover:text-red-600 disabled:opacity-50"
                      title="Xóa toàn bộ ngày làm việc"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="mt-2 flex items-center gap-4 text-sm text-gray-600">
                  <span>{getTotalSlots(daySchedule.timeSlots)} ca làm</span>
                  <span className="text-green-600">
                    {getAvailableCount(daySchedule.timeSlots)} sẵn sàng
                  </span>
                </div>
                <div className="mt-2 flex flex-col gap-1 text-sm text-gray-600">
                  <span>
                    Từ ngày: {formatDateDDMMYY(daySchedule.startDate)}
                  </span>

                  <span>
                    {" "}
                    Đến ngày: {formatDateDDMMYY(daySchedule.endDate)}
                  </span>
                </div>
              </div>

              {/* Time Slots */}
              <div className="p-4">
                <div className="space-y-2 ">
                  {daySchedule.timeSlots.length > 0 ? (
                    daySchedule.timeSlots.map((slot, index) => (
                      <div
                        key={slot._id || index}
                        className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                          slot.isAvailable
                            ? "bg-green-50 border-green-200 hover:bg-green-100"
                            : "bg-red-50 border-red-200"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Clock
                            className={`h-4 w-4 ${
                              slot.isAvailable
                                ? "text-green-600"
                                : "text-red-600"
                            }`}
                          />
                          <span className="font-medium text-gray-900">
                            {formatTime(slot.startTime)} -{" "}
                            {formatTime(slot.endTime)}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-1 text-xs rounded-full ${
                              slot.isAvailable
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {slot.isAvailable ? "Sẵn sàng" : "Bận"}
                          </span>
                          <button
                            onClick={() =>
                              handleDeleteTimeSlot(slot._id, daySchedule)
                            }
                            disabled={workingHourLoading.update}
                            className="p-1 text-gray-400 hover:text-red-600 disabled:opacity-50"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Clock className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                      <p className="text-sm">Chưa có ca làm việc</p>
                      <button
                        onClick={() => setShowCreateModal(true)}
                        className="mt-2 text-blue-500 text-sm hover:underline"
                      >
                        Thêm ca làm việc
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {mergedSchedules.length === 0 && (
          <div className="text-center py-16">
            <Calendar className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Chưa có lịch làm việc
            </h3>
            <p className="text-gray-600 mb-6">
              Tạo lịch làm việc để bắt đầu nhận đặt lịch từ bệnh nhân
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Tạo Lịch Làm Việc
            </button>
          </div>
        )}

        {/* Create Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-[#00000020] bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  Tạo Ca Làm Việc Mới
                </h2>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="p-1 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Doctor ID (Hidden field for debugging) */}
                {formData.doctorId && (
                  <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
                    Doctor ID: {formData.doctorId}
                  </div>
                )}

                {/* Day of Week */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ngày trong tuần
                  </label>
                  <select
                    value={formData.dayOfWeek}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        dayOfWeek: parseInt(e.target.value),
                      }))
                    }
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {Object.entries(daysOfWeek).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Time Slots */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Ca làm việc
                    </label>
                    <button
                      onClick={addTimeSlot}
                      className="flex items-center gap-1 px-2 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                      <Plus className="h-3 w-3" />
                      Thêm ca
                    </button>
                  </div>

                  <div className="space-y-2 max-h-90 overflow-y-auto">
                    {formData.timeSlots.map((slot, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 p-3 border border-gray-200 rounded-lg"
                      >
                        <select
                          value={slot.startTime}
                          onChange={(e) =>
                            updateTimeSlot(index, "startTime", e.target.value)
                          }
                          className="flex-1 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                        >
                          {timeOptions.map((time) => (
                            <option key={time} value={time}>
                              {time}
                            </option>
                          ))}
                        </select>
                        <span className="text-gray-500">-</span>
                        <select
                          value={slot.endTime}
                          onChange={(e) =>
                            updateTimeSlot(index, "endTime", e.target.value)
                          }
                          className="flex-1 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                        >
                          {timeOptions.map((time) => (
                            <option key={time} value={time}>
                              {time}
                            </option>
                          ))}
                        </select>
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={slot.isAvailable}
                            onChange={(e) =>
                              updateTimeSlot(
                                index,
                                "isAvailable",
                                e.target.checked
                              )
                            }
                            className="w-4 h-4 text-blue-600"
                          />
                          <span className="text-sm text-gray-700">
                            Sẵn sàng
                          </span>
                        </label>
                        <button
                          onClick={() => removeTimeSlot(index)}
                          className="p-1 text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="w-full flex items-center gap-3">
                  <div className="flex flex-1 flex-col gap-2 ">
                    <label className="text-sm text-gray-700">
                      Ngày bắt đầu
                    </label>
                    <div className="border-1 border-dark-800 p-2 rounded-lg">
                      <input
                        type="date"
                        value={formData.startDate}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            startDate: e.target.value,
                          }))
                        }
                        placeholder="Chọn ngày bắt đầu lịch"
                        className="w-full text-blue-600"
                      />
                    </div>
                  </div>
                  <div className="flex flex-1 flex-col gap-2 ">
                    <label className="text-sm text-gray-700">
                      Ngày bắt kết thúc
                    </label>
                    <div className="border-1 border-dark-800 p-2 rounded-lg">
                      <input
                        type="date"
                        value={formData.endDate}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            endDate: e.target.value,
                          }))
                        }
                        placeholder="Chọn ngày bắt đầu lịch"
                        className="w-full text-blue-600"
                      />
                    </div>
                  </div>
                </div>

                {/* Active Status */}
                <div>
                  <label className="flex items-center gap-2 mt-10">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          isActive: e.target.checked,
                        }))
                      }
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      Kích hoạt lịch làm việc
                    </span>
                  </label>
                </div>
              </div>

              <div className="flex items-center gap-3 mt-6">
                <button
                  onClick={handleCreate}
                  disabled={
                    workingHourLoading.create || formData.timeSlots.length === 0
                  }
                  className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
                >
                  <Save className="h-4 w-4" />
                  {workingHourLoading.create
                    ? "Đang tạo..."
                    : "Tạo Ca Làm Việc"}
                </button>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Hủy
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {showEditModal && (
          <div className="fixed inset-0 bg-[#0000001c] bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  Chỉnh Sửa Ca Làm Việc
                </h2>
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setFormData({
                      dayOfWeek: 1,
                      timeSlots: [],
                      isActive: false,
                      startDate: "",
                      endDate: "",
                    });
                  }}
                  className="p-1 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Doctor ID (Hidden field for debugging) */}
                {formData.doctorId && (
                  <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
                    Doctor ID: {formData.doctorId}
                  </div>
                )}

                {/* Day of Week (Read only in edit mode) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ngày trong tuần
                  </label>
                  <input
                    type="text"
                    value={daysOfWeek[formData.dayOfWeek]}
                    readOnly
                    className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50"
                  />
                </div>

                {/* Time Slots */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Ca làm việc
                    </label>
                    <button
                      onClick={addTimeSlot}
                      className="flex items-center gap-1 px-2 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                      <Plus className="h-3 w-3" />
                      Thêm ca
                    </button>
                  </div>

                  <div className="space-y-2 max-h-90 overflow-y-auto">
                    {formData.timeSlots.map((slot, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 p-3 border border-gray-200 rounded-lg"
                      >
                        <select
                          value={slot.startTime}
                          onChange={(e) =>
                            updateTimeSlot(index, "startTime", e.target.value)
                          }
                          className="flex-1 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                        >
                          {timeOptions.map((time) => (
                            <option key={time} value={time}>
                              {time}
                            </option>
                          ))}
                        </select>
                        <span className="text-gray-500">-</span>
                        <select
                          value={slot.endTime}
                          onChange={(e) =>
                            updateTimeSlot(index, "endTime", e.target.value)
                          }
                          className="flex-1 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                        >
                          {timeOptions.map((time) => (
                            <option key={time} value={time}>
                              {time}
                            </option>
                          ))}
                        </select>
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={slot.isAvailable}
                            onChange={(e) =>
                              updateTimeSlot(
                                index,
                                "isAvailable",
                                e.target.checked
                              )
                            }
                            className="w-4 h-4 text-blue-600"
                          />
                          <span className="text-sm text-gray-700">
                            Sẵn sàng
                          </span>
                        </label>
                        <button
                          onClick={() => removeTimeSlot(index)}
                          className="p-1 text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="w-full flex items-center gap-3">
                  <div className="flex flex-1 flex-col gap-2 ">
                    <label className="text-sm text-gray-700">
                      Ngày bắt đầu
                    </label>
                    <div className="border-1 border-dark-800 p-2 rounded-lg">
                      <input
                        type="date"
                        value={formatDateYYYYMMDD(formData.startDate)}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            startDate: e.target.value,
                          }))
                        }
                        placeholder="Chọn ngày bắt đầu lịch"
                        className="w-full text-blue-600"
                      />
                    </div>
                  </div>
                  <div className="flex flex-1 flex-col gap-2 ">
                    <label className="text-sm text-gray-700">
                      Ngày bắt kết thúc
                    </label>
                    <div className="border-1 border-dark-800 p-2 rounded-lg">
                      <input
                        type="date"
                        value={formatDateYYYYMMDD(formData.endDate)}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            endDate: e.target.value,
                          }))
                        }
                        placeholder="Chọn ngày bắt đầu lịch"
                        className="w-full text-blue-600"
                      />
                    </div>
                  </div>
                </div>
                {/* Active Status */}
                <div>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          isActive: e.target.checked,
                        }))
                      }
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      Kích hoạt lịch làm việc
                    </span>
                  </label>
                </div>
              </div>

              <div className="flex items-center gap-3 mt-6">
                <button
                  onClick={handleUpdate}
                  disabled={
                    workingHourLoading.update || formData.timeSlots.length === 0
                  }
                  className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
                >
                  <Save className="h-4 w-4" />
                  {workingHourLoading.update ? "Đang cập nhật..." : "Cập Nhật"}
                </button>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Hủy
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkingHour;

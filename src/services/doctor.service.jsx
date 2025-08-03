import axios from "axios";
import { API_URL } from "../config/api.config";
import {
  fetchAppointmentsStart,
  fetchAppointmentsSuccess,
  fetchAppointmentsFailure,
  fetchAppointmentStart,
  fetchAppointmentSuccess,
  fetchAppointmentFailure,
  updateAppointmentStatusStart,
  updateAppointmentStatusSuccess,
  updateAppointmentStatusFailure,
  updateAppointmentStart,
  updateAppointmentSuccess,
  updateAppointmentFailure,
  addAppointmentNotesStart,
  addAppointmentNotesSuccess,
  addAppointmentNotesFailure,
  bulkUpdateAppointmentsStart,
  bulkUpdateAppointmentsSuccess,
  bulkUpdateAppointmentsFailure,
  updateStatistics,
  fetchDoctorsStart,
  fetchDoctorsSuccess,
  fetchDoctorsFailure,
  fetchWorkingHourStart,
  fetchWorkingHourSuccess,
  createWorkingHourStart,
  createWorkingHourSuccess,
  createWorkingHourFailure,
  updateWorkingHourStart,
  updateWorkingHourSuccess,
  updateWorkingHourFailure,
  deleteWorkingHourStart,
  deleteWorkingHourSuccess,
  deleteWorkingHourFailure,
  fetchDoctorStart,
  fetchDoctorSuccess,
  fetchDoctorFailure,
  fetchWorkingHourFailure,
  fetchServicesStart,
  fetchServicesSuccess,
  fetchServicesFailure,
  fetchServiceStart,
  fetchServiceSuccess,
  fetchServiceFailure,
  createServiceStart,
  createServiceSuccess,
  createServiceFailure,
  updateServiceStart,
  updateServiceSuccess,
  updateServiceFailure,
  toggleServiceStatusStart,
  toggleServiceStatusSuccess,
  toggleServiceStatusFailure,
  duplicateServiceStart,
  duplicateServiceSuccess,
  duplicateServiceFailure,
  deleteServiceStart,
  deleteServiceSuccess,
  deleteServiceFailure,
  hardDeleteServiceStart,
  hardDeleteServiceSuccess,
  hardDeleteServiceFailure,
  bulkUpdateServicesStart,
  bulkUpdateServicesSuccess,
  bulkUpdateServicesFailure,
  exportServicesStart,
  exportServicesSuccess,
  exportServicesFailure,
  fetchServiceAnalyticsStart,
  fetchServiceAnalyticsSuccess,
  fetchServiceAnalyticsFailure,
  fetchServiceStatsStart,
  fetchServiceStatsSuccess,
  fetchServiceStatsFailure,
} from "../store/slices/doctor.slice";

const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  withCredentials: true,
});

export const registerDoctor = (payload) => async (dispatch) => {
  try {
    const response = await api.post(`/api/v1/doctors/register`, payload);
    return response.data;
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || "Không thể đăng ký trở thành bác sĩ!";
    dispatch(fetchDoctorFailure(errorMessage));
    throw error;
  }
};

export const fetchDoctors =
  (params = {}) =>
  async (dispatch) => {
    try {
      dispatch(fetchDoctorsStart());
      const response = await api.get("api/v1/doctors", { params });

      dispatch(fetchDoctorsSuccess(response.data.data));
      return response.data;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Không thể tải danh sách bác sĩ";
      dispatch(fetchDoctorsFailure(errorMessage));
      throw error;
    }
  };

export const fetchDoctorByUserId = () => async (dispatch) => {
  try {
    dispatch(fetchDoctorStart());
    const response = await api.get("api/v1/doctors/user");

    dispatch(fetchDoctorSuccess(response.data.data));
    return response.data;
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || "Không thể tải thông tin bác sĩ!";
    dispatch(fetchDoctorFailure(errorMessage));
    throw error;
  }
};

// ================== APPOINTMENT MANAGEMENT SERVICES ==================

// Get doctor's appointments with filters and pagination
export const getDoctorAppointments =
  (doctorId, params = {}) =>
  async (dispatch) => {
    try {
      dispatch(fetchAppointmentsStart());

      const response = await api.get(
        `/api/v1/booking/doctors/${doctorId}/appointments`,
        { params }
      );

      // Calculate statistics from the appointments
      const appointments = response.data.data.appointments || [];
      const statistics = calculateAppointmentStatistics(appointments);
      console.log({ response });
      dispatch(
        fetchAppointmentsSuccess({
          appointments: appointments,
          pagination: response.data.data.pagination || {},
          statistics: statistics,
        })
      );

      return { success: true, data: response.data.data };
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Không thể lấy danh sách lịch khám";
      dispatch(fetchAppointmentsFailure(errorMessage));
      throw error;
    }
  };

// Get single appointment details
export const getAppointmentById = (appointmentId) => async (dispatch) => {
  try {
    dispatch(fetchAppointmentStart());

    const response = await api.get(
      `/api/v1/booking/appointments/${appointmentId}`
    );

    dispatch(fetchAppointmentSuccess(response.data.data));
    return { success: true, data: response.data.data };
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || "Không thể lấy thông tin lịch hẹn";
    dispatch(fetchAppointmentFailure(errorMessage));
    throw error;
  }
};

// Update appointment status
export const updateAppointmentStatus =
  (appointmentId, status, reason = "") =>
  async (dispatch) => {
    try {
      dispatch(updateAppointmentStatusStart());

      const response = await api.put(
        `/api/v1/booking/appointments/${appointmentId}/status`,
        { status, reason }
      );

      dispatch(
        updateAppointmentStatusSuccess({
          appointmentId,
          status,
          updatedData: response.data.data, // Đây là toàn bộ appointment object từ server
        })
      );

      return { success: true, data: response.data.data };
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        "Không thể cập nhật trạng thái lịch hẹn";
      dispatch(updateAppointmentStatusFailure(errorMessage));
      throw error;
    }
  };

// Update appointment details
export const updateAppointmentDetails =
  (appointmentId, updateData) => async (dispatch) => {
    try {
      dispatch(updateAppointmentStart());

      const response = await api.put(
        `/api/v1/booking/appointments/${appointmentId}`,
        updateData
      );

      dispatch(updateAppointmentSuccess(response.data.data));
      return { success: true, data: response.data.data };
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        "Không thể cập nhật thông tin lịch hẹn";
      dispatch(updateAppointmentFailure(errorMessage));
      throw error;
    }
  };

// Add doctor notes to appointment
export const addAppointmentNotes =
  (appointmentId, notes) => async (dispatch) => {
    try {
      dispatch(addAppointmentNotesStart());

      const response = await api.put(
        `/api/v1/booking/appointments/${appointmentId}/notes`,
        { doctorNotes: notes }
      );

      dispatch(
        addAppointmentNotesSuccess({
          appointmentId,
          notes: response.data.data.doctorNotes,
        })
      );

      return { success: true, data: response.data.data };
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Không thể thêm ghi chú";
      dispatch(addAppointmentNotesFailure(errorMessage));
      throw error;
    }
  };

// Reschedule appointment
export const rescheduleAppointment =
  (appointmentId, newDate, newTimeSlot) => async (dispatch) => {
    try {
      dispatch(updateAppointmentStart());

      const response = await api.put(
        `/api/v1/booking/appointments/${appointmentId}/reschedule`,
        {
          date: newDate,
          timeSlots: newTimeSlot,
        }
      );

      dispatch(updateAppointmentSuccess(response.data.data));
      return { success: true, data: response.data.data };
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Không thể thay đổi lịch hẹn";
      dispatch(updateAppointmentFailure(errorMessage));
      throw error;
    }
  };

// Bulk update appointments
export const bulkUpdateAppointments =
  (appointmentIds, updateData) => async (dispatch) => {
    try {
      dispatch(bulkUpdateAppointmentsStart());

      const response = await api.put(
        `/api/v1/booking/appointments/bulk-update`,
        {
          appointmentIds,
          updateData,
        }
      );

      dispatch(
        bulkUpdateAppointmentsSuccess({
          appointmentIds,
          updates: updateData,
          results: response.data.data,
        })
      );

      return { success: true, data: response.data.data };
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Không thể cập nhật hàng loạt";
      dispatch(bulkUpdateAppointmentsFailure(errorMessage));
      throw error;
    }
  };

// ================== STATISTICS AND ANALYTICS ==================

// Get appointment statistics
export const getAppointmentStatistics =
  (doctorId, dateRange = {}) =>
  async (dispatch) => {
    try {
      const response = await api.get(
        `/api/v1/booking/doctors/${doctorId}/statistics`,
        { params: dateRange }
      );

      dispatch(updateStatistics(response.data.data));
      return { success: true, data: response.data.data };
    } catch (error) {
      console.error("Error fetching statistics:", error);
      throw error;
    }
  };

// Get appointment analytics
export const getAppointmentAnalytics =
  (doctorId, period = "month") =>
  async () => {
    try {
      const response = await api.get(
        `/api/v1/booking/doctors/${doctorId}/analytics`,
        { params: { period } }
      );

      return { success: true, data: response.data.data };
    } catch (error) {
      console.error("Error fetching analytics:", error);
      throw error;
    }
  };

// ================== NOTIFICATION SERVICES ==================

// Send appointment reminder
export const sendAppointmentReminder =
  (appointmentId, reminderType) => async () => {
    try {
      const response = await api.post(
        `/api/v1/booking/appointments/${appointmentId}/reminder`,
        { reminderType }
      );

      return { success: true, data: response.data.data };
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Không thể gửi nhắc nhở";
      throw new Error(errorMessage);
    }
  };

// Send appointment confirmation
export const sendAppointmentConfirmation = (appointmentId) => async () => {
  try {
    const response = await api.post(
      `/api/v1/booking/appointments/${appointmentId}/confirm-notification`
    );

    return { success: true, data: response.data.data };
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || "Không thể gửi xác nhận";
    throw new Error(errorMessage);
  }
};

// ================== UTILITY FUNCTIONS ==================

// Calculate appointment statistics from data
const calculateAppointmentStatistics = (appointments) => {
  const today = new Date().toISOString().split("T")[0];

  const stats = {
    total: appointments.length,
    pending: 0,
    confirmed: 0,
    completed: 0,
    cancelled: 0,
    todayAppointments: 0,
    totalRevenue: 0,
  };

  appointments.forEach((appointment) => {
    // Count by status
    if (appointment.status === "pending") stats.pending++;
    else if (appointment.status === "confirmed") stats.confirmed++;
    else if (appointment.status === "completed") stats.completed++;
    else if (appointment.status === "cancelled") stats.cancelled++;

    // Count today's appointments
    const appointmentDate = new Date(appointment.date)
      .toISOString()
      .split("T")[0];
    if (appointmentDate === today) {
      stats.todayAppointments++;
    }

    // Calculate revenue (only paid appointments)
    if (appointment.paymentStatus === "paid") {
      stats.totalRevenue += appointment.totalFee || 0;
    }
  });

  return stats;
};

export const fetchMySchedule = () => async (dispatch) => {
  try {
    dispatch(fetchWorkingHourStart());
    const response = await api.get("api/v1/doctors/my-schedule");

    dispatch(fetchWorkingHourSuccess(response.data.data));
    return response.data;
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || "Không thể tải lịch làm việc!";
    throw error;
  }
};

// POST /my-schedule - Create new working hour
export const createMyWorkingHour = (workingHourData) => async (dispatch) => {
  try {
    dispatch(createWorkingHourStart());
    const response = await api.post(
      "api/v1/doctors/my-schedule",
      workingHourData
    );

    dispatch(createWorkingHourSuccess(response.data.data));
    return response.data;
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || "Không thể tạo ca làm việc!";
    dispatch(createWorkingHourFailure(errorMessage));
    throw error;
  }
};

// PUT /my-schedule/:id - Update working hour
export const updateMyWorkingHour =
  (id, workingHourData) => async (dispatch) => {
    try {
      dispatch(updateWorkingHourStart());
      const response = await api.put(
        `api/v1/doctors/my-schedule/${id}`,
        workingHourData
      );

      dispatch(updateWorkingHourSuccess(response.data.data));
      return response.data;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Không thể cập nhật ca làm việc!";
      dispatch(updateWorkingHourFailure(errorMessage));
      throw error;
    }
  };

// DELETE /my-schedule/hard/:id - Hard delete working hour
export const deleteHardWorkingHour = (id) => async (dispatch) => {
  try {
    dispatch(deleteWorkingHourStart());
    await api.delete(`api/v1/doctors/my-schedule/hard/${id}`);

    dispatch(deleteWorkingHourSuccess(id));
    return { success: true, message: "Xóa ca làm việc thành công!" };
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || "Không thể xóa ca làm việc!";
    dispatch(deleteWorkingHourFailure(errorMessage));
    throw error;
  }
};

// ================== UTILITY FUNCTIONS ==================

// Helper function to handle API errors consistently

// Bulk operations for working hours
export const createMultipleWorkingHours =
  (workingHoursArray) => async (dispatch) => {
    try {
      dispatch(createWorkingHourStart());

      const promises = workingHoursArray.map((workingHour) =>
        api.post("api/v1/doctors/my-schedule", workingHour)
      );

      const responses = await Promise.all(promises);

      // Add all created working hours to state
      responses.forEach((response) => {
        dispatch(createWorkingHourSuccess(response.data.data));
      });

      return { success: true, count: responses.length };
    } catch (error) {
      const errorMessage = handleApiError(
        error,
        "Không thể tạo nhiều ca làm việc!"
      );
      dispatch(createWorkingHourFailure(errorMessage));
      throw error;
    }
  };

// Update multiple time slots for a working hour
export const updateWorkingHourTimeSlots =
  (id, timeSlots) => async (dispatch) => {
    try {
      dispatch(updateWorkingHourStart());
      const response = await api.put(`api/v1/doctors/my-schedule/${id}`, {
        timeSlots: timeSlots,
      });

      dispatch(updateWorkingHourSuccess(response.data.data));
      return response.data;
    } catch (error) {
      const errorMessage = handleApiError(
        error,
        "Không thể cập nhật ca làm việc!"
      );
      dispatch(updateWorkingHourFailure(errorMessage));
      throw error;
    }
  };

// Toggle working hour active status
export const toggleWorkingHourStatus = (id, isActive) => async (dispatch) => {
  try {
    dispatch(updateWorkingHourStart());
    const response = await api.put(`api/v1/doctors/my-schedule/${id}`, {
      isActive: !isActive,
    });

    dispatch(updateWorkingHourSuccess(response.data.data));
    return response.data;
  } catch (error) {
    const errorMessage = handleApiError(
      error,
      "Không thể thay đổi trạng thái ca làm việc!"
    );
    dispatch(updateWorkingHourFailure(errorMessage));
    throw error;
  }
};

// Format error message consistently
export const handleApiError = (error, defaultMessage) => {
  if (error.response) {
    // Server responded with error status
    return error.response.data?.message || defaultMessage;
  } else if (error.request) {
    // Request was made but no response received
    return "Không thể kết nối đến server";
  } else {
    // Something else happened
    return error.message || defaultMessage;
  }
};

// Validate appointment data
export const validateAppointmentData = (appointmentData) => {
  const errors = {};

  if (!appointmentData.patientInfo?.fullName) {
    errors.patientName = "Tên bệnh nhân không được để trống";
  }

  if (!appointmentData.patientInfo?.phone) {
    errors.patientPhone = "Số điện thoại không được để trống";
  }

  if (!appointmentData.date) {
    errors.date = "Ngày khám không được để trống";
  }

  if (!appointmentData.timeSlots) {
    errors.timeSlots = "Giờ khám không được để trống";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

export const getMyServices =
  (doctorId, params = {}) =>
  async (dispatch) => {
    dispatch(fetchServicesStart());
    try {
      const response = await api.get(
        `/api/v1/booking-services/my/service/${doctorId}`,
        { params }
      );

      dispatch(fetchServicesSuccess(response.data.data));
      return response.data;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Lỗi khi tải danh sách dịch vụ";
      dispatch(fetchServicesFailure(errorMessage));
      throw error;
    }
  };

// Get single service
export const getServiceById = (serviceId) => async (dispatch) => {
  dispatch(fetchServiceStart());
  try {
    const response = await api.get(`/api/v1/booking-services/${serviceId}`);
    dispatch(fetchServiceSuccess(response.data.data));
    return response.data;
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || "Lỗi khi tải thông tin dịch vụ";
    dispatch(fetchServiceFailure(errorMessage));
    throw error;
  }
};

// Get my service statistics (doctor only)
export const getServiceStats = (doctorId) => async (dispatch) => {
  dispatch(fetchServiceStatsStart());
  try {
    const response = await api.get(
      `/api/v1/booking-services/my/stats/${doctorId}`
    );
    dispatch(fetchServiceStatsSuccess(response.data.data));
    return response.data;
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || "Lỗi khi tải thống kê dịch vụ";
    dispatch(fetchServiceStatsFailure(errorMessage));
    throw error;
  }
};

// Export my services (doctor only)
export const exportServices =
  (doctorId, format = "excel") =>
  async (dispatch) => {
    dispatch(exportServicesStart());
    try {
      const response = await api.get(
        `/api/v1/booking-services/my/export/${doctorId}?format=${format}`,
        {
          responseType: "blob", // Important for file downloads
        }
      );

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `services_export_${new Date().toISOString().split("T")[0]}.xlsx`
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      dispatch(exportServicesSuccess());
      return response.data;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Lỗi khi xuất dữ liệu dịch vụ";
      dispatch(exportServicesFailure(errorMessage));
      throw error;
    }
  };

// Create new service for myself (doctor only)
export const createService = (doctorId, serviceData) => async (dispatch) => {
  dispatch(createServiceStart());
  try {
    const response = await api.post(
      `/api/v1/booking-services/my/create/${doctorId}`,
      serviceData
    );
    dispatch(createServiceSuccess(response.data));
    return response.data;
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || "Lỗi khi tạo dịch vụ mới";
    dispatch(createServiceFailure(errorMessage));
    throw error;
  }
};

// Update my service (doctor only)
export const updateService = (serviceId, serviceData) => async (dispatch) => {
  dispatch(updateServiceStart());
  try {
    const response = await api.put(
      `/api/v1/booking-services/my/${serviceId}`,
      serviceData
    );
    dispatch(updateServiceSuccess(response.data.data));
    return response.data;
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || "Lỗi khi cập nhật dịch vụ";
    dispatch(updateServiceFailure(errorMessage));
    throw error;
  }
};

// Toggle my service status (doctor only)
export const toggleServiceStatus = (serviceId) => async (dispatch) => {
  dispatch(toggleServiceStatusStart());
  try {
    const response = await api.patch(
      `/api/v1/booking-services/my/${serviceId}/toggle`
    );
    dispatch(
      toggleServiceStatusSuccess({
        serviceId,
        isActive: response.data.data.isActive,
      })
    );
    return response.data;
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || "Lỗi khi thay đổi trạng thái dịch vụ";
    dispatch(toggleServiceStatusFailure(errorMessage));
    throw error;
  }
};

// Duplicate my service (doctor only)
export const duplicateService = (serviceId) => async (dispatch) => {
  dispatch(duplicateServiceStart());
  try {
    const response = await api.post(
      `/api/v1/booking-services/my/${serviceId}/duplicate`
    );
    dispatch(duplicateServiceSuccess(response.data.data));
    return response.data;
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || "Lỗi khi sao chép dịch vụ";
    dispatch(duplicateServiceFailure(errorMessage));
    throw error;
  }
};

// Soft delete my service (doctor only)
export const deleteService = (serviceId) => async (dispatch) => {
  dispatch(deleteServiceStart());
  try {
    await api.delete(`/api/v1/booking-services/my/${serviceId}`);
    dispatch(deleteServiceSuccess(serviceId));
    return { success: true };
  } catch (error) {
    const errorMessage = error.response?.data?.message || "Lỗi khi xóa dịch vụ";
    dispatch(deleteServiceFailure(errorMessage));
    throw error;
  }
};

// Hard delete my service (doctor only)
export const hardDeleteService = (serviceId) => async (dispatch) => {
  dispatch(hardDeleteServiceStart());
  try {
    await api.delete(`/api/v1/booking-services/my/${serviceId}/hard`);
    dispatch(hardDeleteServiceSuccess(serviceId));
    return { success: true };
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || "Lỗi khi xóa vĩnh viễn dịch vụ";
    dispatch(hardDeleteServiceFailure(errorMessage));
    throw error;
  }
};

// Bulk update my services (doctor only)
export const bulkUpdateServices = (updateData) => async (dispatch) => {
  dispatch(bulkUpdateServicesStart());
  try {
    const response = await api.patch(
      `/api/v1/booking-services/my/bulk-update`,
      updateData
    );
    dispatch(bulkUpdateServicesSuccess(response.data.data));
    return response.data;
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || "Lỗi khi cập nhật hàng loạt dịch vụ";
    dispatch(bulkUpdateServicesFailure(errorMessage));
    throw error;
  }
};

// Get analytics for my service (doctor only)
export const getServiceAnalytics =
  (serviceId, timeRange = "month") =>
  async (dispatch) => {
    dispatch(fetchServiceAnalyticsStart());
    try {
      const response = await api.get(
        `/api/v1/booking-services/my/${serviceId}/analytics?timeRange=${timeRange}`
      );
      dispatch(fetchServiceAnalyticsSuccess(response.data.data));
      return response.data;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Lỗi khi tải phân tích dịch vụ";
      dispatch(fetchServiceAnalyticsFailure(errorMessage));
      throw error;
    }
  };

// Helper functions for common operations
export const searchServices = (doctorId, searchParams) => async (dispatch) => {
  return dispatch(
    getMyServices(doctorId, {
      search: searchParams.searchTerm,
      status: searchParams.status,
      category: searchParams.category,
      minPrice: searchParams.priceRange?.min,
      maxPrice: searchParams.priceRange?.max,
      sortBy: searchParams.sortBy,
      sortOrder: searchParams.sortOrder,
      page: searchParams.page || 1,
      limit: searchParams.limit || 10,
    })
  );
};

import axios from "axios";
import { API_URL } from "../config/api.config";
import {
  // Available slots
  getAvailableSlotsSuccess,
  getAvailableSlotsFailure,
  availableSlotsLoadingStart,

  // Create appointment
  createAppointmentSuccess,
  createAppointmentFailure,
  createAppointmentLoadingStart,

  // Get appointment by ID
  getAppointmentByIdSuccess,
  getAppointmentByIdFailure,
  getAppointmentByIdLoadingStart,

  // Update appointment status
  updateAppointmentStatusSuccess,
  updateAppointmentStatusFailure,
  updateAppointmentStatusLoadingStart,

  // Cancel appointment
  cancelAppointmentSuccess,
  cancelAppointmentFailure,
  cancelAppointmentLoadingStart,

  // Get user appointments
  getUserAppointmentsSuccess,
  getUserAppointmentsFailure,
  getUserAppointmentsLoadingStart,

  // Get doctor appointments
  getDoctorAppointmentsSuccess,
  getDoctorAppointmentsFailure,
  getDoctorAppointmentsLoadingStart,

  // Process payment
  processPaymentSuccess,
  processPaymentFailure,
  processPaymentLoadingStart,

  // Get payment history
  getPaymentHistorySuccess,
  getPaymentHistoryFailure,
  getPaymentHistoryLoadingStart,
  loadingStart,
  loadingEnd,
  fetchDoctorStart,
  fetchDoctorSuccess,
  fetchDoctorFailure,
} from "../store/slices/booking.slice";

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  withCredentials: true,
});

// Request interceptor - Add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired
      localStorage.removeItem("accessToken");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);
export const fetchDoctorById = (id) => async (dispatch) => {
  try {
    dispatch(fetchDoctorStart());
    const response = await api.get(`api/v1/doctors/doctor/${id}`);

    dispatch(fetchDoctorSuccess(response.data.data));
    return response.data;
  } catch (error) {
    const errorMessage =
      error.response?.data?.message ||
      "Không thể tải thông tin chi tiết bác sĩ!";
    dispatch(fetchDoctorFailure(errorMessage));
    throw error;
  }
};

// Lấy slot trống của bác sĩ
export const getAvailableSlots =
  (doctorId, params = {}) =>
  async (dispatch) => {
    try {
      dispatch(availableSlotsLoadingStart());
      const response = await api.get(
        `/api/v1/doctors/doctor/${doctorId}/available-slot`,
        { params }
      );
      dispatch(getAvailableSlotsSuccess(response.data.data));
      return { success: true, data: response.data.data };
    } catch (error) {
      const errorMessage =
        error.response?.data.message || "Không thể lấy danh sách slot trống";
      dispatch(getAvailableSlotsFailure(errorMessage));
      throw error;
    }
  };

// Tạo appointment mới
export const createAppointment = (appointmentData) => async (dispatch) => {
  try {
    dispatch(createAppointmentLoadingStart());
    const response = await api.post(
      "/api/v1/booking/appointments",
      appointmentData
    );
    dispatch(createAppointmentSuccess(response.data.data));
    return { success: response.data.success, data: response.data.data };
  } catch (error) {
    const errorMessage =
      error.response?.data.message || "Không thể tạo lịch khám";
    dispatch(createAppointmentFailure(errorMessage));
    throw error;
  }
};

// Lấy thông tin appointment theo ID
export const getAppointmentById = (appointmentId) => async (dispatch) => {
  try {
    dispatch(getAppointmentByIdLoadingStart());
    const response = await api.get(
      `/api/v1/booking/appointments/${appointmentId}`
    );
    dispatch(getAppointmentByIdSuccess(response.data.data));
    return { success: true, data: response.data.data };
  } catch (error) {
    const errorMessage =
      error.response?.data.message || "Không thể lấy thông tin lịch khám";
    dispatch(getAppointmentByIdFailure(errorMessage));
    throw error;
  }
};

// Cập nhật trạng thái appointment
export const updateAppointmentStatus =
  (appointmentId, statusData) => async (dispatch) => {
    try {
      dispatch(updateAppointmentStatusLoadingStart());
      const response = await api.patch(
        `/api/v1/booking/appointments/${appointmentId}/status`,
        statusData
      );
      dispatch(updateAppointmentStatusSuccess(response.data.data));
      return { success: true, data: response.data.data };
    } catch (error) {
      const errorMessage =
        error.response?.data.message ||
        "Không thể cập nhật trạng thái lịch khám";
      dispatch(updateAppointmentStatusFailure(errorMessage));
      throw error;
    }
  };

// Hủy appointment
export const cancelAppointment = (appointmentId) => async (dispatch) => {
  try {
    dispatch(cancelAppointmentLoadingStart());
    const response = await api.delete(
      `/api/v1/booking/appointments/${appointmentId}`
    );
    dispatch(cancelAppointmentSuccess(response.data.data));
    return { success: true, data: response.data.data };
  } catch (error) {
    const errorMessage =
      error.response?.data.message || "Không thể hủy lịch khám";
    dispatch(cancelAppointmentFailure(errorMessage));
    throw error;
  }
};

// Lấy danh sách appointment của user
export const getUserAppointments =
  (userId, params = {}) =>
  async (dispatch) => {
    try {
      dispatch(getUserAppointmentsLoadingStart());
      const response = await api.get(
        `/api/v1/booking/users/${userId}/appointments`,
        {
          params,
        }
      );
      dispatch(getUserAppointmentsSuccess(response.data.data));
      return { success: true, data: response.data.data };
    } catch (error) {
      const errorMessage =
        error.response?.data.message || "Không thể lấy danh sách lịch khám";
      dispatch(getUserAppointmentsFailure(errorMessage));
      throw error;
    }
  };

// Lấy danh sách appointment của doctor

// Xử lý thanh toán
export const processPayment =
  (appointmentId, paymentData) => async (dispatch) => {
    try {
      dispatch(processPaymentLoadingStart());
      console.log(
        `Processing payment for appointment: ${appointmentId}`,
        paymentData
      );

      const response = await api.post(
        `/api/v1/booking/appointments/${appointmentId}/payment`,
        paymentData
      );

      console.log("Payment response:", response.data);
      dispatch(processPaymentSuccess(response.data.data));
      return { success: true, data: response.data.data };
    } catch (error) {
      console.error("Payment processing error:", error);
      const errorMessage =
        error.response?.data.message || "Không thể xử lý thanh toán";
      dispatch(processPaymentFailure(errorMessage));
      throw error;
    }
  };
export const handleVNPayReturn = (queryParams) => async (dispatch) => {
  try {
    console.log("🔄 Gửi yêu cầu xác thực VNPay với params:", {
      params: queryParams,
    });

    const response = await api.get("/api/v1/booking/vnpay/return", {
      params: queryParams,
    });

    console.log("✅ VNPay return response:", response.data);

    return { success: true, data: response.data.data };
  } catch (error) {
    console.error("❌ Lỗi khi xác thực VNPay:", error);
    const errorMessage =
      error.response?.data?.message || "Không thể xác thực thanh toán";

    return { success: false, error: errorMessage };
  }
};
// Lấy lịch sử thanh toán
export const getPaymentHistory =
  (userId, params = {}) =>
  async (dispatch) => {
    try {
      dispatch(getPaymentHistoryLoadingStart());
      const response = await api.get(
        `/api/v1/booking/users/${userId}/payments`,
        {
          params,
        }
      );
      dispatch(getPaymentHistorySuccess(response.data.data));
      return { success: true, data: response.data.data };
    } catch (error) {
      const errorMessage =
        error.response?.data.message || "Không thể lấy lịch sử thanh toán";
      dispatch(getPaymentHistoryFailure(errorMessage));
      throw error;
    }
  };

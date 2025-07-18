// services/health.service.js
import axios from "axios";
import { API_URL } from "../config/api.config";
import {
  // Get user health info
  fetchHealthInfoStart,
  fetchHealthInfoSuccess,
  fetchHealthInfoFailure,

  // Get all health info
  fetchAllHealthStart,
  fetchAllHealthSuccess,
  fetchAllHealthFailure,

  // Create health info
  createHealthStart,
  createHealthSuccess,
  createHealthFailure,

  // Update health info
  updateHealthStart,
  updateHealthSuccess,
  updateHealthFailure,

  // Delete health info
  deleteHealthStart,
  deleteHealthSuccess,
  deleteHealthFailure,

  // Health statistics
  fetchHealthStatsStart,
  fetchHealthStatsSuccess,
  fetchHealthStatsFailure,

  // Clear states
  clearHealthInfo,
  clearErrors,
  clearSuccess,
  resetHealthState,
  fetchMetabolismStart,
  fetchMetabolismSuccess,
  fetchMetabolismFailure,
} from "../store/slices/health.slice";

const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  withCredentials: true,
});

// Get current user health info
export const fetchUserHealthInfo = () => async (dispatch) => {
  try {
    dispatch(fetchHealthInfoStart());
    const response = await api.get("/api/v1/health/me");

    dispatch(fetchHealthInfoSuccess(response.data));
    return response.data;
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || "Không thể tải thông tin sức khỏe!";
    dispatch(fetchHealthInfoFailure(errorMessage));
    throw error;
  }
};

export const getHealthAdviceMetabolism =
  (params = "metabolism") =>
  async (dispatch) => {
    try {
      dispatch(fetchMetabolismStart());
      const response = await api.get("/api/v1/health-advices/latest", {
        params,
      });
      dispatch(fetchMetabolismSuccess(response.data.data));
      return { success: true, data: response.data };
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Không lấy lời khuyên !";
      dispatch(fetchMetabolismFailure(errorMessage));
      throw error;
    }
  };

// Get all health info (admin only)
export const fetchAllHealthInfo = () => async (dispatch) => {
  try {
    dispatch(fetchAllHealthStart());
    const response = await api.get("api/v1/health");

    dispatch(fetchAllHealthSuccess(response.data.healthInfo));
    return response.data;
  } catch (error) {
    const errorMessage =
      error.response?.data?.message ||
      "Không thể tải danh sách thông tin sức khỏe!";
    dispatch(fetchAllHealthFailure(errorMessage));
    throw error;
  }
};

// Create new health info
export const createHealthInfo = (healthData) => async (dispatch) => {
  try {
    dispatch(createHealthStart());
    const response = await api.post("api/v1/health", healthData);

    dispatch(createHealthSuccess(response.data.newHealthInfo));
    return response.data;
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || "Không thể tạo thông tin sức khỏe!";
    dispatch(createHealthFailure(errorMessage));
    throw error;
  }
};
export const getSimpleHealthAdvice = (healthData) => async (dispatch) => {
  try {
    dispatch(createHealthStart());
    const response = await api.post("api/v1/health/advice", healthData);
    return { success: true, data: response.data };
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || "Không thể tạo thông tin sức khỏe!";
    dispatch(createHealthFailure(errorMessage));
    throw error;
  }
};

// Update user health info
export const updateHealthInfo = (healthData) => async (dispatch) => {
  try {
    dispatch(updateHealthStart());
    const response = await api.post("api/v1/health/me", healthData);

    dispatch(updateHealthSuccess(response.data));
    return { success: true, data: response.data };
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || "Không thể cập nhật thông tin sức khỏe!";
    dispatch(updateHealthFailure(errorMessage));
    throw error;
  }
};

// Delete health info
export const deleteHealthInfo = (healthId) => async (dispatch) => {
  try {
    dispatch(deleteHealthStart());
    const response = await api.delete(`api/v1/health/${healthId}`);

    dispatch(deleteHealthSuccess({ deletedId: healthId }));
    return response.data;
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || "Không thể xóa thông tin sức khỏe!";
    dispatch(deleteHealthFailure(errorMessage));
    throw error;
  }
};

// Get health statistics
export const fetchHealthStats = () => async (dispatch) => {
  try {
    dispatch(fetchHealthStatsStart());
    const response = await api.get("api/v1/health/stats");

    dispatch(fetchHealthStatsSuccess(response.data.data));
    return response.data;
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || "Không thể tải thống kê sức khỏe!";
    dispatch(fetchHealthStatsFailure(errorMessage));
    throw error;
  }
};

// Clear health info state
export const clearHealthInfoState = () => (dispatch) => {
  dispatch(clearHealthInfo());
};

// Clear all errors
export const clearAllHealthErrors = () => (dispatch) => {
  dispatch(clearErrors());
};

// Clear success states
export const clearHealthSuccess = () => (dispatch) => {
  dispatch(clearSuccess());
};

// Reset entire health state
export const resetHealthStateAction = () => (dispatch) => {
  dispatch(resetHealthState());
};

// Utility function to validate health data
export const validateHealthData = (data) => {
  const errors = {};

  if (data.weight !== undefined) {
    if (typeof data.weight !== "number" || data.weight <= 0) {
      errors.weight = "Cân nặng phải là số dương";
    }
    if (data.weight > 500) {
      errors.weight = "Cân nặng không hợp lệ";
    }
  }

  if (data.height !== undefined) {
    if (typeof data.height !== "number" || data.height <= 0) {
      errors.height = "Chiều cao phải là số dương";
    }
    if (data.height > 300) {
      errors.height = "Chiều cao không hợp lệ";
    }
  }

  if (data.age !== undefined) {
    if (typeof data.age !== "number" || data.age <= 0 || data.age > 150) {
      errors.age = "Tuổi không hợp lệ";
    }
  }

  if (data.bloodPressure !== undefined) {
    const bpRegex = /^\d{2,3}\/\d{2,3}$/;
    if (!bpRegex.test(data.bloodPressure)) {
      errors.bloodPressure = "Huyết áp phải có định dạng: 120/80";
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

// Calculate BMI utility
export const calculateBMI = (weight, height) => {
  if (!weight || !height) return null;
  const heightInMeters = height / 100;
  return (weight / (heightInMeters * heightInMeters)).toFixed(2);
};

// Classify BMI category
export const getBMICategory = (bmi) => {
  if (!bmi) return null;

  const bmiValue = parseFloat(bmi);

  if (bmiValue < 18.5) return "Thiếu cân";
  if (bmiValue < 25) return "Bình thường";
  if (bmiValue < 30) return "Thừa cân";
  return "Béo phì";
};

// Export all functions as default object
export default {
  fetchUserHealthInfo,
  fetchAllHealthInfo,
  createHealthInfo,
  updateHealthInfo,
  deleteHealthInfo,
  fetchHealthStats,
  clearHealthInfoState,
  clearAllHealthErrors,
  clearHealthSuccess,
  resetHealthStateAction,
  validateHealthData,
  calculateBMI,
  getBMICategory,
};

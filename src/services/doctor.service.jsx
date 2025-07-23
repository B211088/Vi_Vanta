import axios from "axios";
import { API_URL } from "../config/api.config";
import {
  fetchDoctorFailure,
  fetchDoctorsFailure,
  fetchDoctorsStart,
  fetchDoctorsSuccess,
  fetchDoctorStart,
  fetchDoctorSuccess,
  fetchWorkingHourFailure,
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
} from "../store/slices/doctor.slice";

const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  withCredentials: true,
});

// ================== DOCTOR SERVICES ==================

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

// ================== WORKING HOUR SERVICES ==================

// GET /my-schedule - Fetch doctor's working hours
export const fetchMySchedule = () => async (dispatch) => {
  try {
    dispatch(fetchWorkingHourStart());
    const response = await api.get("api/v1/doctors/my-schedule");

    dispatch(fetchWorkingHourSuccess(response.data.data));
    return response.data;
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || "Không thể tải lịch làm việc!";
    dispatch(fetchWorkingHourFailure(errorMessage));
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

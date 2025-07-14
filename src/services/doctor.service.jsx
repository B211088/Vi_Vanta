import axios from "axios";
import { API_URL } from "../config/api.config";
import {
  fetchDoctorFailure,
  fetchDoctorsFailure,
  fetchDoctorsStart,
  fetchDoctorsSuccess,
  fetchDoctorStart,
  fetchDoctorSuccess,
} from "../store/slices/doctor.slice";

const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  withCredentials: true,
});

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
    const response = await api.get(`api/v1/doctors/${id}`);

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

import axios from "axios";
import { API_URL } from "../config/api.config";
import {
  addChildFailure,
  addChildStart,
  addChildSuccess,
  checkingVaccinacationRecordFailure,
  checkingVaccinacationRecordStart,
  checkingVaccinacationRecordSuccess,
  deleteChildFailure,
  deleteChildStart,
  deleteChildSuccess,
  fetchChildrenFailure,
  fetchChildrenStart,
  fetchChildrenSuccess,
  fetchVaccinationRecordsFailure,
  fetchVaccinationRecordsStart,
  fetchVaccinationRecordsSuccess,
  updateChildFailure,
  updateChildStart,
  updateChildSuccess,
} from "../store/slices/children.slice";

const api = axios.create({
  baseURL: API_URL,
  timeout: 5000,
  withCredentials: true,
});

export const fetchChildren = () => async (dispatch) => {
  try {
    dispatch(fetchChildrenStart());
    const response = await api.get(`/api/v1/children`);

    dispatch(fetchChildrenSuccess(response.data.data));
    return response.data;
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || "Không thể tải các hồ sơ bé!";
    dispatch(fetchChildrenFailure(errorMessage));
    throw error;
  }
};

export const createChild = (payload) => async (dispatch) => {
  try {
    dispatch(addChildStart());
    const response = await api.post(`/api/v1/children`, payload);

    dispatch(addChildSuccess(response.data.data));
    return response.data;
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || "Không thể thêm hồ sơ bé!";
    dispatch(addChildFailure(errorMessage));
    throw error;
  }
};

export const updateChild = (payload, id) => async (dispatch) => {
  try {
    dispatch(updateChildStart());
    const response = await api.put(`/api/v1/children/${id}`, payload);

    dispatch(updateChildSuccess(response.data.data));
    return response.data;
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || "Không thể cập nhật hồ sơ bé!";
    dispatch(updateChildFailure(errorMessage));
    throw error;
  }
};
export const deleteChild = (id) => async (dispatch) => {
  try {
    dispatch(deleteChildStart());
    const response = await api.delete(`/api/v1/children/${id}`);

    dispatch(deleteChildSuccess(response.data.data));
    return response.data;
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || "Không thể xóa hồ sơ bé";
    dispatch(deleteChildFailure(errorMessage));
    throw error;
  }
};
export const checkingVaccinacationRecord =
  (id, payload) => async (dispatch) => {
    try {
      dispatch(checkingVaccinacationRecordStart());
      const response = await api.post(
        `/api/v1/children/${id}/checking`,
        payload
      );
      dispatch(checkingVaccinacationRecordSuccess(response.data.data));
      return response.data;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Không thể xóa hồ sơ bé";
      dispatch(checkingVaccinacationRecordFailure(errorMessage));
      throw error;
    }
  };

export const fetchVaccinationRecords = (childId) => async (dispatch) => {
  try {
    dispatch(fetchVaccinationRecordsStart());
    const response = await api.get(
      `/api/v1/children/${childId}/vaccination-records`
    );
    dispatch(fetchVaccinationRecordsSuccess(response.data.data));
    return response.data;
  } catch (error) {
    const errorMessage =
      error.response?.data?.message ||
      "Không thể lấy danh sách record tiêm chủng!";
    dispatch(fetchVaccinationRecordsFailure(errorMessage));
    throw error;
  }
};

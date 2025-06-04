import axios from "axios";
import { API_URL } from "../config/api.config";
import {
  getDistrictsFailure,
  getDistrictsSuccess,
  getProvincesFailure,
  getProvincesSuccess,
  getWardsFailure,
  getWardsSuccess,
  loadingEnd,
  loadingStart,
} from "../store/slices/addressSlice";

const api = axios.create({
  baseURL: API_URL,
  timeout: 5000,
  withCredentials: true,
});

export const getProvinces = () => async (dispatch) => {
  try {
    dispatch(loadingStart());
    const response = await api.get("/api/v1/address/provinces");
    dispatch(getProvincesSuccess(response.data.provinces));
    return { success: true };
  } catch (error) {
    const errorMessage =
      error.response?.data.message || "Không thể lấy danh sách tỉnh";
    dispatch(getProvincesFailure(errorMessage));
    throw error;
  }
};

export const getDistricts = (provinceId) => async (dispatch) => {
  try {
    dispatch(loadingStart());
    const response = await api.get(`/api/v1/address/${provinceId}/districts`);
    dispatch(getDistrictsSuccess(response.data.districts));
    return { success: true };
  } catch (error) {
    const errorMessage =
      error.response?.data.message || "Không thể lấy danh sách tỉnh";
    dispatch(getDistrictsFailure(errorMessage));
    throw error;
  }
};

export const getWards = (districtId) => async (dispatch) => {
  try {
    dispatch(loadingStart());
    const response = await api.get(`/api/v1/address/${districtId}/wards`);
    dispatch(getWardsSuccess(response.data.wards));
    return { success: true };
  } catch (error) {
    const errorMessage =
      error.response?.data.message || "Không thể lấy danh sách tỉnh";
    dispatch(getWardsFailure(errorMessage));
    throw error;
  }
};

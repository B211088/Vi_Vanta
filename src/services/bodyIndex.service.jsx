import axios from "axios";
import {
  fetchStart,
  fetchFailure,
  setBMIRecords,
  setBMIRecord,
  setEMMRecords,
  setEMMRecord,
  setBodyFatRecords,
  setBodyFatRecord,
  setWHRRecords,
  setWHRRecord,
} from "../store/slices/bodyIndex.slice";
import { API_URL } from "../config/api.config";

const api = axios.create({
  baseURL: API_URL,
  timeout: 5000,
  withCredentials: true,
});

// BMI
export const fetchBMIRecords = () => async (dispatch) => {
  try {
    dispatch(fetchStart());
    const res = await api.get("/api/v1/body-index/bmi");
    dispatch(setBMIRecords(res.data.bmiRecords));
  } catch (error) {
    dispatch(fetchFailure(error.response?.data?.message || "Lỗi lấy BMI"));
  }
};

export const fetchBMIRecordById = (id) => async (dispatch) => {
  try {
    dispatch(fetchStart());
    const res = await api.get(`/api/v1/body-index/bmi/${id}`);
    dispatch(setBMIRecord(res.data.bmiRecord));
  } catch (error) {
    dispatch(fetchFailure(error.response?.data?.message || "Lỗi lấy BMI"));
  }
};

export const createBMI = (data) => async (dispatch) => {
  try {
    dispatch(fetchStart());
    const res = await api.post("/api/v1/body-index/bmi", data);
    dispatch(setBMIRecord(res.data.bodyIndex));
    await dispatch(fetchBMIRecords());
    return res.data;
  } catch (error) {
    dispatch(fetchFailure(error.response?.data?.message || "Lỗi tạo BMI"));
    throw error;
  }
};

export const deleteBMI = (id) => async (dispatch) => {
  try {
    dispatch(fetchStart());
    await api.delete(`/api/v1/body-index/bmi/${id}`);
    // Có thể fetch lại danh sách nếu cần
  } catch (error) {
    dispatch(fetchFailure(error.response?.data?.message || "Lỗi xóa BMI"));
  }
};

// EMM
export const fetchEMMRecords = () => async (dispatch) => {
  try {
    dispatch(fetchStart());
    const res = await api.get("/api/v1/body-index/emm");
    dispatch(setEMMRecords(res.data.emmRecords));
  } catch (error) {
    dispatch(fetchFailure(error.response?.data?.message || "Lỗi lấy EMM"));
  }
};

export const fetchEMMRecordById = (id) => async (dispatch) => {
  try {
    dispatch(fetchStart());
    const res = await api.get(`/api/v1/body-index/emm/${id}`);
    dispatch(setEMMRecord(res.data.emmRecord));
  } catch (error) {
    dispatch(fetchFailure(error.response?.data?.message || "Lỗi lấy EMM"));
  }
};

export const createEMM = (data) => async (dispatch) => {
  try {
    dispatch(fetchStart());
    const res = await api.post("/api/v1/body-index/emm", data);
    dispatch(setEMMRecord(res.data.bodyIndex));
    return res.data;
  } catch (error) {
    dispatch(fetchFailure(error.response?.data?.message || "Lỗi tạo EMM"));
    throw error;
  }
};

export const deleteEMM = (id) => async (dispatch) => {
  try {
    dispatch(fetchStart());
    await api.delete(`/api/v1/body-index/emm/${id}`);
  } catch (error) {
    dispatch(fetchFailure(error.response?.data?.message || "Lỗi xóa EMM"));
  }
};

// Body Fat
export const fetchBodyFatRecords = () => async (dispatch) => {
  try {
    dispatch(fetchStart());
    const res = await api.get("/api/v1/body-index/body-fat");
    dispatch(setBodyFatRecords(res.data.bodyFatRecords));
  } catch (error) {
    dispatch(fetchFailure(error.response?.data?.message || "Lỗi lấy Body Fat"));
  }
};

export const fetchBodyFatRecordById = (id) => async (dispatch) => {
  try {
    dispatch(fetchStart());
    const res = await api.get(`/api/v1/body-index/body-fat/${id}`);
    dispatch(setBodyFatRecord(res.data.bodyFatRecord));
  } catch (error) {
    dispatch(fetchFailure(error.response?.data?.message || "Lỗi lấy Body Fat"));
  }
};

export const createBodyFat = (data) => async (dispatch) => {
  try {
    dispatch(fetchStart());
    const res = await api.post("/api/v1/body-index/body-fat", data);
    dispatch(setBodyFatRecord(res.data.bodyFat));
    return res.data;
  } catch (error) {
    dispatch(fetchFailure(error.response?.data?.message || "Lỗi tạo Body Fat"));
    throw error;
  }
};

export const deleteBodyFat = (id) => async (dispatch) => {
  try {
    dispatch(fetchStart());
    await api.delete(`/api/v1/body-index/body-fat/${id}`);
  } catch (error) {
    dispatch(fetchFailure(error.response?.data?.message || "Lỗi xóa Body Fat"));
  }
};

// WHR
export const fetchWHRRecords = () => async (dispatch) => {
  try {
    dispatch(fetchStart());
    const res = await api.get("/api/v1/body-index/whr");
    dispatch(setWHRRecords(res.data.whrRecords));
  } catch (error) {
    dispatch(fetchFailure(error.response?.data?.message || "Lỗi lấy WHR"));
  }
};

export const fetchWHRRecordById = (id) => async (dispatch) => {
  try {
    dispatch(fetchStart());
    const res = await api.get(`/api/v1/body-index/whr/${id}`);
    dispatch(setWHRRecord(res.data.whrRecord));
  } catch (error) {
    dispatch(fetchFailure(error.response?.data?.message || "Lỗi lấy WHR"));
  }
};

export const createWHR = (data) => async (dispatch) => {
  try {
    dispatch(fetchStart());
    const res = await api.post("/api/v1/body-index/whr", data);
    dispatch(setWHRRecord(res.data.whr));
    return res.data;
  } catch (error) {
    dispatch(fetchFailure(error.response?.data?.message || "Lỗi tạo WHR"));
    throw error;
  }
};

export const deleteWHR = (id) => async (dispatch) => {
  try {
    dispatch(fetchStart());
    await api.delete(`/api/v1/body-index/whr/${id}`);
  } catch (error) {
    dispatch(fetchFailure(error.response?.data?.message || "Lỗi xóa WHR"));
  }
};

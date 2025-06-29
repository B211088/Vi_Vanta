import axios from "axios";
import { API_URL } from "../config/api.config";
import {
  fetchTopicsFailer,
  fetchTopicsSuccess,
  fetchStart,
  fetchTopicFailer,
  fetchTopicSuccess,
  deleteSoftTopicSuccess,
} from "../store/slices/topic.slice";
import {
  createCollectionFailure,
  createCollectionStart,
  createCollectionSuccess,
  deleteCollectionFailure,
  deleteCollectionStart,
  deleteCollectionSuccess,
  updateCollectionFailure,
  updateCollectionStart,
  updateCollectionSuccess,
} from "../store/slices/collection.slice";

const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  withCredentials: true,
});

export const fetchAllTopics =
  (page, limit, sortBy, sortOrder, status) => async (dispatch) => {
    try {
      dispatch(fetchStart());
      const response = await api.get(
        `api/v1/topics?page=${page}&?limit=${limit}&sortby=${sortBy}&sortOrder=${sortOrder}${
          status ? `&status=${status}` : ""
        }`
      );
      dispatch(fetchTopicsSuccess(response.data.data));
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Không thể tải danh sách bệnh!";
      dispatch(fetchTopicsFailer(errorMessage));
      throw error;
    }
  };
export const fetchDetailTopic = (id) => async (dispatch) => {
  try {
    dispatch(fetchStart());
    const response = await api.get(`api/v1/topics/${id}`);
    dispatch(fetchTopicSuccess(response.data.data));
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || "Không thể tải danh sách bệnh!";
    dispatch(fetchTopicFailer(errorMessage));
    throw error;
  }
};

export const createTopic = (payload) => async (dispatch) => {
  try {
    dispatch(createCollectionStart());
    const response = await api.post(`api/v1/topics`, payload);
    dispatch(createCollectionSuccess(response.data.data));
    return response.data;
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || "Không thể tải danh sách bệnh!";
    dispatch(createCollectionFailure(errorMessage));
    throw error;
  }
};

export const updateTopic = (id, payload) => async (dispatch) => {
  try {
    dispatch(updateCollectionStart());
    const response = await api.put(`api/v1/topics/${id}`, payload);
    dispatch(updateCollectionSuccess(response.data.data));
    return response.data;
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || "Không thể tải danh sách bệnh!";
    dispatch(updateCollectionFailure(errorMessage));
    throw error;
  }
};
export const deleteTopic =
  (id, hard = false) =>
  async (dispatch) => {
    try {
      dispatch(deleteCollectionStart());
      const response = await api.delete(`api/v1/topics/${id}?hard=${hard}`);
      if (hard) {
        dispatch(deleteCollectionSuccess(response.data.data));
      }
      dispatch(deleteSoftTopicSuccess(response.data.data));
      return response.data;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Không thể tải danh sách bệnh!";
      dispatch(deleteCollectionFailure(errorMessage));
      throw error;
    }
  };

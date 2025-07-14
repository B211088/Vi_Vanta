import axios from "axios";
import { API_URL } from "../config/api.config";
import {
  fetchStart,
  fetchTopicFailer,
  fetchTopicsFailer,
  fetchTopicsSuccess,
  fetchTopicSuccess,
} from "../store/slices/topic.slice";

const api = axios.create({
  baseURL: API_URL,
  timeout: 3000,
  withCredentials: true,
});

export const fetchAllTopics =
  (params = {}) =>
  async (dispatch) => {
    try {
      dispatch(fetchStart());
      const response = await api.get(`api/v1/topics`, { params });
      dispatch(fetchTopicsSuccess(response.data.data));
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Không thể tải danh sách bệnh!";
      dispatch(fetchTopicsFailer(errorMessage));
      throw error;
    }
  };

export const searchTopics =
  (page, limit, sortBy, sortOrder, search) => async (dispatch) => {
    try {
      dispatch(fetchStart());
      const response = await api.get(
        `api/v1/topics/search?q=${search}&page=${page}&?limit=${limit}&sortby=${sortBy}&sortOrder=${sortOrder}`
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

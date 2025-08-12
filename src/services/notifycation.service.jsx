import axios from "axios";
import { API_URL } from "../config/api.config";
import {
  fetchNotifycationsFailure,
  fetchNotifycationsStart,
  fetchNotifycationsSuccess,
} from "../store/slices/notifycation.slice";

const api = axios.create({
  baseURL: API_URL,
  timeout: 5000,
  withCredentials: true,
});

export const getNotifycationsByUser = (params) => async (dispacth) => {
  try {
    dispacth(fetchNotifycationsStart());
    const response = await api.get("/api/v1/notifycation", { params });
    dispacth(fetchNotifycationsSuccess(response.data.data));
    return response.data;
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || "Không thể tải thông báo";
    dispacth(fetchNotifycationsFailure(errorMessage));
    throw error;
  }
};

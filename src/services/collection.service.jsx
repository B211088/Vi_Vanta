import axios from "axios";
import { API_URL } from "../config/api.config";
import {
  fetchCollectionFailure,
  fetchCollectionsFailure,
  fetchCollectionsStart,
  fetchCollectionsSuccess,
  fetchCollectionStart,
  fetchCollectionSuccess,
} from "../store/slices/collection.slice";

const api = axios.create({
  baseURL: API_URL,
  timeout: 5000,
  withCredentials: true,
});

export const getAllInfoCollections = () => async (dispatch) => {
  try {
    dispatch(fetchCollectionsStart());
    const response = await api.get(`/api/v1/collections`);
    console.log({ response });
    dispatch(fetchCollectionsSuccess(response.data.data));
    return response.data;
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || "Không thể tải các collections";
    dispatch(fetchCollectionsFailure(errorMessage));
    throw error;
  }
};
export const getDetailCollection = (id) => async (dispatch) => {
  try {
    dispatch(fetchCollectionStart());
    const response = await api.get(`/api/v1/collections/${id}`);
    console.log({ response });
    dispatch(fetchCollectionSuccess(response.data.data));
    return response.data;
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || "Không thể tải các collections";
    dispatch(fetchCollectionFailure(errorMessage));
    throw error;
  }
};

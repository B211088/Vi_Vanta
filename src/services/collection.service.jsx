import axios from "axios";
import { API_URL } from "../config/api.config";
import {
  addDocumentFailure,
  addDocumentStart,
  addDocumentSuccess,
  createCollectionFailure,
  createCollectionStart,
  createCollectionSuccess,
  deleteCollectionStart,
  deleteCollectionSuccess,
  fetchCollectionFailure,
  fetchCollectionsFailure,
  fetchCollectionsStart,
  fetchCollectionsSuccess,
  fetchCollectionStart,
  fetchCollectionSuccess,
  fetchDocumentsSuccess,
  updateCollectionFailure,
  updateCollectionStart,
  updateCollectionSuccess,
} from "../store/slices/collection.slice";

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000000,
  withCredentials: true,
});

export const getAllInfoCollections = () => async (dispatch) => {
  try {
    dispatch(fetchCollectionsStart());
    const response = await api.get(`/api/v1/collections`);

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

    dispatch(fetchCollectionSuccess(response.data.data.collection));
    dispatch(fetchDocumentsSuccess(response.data.data.documents));
    return response.data;
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || "Không thể tải các collections";
    dispatch(fetchCollectionFailure(errorMessage));
    throw error;
  }
};

export const createCollection = (payload) => async (dispatch) => {
  try {
    dispatch(createCollectionStart());
    const response = await api.post(`/api/v1/collections`, payload);

    dispatch(createCollectionSuccess(response.data.collection));
    return { success: true, message: response.data.message };
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || "Không thể tạo collection!";
    dispatch(createCollectionFailure(errorMessage));
    throw error;
  }
};

export const updateCollection = (id, payload) => async (dispatch) => {
  try {
    dispatch(updateCollectionStart());
    const response = await api.put(`/api/v1/collections/${id}`, payload);

    dispatch(updateCollectionSuccess(response.data.collection));
    return { success: true, message: response.data.message };
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || "Không thể cập nhật collection!";
    dispatch(updateCollectionFailure(errorMessage));
    throw error;
  }
};

export const updateConfigCollection = (id, payload) => async (dispatch) => {
  try {
    dispatch(updateCollectionStart());
    const response = await api.put(`/api/v1/collections/config/${id}`, payload);

    dispatch(updateCollectionSuccess(response.data.data));
    return { success: true, message: response.data.message };
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || "Không thể cập nhật collection!";
    dispatch(updateCollectionFailure(errorMessage));
    throw error;
  }
};

export const deleteCollection = (id) => async (dispatch) => {
  try {
    dispatch(deleteCollectionStart());
    const response = await api.delete(`/api/v1/collections/${id}`);
    dispatch(deleteCollectionSuccess(response.data.collection._id));
    return { success: true, message: response.data.message };
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || "Không thể xoá collection";
    dispatch(fetchCollectionFailure(errorMessage));
    throw error;
  }
};

export const addDocument = (payload) => async (dispatch) => {
  try {
    dispatch(addDocumentStart());
    const response = await api.post(`/api/v1/rag/openai/upload`, payload);

    dispatch(addDocumentSuccess(response.data.document));
    return { success: true, message: response.data.message };
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || "Không thể tạo collection!";
    dispatch(addDocumentFailure(errorMessage));
    throw error;
  }
};

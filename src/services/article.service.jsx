import axios from "axios";
import { API_URL } from "../config/api.config";
import {
  fetchArticlesStart,
  fetchArticlesSuccess,
  fetchArticlesFailure,
  fetchArticleStart,
  fetchArticleSuccess,
  fetchArticleFailure,
  createArticleStart,
  createArticleSuccess,
  createArticleFailure,
  updateArticleStart,
  updateArticleSuccess,
  updateArticleFailure,
  deleteArticleStart,
  deleteArticleSuccess,
  deleteArticleFailure,
  clearArticle,
} from "../store/slices/article.slices";

const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  withCredentials: true,
});

// Fetch all articles
export const fetchAllArticles =
  (page, limit, sortBy, sortOrder, status) => async (dispatch) => {
    try {
      dispatch(fetchArticlesStart());
      const response = await api.get("api/v1/articles?", {
        params: { page, limit, sortBy, sortOrder, status },
      });
      dispatch(fetchArticlesSuccess(response.data.data));
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Không thể tải danh sách bài viết!";
      dispatch(fetchArticlesFailure(errorMessage));
      throw error;
    }
  };

// Fetch article detail
export const fetchDetailArticle = (id) => async (dispatch) => {
  try {
    dispatch(fetchArticleStart());
    const response = await api.get(`api/v1/articles/${id}`);
    dispatch(fetchArticleSuccess(response.data.data));
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || "Không thể tải bài viết!";
    dispatch(fetchArticleFailure(errorMessage));
    throw error;
  }
};

// Create article
export const createArticleHandle = (payload) => async (dispatch) => {
  try {
    dispatch(createArticleStart());
    const response = await api.post(`api/v1/articles`, payload, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    dispatch(createArticleSuccess(response.data.data));
    return { success: true, data: response.data };
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || "Không thể tạo bài viết!";
    dispatch(createArticleFailure(errorMessage));
    throw error;
  }
};

// Update article
export const updateArticle = (id, payload) => async (dispatch) => {
  try {
    dispatch(updateArticleStart());
    const response = await api.put(`api/v1/articles/${id}`, payload, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    dispatch(updateArticleSuccess(response.data.data));
    return response.data;
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || "Không thể cập nhật bài viết!";
    dispatch(updateArticleFailure(errorMessage));
    throw error;
  }
};

// Delete article
export const deleteArticle = (id) => async (dispatch) => {
  try {
    dispatch(deleteArticleStart());
    const response = await api.delete(`api/v1/articles/${id}`);
    dispatch(deleteArticleSuccess(response.data.data));
    return response.data;
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || "Không thể xóa bài viết!";
    dispatch(deleteArticleFailure(errorMessage));
    throw error;
  }
};

export const clearArticleState = () => (dispatch) => {
  dispatch(clearArticle());
};

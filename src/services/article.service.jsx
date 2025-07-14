import axios from "axios";
import { API_URL } from "../config/api.config";
import {
  // Get Articles
  fetchArticlesStart,
  fetchArticlesSuccess,
  fetchArticlesFailure,

  // Search Articles
  searchArticlesStart,
  searchArticlesSuccess,
  searchArticlesFailure,

  // Article Stats
  fetchArticleStatsStart,
  fetchArticleStatsSuccess,
  fetchArticleStatsFailure,

  // Single Article
  fetchArticleStart,
  fetchArticleSuccess,
  fetchArticleFailure,

  // Articles by Author
  fetchArticlesByAuthorStart,
  fetchArticlesByAuthorSuccess,
  fetchArticlesByAuthorFailure,

  // Articles by Topic
  fetchArticlesByTopicStart,
  fetchArticlesByTopicSuccess,
  fetchArticlesByTopicFailure,

  // Related Articles
  fetchRelatedArticlesStart,
  fetchRelatedArticlesSuccess,
  fetchRelatedArticlesFailure,

  // Clear states
  clearArticle,
  clearSearchResults,
  clearErrors,
  fetchArticlesByAttributeStart,
  fetchArticlesByAttributeSuccess,
  fetchArticlesByAttributeFailure,
} from "../store/slices/article.slices";

const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  withCredentials: true,
});

// Get all articles with pagination and filters
export const fetchAllArticles =
  (params = {}) =>
  async (dispatch) => {
    try {
      dispatch(fetchArticlesStart());
      const response = await api.get("api/v1/articles", { params });

      dispatch(fetchArticlesSuccess(response.data.data));
      return response.data;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Không thể tải danh sách bài viết!";
      dispatch(fetchArticlesFailure(errorMessage));
      throw error;
    }
  };

// Search articles
export const searchArticles =
  (params = {}) =>
  async (dispatch) => {
    try {
      dispatch(searchArticlesStart());
      const response = await api.get("api/v1/articles/search", { params });

      dispatch(searchArticlesSuccess(response.data.data));
      return response.data;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Không thể tìm kiếm bài viết!";
      dispatch(searchArticlesFailure(errorMessage));
      throw error;
    }
  };

// Get featured articles
export const fetchFeaturedArticles =
  (params = {}) =>
  async (dispatch) => {
    try {
      dispatch(fetchArticlesByAttributeStart());
      const response = await api.get("api/v1/articles/featured", { params });

      dispatch(fetchArticlesByAttributeSuccess(response.data.data));
      return response.data;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Không thể tải bài viết nổi bật!";
      dispatch(fetchArticlesByAttributeFailure(errorMessage));
      throw error;
    }
  };

export const fetchLatestArticles =
  (params = {}) =>
  async (dispatch) => {
    try {
      dispatch(fetchArticlesByAttributeStart());
      const response = await api.get("api/v1/articles/latest", { params });

      dispatch(fetchArticlesByAttributeSuccess(response.data.data));
      return response.data;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Không thể tải bài viết mới nhất!";
      dispatch(fetchArticlesByAttributeFailure(errorMessage));
      throw error;
    }
  };

export const fetchMostViewedArticles =
  (params = {}) =>
  async (dispatch) => {
    try {
      dispatch(fetchArticlesByAttributeStart());
      const response = await api.get("api/v1/articles/most-viewed", { params });

      dispatch(fetchArticlesByAttributeSuccess(response.data.data));
      return response.data;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        "Không thể tải bài viết xem nhiều nhất!";
      dispatch(fetchArticlesByAttributeFailure(errorMessage));
      throw error;
    }
  };

// Get article statistics
export const fetchArticleStats = () => async (dispatch) => {
  try {
    dispatch(fetchArticleStatsStart());
    const response = await api.get("api/v1/articles/stats");

    dispatch(fetchArticleStatsSuccess(response.data.data));
    return response.data;
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || "Không thể tải thống kê bài viết!";
    dispatch(fetchArticleStatsFailure(errorMessage));
    throw error;
  }
};

// Get article by slug
export const fetchArticleBySlug = (slug) => async (dispatch) => {
  try {
    dispatch(fetchArticleStart());
    const response = await api.get(`api/v1/articles/slug/${slug}`);

    dispatch(fetchArticleSuccess(response.data.data));
    return response.data;
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || "Không thể tải bài viết!";
    dispatch(fetchArticleFailure(errorMessage));
    throw error;
  }
};

// Get article by ID
export const fetchArticleById = (id) => async (dispatch) => {
  try {
    dispatch(fetchArticleStart());
    const response = await api.get(`api/v1/articles/${id}`);

    dispatch(fetchArticleSuccess(response.data.data));
    return response.data;
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || "Không thể tải bài viết!";
    dispatch(fetchArticleFailure(errorMessage));
    throw error;
  }
};

// Get articles by author
export const fetchArticlesByAuthor =
  (authorId, params = {}) =>
  async (dispatch) => {
    try {
      dispatch(fetchArticlesByAuthorStart());
      const response = await api.get(`api/v1/articles/author/${authorId}`, {
        params,
      });

      dispatch(fetchArticlesByAuthorSuccess(response.data.data));
      return response.data;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Không thể tải bài viết của tác giả!";
      dispatch(fetchArticlesByAuthorFailure(errorMessage));
      throw error;
    }
  };

// Get articles by topic
export const fetchArticlesByTopic =
  (topicId, params = {}) =>
  async (dispatch) => {
    try {
      dispatch(fetchArticlesByTopicStart());
      const response = await api.get(`api/v1/articles/topic/${topicId}`, {
        params,
      });
      dispatch(fetchArticlesByTopicSuccess(response.data.data));
      return response.data;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Không thể tải bài viết theo chủ đề!";
      dispatch(fetchArticlesByTopicFailure(errorMessage));
      throw error;
    }
  };

// Get related articles
export const fetchRelatedArticles =
  (id, params = {}) =>
  async (dispatch) => {
    try {
      dispatch(fetchRelatedArticlesStart());
      const response = await api.get(`api/v1/articles/${id}/related`, {
        params,
      });

      dispatch(fetchRelatedArticlesSuccess(response.data.data));
      return response.data;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Không thể tải bài viết liên quan!";
      dispatch(fetchRelatedArticlesFailure(errorMessage));
      throw error;
    }
  };

// Clear article state
export const clearArticleState = () => (dispatch) => {
  dispatch(clearArticle());
};

// Clear search results
export const clearSearchResultsState = () => (dispatch) => {
  dispatch(clearSearchResults());
};

// Clear all errors
export const clearAllErrors = () => (dispatch) => {
  dispatch(clearErrors());
};

// Utility function to build query params
export const buildQueryParams = (filters = {}) => {
  const params = new URLSearchParams();

  Object.keys(filters).forEach((key) => {
    if (
      filters[key] !== null &&
      filters[key] !== undefined &&
      filters[key] !== ""
    ) {
      params.append(key, filters[key]);
    }
  });

  return params.toString();
};

// Advanced search with multiple filters
export const advancedSearchArticles =
  (filters = {}) =>
  async (dispatch) => {
    try {
      dispatch(searchArticlesStart());
      const queryString = buildQueryParams(filters);
      const response = await api.get(`api/v1/articles/search?${queryString}`);

      dispatch(searchArticlesSuccess(response.data.data));
      return response.data;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Không thể tìm kiếm bài viết!";
      dispatch(searchArticlesFailure(errorMessage));
      throw error;
    }
  };

// Export all functions as default object for easier importing
export default {
  fetchAllArticles,
  searchArticles,
  advancedSearchArticles,
  fetchFeaturedArticles,
  fetchArticleStats,
  fetchArticleBySlug,
  fetchArticleById,
  fetchArticlesByAuthor,
  fetchArticlesByTopic,
  fetchRelatedArticles,
  clearArticleState,
  clearSearchResultsState,
  clearAllErrors,
  buildQueryParams,
};

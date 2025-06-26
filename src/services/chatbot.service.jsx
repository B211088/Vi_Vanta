import axios from "axios";
import { API_URL } from "../config/api.config";
import {
  addSection,
  clearCurrentSection,
  clearSection,
  deleteSection,
  fetchModelsFailure,
  fetchModelsStart,
  fetchModelsSuccess,
  fetchSectionFailure,
  fetchSectionsFailure,
  fetchSectionsStart,
  fetchSectionsSuccess,
  fetchSectionStart,
  fetchSectionSuccess,
} from "../store/slices/chatbot.slice";

const api = axios.create({
  baseURL: API_URL,
  timeout: 100000,
  withCredentials: true,
});

export const getAllSectionsChat = () => async (dispatch) => {
  try {
    dispatch(fetchSectionsStart());
    const response = await api.get(`/api/v1/openai-chat-bot/sections`);

    dispatch(fetchSectionsSuccess(response.data.data));
    return response.data;
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || "Không thể tải các sections";
    dispatch(fetchSectionsFailure(errorMessage));
    throw error;
  }
};

export const getSectionChat = (id) => async (dispatch) => {
  try {
    // Clear section hiện tại trước
    dispatch(clearCurrentSection());

    // Bắt đầu loading
    dispatch(fetchSectionStart());

    const response = await api.get(`/api/v1/openai-chat-bot/sections/${id}`);

    // Dispatch success với data mới
    dispatch(fetchSectionSuccess(response.data.data));

    return response.data;
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || "Không thể tải section";
    dispatch(fetchSectionFailure(errorMessage));
    throw error;
  }
};

export const deleteSectionChatHandle = (id) => async (dispatch) => {
  try {
    // Bắt đầu loading
    dispatch(fetchSectionStart());
    // Clear section hiện tại trước
    dispatch(clearSection());

    const response = await api.delete(`/api/v1/openai-chat-bot/sections/${id}`);

    // Dispatch success với data mới
    dispatch(deleteSection(response.data.section));

    return response.data;
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || "Không thể xoá section";
    dispatch(fetchSectionFailure(errorMessage));
    throw error;
  }
};

// FIXED: Đảm bảo askChatBot luôn trả về section với messages đúng thứ tự
export const askChatBot = (payload) => async (dispatch) => {
  try {
    dispatch(fetchSectionStart());
    const response = await api.post(`/api/v1/openai-chat-bot/ask`, payload);

    // Đảm bảo section được cập nhật đúng
    if (response.data?.data?.section) {
      dispatch(fetchSectionSuccess(response.data.data.section));
    }

    return response.data;
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || "Không thể gửi câu hỏi";
    dispatch(fetchSectionFailure(errorMessage));
    throw error;
  }
};

export const getAllAIModel = () => async (dispatch) => {
  try {
    dispatch(fetchModelsStart());
    const response = await api.get(`/api/v1/ai-modal`);

    dispatch(fetchModelsSuccess(response.data.data));
    return response.data;
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || "Không thể tải các model";
    dispatch(fetchModelsFailure(errorMessage));
    throw error;
  }
};

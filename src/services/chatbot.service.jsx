import axios from "axios";
import { API_URL } from "../config/api.config";
import {
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
    console.log({ response });
    dispatch(fetchSectionsSuccess(response.data.data));
    return response.data;
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || "Không thể tải các sections";
    dispatch(fetchSectionsFailure(errorMessage));
    throw error;
  }
};

export const askChatBot = (payload) => async (dispatch) => {
  try {
    dispatch(fetchSectionStart());
    const response = await api.post(`/api/v1/openai-chat-bot/ask`, payload);
    console.log({ response });
    dispatch(fetchSectionSuccess(response.data.data));
    return response.data;
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || "Không thể tải các sections";
    dispatch(fetchSectionFailure(errorMessage));
    throw error;
  }
};

export const getAllAIModel = () => async (dispatch) => {
  try {
    dispatch(fetchModelsStart());
    const response = await api.get(`/api/v1/ai-modal`);
    console.log({ response });
    dispatch(fetchModelsSuccess(response.data.data));
    return response.data;
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || "Không thể tải các model";
    dispatch(fetchModelsFailure(errorMessage));
    throw error;
  }
};

import axios from "axios";
import { API_URL } from "../config/api.config";
import {
  fetchFailure,
  fetchStart,
  setCategories,
  setCauses,
  setDisease,
  setDiseases,
  setPreventions,
  setSymptoms,
  setTreatments,
  updateDisease,
  deleteDisease,
  addDisease,
  addCategories,
} from "../store/slices/diseaseSlice";

const api = axios.create({
  baseURL: API_URL,
  timeout: 20000,
  withCredentials: true,
});

export const getAllDiseasesHandle =
  (page, limit, status) => async (dispatch) => {
    try {
      dispatch(fetchStart());
      const response = await api.get(
        `/api/v1/diseases?page=${page}&limit=${limit}&status=${status}`
      );
      console.log({ response });
      dispatch(setDiseases(response.data.diseases));
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Không thể tải danh sách bệnh!";
      dispatch(fetchFailure(errorMessage));
      throw error;
    }
  };

export const getAllDiseaseCategoriesHandle =
  (page, limit) => async (dispatch) => {
    try {
      dispatch(fetchStart());
      const response = await api.get(
        `/api/v1/disease-categories?page=${page}&limit=${limit}`
      );
      dispatch(setCategories(response.data.categories));
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        "Không thể tải danh sách phân loại bệnh!";
      dispatch(fetchFailure(errorMessage));
      throw error;
    }
  };

export const getChildrenDiseaseCategoriesHandle =
  (page, limit, id) => async (dispatch) => {
    try {
      dispatch(fetchStart());
      const response = await api.get(
        `/api/v1/disease-categories/${id}/children?page=${page}&limit=${limit}`
      );
      dispatch(setCategories(response.data.categories));
      return response.data;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        "Không thể tải danh sách phân loại bệnh con!";
      dispatch(fetchFailure(errorMessage));
      throw error;
    }
  };

export const createDiseaseCategoryHandle = (formData) => async (dispatch) => {
  try {
    dispatch(fetchStart());
    const response = await api.post(`/api/v1/disease-categories`, formData);
    dispatch(addCategories(response.data.diseaseCategory));
    return response.data;
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || "Không thể tạo phân loại mới!";
    dispatch(fetchFailure(errorMessage));
    throw error;
  }
};

export const getDiseaseByIdHandle = (id) => async (dispatch) => {
  try {
    dispatch(fetchStart());
    const response = await api.get(`/api/v1/diseases/get-disease/${id}`);
    dispatch(setDisease(response.data.disease));
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || "Không thể tải chi tiết bệnh!";
    dispatch(fetchFailure(errorMessage));
    throw error;
  }
};

export const createDiseaseHandle = (payload) => async (dispatch) => {
  try {
    dispatch(fetchStart());
    await api.post(`/api/v1/diseases/create-disease`, payload);
    dispatch(addDisease());
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || "Không thể tạo bênh mới!";
    dispatch(fetchFailure(errorMessage));
    throw error;
  }
};

export const updateDiseaseHandle = (id, payload) => async (dispatch) => {
  try {
    dispatch(fetchStart());
    const response = await api.post(
      `/api/v1/diseases/update-disease/${id}`,
      payload
    );
    dispatch(updateDisease(response.data.disease));
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || "Không thể tạo bênh mới!";
    dispatch(fetchFailure(errorMessage));
    throw error;
  }
};

export const deleteDiseaseHandle = (id) => async (dispatch) => {
  try {
    dispatch(fetchStart());
    await api.delete(`/api/v1/diseases/delete-disease/${id}`);
    dispatch(deleteDisease(id));
  } catch (error) {
    const errorMessage = error.response?.data?.message || "Không thể xóa bệnh!";
    dispatch(fetchFailure(errorMessage));
    throw error;
  }
};

export const getAllPreventionsHandle = (page, limit) => async (dispatch) => {
  try {
    dispatch(fetchStart());
    const response = await api.get(
      `/api/v1/diseases/preventions?page=${page}&?limit=${limit}`
    );
    dispatch(setPreventions(response.data.preventions));
  } catch (error) {
    const errorMessage =
      error.response?.data?.message ||
      "Không thể tải danh sách biện pháp phòng ngừa!";
    dispatch(fetchFailure(errorMessage));
    throw error;
  }
};
export const getPreventionById = (id) => api.get(`/prevention/${id}`);
export const createPrevention = (data) => api.post("/prevention", data);
export const updatePrevention = (id, data) =>
  api.put(`/prevention/${id}`, data);
export const deletePrevention = (id) => api.delete(`/prevention/${id}`);

// ===== SYMPTOM =====
export const getAllSymptomsHandle = (page, limit) => async (dispatch) => {
  try {
    dispatch(fetchStart());
    const response = await api.get(
      `/api/v1/diseases/symptoms?page=${page}&?limit=${limit}`
    );
    dispatch(setSymptoms(response.data.symptoms));
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || "Không thể tải danh sách triệu chứng!";
    dispatch(fetchFailure(errorMessage));
    throw error;
  }
};
export const getSymptomById = (id) => api.get(`/symptom/${id}`);
export const createSymptom = (data) => api.post("/symptom", data);
export const updateSymptom = (id, data) => api.put(`/symptom/${id}`, data);
export const deleteSymptom = (id) => api.delete(`/symptom/${id}`);

// ===== TREATMENT =====
export const getAllTreatmentsHandle = (page, limit) => async (dispatch) => {
  try {
    dispatch(fetchStart());
    const response = await api.get(
      `/api/v1/diseases/treatment?page=${page}&?limit=${limit}`
    );
    dispatch(setTreatments(response.data.treatments));
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || "Không thể tải danh sách cách điều trị!";
    dispatch(fetchFailure(errorMessage));
    throw error;
  }
};
export const getTreatmentById = (id) => api.get(`/treatment/${id}`);
export const createTreatment = (data) => api.post("/treatment", data);
export const updateTreatment = (id, data) => api.put(`/treatment/${id}`, data);
export const deleteTreatment = (id) => api.delete(`/treatment/${id}`);

// ===== CAUSE =====
export const getAllCausesHandle = (page, limit) => async (dispatch) => {
  try {
    dispatch(fetchStart());
    const response = await api.get(
      `/api/v1/diseases/cause?page=${page}&?limit=${limit}`
    );
    dispatch(setCauses(response.data.causes));
  } catch (error) {
    const errorMessage =
      error.response?.data?.message ||
      "Không thể tải danh sách nguyên nhân gây bệnh!";
    dispatch(fetchFailure(errorMessage));
    throw error;
  }
};
export const getCauseById = (id) => api.get(`/cause/${id}`);
export const createCause = (data) => api.post("/cause", data);
export const updateCause = (id, data) => api.put(`/cause/${id}`, data);
export const deleteCause = (id) => api.delete(`/cause/${id}`);

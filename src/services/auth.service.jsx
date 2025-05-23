import axios from "axios";
import {
  registerStart,
  registerSuccess,
  registerFailure,
  loginStart,
  loginSuccess,
  loginFailure,
  loadUserStart,
  loadUserSuccess,
  loadUserFailure,
  logout,
  loadingStart,
  loadingEnd,
  updateUserProileFailure,
  updateUserProileSuccess,
  uploadUserAvatarSuccess,
  uploadUserAvatarFailure,
  getUserAddressSuccess,
  getUserAddressFailure,
  updateUserAddressSuccess,
  updateUserAddressFailure,
} from "../store/slices/authSlice";
import { API_URL } from "../config/api.config";

const api = axios.create({
  baseURL: API_URL,
  timeout: 5000,
  withCredentials: true,
});

export const loadUser = () => async (dispatch) => {
  try {
    dispatch(loadUserStart());
    const response = await api.get("/api/v1/user/profile");
    dispatch(loadUserSuccess(response.data.user));
    await dispatch(getUserAddress());
    return response.data;
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || "Không thể tải thông tin người dùng";
    dispatch(loadUserFailure(errorMessage));
    throw error;
  }
};

export const registerUser = (userData) => async (dispatch) => {
  try {
    dispatch(registerStart());
    const response = await api.post("/api/v1/user/register", userData);
    dispatch(registerSuccess(response.data));
    return { success: true, data: response.data };
  } catch (error) {
    const errorMessage = error.response?.data?.message || "Lỗi kết nối server";
    dispatch(registerFailure(errorMessage));
    throw error;
  }
};

export const loginUser = (credentials) => async (dispatch) => {
  try {
    dispatch(loginStart());
    const response = await api.post("/api/v1/user/login", credentials);
    dispatch(loginSuccess(response.data));
    await dispatch(loadUser());
    await dispatch(getUserAddress());
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.message || "Đăng nhập thất bại";
    dispatch(loginFailure(errorMessage));
    throw error;
  }
};
export const logoutUser = () => async (dispatch) => {
  try {
    await api.post("/api/v1/user/logout");

    dispatch(logout());
    return { success: true, message: "Đăng xuất thành công" };
  } catch (error) {
    const errorMessage = error.response?.data?.message || "Đăng xuất thất bại";
    console.error(errorMessage);
    throw error;
  }
};

export const updateUserProfile = (userData) => async (dispatch) => {
  try {
    dispatch(loadingStart());
    const response = await api.put("/api/v1/user/update/profile", userData);

    dispatch(updateUserProileSuccess({ user: response.data.user }));
    return {
      success: true,
      message: "Cập nhật thông tin thành công",
      user: response.data.user,
    };
  } catch (error) {
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      "Cập nhật thông tin thất bại";
    dispatch(updateUserProileFailure(errorMessage));
    throw new Error(errorMessage);
  }
};

export const uploadUserAvatar = (avatarFile) => async (dispatch) => {
  try {
    dispatch(loadingStart());
    const formData = new FormData();
    formData.append("avatar", avatarFile);
    const response = await api.put("/api/v1/user/upload_avatar", formData);
    dispatch(uploadUserAvatarSuccess({ user: response.data.user }));
    return { success: true, message: "Cập nhật avatar thành công!" };
  } catch (error) {
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      "Cập nhật ảnh đại diện thất bại";
    dispatch(uploadUserAvatarFailure(errorMessage));
    throw new Error(errorMessage);
  }
};

export const sendCodeVerifyMail = (email) => async (dispatch) => {
  try {
    dispatch(loadingStart());
    const response = await api.post("/api/v1/user/register/send_code", {
      email,
    });
    dispatch(loadingEnd());

    if (response.data.success) {
      return {
        success: true,
        message: response.data.message || "Gửi code thành công",
      };
    } else {
      throw new Error(response.data.message || "Gửi code thất bại");
    }
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || error.message || "Gửi code thất bại";
    dispatch(loadingEnd(errorMessage));
    throw new Error(errorMessage);
  }
};

export const confirmCode = (email, code) => async (dispatch) => {
  try {
    dispatch(loadingStart());
    const response = await api.post("/api/v1/user/register/confirm_code", {
      email,
      code,
    });
    dispatch(loadingEnd());

    if (response.data.success) {
      return {
        success: true,
        message: response.data.message || "Xác nhận email thành công",
      };
    } else {
      throw new Error(response.data.message || "Xác nhận email thất bại");
    }
  } catch (error) {
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      "Xác nhận email thất bại";
    dispatch(loadingEnd(errorMessage));
    throw new Error(errorMessage);
  }
};

export const getUserAddress = () => async (dispatch) => {
  try {
    dispatch(loadingStart());
    const response = await api.get("/api/v1/user/address");
    dispatch(getUserAddressSuccess(response.data.userAddress));
    return { success: true };
  } catch (error) {
    const errorMessage =
      error.response?.data.message || "Không thể địa chỉ của bạn";
    dispatch(getUserAddressFailure(errorMessage));
    throw error;
  }
};

export const updateUserAddress =
  (updateUserAddressData) => async (dispatch) => {
    try {
      dispatch(loadingStart());
      const response = await api.put(
        "/api/v1/user/update/address",
        updateUserAddressData
      );
      dispatch(updateUserAddressSuccess(response.data.userAddress));
      return { success: true };
    } catch (error) {
      const errorMessage =
        error.response?.data.message || "Không thể địa chỉ của bạn";
      dispatch(updateUserAddressFailure(errorMessage));
      throw error;
    }
  };

// Add interceptors for token management
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;

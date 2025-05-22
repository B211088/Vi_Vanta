import api from "../services/auth.service";

export const checkAuth = async () => {
  try {
    const response = await api.get("/api/v1/user/profile");
    if (response.status >= 200 && response.status < 300) {
      return true;
    }
  } catch (error) {
    return false;
  }
};

import axios from "axios";
import { userManager } from "./keycloak";

const API_URL = import.meta.env.VITE_API_URL;

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use(async (config) => {
  const user = await userManager.getUser();

  if (user?.access_token && !user.expired) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${user.access_token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status !== 401 ||
      !originalRequest ||
      originalRequest._retry
    ) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      // Token was rejected or expired: get a fresh one from Keycloak and retry once
      const user = await userManager.signinSilent();
      if (!user) return Promise.reject(error);

      originalRequest.headers = originalRequest.headers ?? {};
      originalRequest.headers.Authorization = `Bearer ${user.access_token}`;

      return api(originalRequest);
    } catch (refreshError) {
      return Promise.reject(refreshError);
    }
  },
);

export default api;

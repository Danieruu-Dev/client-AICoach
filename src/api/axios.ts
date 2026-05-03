import axios from "axios";
import { getAccessToken, setAccessToken } from "../utils/authToken";

const API_URL = import.meta.env.VITE_API_URL;

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const accessToken = getAccessToken();

  if (accessToken) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${accessToken}`;
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
      originalRequest._retry ||
      originalRequest.url?.includes("/api/auth/refresh")
    ) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      const refreshResponse = await axios.post(
        `${API_URL}/api/auth/refresh`,
        {},
        {
          withCredentials: true,
        },
      );

      const newAccessToken = refreshResponse.data.access_token;
      setAccessToken(newAccessToken);

      originalRequest.headers = originalRequest.headers ?? {};
      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

      return api(originalRequest);
    } catch (refreshError) {
      setAccessToken(null);
      return Promise.reject(refreshError);
    }
  },
);

export default api;

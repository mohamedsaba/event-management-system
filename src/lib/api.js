import axios from "axios";
import { toast } from "sonner";
import { config as appConfig } from "@/utils/config";

const api = axios.create({
  // Use Vite environment variables for the URL
  baseURL: appConfig.apiUrl,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000, // 10 seconds timeout
});

// REQUEST INTERCEPTOR: Automatically add Token to every call
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Flag to prevent multiple refresh attempts at the same time
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// RESPONSE INTERCEPTOR: Handle 401 with automatic token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const url = originalRequest?.url || "";
    const isAuthRequest = url.includes("/auth/");

    // If 401 and NOT an auth request and NOT already retried
    if (error.response?.status === 401 && !isAuthRequest && !originalRequest._retry) {
      const refreshToken = localStorage.getItem("refreshToken");

      if (!refreshToken) {
        // No refresh token available — force logout
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        toast.error("Session expired. Please log in again.");
        window.location.hash = "#/auth";
        return Promise.reject(error);
      }

      if (isRefreshing) {
        // Another refresh is in progress — queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((newToken) => {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Call refresh token endpoint directly (avoid circular import)
        const response = await axios.post(
          `${appConfig.apiUrl}/api/auth/refresh-token`,
          { refreshToken }
        );

        const newToken = response.data.token;
        const newRefreshToken = response.data.refreshToken;

        // Store new tokens
        localStorage.setItem("token", newToken);
        if (newRefreshToken) {
          localStorage.setItem("refreshToken", newRefreshToken);
        }

        // Update the failed request's auth header
        originalRequest.headers.Authorization = `Bearer ${newToken}`;

        // Process queued requests
        processQueue(null, newToken);

        // Retry the original request
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed — force logout
        processQueue(refreshError, null);
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        toast.error("Session expired. Please log in again.");
        window.location.hash = "#/auth";
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // For non-401 errors (and non-auth requests), show toast
    if (!isAuthRequest && error.response?.status !== 401) {
      const message = error.response?.data?.message || "Something went wrong";
      toast.error(message);
    }

    return Promise.reject(error);
  }
);

export default api;
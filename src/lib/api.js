import axios from "axios";
import { toast } from "sonner";

const api = axios.create({
  // Use Vite environment variables for the URL
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000, // 10 seconds timeout
});

// REQUEST INTERCEPTOR: Automatically add Token to every call
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token"); // We'll move to memory later, but this is the hook for it
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// RESPONSE INTERCEPTOR: Handle global errors (like 401 Unauthorized)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || "Something went wrong";

    // If the token is expired or invalid (401), force logout
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      toast.error("Session expired. Please log in again.");
      window.location.href = "/auth";
    } else {
      toast.error(message);
    }

    return Promise.reject(error);
  }
);

export default api;
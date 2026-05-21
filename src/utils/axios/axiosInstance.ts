import { router } from "@/main";
import axios from "axios";
import { queryClient } from "../queryclient/queryClient";

const defaultOptions = {
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
};

const axiosInstance = axios.create(defaultOptions);

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("auth_token");
    if (token) {
      config.headers.Authorization = "Bearer " + token;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const keysToRemove = Object.keys(localStorage).filter((key) =>
        key.startsWith("plan_role_"),
      );

      keysToRemove.forEach((key) => localStorage.removeItem(key));

      localStorage.removeItem("auth_token");
      localStorage.removeItem("user");

      queryClient.clear();

      router.navigate({ to: "/login" });
    }
    return Promise.reject(error);
  },
);

export default axiosInstance;

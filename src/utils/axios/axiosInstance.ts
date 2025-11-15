import axios from "axios";

const defaultOptions = {
  baseURL: "http://localhost:3000",
  headers: {
    "Content-Type": "application/json",
  },
};

const instance = axios.create(defaultOptions);

instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = token;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default instance;

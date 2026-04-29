import axios from "axios";

const api = axios.create({
  // Usamos (import.meta as any).env para que TS no moleste
  // y quitamos el .env repetido
  baseURL: (import.meta as any).env.VITE_API_URL || "http://localhost:8080/api",
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("parkly_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

export default api;
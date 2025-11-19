// src/services/http.jsx
import axios from "axios";
// Nếu bạn re-export store & logout từ '@/redux/store' thì dùng một dòng:
import { store, logout } from "@/redux/store";

// ✅ Base URL backend
const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:3000",
  withCredentials: false, // để true nếu backend dùng cookie
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  timeout: 15000,
});

// ✅ Gắn Bearer token nếu có
http.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ Bắt 401 -> logout nhẹ nhàng (nhưng bỏ qua /auth/login, /auth/register)
http.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err?.response?.status;
    const url = err?.config?.url || "";

    // ❗ Chỉ auto-logout nếu 401 KHÔNG phải từ các endpoint auth công khai
    const isAuthPublicEndpoint =
      url.includes("/auth/login") ||
      url.includes("/auth/register") ||
      url.includes("/auth/password/forgot");

    if (status === 401 && !isAuthPublicEndpoint) {
      console.warn("⚠️ Token hết hạn/không hợp lệ -> logout");
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");

      try {
        store.dispatch(logout());
      } catch (e) {
        console.log("Store chưa sẵn sàng:", e);
      }

      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }

    return Promise.reject(err);
  }
);

export default http;

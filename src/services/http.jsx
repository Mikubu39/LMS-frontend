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
    // Đảm bảo key thống nhất với chỗ login lưu
    const token = localStorage.getItem("access_token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ Bắt 401 -> logout nhẹ nhàng
http.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err?.response?.status;
    if (status === 401) {
      console.warn("⚠️ Token hết hạn/không hợp lệ -> logout");
      localStorage.removeItem("access_token");
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

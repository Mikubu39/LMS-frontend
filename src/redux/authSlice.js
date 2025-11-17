// src/redux/authSlice.js
import { createSlice } from "@reduxjs/toolkit";

/** Helper: parse JWT để khôi phục user từ localStorage (nếu có) */
function parseJwt(token) {
  if (!token) return null;
  try {
    const base64 = token.split(".")[1];
    const json = atob(base64.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(decodeURIComponent(escape(json)));
  } catch {
    return null;
  }
}

/** Helper: chuẩn hóa danh sách role từ payload */
function extractRoles(payload) {
  if (!payload) return ["student"];

  // một số backend trả "role", số khác trả "roles"
  const raw = payload.roles ?? payload.role;

  if (Array.isArray(raw)) return raw;
  if (typeof raw === "string" && raw.trim() !== "") return [raw.trim()];
  return ["student"];
}

/** Khởi tạo state auth từ localStorage (nếu có token cũ + user đã lưu) */
function loadInitialAuthState() {
  if (typeof window === "undefined") {
    return { user: null, isAuthenticated: false };
  }

  const token = localStorage.getItem("access_token");
  if (!token) return { user: null, isAuthenticated: false };

  const payload = parseJwt(token) || {};
  const roles = extractRoles(payload);

  // user cơ bản lấy từ payload JWT
  const baseUser = {
    id: payload.sub || `u_${Date.now()}`,
    name: payload.name || (payload.email || "").split("@")[0] || "User",
    email: payload.email || "",
    avatar: "https://i.pravatar.cc/80?img=47",
    roles,
    isAuthenticated: true,
    online: true,
  };

  // 🔹 Thử đọc user đã lưu chi tiết trong localStorage (sau khi update profile, upload avatar...)
  const storedRaw = localStorage.getItem("auth_user");

  if (storedRaw) {
    try {
      const storedUser = JSON.parse(storedRaw);
      return {
        user: {
          ...baseUser,
          ...storedUser,
          // đảm bảo roles không bị mất
          roles: storedUser.roles || baseUser.roles,
        },
        isAuthenticated: true,
      };
    } catch (e) {
      console.warn("Không parse được auth_user từ localStorage:", e);
      return {
        user: baseUser,
        isAuthenticated: true,
      };
    }
  }

  // Không có auth_user => dùng baseUser từ token
  return {
    user: baseUser,
    isAuthenticated: true,
  };
}

const authSlice = createSlice({
  name: "auth",
  initialState: loadInitialAuthState(),
  reducers: {
    /** Set lại thông tin user sau khi đăng nhập / cập nhật profile */
    setUser(state, action) {
      state.user = action.payload || null;
      state.isAuthenticated = !!action.payload; // chỉ cần có user là đang đăng nhập

      if (typeof window !== "undefined") {
        if (action.payload) {
          // 🔹 Lưu user chi tiết xuống localStorage để F5 không mất
          localStorage.setItem("auth_user", JSON.stringify(action.payload));
        } else {
          localStorage.removeItem("auth_user");
        }
      }
    },

    /** Đăng xuất: xoá user + token + cache user */
    logout(state) {
      state.user = null;
      state.isAuthenticated = false;
      if (typeof window !== "undefined") {
        localStorage.removeItem("access_token");
        localStorage.removeItem("auth_user"); // 🔹 xoá luôn user cache
      }
    },
  },
});

// 🔹 actions
export const { setUser, logout } = authSlice.actions;

// 🔹 selectors
export const selectUser = (state) => state.auth.user;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectIsAdmin = (state) =>
  !!state.auth.user?.roles?.includes("admin"); // tách riêng luồng admin

// 🔹 reducer mặc định cho store
export default authSlice.reducer;

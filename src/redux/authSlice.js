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

/** Helper: chuẩn hóa danh sách role từ payload (luôn trả về chữ thường, map ROLE_ADMIN → admin,...) */
function extractRoles(payload) {
  if (!payload) return ["student"];

  // một số backend trả "role", số khác trả "roles"
  const raw = payload.roles ?? payload.role;

  let roles = [];

  if (Array.isArray(raw)) {
    roles = raw;
  } else if (typeof raw === "string" && raw.trim() !== "") {
    roles = [raw];
  } else {
    roles = ["student"];
  }

  return roles
    .map((r) => {
      const lower = String(r).trim().toLowerCase();
      if (!lower) return null;

      if (lower.includes("admin")) return "admin";      // ADMIN, ROLE_ADMIN, superadmin...
      if (lower.includes("teacher")) return "teacher";  // TEACHER, ROLE_TEACHER
      if (lower.includes("student")) return "student";  // STUDENT, ROLE_STUDENT

      return lower;
    })
    .filter(Boolean);
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

  const baseUser = {
    id: payload.sub || `u_${Date.now()}`,
    name: payload.name || (payload.email || "").split("@")[0] || "User",
    email: payload.email || "",
    avatar: "https://i.pravatar.cc/80?img=47",
    roles,
    isAuthenticated: true,
    online: true,
  };

  const storedRaw = localStorage.getItem("auth_user");

  if (storedRaw) {
    try {
      const storedUser = JSON.parse(storedRaw);

      const finalRoles = extractRoles({
        roles: storedUser.roles || baseUser.roles,
      });

      return {
        user: {
          ...baseUser,
          ...storedUser,
          roles: finalRoles,
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

  return {
    user: baseUser,
    isAuthenticated: true,
  };
}

const authSlice = createSlice({
  name: "auth",
  initialState: loadInitialAuthState(),
  reducers: {
    setUser(state, action) {
      const incoming = action.payload || null;

      if (!incoming) {
        state.user = null;
        state.isAuthenticated = false;

        if (typeof window !== "undefined") {
          localStorage.removeItem("auth_user");
        }
        return;
      }

      const normalizedRoles = extractRoles({
        roles: incoming.roles ?? incoming.role,
      });

      state.user = {
        ...state.user,
        ...incoming,
        roles: normalizedRoles,
      };
      state.isAuthenticated = true;

      if (typeof window !== "undefined") {
        localStorage.setItem(
          "auth_user",
          JSON.stringify({
            ...incoming,
            roles: normalizedRoles,
          })
        );
      }
    },

    logout(state) {
      state.user = null;
      state.isAuthenticated = false;
      if (typeof window !== "undefined") {
        localStorage.removeItem("access_token");
        localStorage.removeItem("auth_user");
      }
    },
  },
});

export const { setUser, logout } = authSlice.actions;

export const selectUser = (state) => state.auth.user;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;

export const selectIsAdmin = (state) => {
  const roles = state.auth.user?.roles || [];
  return roles.map((r) => String(r).toLowerCase()).includes("admin");
};

export const selectRoles = (state) => state.auth.user?.roles || [];

export default authSlice.reducer;

// ✅ src/services/api/authApi.jsx
import http from "@/services/http";

/* Helper: decode JWT để lấy payload (email, sub, role, ...) */
function parseJwt(token) {
  if (!token) return null;
  try {
    const base64 = token.split(".")[1];
    const json = atob(base64.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(decodeURIComponent(escape(json)));
  } catch (e) {
    console.warn("Không parse được JWT:", e);
    return null;
  }
}

export const AuthApi = {
  /**
   * 🔹 Đăng nhập
   * @param {{ email: string, password: string }} body
   * @returns {Promise<{ access_token: string, refresh_token?: string, payload?: any }>}
   */
  async login(body) {
    // Không try/catch ở đây -> để component (Login.jsx) bắt lỗi AxiosError
    const { data } = await http.post("/auth/login", body);
    // data = { access_token, refresh_token }

    const accessToken = data?.access_token;
    const refreshToken = data?.refresh_token;

    if (!accessToken) {
      console.warn("⚠️ Backend không trả về access_token:", data);
      throw new Error("Không nhận được access_token từ server");
    }

    // ✅ Lưu token vào localStorage
    localStorage.setItem("access_token", accessToken);
    if (refreshToken) {
      localStorage.setItem("refresh_token", refreshToken);
    }

    // ✅ Decode payload để FE có thể dùng role/email nếu cần
    const payload = parseJwt(accessToken) || {};

    // Trả về giống backend + thêm payload cho tiện
    return {
      ...data,
      payload,
    };
  },

  /**
   * 🔹 Đăng ký người dùng mới
   * @param {Object} body - { full_name, email, password, phone? }
   */
  async register(body) {
    try {
      const { data } = await http.post("/auth/register", body);
      return data;
    } catch (error) {
      console.error("❌ Lỗi khi đăng ký:", error);
      const msg = error?.response?.data?.message || "Đăng ký thất bại";
      throw new Error(msg);
    }
  },

  /**
   * 🔹 Cập nhật hồ sơ người dùng
   * @param {Object} body - { full_name?, avatar?, phone? }
   */
  async updateProfile(body) {
    try {
      const { data } = await http.patch("/auth/profile/update", body);
      return data;
    } catch (error) {
      console.error("❌ Lỗi khi cập nhật hồ sơ:", error);
      const msg = error?.response?.data?.message || "Cập nhật hồ sơ thất bại";
      throw new Error(msg);
    }
  },

  /**
   * 🔹 Đổi mật khẩu
   * @param {{ oldPassword: string, newPassword: string }} body
   */
  async changePassword(body) {
    try {
      const { data } = await http.post("/auth/password/change", body);
      return data;
    } catch (error) {
      console.error("❌ Lỗi khi đổi mật khẩu:", error);
      const msg = error?.response?.data?.message || "Đổi mật khẩu thất bại";
      throw new Error(msg);
    }
  },

  /**
   * 🔹 Quên mật khẩu
   * @param {{ email: string }} body
   */
  async forgotPassword(body) {
    try {
      const { data } = await http.post("/auth/password/forgot", body);
      return data;
    } catch (error) {
      console.error("❌ Lỗi khi gửi email quên mật khẩu:", error);
      const msg = error?.response?.data?.message || "Gửi email thất bại";
      throw new Error(msg);
    }
  },

  async logout() {
    try {
      // Gọi API báo server hủy token
      await http.post("/auth/logout");
    } catch (error) {
      console.warn("Lỗi gọi API logout (có thể token đã hết hạn):", error);
    } finally {
      // Luôn xóa localStorage dù server trả về lỗi hay thành công
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("user");
    }
  }
};

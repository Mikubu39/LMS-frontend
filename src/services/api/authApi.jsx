// ✅ src/services/api/authApi.js
import http from "@/services/http";

export const AuthApi = {
  /**
   * 🔹 Đăng nhập người dùng
   * Backend trả về: { access_token }
   * @param {Object} body - { email, password }
   * @returns {Promise<{ access_token: string }>}
   */
  async login(body) {
    try {
      const { data } = await http.post("/auth/login", body);

      // ✅ Lưu token vào localStorage nếu có
      if (data?.access_token) {
        localStorage.setItem("access_token", data.access_token);
      } else {
        console.warn("⚠️ Backend không trả về access_token:", data);
      }

      return data;
    } catch (error) {
      console.error("❌ Lỗi khi đăng nhập:", error);
      // Ưu tiên hiển thị thông báo backend trả về nếu có
      const msg = error?.response?.data?.message || "Đăng nhập thất bại";
      throw new Error(msg);
    }
  },

  /**
   * 🔹 Đăng ký người dùng mới
   * @param {Object} body - { full_name, email, password, phone? }
   * @returns {Promise<object>}
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
   * ⚠️ Backend KHÔNG có /auth/me nên tạm ẩn
   * (Mở lại sau khi backend thêm endpoint)
   */
  // async getProfile() {
  //   try {
  //     const { data } = await http.get("/auth/me");
  //     return data;
  //   } catch (error) {
  //     console.error("❌ Lỗi khi lấy thông tin user:", error);
  //     throw error;
  //   }
  // },

  /**
   * 🔹 Cập nhật hồ sơ người dùng
   * @param {Object} body - { full_name?, avatar?, phone? }
   * @returns {Promise<object>}
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
   * @param {Object} body - { oldPassword, newPassword }
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
   * @param {Object} body - { email }
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
};

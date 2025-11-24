// ✅ src/services/api/userApi.jsx
import http from "@/services/http";

export const UserApi = {
  /**
   * Lấy danh sách users (có thể lọc theo role)
   * Endpoint backend: GET /users/admin
   */
  getAll: async (params = {}) => {
    // Gọi vào endpoint admin
    const res = await http.get("/users/admin", { params });
    
    // Backend trả về dạng phân trang: { data: [...], total: ... }
    // Chúng ta cần lấy mảng 'data'
    return res.data?.data || [];
  },
};
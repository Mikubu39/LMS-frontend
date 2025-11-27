import http from "@/services/http";

export const UserApi = {
  // Lấy danh sách user (Admin)
  getAll: async (params) => {
    // params: { page, limit, search, role, ... }
    const res = await http.get("/users/admin", { params });
    
    // Lưu ý: Backend trả về { data: [...], meta: {...} } (PaginatedStudentsResponseDto)
    // Frontend UserManagerTable đang mong đợi một mảng, nên ta cần trả về res.data.data
    return res.data?.data || []; 
  },

  // Lấy chi tiết 1 user
  getById: async (id) => {
    const res = await http.get(`/users/admin/${id}`);
    return res.data;
  },

  // Tạo mới user
  create: async (data) => {
    const res = await http.post("/users/admin", data);
    return res.data;
  },

  // 👇 HÀM UPDATE BẠN ĐANG THIẾU
  update: async (id, data) => {
    const res = await http.patch(`/users/admin/${id}`, data);
    return res.data;
  },

  // Xóa user
  delete: async (id) => {
    const res = await http.delete(`/users/admin/${id}`);
    return res.data;
  },
};
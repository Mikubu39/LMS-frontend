import http from "@/services/http";

export const UserApi = {
  // ... Các hàm cũ giữ nguyên (getAll, getById, create, update, delete, uploadExcel) ...

  getAll: async (params) => {
    const res = await http.get("/users/admin", { params });
    return res.data?.data || []; 
  },
  getById: async (id) => {
    const res = await http.get(`/users/admin/${id}`);
    return res.data;
  },
  create: async (data) => {
    const res = await http.post("/users/admin", data);
    return res.data;
  },
  update: async (id, data) => {
    const res = await http.patch(`/users/admin/${id}`, data);
    return res.data;
  },
  delete: async (id) => {
    const res = await http.delete(`/users/admin/${id}`);
    return res.data;
  },
  uploadExcel: async (file, role) => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await http.post(`/users/admin/import?role=${role}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  },

  // 👇 HÀM MỚI: Lấy danh sách khóa học của tôi
  getMyCourses: async () => {
    // Endpoint backend: /users/profile/me/courses
    const res = await http.get("/users/profile/me/courses");
    return res.data; // Trả về { courses: [...] }
  }
};
// ✅ src/services/api/classApi.jsx
import http from "@/services/http";

export const ClassApi = {
  getAll: async () => {
    const res = await http.get("/classes");
    return res.data;
  },
  
  // 👇 THÊM: Lấy chi tiết lớp
  getById: async (id) => {
    const res = await http.get(`/classes/${id}`);
    return res.data;
  },

  create: async (data) => {
    const res = await http.post("/classes", data);
    return res.data;
  },
  update: async (id, data) => {
    const res = await http.patch(`/classes/${id}`, data);
    return res.data;
  },
  delete: async (id) => {
    const res = await http.delete(`/classes/${id}`);
    return res.data;
  },

  // 👇 THÊM: Lấy danh sách học viên của lớp
  getStudents: async (classId) => {
    const res = await http.get(`/classes/${classId}/students`);
    return res.data;
  },

  // 👇 THÊM: Thêm học viên vào lớp
  addStudent: async (classId, studentId) => {
    const res = await http.post(`/classes/${classId}/students`, { studentId });
    return res.data;
  }
};
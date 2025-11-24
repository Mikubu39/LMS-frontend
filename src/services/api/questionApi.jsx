// ✅ src/services/api/questionApi.jsx
import http from "@/services/http";

export const QuestionApi = {
  /**
   * Lấy tất cả câu hỏi
   * GET /questions
   */
  getAll: async () => {
    const res = await http.get("/questions");
    return res.data;
  },

  /**
   * Tạo câu hỏi mới
   * POST /questions
   */
  create: async (data) => {
    const res = await http.post("/questions", data);
    return res.data;
  },

  /**
   * Cập nhật câu hỏi
   * PATCH /questions/:id
   */
  update: async (id, data) => {
    const res = await http.patch(`/questions/${id}`, data);
    return res.data;
  },

  /**
   * Xóa câu hỏi
   * DELETE /questions/:id
   */
  delete: async (id) => {
    const res = await http.delete(`/questions/${id}`);
    return res.data;
  },

  /**
   * Import từ Excel
   * POST /questions/import
   */
  importExcel: async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    
    const res = await http.post("/questions/import", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return res.data;
  },
};
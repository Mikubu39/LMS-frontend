// ✅ src/services/api/quizApi.jsx
import http from "@/services/http";

export const QuizApi = {
  // Lấy danh sách Quiz
  getAll: async () => {
    const res = await http.get("/quizzes");
    return res.data;
  },

  // Lấy chi tiết Quiz (kèm câu hỏi)
  getById: async (id) => {
    const res = await http.get(`/quizzes/${id}`);
    return res.data;
  },

  // Tạo Quiz mới
  create: async (data) => {
    const res = await http.post("/quizzes", data);
    return res.data;
  },

  // Cập nhật thông tin Quiz
  update: async (id, data) => {
    const res = await http.patch(`/quizzes/${id}`, data);
    return res.data;
  },

  // Xóa Quiz
  delete: async (id) => {
    const res = await http.delete(`/quizzes/${id}`);
    return res.data;
  },

  /**
   * Gán câu hỏi vào Quiz
   * Payload: { assignments: [{ question_id, order_index }] }
   */
  assignQuestions: async (quizId, assignments) => {
    const res = await http.put(`/quizzes/${quizId}/questions`, { assignments });
    return res.data;
  },
  
  submitQuiz: async (quizId, payload) => {
    // payload: { answers: [...], lessonItemId }
    const res = await http.post(`/quizzes/${quizId}/submit`, payload);
    return res.data;
  },
};
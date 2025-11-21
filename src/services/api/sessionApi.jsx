// ✅ src/services/api/sessionApi.js
import http from "@/services/http";

// Mọi chỗ khác sẽ import: import { SessionApi } from "@/services/api/sessionApi";
export const SessionApi = {
  /**
   * Lấy toàn bộ sessions
   * GET /sessions
   */
  async getSessions() {
    const { data } = await http.get("/sessions");
    return data;
  },

  /**
   * Lấy chi tiết 1 session theo id
   * GET /sessions/:id
   */
  async getSessionById(id) {
    const { data } = await http.get(`/sessions/${id}`);
    return data;
  },

  /**
   * Tạo session mới
   * body: { title: string, order?: number, courseId: string }
   * POST /sessions
   */
  async createSession(body) {
    const { data } = await http.post("/sessions", body);
    return data;
  },

  /**
   * Cập nhật session
   * PATCH /sessions/:id
   */
  async updateSession(id, body) {
    const { data } = await http.patch(`/sessions/${id}`, body);
    return data;
  },

  /**
   * Xoá session
   * DELETE /sessions/:id
   */
  async deleteSession(id) {
    const { data } = await http.delete(`/sessions/${id}`);
    return data;
  },

  // ✅ Thêm alias cho chắc (nếu chỗ nào cũ còn dùng getAllSessions)
  async getAllSessions() {
    return this.getSessions();
  },
};

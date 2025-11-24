// ✅ src/services/api/sessionApi.jsx
import http from "@/services/http";

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
   * 👇 QUAN TRỌNG: Lấy sessions theo courseId
   * Do backend api findAll trả về tất cả, ta cần filter phía client
   * hoặc gửi params nếu backend hỗ trợ (ở đây ta filter thủ công cho chắc chắn)
   */
  async getSessionsByCourse(courseId) {
    const { data } = await http.get("/sessions");
    
    if (Array.isArray(data)) {
      // 👇 Logic lọc an toàn: Kiểm tra cả 2 trường hợp
      return data.filter(s => 
        (s.courseId === courseId) ||        // Trường hợp 1: Có cột courseId
        (s.course && s.course.id === courseId) // Trường hợp 2: Có quan hệ course
      );
    }
    return [];
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

  // Alias
  async getAllSessions() {
    return this.getSessions();
  },
};
// ✅ src/services/api/sessionApi.jsx
import http from "@/services/http";

/**
 * Chuẩn hóa response list sessions:
 * - Nếu backend trả mảng: [session, ...]
 * - Hoặc { items: [...], meta: {...} } / { data: [...], meta: {...} }
 */
function normalizeListResponse(data) {
  let list = [];

  if (Array.isArray(data)) {
    list = data;
  } else if (Array.isArray(data?.items)) {
    list = data.items;
  } else if (Array.isArray(data?.data)) {
    list = data.data;
  } else if (Array.isArray(data?.results)) {
    list = data.results;
  }

  return list;
}

export const SessionApi = {
  /**
   * Lấy tất cả session
   * GET /sessions
   */
  async getSessions() {
    const { data } = await http.get("/sessions");
    return normalizeListResponse(data);
  },

  /**
   * Lấy chi tiết 1 session
   * GET /sessions/:id
   */
  async getSessionById(id) {
    const { data } = await http.get(`/sessions/${id}`);
    return data;
  },

  /**
   * Tạo session
   * POST /sessions
   * body dự kiến: { title, order, courseId }
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
   * Xóa session
   * DELETE /sessions/:id
   */
  async deleteSession(id) {
    const { data } = await http.delete(`/sessions/${id}`);
    return data;
  },
};

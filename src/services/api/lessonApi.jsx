// ✅ src/services/api/lessonApi.jsx
import http from "@/services/http";

export const LessonApi = {
  // ==========================================
  // 1. API CHO BÀI HỌC (LESSON - Vỏ bên ngoài)
  // ==========================================

  /**
   * Tạo bài học mới (chỉ có vỏ: title, order, sessionId)
   * POST /lessons
   */
  async createLesson(body) {
    // body: { title, sessionId, order }
    const { data } = await http.post("/lessons", body);
    return data;
  },

  /**
   * Lấy chi tiết bài học (Backend sẽ trả về kèm relation 'items')
   * GET /lessons/:id
   */
  async getLessonById(id) {
    const { data } = await http.get(`/lessons/${id}`);
    return data;
  },

  /**
   * Cập nhật thông tin cơ bản bài học (Tiêu đề, thứ tự)
   * PATCH /lessons/:id
   */
  async updateLesson(id, body) {
    const { data } = await http.patch(`/lessons/${id}`, body);
    return data;
  },

  /**
   * Xoá bài học (Xoá luôn cả items bên trong)
   * DELETE /lessons/:id
   */
  async deleteLesson(id) {
    const { data } = await http.delete(`/lessons/${id}`);
    return data;
  },

  // ==========================================
  // 2. API CHO NỘI DUNG (LESSON ITEMS - Video/Text/Quiz)
  // ==========================================

  /**
   * Thêm nội dung vào bài học
   * POST /lessons/:lessonId/items
   * body: { type: 'Video'|'Text', title?, videoUrl?, textContent? }
   */
  async addLessonItem(lessonId, body) {
    const { data } = await http.post(`/lessons/${lessonId}/items`, body);
    return data;
  },

  /**
   * Cập nhật nội dung chi tiết
   * ⚠️ URL Backend: PATCH /lessons/items/:itemId (Không có lessonId ở giữa)
   */
  async updateLessonItem(itemId, body) {
    const { data } = await http.patch(`/lessons/items/${itemId}`, body);
    return data;
  },

  /**
   * Xoá một item cụ thể
   * ⚠️ URL Backend: DELETE /lessons/items/:itemId
   */
  async deleteLessonItem(itemId) {
    const { data } = await http.delete(`/lessons/items/${itemId}`);
    return data;
  },
};
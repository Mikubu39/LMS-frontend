// ✅ src/services/api/lessonApi.jsx
import http from "@/services/http";

export const LessonApi = {
  // ==========================================
  // 0. LẤY DANH SÁCH BÀI HỌC
  // ==========================================

  /**
   * Lấy danh sách bài học
   * GET /lessons
   * params (optional): { sessionId?, courseId?, page?, limit? } tuỳ backend xử lý
   *
   * Ví dụ response (list):
   * [
   *   {
   *     "id": "...",
   *     "title": "Bài 1: Giới thiệu",
   *     "duration": 15,
   *     "order": 1,
   *     "session": {
   *       "id": "...",
   *       "title": "Chương 1: Bắt đầu với NestJS",
   *       ...
   *     }
   *   },
   *   ...
   * ]
   */
  async getLessons(params) {
    const { data } = await http.get("/lessons", { params });
    return data; // thường là mảng lesson hoặc { data, meta }
  },

  // alias cho code cũ đang gọi getAllLessons()
  async getAllLessons(params) {
    return LessonApi.getLessons(params);
  },

  /**
   * Lấy danh sách bài học theo sessionId (nếu backend đang filter bằng query)
   * GET /lessons?sessionId=...
   */
  async getLessonsBySession(sessionId) {
    const { data } = await http.get("/lessons", {
      params: { sessionId },
    });
    return data;
  },

  // ==========================================
  // 1. API CHO BÀI HỌC (LESSON)
  // ==========================================

  /**
   * Tạo bài học mới
   * POST /lessons
   * body gợi ý: { title, sessionId, orderIndex?, type?, duration? }
   */
  async createLesson(body) {
    const { data } = await http.post("/lessons", body);
    return data;
  },

  /**
   * Lấy chi tiết 1 bài học (backend trả kèm items)
   * GET /lessons/:id
   *
   * Ví dụ response:
   * {
   *   "id": "...",
   *   "title": "adsf",
   *   "duration": 15,
   *   "order": 1,
   *   "items": [
   *     {
   *       "id": "...",
   *       "type": "Video",
   *       "orderIndex": 1,
   *       "title": "Video mới",
   *       "videoUrl": "https://www.youtube.com/..."
   *     }
   *   ]
   * }
   */
  async getLessonById(id) {
    const { data } = await http.get(`/lessons/${id}`);
    return data; // { id, title, ..., items: [...] }
  },

  /**
   * Cập nhật thông tin cơ bản bài học (tiêu đề, thứ tự,...)
   * PATCH /lessons/:id
   */
  async updateLesson(id, body) {
    const { data } = await http.patch(`/lessons/${id}`, body);
    return data;
  },

  /**
   * Xoá bài học
   * DELETE /lessons/:id
   */
  async deleteLesson(id) {
    const { data } = await http.delete(`/lessons/${id}`);
    return data;
  },

  // ==========================================
  // 2. API CHO NỘI DUNG BÀI HỌC (LESSON ITEMS)
  // ==========================================

  /**
   * Thêm 1 nội dung (item) vào bài học
   * POST /lessons/:lessonId/items
   *
   * body gợi ý:
   * {
   *   type: 'Video' | 'Text' | 'Quiz' | 'Essay',
   *   title?: string,
   *   orderIndex?: number,
   *   // VIDEO:
   *   videoUrl?: string,
   *   duration?: number,
   *   // TEXT / ESSAY:
   *   textContent?: string,
   *   // QUIZ:
   *   resource_quiz_id?: string
   * }
   */
  async addLessonItem(lessonId, body) {
    const { data } = await http.post(`/lessons/${lessonId}/items`, body);
    return data;
  },

  /**
   * Cập nhật 1 item
   * PATCH /lessons/items/:itemId
   */
  async updateLessonItem(itemId, body) {
    const { data } = await http.patch(`/lessons/items/${itemId}`, body);
    return data;
  },

  /**
   * Xoá 1 item của bài học
   * DELETE /lessons/items/:itemId
   */
  async deleteLessonItem(itemId) {
    const { data } = await http.delete(`/lessons/items/${itemId}`);
    return data;
  },

  // ==========================================
  // 3. ALIAS / HELPER THEO RESPONSE THỰC TẾ
  // ==========================================

  /**
   * Helper: tên rõ nghĩa hơn cho list có kèm session
   * (thực chất vẫn là GET /lessons)
   */
  async getLessonsWithSession(params) {
    return LessonApi.getLessons(params);
  },

  /**
   * Helper: tên rõ nghĩa hơn cho detail có kèm items
   * (thực chất vẫn là GET /lessons/:id)
   */
  async getLessonWithItems(id) {
    return LessonApi.getLessonById(id);
  },
};

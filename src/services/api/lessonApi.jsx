// ✅ src/services/api/lessonApi.js
import http from "@/services/http";

/**
 * API cho Lessons
 * Backend:
 *  - GET    /lessons
 *  - GET    /lessons/:id
 *  - POST   /lessons
 *  - PATCH  /lessons/:id
 *  - DELETE /lessons/:id
 *
 * CreateLessonDto (backend):
 *  {
 *    title: string;        // bắt buộc
 *    duration?: number;    // phút
 *    order?: number;       // thứ tự
 *    type?: "Video" | "Quiz" | "Essay" | "Link"; // enum LessonType
 *    sessionId: string;    // UUID, bắt buộc
 *  }
 */

export const LessonApi = {
  /**
   * Lấy danh sách tất cả lessons
   * GET /lessons
   */
  async getLessons() {
    const { data } = await http.get("/lessons");
    return data; // mảng Lesson
  },

  // ⭐ Alias cho code đang dùng getAllLessons()
  async getAllLessons() {
    return this.getLessons();
  },

  /**
   * Lấy chi tiết 1 lesson theo id
   * GET /lessons/:id
   */
  async getLessonById(id) {
    const { data } = await http.get(`/lessons/${id}`);
    return data; // Lesson
  },

  /**
   * Tạo lesson mới
   * POST /lessons
   */
  async createLesson(body) {
    // body phải đúng DTO: { title, duration?, order?, type?, sessionId }
    const { data } = await http.post("/lessons", body);
    return data;
  },

  /**
   * Cập nhật lesson
   * PATCH /lessons/:id
   */
  async updateLesson(id, body) {
    const { data } = await http.patch(`/lessons/${id}`, body);
    return data;
  },

  /**
   * Xóa lesson
   * DELETE /lessons/:id
   */
  async deleteLesson(id) {
    const { data } = await http.delete(`/lessons/${id}`);
    return data;
  },
};

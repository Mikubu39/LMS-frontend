// ✅ src/services/api/lessonVideoApi.jsx
import http from "@/services/http";

export const LessonVideoApi = {
  // Lấy danh sách video bài học (GET /lesson-videos)
  async getLessonVideos() {
    const { data } = await http.get("/lesson-videos");
    return data; // có thể là mảng
  },

  // Lấy chi tiết 1 video bài học (GET /lesson-videos/:id)
  async getLessonVideoById(id) {
    const { data } = await http.get(`/lesson-videos/${id}`);
    return data; // object: { id, title, description, videoUrl, duration, ... }
  },

  async createLessonVideo(body) {
    const { data } = await http.post("/lesson-videos", body);
    return data;
  },

  async updateLessonVideo(id, body) {
    const { data } = await http.patch(`/lesson-videos/${id}`, body);
    return data;
  },

  async deleteLessonVideo(id) {
    const { data } = await http.delete(`/lesson-videos/${id}`);
    return data;
  },
};

// src/services/api/submissionApi.jsx
import http from "@/services/http";

/**
 * API nộp bài / quản lý bài nộp
 */
export const SubmissionApi = {
  // =======================
  // 1. STUDENT: Nộp bài
  // =======================
  async createSubmission(payload) {
    const { data } = await http.post("/submissions", payload);
    return data; 
  },

  // Cập nhật bài nộp (nếu backend hỗ trợ PUT/PATCH)
  async updateSubmission(id, payload) {
    const { data } = await http.patch(`/submissions/${id}`, payload);
    return data;
  },

  // Lấy danh sách bài nộp của chính student đang login
  async getMySubmissions(params) {
    const { data } = await http.get("/submissions/my", { params });
    return data; // Thường là mảng []
  },

  // 👇👇👇 HÀM MỚI QUAN TRỌNG ĐỂ FIX LỖI F5 👇👇👇
  // Hàm này sẽ lấy danh sách bài đã nộp, sau đó lọc ra bài trùng với lessonItemId hiện tại
  async getSubmissionByLessonItemId(lessonItemId) {
    try {
      // 1. Gọi API lấy tất cả bài đã nộp của user
      const { data } = await http.get("/submissions/my");

      // 2. Kiểm tra nếu data là mảng thì mới tìm kiếm
      if (Array.isArray(data)) {
        // Tìm bài nộp nào có lessonItemId khớp với bài học đang mở
        // Lưu ý: Tùy backend trả về key là 'lessonItemId' hay 'lesson_item_id'
        const found = data.find(
          (sub) => 
            sub.lessonItemId === lessonItemId || 
            sub.lessonItem?.id === lessonItemId ||
            sub.lesson_item_id === lessonItemId
        );
        return found || null;
      }
      return null;
    } catch (error) {
      console.error("Error fetching specific submission:", error);
      return null;
    }
  },
  // 👆👆👆 --------------------------------------- 👆👆👆

  // =======================
  // 2. ADMIN / TEACHER
  // =======================

  async getAllSubmissions(params) {
    const { data } = await http.get("/admin/submissions", { params });
    return data; 
  },

  async getSubmissionDetail(id) {
    const { data } = await http.get(`/admin/submissions/${id}`);
    return data; 
  },

  async gradeSubmission(id, payload) {
    const { data } = await http.patch(`/admin/submissions/${id}/grade`, payload);
    return data; 
  },
};
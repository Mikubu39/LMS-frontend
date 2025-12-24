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
    // Payload gửi lên bắt buộc phải có: { lessonItemId, classId, gitLink, ... }
    const { data } = await http.post("/submissions", payload);
    return data; 
  },

  // Cập nhật bài nộp
  async updateSubmission(id, payload) {
    const { data } = await http.patch(`/submissions/${id}`, payload);
    return data;
  },

  // Lấy danh sách bài nộp của chính student đang login
  async getMySubmissions(params) {
    const { data } = await http.get("/submissions/my", { params });
    return data;
  },

  // 👇👇👇 HÀM ĐÃ SỬA: Thêm tham số classId 👇👇👇
  // Hàm này sẽ tìm bài nộp khớp cả lessonItemId VÀ classId
  async getSubmissionByLessonItemId(lessonItemId, classId) {
    try {
      if (!classId) {
        console.warn("getSubmissionByLessonItemId gọi thiếu classId -> Có thể lấy nhầm bài cũ");
      }

      // 1. Gọi API lấy tất cả bài đã nộp
      // (Tốt nhất là Backend nên hỗ trợ filter ?lessonItemId=&classId= để đỡ phải lọc ở client)
      // Nhưng nếu dùng logic hiện tại thì ta lọc client:
      const { data } = await http.get("/submissions/my");

      // 2. Lọc bài nộp
      if (Array.isArray(data)) {
        const found = data.find((sub) => {
            // Check ID bài học (hỗ trợ nhiều format key)
            const isItemMatch = 
                sub.lessonItemId === lessonItemId || 
                sub.lessonItem?.id === lessonItemId ||
                sub.lesson_item_id === lessonItemId;
            
            // Check ID lớp học (QUAN TRỌNG NHẤT)
            // Nếu sub.classId (từ backend trả về) khớp với classId hiện tại
            const isClassMatch = sub.classId === classId || sub.class?.class_id === classId;

            // Nếu classId không được truyền vào (undefined), ta tạm thời bỏ qua check class (fallback)
            // Nhưng đúng logic là PHẢI có classId.
            return isItemMatch && (classId ? isClassMatch : true);
        });
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
    // params nên chứa { classId: '...', lessonItemId: '...' }
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
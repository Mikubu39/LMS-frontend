import axiosClient from "@/services/http"; 

export const ProgressApi = {
  /**
   * Cập nhật hoặc tạo mới tiến độ học (Upsert)
   * * @param {Object} payload - Dữ liệu gửi lên
   * @param {string} payload.userId - ID người dùng (Bắt buộc)
   * @param {string} payload.courseId - ID khoá học (Bắt buộc)
   * @param {string} payload.sessionId - ID chương (Bắt buộc)
   * @param {string} payload.lessonId - ID bài học cha (Bắt buộc)
   * @param {string} payload.lessonItemId - ID bài học con/video (Bắt buộc)
   * @param {string} [payload.classId] - ID lớp học (Tuỳ chọn)
   * @param {'in_progress' | 'completed'} [payload.status] - Trạng thái
   * @param {number} [payload.percentage] - Phần trăm hoàn thành (0-100)
   * @param {number} [payload.lastPosition] - Vị trí xem video gần nhất (giây)
   */
  upsert: async (payload) => {
    const url = '/progress';
    return await axiosClient.post(url, payload);
  },

  /**
   * Lấy tiến độ học hiện tại
   * * @param {Object} params - Tham số lọc
   * @param {string} params.userId - ID người dùng (Bắt buộc)
   * @param {string} [params.courseId]
   * @param {string} [params.sessionId]
   * @param {string} [params.lessonId]
   * @param {string} [params.lessonItemId] - Thường dùng nhất để lấy progress bài hiện tại
   * @param {string} [params.classId]
   */
  get: async (params) => {
    const url = '/progress';
    return await axiosClient.get(url, { params });
  }
};
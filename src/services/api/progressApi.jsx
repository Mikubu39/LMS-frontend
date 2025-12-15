import axiosClient from "@/services/http"; 

export const ProgressApi = {
  /**
   * Cập nhật hoặc tạo mới tiến độ học (Upsert)
   * @param {Object} payload - Dữ liệu gửi lên
   */
  upsert: async (payload) => {
    const url = '/progress';
    return await axiosClient.post(url, payload);
  },

  /**
   * Lấy tiến độ học hiện tại (của 1 user cụ thể đối với bài học/khóa học)
   * @param {Object} params - Tham số lọc
   */
  get: async (params) => {
    const url = '/progress';
    return await axiosClient.get(url, { params });
  },

  /**
   * 🟢 HÀM MỚI: Lấy tổng hợp tiến độ của cả lớp
   * Dùng cho trang ClassDetail để hiển thị % hoàn thành của từng học viên
   * * @param {string} classId - ID lớp học
   * @param {string[]} studentIds - Mảng ID học viên (VD: ['id1', 'id2'])
   * @param {string[]} courseIds - Mảng ID khóa học (VD: ['c1', 'c2'])
   */
  getClassProgress: async (classId, studentIds, courseIds) => {
    const url = '/progress/class-summary';
    
    // Backend yêu cầu query string dạng "id1,id2", nên ta dùng .join(',')
    return await axiosClient.get(url, {
      params: {
        classId,
        studentIds: studentIds.join(','), 
        courseIds: courseIds.join(','),
      }
    });
  }
};
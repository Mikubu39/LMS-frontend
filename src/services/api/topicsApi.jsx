import http from "../http"; // ⚠️ Đảm bảo đường dẫn import đúng tới file http.jsx của bạn

export const TopicsApi = {
  /**
   * Lấy danh sách Topics (có hỗ trợ phân trang, tìm kiếm)
   * URL: GET /topics?page=1&limit=10&search=...&level=N5
   * @param {Object} params - { page, limit, search, level }
   */
  getAll: async (params) => {
    const res = await http.get("/topics", { params });
    return res.data;
  },

  /**
   * Lấy chi tiết Topic theo ID
   * URL: GET /topics/:id
   * @param {string} id 
   */
  getById: async (id) => {
    const res = await http.get(`/topics/${id}`);
    return res.data;
  },

  /**
   * Tạo Topic mới
   * URL: POST /topics
   * @param {Object} data - { name, description, level, ... }
   */
  create: async (data) => {
    const res = await http.post("/topics", data);
    return res.data;
  },

  /**
   * Cập nhật Topic
   * URL: PUT /topics/:id (hoặc PATCH tùy backend)
   * @param {string} id 
   * @param {Object} data - { name, description, level, ... }
   */
  update: async (id, data) => {
    const res = await http.put(`/topics/${id}`, data);
    return res.data;
  },

  /**
   * Xóa Topic
   * URL: DELETE /topics/:id
   * @param {string} id 
   */
  delete: async (id) => {
    const res = await http.delete(`/topics/${id}`);
    return res.data;
  },

  // --- MỞ RỘNG CHO TỪ VỰNG (Nếu backend gộp chung vào Topic) ---
  
  /**
   * Lấy danh sách từ vựng thuộc Topic này
   * URL: GET /topics/:id/vocabularies
   */
  getVocabulariesByTopic: async (topicId, params) => {
    const res = await http.get(`/topics/${topicId}/vocabularies`, { params });
    return res.data;
  }
};
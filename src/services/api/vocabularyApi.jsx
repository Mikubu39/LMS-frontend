import http from "../http"; // ⚠️ Đảm bảo đường dẫn import đúng tới file http.jsx

export const VocabularyApi = {
  /**
   * Lấy danh sách từ vựng (có phân trang, tìm kiếm, lọc theo topic)
   * Endpoint: GET /vocabularies
   * @param {Object} params - { page, limit, search, topic_id }
   */
  getAll: async (params) => {
    // Ví dụ: /vocabularies?page=1&limit=10&topic_id=...
    const res = await http.get("/vocabularies", { params });
    return res.data;
  },

  /**
   * Lấy chi tiết 1 từ vựng theo ID
   * Endpoint: GET /vocabularies/:id
   * @param {string} id 
   */
  getById: async (id) => {
    const res = await http.get(`/vocabularies/${id}`);
    return res.data;
  },

  /**
   * Tạo từ vựng mới
   * Endpoint: POST /vocabularies
   * @param {Object} data 
   * Cấu trúc data mong đợi:
   * {
   * word: "日本",
   * meaning: "Nhật Bản",
   * topic_id: "uuid-cua-topic",
   * kanji_ids: [1, 2] // Mảng ID của các Kanji liên quan (nếu backend hỗ trợ map luôn)
   * }
   */
  create: async (data) => {
    const res = await http.post("/vocabularies", data);
    return res.data;
  },

  /**
   * Cập nhật từ vựng
   * Endpoint: PUT /vocabularies/:id
   * @param {string} id 
   * @param {Object} data - { word, meaning, topic_id, kanji_ids }
   */
  update: async (id, data) => {
    const res = await http.put(`/vocabularies/${id}`, data);
    return res.data;
  },

  /**
   * Xóa từ vựng
   * Endpoint: DELETE /vocabularies/:id
   * @param {string} id 
   */
  delete: async (id) => {
    const res = await http.delete(`/vocabularies/${id}`);
    return res.data;
  },

  // --- CÁC HÀM MỞ RỘNG (Tùy thuộc vào thiết kế Backend của bạn) ---

  /**
   * Gán thêm Kanji vào từ vựng (nếu API tách riêng chức năng này)
   * Endpoint: POST /vocabularies/:id/kanji
   */
  addKanji: async (vocabId, kanjiId) => {
    const res = await http.post(`/vocabularies/${vocabId}/kanji`, { kanji_id: kanjiId });
    return res.data;
  },

  /**
   * Gỡ Kanji khỏi từ vựng
   * Endpoint: DELETE /vocabularies/:id/kanji/:kanjiId
   */
  removeKanji: async (vocabId, kanjiId) => {
    const res = await http.delete(`/vocabularies/${vocabId}/kanji/${kanjiId}`);
    return res.data;
  }
};
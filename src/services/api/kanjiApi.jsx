import http from "../http"; // ⚠️ Hãy kiểm tra đường dẫn import http cho đúng vị trí file

export const KanjiApi = {
  /**
   * Lấy danh sách Kanji (có phân trang & tìm kiếm)
   * @param {Object} params - { page, limit, search, jlpt }
   * Ví dụ URL: GET /kanji?page=1&limit=10&search=nhất&jlpt=N5
   */
  getAll: async (params) => {
    // Lưu ý: Endpoint là /kanji hoặc /kanjis tùy theo Backend của bạn
    const res = await http.get("/kanji", { params });
    return res.data;
  },

  /**
   * Lấy chi tiết 1 Kanji theo ID
   * @param {number|string} id
   */
  getById: async (id) => {
    const res = await http.get(`/kanji/${id}`);
    return res.data;
  },

  /**
   * Tạo mới Kanji
   * @param {Object} data - { kanji, onyomi, kunyomi, meanings, mnemonic, jlpt }
   */
  create: async (data) => {
    const res = await http.post("/kanji", data);
    return res.data;
  },

  /**
   * Cập nhật Kanji
   * @param {number|string} id
   * @param {Object} data
   */
  update: async (id, data) => {
    const res = await http.put(`/kanji/${id}`, data);
    return res.data;
  },

  /**
   * Xóa Kanji
   * @param {number|string} id
   */
  delete: async (id) => {
    const res = await http.delete(`/kanji/${id}`);
    return res.data;
  },
};
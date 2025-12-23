import http from "../http"; 

export const KanjiApi = {
  // ... các hàm cũ giữ nguyên (getAll, getById, create, update, delete)

  getAll: async (params) => {
    const res = await http.get("/kanji", { params });
    return res.data;
  },

  create: async (data) => {
    const res = await http.post("/kanji", data);
    return res.data;
  },

  update: async (id, data) => {
    const res = await http.put(`/kanji/${id}`, data);
    return res.data;
  },

  delete: async (id) => {
    const res = await http.delete(`/kanji/${id}`);
    return res.data;
  },

  // 🟢 THÊM HÀM NÀY ĐỂ IMPORT
  importBulk: async (data) => {
    // Gọi API: POST /kanji/import
    const res = await http.post("/kanji/import", data);
    return res.data;
  }
};
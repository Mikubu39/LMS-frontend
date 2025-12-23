// src/services/api/vocabularyApi.jsx
import http from "../http"; 

export const VocabularyApi = {
  getAll: async (params) => {
    const res = await http.get("/vocabulary", { params });
    return res.data;
  },

  getById: async (id) => {
    const res = await http.get(`/vocabulary/${id}`);
    return res.data;
  },

  create: async (data) => {
    const res = await http.post("/vocabulary", data);
    return res.data;
  },

  update: async (id, data) => {
    const res = await http.put(`/vocabulary/${id}`, data);
    return res.data;
  },

  delete: async (id) => {
    const res = await http.delete(`/vocabulary/${id}`);
    return res.data;
  },

  // 🟢 MỚI: Hàm Import hàng loạt
  // Endpoint: POST /vocabulary/import/:topicId
  importBulk: async (topicId, data) => {
    const res = await http.post(`/vocabulary/import/${topicId}`, data);
    return res.data;
  }
};
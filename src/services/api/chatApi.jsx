// src/services/api/chatApi.jsx
import http from "@/services/http";

export const ChatApi = {
  // Lấy danh sách người dùng (Giáo viên/Học sinh) để chat
  getUsers: async () => {
    const res = await http.get("/chat/users");
    return res.data;
  },

  // Tạo hoặc lấy phòng chat với 1 người cụ thể
  initConversation: async (targetUserId) => {
    const res = await http.post("/chat/init", { targetUserId });
    return res.data;
  }
};
// src/services/api/chatApi.jsx
import http from "@/services/http";

export const ChatApi = {
  // Lấy danh sách Sidebar (Dành cho Giáo viên)
  getSidebar: async () => {
    const res = await http.get("/chat/sidebar");
    return res.data;
  },

  // 👇 API MỚI (Dành cho Học sinh): Tự động kết nối với GV phụ trách
  connectSupport: async () => {
    const res = await http.post("/chat/support");
    return res.data;
  },

  // Lấy chi tiết tin nhắn của 1 hội thoại (Khi bấm vào sidebar)
  initConversation: async (targetUserId) => {
    const res = await http.post("/chat/init", { targetUserId });
    return res.data;
  },
  
  markRead: async (conversationId) => {
    await http.post("/chat/read", { conversationId });
  },
  
  getUnreadCount: async () => {
    const res = await http.get("/chat/unread");
    return res.data; // Trả về { count: 5 }
  },
};
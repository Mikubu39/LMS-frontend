// src/services/api/aiChatApi.jsx
import http from "@/services/http";

export const AiChatService = {
  
  /**
   * Bắt đầu phiên hội thoại mới
   * @param {string} userId - UUID của user
   * @param {string} topic 
   */
  startSession: async (userId, topic) => {
    const { data } = await http.post("/ai-chat/start", { userId, topic });
    return data;
  },

  /**
   * Gửi tin nhắn và nhận phản hồi
   */
  sendMessage: async (sessionId, message) => {
    const { data } = await http.post("/ai-chat/talk", { sessionId, message });
    return data;
  },
  
  /**
   * [SỬA] Lấy danh sách các phiên chat cũ của user
   * @param {string} userId - UUID của user
   */
  getHistory: async (userId) => {
    // Truyền userId lên query params để Backend lọc
    const { data } = await http.get(`/ai-chat/history?userId=${userId}`);
    return data;
  },

  /**
   * Lấy chi tiết nội dung tin nhắn của 1 session
   */
  getSessionDetail: async (sessionId) => {
    const { data } = await http.get(`/ai-chat/${sessionId}`);
    return data; 
  },

  getAudioUrl: (text, lang = 'ja') => {
    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
    return `${baseUrl}/ai-chat/tts?text=${encodeURIComponent(text)}&lang=${lang}`;
  }
};
// src/components/ChatWidget.jsx
import { useEffect, useState, useRef } from 'react';
import { Avatar, Input, Button, Badge, Skeleton } from 'antd';
import { 
  SendOutlined, 
  UserOutlined, 
  SearchOutlined, 
  CloseOutlined, 
  QuestionCircleOutlined 
} from '@ant-design/icons';
import io from 'socket.io-client';
import { ChatApi } from '@/services/api/chatApi';
import "@/css/messenger.css"; 

const socket = io('http://localhost:3000'); 

export default function ChatWidget({ open, onClose, currentUser }) {
  // --- STATE CHUNG ---
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef(null);
  
  // --- STATE CHO GIÁO VIÊN (Messenger Mode) ---
  const [contacts, setContacts] = useState([]); 
  const [activeConv, setActiveConv] = useState(null); 
  // activeConv có thể là object Conversation (Support) hoặc Sidebar Item (Teacher)

  // Kiểm tra Role
  // Lưu ý: Đảm bảo logic check role khớp với cách lưu trong localStorage của bạn
  const isStudent = currentUser?.roles?.includes('student') || currentUser?.role === 'student';

  // ========================================================================
  // 1. KHỞI TẠO DỮ LIỆU KHI MỞ WIDGET
  // ========================================================================
  useEffect(() => {
    if (open && currentUser) {
        if (isStudent) {
            initStudentChat();
        } else {
            initTeacherChat();
        }
    }
  }, [open, currentUser]);

  // 👉 Mode Học sinh: Tự động gọi API Support
  const initStudentChat = async () => {
      try {
          const conversation = await ChatApi.connectSupport();
          // Backend trả về conversation entity (có field .id)
          setActiveConv(conversation); 
          setMessages(conversation.messages || []);
          
          // Socket Join
          socket.emit('joinRoom', conversation.id);
          setTimeout(scrollToBottom, 200);
      } catch (error) {
          console.error("Lỗi kết nối Support", error);
      }
  };

  // 👉 Mode Giáo viên: Tải danh sách Sidebar
  const initTeacherChat = async () => {
      try {
          const data = await ChatApi.getSidebar();
          setContacts(data);
      } catch (error) {
          console.error("Lỗi tải sidebar", error);
      }
  };

  const scrollToBottom = () => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // ========================================================================
  // 2. XỬ LÝ SOCKET REAL-TIME
  // ========================================================================
  useEffect(() => {
    socket.on('receiveMessage', (newMsg) => {
      const convId = newMsg.conversation.id;
      const currentActiveId = activeConv?.id || activeConv?.conversation_id;

      // A. CẬP NHẬT KHUNG CHAT (Nếu đang mở đúng hội thoại đó)
      if (currentActiveId === convId) {
        setMessages((prev) => [...prev, newMsg]);
        
        // Đánh dấu đã đọc (nếu tin nhắn không phải của mình)
        if (newMsg.sender.user_id !== currentUser.user_id) {
             ChatApi.markRead(convId);
        }
        setTimeout(scrollToBottom, 100);
      }

      // B. CẬP NHẬT SIDEBAR (Chỉ dành cho Giáo viên)
      if (!isStudent) {
         updateTeacherSidebar(newMsg, currentActiveId);
      }
    });

    return () => { socket.off('receiveMessage'); };
  }, [activeConv, currentUser, isStudent]);

  // Helper: Update Sidebar khi có tin nhắn mới
  const updateTeacherSidebar = (newMsg, currentActiveId) => {
      setContacts((prev) => {
        const convId = newMsg.conversation.id;
        const existingIndex = prev.findIndex(c => c.conversation_id === convId);

        if (existingIndex > -1) {
            // Cập nhật item cũ
            const oldItem = prev[existingIndex];
            const updatedItem = {
                ...oldItem,
                last_msg: newMsg.content,
                last_time: new Date(),
                // Tăng unread nếu không đang mở hội thoại này VÀ người gửi không phải mình
                unread: (newMsg.sender.user_id !== currentUser.user_id && currentActiveId !== convId) 
                        ? (oldItem.unread || 0) + 1 : 0
            };
            // Xóa cũ, thêm mới vào đầu
            const newList = [...prev];
            newList.splice(existingIndex, 1);
            return [updatedItem, ...newList];
        } else {
            // Nếu hội thoại chưa có trong list (Học sinh mới chat lần đầu) -> Reload sidebar
            initTeacherChat(); 
            return prev;
        }
      });
  }

  // ========================================================================
  // 3. CÁC HÀM XỬ LÝ SỰ KIỆN
  // ========================================================================
  
  // Gửi tin nhắn
  const handleSend = () => {
    if (!inputValue.trim() || !activeConv || !currentUser) return;
    
    // Normalize ID: Student dùng .id, Teacher sidebar dùng .conversation_id
    const convId = activeConv.id || activeConv.conversation_id;

    socket.emit('sendMessage', {
      conversationId: convId,
      senderId: currentUser.user_id,
      content: inputValue
    });
    setInputValue("");
  };

  // Giáo viên chọn 1 học sinh từ sidebar
  const handleTeacherSelectContact = async (contact) => {
      // Reset unread UI
      setContacts(prev => prev.map(c => c.conversation_id === contact.conversation_id ? { ...c, unread: 0 } : c));
      
      // Mark read DB
      if (contact.unread > 0) ChatApi.markRead(contact.conversation_id);

      setActiveConv(contact);
      setMessages([]); 

      // Load full messages
      const conversation = await ChatApi.initConversation(contact.partner_id);
      setMessages(conversation.messages || []);
      
      // Join room
      socket.emit('joinRoom', conversation.id);
      setTimeout(scrollToBottom, 200);
  };

  if (!open) return null;

  return (
    <div className="messenger-overlay">
      
      {/* === CỘT TRÁI (CHỈ HIỆN VỚI GIÁO VIÊN) === */}
      {!isStudent && (
          <div className="messenger-sidebar">
              <div className="messenger-sidebar-header">
                 <div className="messenger-title">Hộp thư hỗ trợ</div>
                 <Button shape="circle" icon={<CloseOutlined />} onClick={onClose} />
              </div>
              
              <div className="messenger-search">
                <Input prefix={<SearchOutlined />} placeholder="Tìm kiếm học viên..." style={{borderRadius: 20}} />
              </div>

              <div className="contact-list">
                  {contacts.length === 0 && <div style={{padding: 20, textAlign: 'center', color: '#999'}}>Chưa có tin nhắn nào</div>}
                  
                  {contacts.map(c => (
                      <div 
                          key={c.conversation_id} 
                          className={`contact-item ${activeConv?.conversation_id === c.conversation_id ? 'active' : ''}`}
                          onClick={() => handleTeacherSelectContact(c)}
                      >
                          <Badge count={c.unread} offset={[-5, 5]} color="#ff4d4f">
                              <Avatar size={50} icon={<UserOutlined />} src={c.avatar} />
                          </Badge>
                          <div className="contact-info">
                              <div className="contact-name">{c.full_name}</div>
                              <div className={`contact-preview ${c.unread > 0 ? 'unread' : ''}`}>
                                  {c.unread > 0 ? <b>{c.unread} tin nhắn mới</b> : (c.last_msg || "...")}
                              </div>
                          </div>
                      </div>
                  ))}
              </div>
          </div>
      )}

      {/* === CỘT PHẢI (KHUNG CHAT) === */}
      <div 
        className="messenger-chat-window" 
        style={isStudent ? { width: '100%', height: '100%' } : {}}
      >
          
          {/* Header */}
          <div className="chat-header">
              {isStudent ? (
                  // HEADER HỌC SINH
                  <>
                    <Avatar 
                        style={{ backgroundColor: '#1890ff', verticalAlign: 'middle' }} 
                        size="large" 
                        icon={<QuestionCircleOutlined />} 
                    />
                    <div style={{marginLeft: 12}}>
                        <div className="chat-user-name" style={{fontSize: 18}}>Hỗ trợ học tập</div>
                        <div style={{fontSize: 12, color: '#888'}}>Kết nối với giảng viên phụ trách</div>
                    </div>
                    <div style={{marginLeft: 'auto'}}>
                        <Button type="text" icon={<CloseOutlined style={{fontSize: 20}} />} onClick={onClose} />
                    </div>
                  </>
              ) : (
                  // HEADER GIÁO VIÊN
                  activeConv ? (
                    <>
                        <Avatar src={activeConv.avatar} icon={<UserOutlined />} size="large" />
                        <div style={{marginLeft: 12}}>
                            <div className="chat-user-name">{activeConv.full_name}</div>
                            <div style={{fontSize: 12, color: '#1890ff'}}>Học viên</div>
                        </div>
                    </>
                  ) : (
                    <div className="chat-user-name">Chọn một cuộc hội thoại</div>
                  )
              )}
          </div>

          {/* Messages List */}
          <div className="chat-messages" style={{backgroundColor: isStudent ? '#f9f9f9' : '#fff'}}>
              {(!activeConv && !isStudent) ? (
                  <div className="empty-chat">
                      <img src="https://gw.alipayobjects.com/zos/rmsportal/wOjLzTSmcRzUqQwlAOHK.svg" alt="chat" width={120} style={{opacity: 0.5}} />
                      <h3 style={{marginTop: 20, color: '#666'}}>Chọn học viên để bắt đầu hỗ trợ</h3>
                  </div>
              ) : (
                  <>
                    {messages.length === 0 && isStudent && (
                        <div style={{textAlign: 'center', padding: 20, color: '#999'}}>
                            <p>Chào bạn, giảng viên phụ trách sẽ giải đáp thắc mắc của bạn tại đây.</p>
                        </div>
                    )}

                    {messages.map((msg, index) => {
                        const isMine = msg.sender.user_id === currentUser.user_id;
                        return (
                            <div key={msg.id || index} className={`message-row ${isMine ? 'mine' : ''}`}>
                                {/* Avatar người đối diện */}
                                {!isMine && (
                                    isStudent 
                                    ? <Avatar size={28} icon={<QuestionCircleOutlined />} style={{backgroundColor: '#1890ff', marginRight: 8}} />
                                    : <Avatar size={28} src={activeConv?.avatar} style={{marginRight: 8}} />
                                )}
                                
                                <div className={`message-bubble ${isMine ? 'mine' : 'theirs'}`}>
                                    {msg.content}
                                </div>
                            </div>
                        )
                    })}
                    <div ref={messagesEndRef} />
                  </>
              )}
          </div>

          {/* Input Area */}
          {(activeConv || isStudent) && (
              <div className="chat-input-area">
                  <Input 
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onPressEnter={handleSend}
                      placeholder={isStudent ? "Nhập câu hỏi cần hỗ trợ..." : "Nhập tin nhắn..."}
                      style={{ borderRadius: 20, padding: '8px 15px', background: '#f5f5f5', border: 'none' }}
                  />
                  <Button 
                    type="primary" 
                    shape="circle" 
                    icon={<SendOutlined />} 
                    onClick={handleSend} 
                    style={{marginLeft: 10}}
                  />
              </div>
          )}
      </div>
    </div>
  );
}
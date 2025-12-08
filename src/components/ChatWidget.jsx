// src/components/ChatWidget.jsx
import { useEffect, useState, useRef } from 'react';
import { Drawer, List, Avatar, Input, Button, Badge, Empty } from 'antd';
import { SendOutlined, UserOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import io from 'socket.io-client';
import { ChatApi } from '@/services/api/chatApi';

// Khởi tạo Socket (Chỉ 1 lần)
// Lưu ý: Thay URL bằng backend của bạn
const socket = io('http://localhost:3000'); 

export default function ChatWidget({ open, onClose, currentUser }) {
  const [users, setUsers] = useState([]); 
  const [activeConv, setActiveConv] = useState(null); // Phòng chat đang mở
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef(null);

  // 1. Load danh sách user khi mở Widget
  useEffect(() => {
    if (open) {
      fetchUsers();
    }
  }, [open]);

  const fetchUsers = async () => {
    try {
      // Backend sẽ trả về list user (nếu mình là gv thì trả về list hs)
      const data = await ChatApi.getUsers(); 
      setUsers(data);
    } catch (error) {
      console.error("Lỗi tải users chat", error);
    }
  };

  // 2. Khi chọn 1 người -> Vào phòng chat
  const handleUserClick = async (targetUser) => {
    try {
      // Gọi API lấy thông tin phòng chat + tin nhắn cũ
      const conversation = await ChatApi.initConversation(targetUser.id);
      
      setActiveConv({ ...conversation, targetUser }); // Lưu thêm info người kia để hiển thị tên
      setMessages(conversation.messages || []);
      
      // Socket Join Room
      socket.emit('joinRoom', conversation.id);
    } catch (error) {
      console.error("Lỗi init chat", error);
    }
  };

  // 3. Lắng nghe tin nhắn mới
  useEffect(() => {
    socket.on('receiveMessage', (newMsg) => {
      // Chỉ push vào mảng nếu tin nhắn đó thuộc về cuộc hội thoại đang mở
      if (activeConv && newMsg.conversation.id === activeConv.id) {
        setMessages((prev) => [...prev, newMsg]);
      }
    });

    return () => {
      socket.off('receiveMessage');
    };
  }, [activeConv]);

  // 4. Auto scroll xuống dưới cùng
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 5. Gửi tin nhắn
  const handleSend = () => {
    if (!inputValue.trim() || !activeConv) return;

    socket.emit('sendMessage', {
      conversationId: activeConv.id,
      senderId: currentUser.id, // ID của mình
      content: inputValue
    });
    setInputValue("");
  };

  return (
    <Drawer
      title={activeConv ? `Chat với ${activeConv.targetUser.full_name || activeConv.targetUser.username}` : "Tin nhắn"}
      placement="right"
      onClose={() => { setActiveConv(null); onClose(); }}
      open={open}
      width={450}
      styles={{ body: { padding: 0 } }}
    >
      {!activeConv ? (
        /* --- MÀN HÌNH 1: DANH SÁCH NGƯỜI DÙNG --- */
        <List
          dataSource={users}
          renderItem={(user) => (
            <List.Item 
                onClick={() => handleUserClick(user)} 
                className="chat-user-item"
                style={{ cursor: 'pointer', padding: '15px 20px', borderBottom: '1px solid #f0f0f0' }}
            >
              <List.Item.Meta
                avatar={<Avatar size="large" icon={<UserOutlined />} src={user.avatar} />}
                title={<span style={{fontWeight: 600}}>{user.full_name || user.username}</span>}
                description={<Badge status={user.role === 'TEACHER' ? 'success' : 'processing'} text={user.role} />}
              />
            </List.Item>
          )}
        />
      ) : (
        /* --- MÀN HÌNH 2: KHUNG CHAT --- */
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          {/* Header phụ */}
          <div style={{ padding: '10px', borderBottom: '1px solid #eee', background: '#fafafa' }}>
            <Button type="text" icon={<ArrowLeftOutlined />} onClick={() => setActiveConv(null)}>
              Quay lại
            </Button>
          </div>

          {/* List tin nhắn */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '15px', background: '#fff' }}>
            {messages.length === 0 && <Empty description="Chưa có tin nhắn nào" />}
            
            {messages.map((msg) => {
              const isMine = msg.sender.id === currentUser.id;
              return (
                <div key={msg.id} style={{ 
                    display: 'flex', 
                    justifyContent: isMine ? 'flex-end' : 'flex-start', 
                    marginBottom: '10px' 
                }}>
                  {!isMine && <Avatar size="small" icon={<UserOutlined />} style={{marginRight: 8}} />}
                  <div style={{
                    background: isMine ? '#1890ff' : '#f0f2f5',
                    color: isMine ? '#fff' : '#000',
                    padding: '8px 12px',
                    borderRadius: '15px',
                    maxWidth: '70%',
                    wordWrap: 'break-word'
                  }}>
                    {msg.content}
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div style={{ padding: '15px', borderTop: '1px solid #eee', display: 'flex', gap: '10px' }}>
            <Input 
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onPressEnter={handleSend}
              placeholder="Nhập tin nhắn..."
              style={{ borderRadius: '20px' }}
            />
            <Button type="primary" shape="circle" icon={<SendOutlined />} onClick={handleSend} />
          </div>
        </div>
      )}
    </Drawer>
  );
}
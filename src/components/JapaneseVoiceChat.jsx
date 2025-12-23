// src/components/JapaneseVoiceChat.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { selectUser } from '../redux/authSlice'; 
import { AiChatService } from '../services/api/aiChatApi';
import '../css/JapaneseVoiceChat.css';

// --- ICONS ---
const MicIcon = () => (<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>);
const StopIcon = () => (<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="6" y="6" width="12" height="12" rx="2" ry="2"/></svg>);
const PlusIcon = () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>);
const SpeakerIcon = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>);
const MenuIcon = () => (<svg width="24" height="24" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>);

const JapaneseVoiceChat = () => {
  const user = useSelector(selectUser);

  // --- STATE ---
  const [history, setHistory] = useState([]);
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [customTopic, setCustomTopic] = useState("");
  
  // UI State
  const [isListening, setIsListening] = useState(false);
  const [loading, setLoading] = useState(false);
  // Mặc định mở Sidebar trên Desktop (true)
  const [showSidebar, setShowSidebar] = useState(true);
  
  // Text đang nói dở (preview)
  const [transcriptText, setTranscriptText] = useState(""); 

  const recognitionRef = useRef(null);
  
  // Ref vào container tin nhắn để scroll cục bộ
  const chatContainerRef = useRef(null);

  // 1. Load History
  useEffect(() => {
    if (user && user.user_id) fetchHistory();
  }, [user]);

  // Handle Resize để tự động ẩn sidebar trên mobile nếu cần
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setShowSidebar(false);
      } else {
        setShowSidebar(true);
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize(); // Init check
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const fetchHistory = async () => {
    try {
      const data = await AiChatService.getHistory(user.user_id); 
      if(Array.isArray(data)) setHistory(data);
    } catch (error) {
      console.error("Failed to load history", error);
    }
  };

  // 2. Cấu hình Mic
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true; 
      recognitionRef.current.interimResults = true; 
      recognitionRef.current.lang = 'ja-JP';

      recognitionRef.current.onresult = (event) => {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
           if (event.results[i].isFinal) finalTranscript += event.results[i][0].transcript;
           else interimTranscript += event.results[i][0].transcript;
        }
        
        // Chỉ lấy chuỗi mới nhất để hiển thị preview
        let completeTranscript = "";
        for (let i = 0; i < event.results.length; ++i) {
           completeTranscript += event.results[i][0].transcript;
        }
        setTranscriptText(completeTranscript);
      };

      recognitionRef.current.onerror = (e) => {
        if(e.error !== 'no-speech') setIsListening(false);
      };
      recognitionRef.current.onend = () => setIsListening(false);
    }
  }, []);

  // 3. Xử lý Scroll thông minh
  // Mỗi khi tin nhắn thay đổi, cuộn xuống dưới
  useEffect(() => {
    scrollToBottom(true); // True = Smooth scroll cho tin nhắn mới
  }, [messages, transcriptText, loading]);

  // Hàm cuộn cục bộ (Không ảnh hưởng body)
  const scrollToBottom = (smooth = false) => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: smooth ? 'smooth' : 'auto'
      });
    }
  };

  // --- ACTIONS ---

  const handleCreateSession = async () => {
    if (!customTopic.trim()) return;
    if (!user || !user.user_id) return alert("Vui lòng đăng nhập!");

    setLoading(true);
    try {
      const data = await AiChatService.startSession(user.user_id, customTopic);
      const newSession = { id: data.id, topic: customTopic };
      setHistory(prev => [newSession, ...prev]);
      setCurrentSessionId(data.id);
      
      const welcomeMsg = { 
        role: 'assistant', 
        content: `初めまして。今日のテーマは「${customTopic}」です。`,
        vietnameseTranslation: `Rất vui được gặp. Chủ đề là "${customTopic}".`
      };
      setMessages([welcomeMsg]);
      playAudio(welcomeMsg.content, 'ja');
      setCustomTopic("");
      
      // Mobile: Tự đóng sidebar khi bắt đầu
      if (window.innerWidth < 768) setShowSidebar(false);
      
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectSession = async (session) => {
    if (session.id === currentSessionId) return;
    
    setLoading(true);
    setCurrentSessionId(session.id);
    
    // Mobile: Tự đóng sidebar khi chọn
    if (window.innerWidth < 768) setShowSidebar(false);

    setMessages([]); // Clear màn hình để tránh hiển thị tin cũ
    
    try {
      const detail = await AiChatService.getSessionDetail(session.id);
      setMessages(detail.messages || []);
      
      // QUAN TRỌNG: Khi load lịch sử cũ, cuộn xuống ngay lập tức (không smooth)
      setTimeout(() => scrollToBottom(false), 100);
      
    } catch (error) {
      console.error("Lỗi tải tin nhắn cũ");
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (text) => {
    if (!text || !currentSessionId) return;
    
    const userMsg = { role: 'user', content: text };
    setMessages(prev => [...prev, userMsg]);
    setTranscriptText(""); 
    setLoading(true);

    try {
      const aiData = await AiChatService.sendMessage(currentSessionId, text);
      setMessages(prev => [...prev, aiData]);
      playAudio(aiData.content, 'ja');
    } catch (error) {
      console.error("Send Error", error);
    } finally {
      setLoading(false);
    }
  };

  const playAudio = (text, lang) => {
    const url = AiChatService.getAudioUrl(text, lang);
    const audio = new Audio(url);
    audio.play().catch(e => console.error("Audio Blocked", e));
  };

  const toggleMic = () => {
    if (!recognitionRef.current) return alert("Trình duyệt không hỗ trợ");
    if (isListening) {
      recognitionRef.current.stop(); // Stop -> Gửi
      if (transcriptText.trim()) handleSendMessage(transcriptText);
    } else {
      setTranscriptText("");
      recognitionRef.current.start(); // Start -> Nghe
      setIsListening(true);
    }
  };

  // --- RENDER ---
  const renderEmptyState = () => (
    <div className="empty-state">
      <div style={{fontSize: '4rem', marginBottom: '20px'}}>🎙️</div>
      <h2 style={{color: '#1e293b'}}>Luyện nói tiếng Nhật cùng AI</h2>
      <p style={{color: '#64748b'}}>Chọn một chủ đề để bắt đầu hội thoại ngay</p>
      
      <div className="topic-input-wrapper">
        <input 
          className="input-topic"
          placeholder="Nhập chủ đề (VD: Du lịch, Mua sắm...)" 
          value={customTopic}
          onChange={e => setCustomTopic(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleCreateSession()}
        />
        <button className="btn-start" onClick={handleCreateSession} disabled={loading}>
          {loading ? '...' : 'Bắt đầu'}
        </button>
      </div>
    </div>
  );

  return (
    <div className="voice-chat-layout">
      {/* SIDEBAR */}
      <div className={`chat-sidebar ${showSidebar ? 'open' : ''}`}>
        <div className="sidebar-header">
          <button className="btn-new-chat" onClick={() => setCurrentSessionId(null)}>
            <PlusIcon /> Hội thoại mới
          </button>
        </div>
        <ul className="history-list">
          {history.map(session => (
            <li 
              key={session.id} 
              className={`history-item ${currentSessionId === session.id ? 'active' : ''}`}
              onClick={() => handleSelectSession(session)}
            >
              {session.topic || "Không có chủ đề"}
            </li>
          ))}
        </ul>
      </div>

      {/* OVERLAY MOBILE: Chỉ hiện khi màn hình nhỏ và sidebar đang mở */}
      {showSidebar && (
        <div className="sidebar-overlay d-md-none" onClick={() => setShowSidebar(false)} />
      )}

      {/* MAIN CHAT AREA */}
      <div className="chat-main">
        {/* Topbar */}
        <div className="chat-topbar">
          <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
             {/* SỬA: Logic Toggle Sidebar */}
             <button 
               className="btn-icon-text" 
               style={{fontSize:'1.5rem', color:'#333'}} 
               onClick={() => setShowSidebar(!showSidebar)}
             >
               <MenuIcon/>
             </button>
             <span className="chat-topic-title">
               {currentSessionId 
                 ? history.find(h => h.id === currentSessionId)?.topic 
                 : "Trang chủ"}
             </span>
          </div>
          <div className={`status-indicator ${isListening ? 'listening' : ''}`} style={{background: isListening ? '#dcfce7' : '#f1f5f9', color: isListening ? '#166534' : '#64748b', padding:'4px 12px', borderRadius:'20px', fontSize:'0.75rem', fontWeight:'600'}}>
            {isListening ? 'Đang nghe...' : 'Sẵn sàng'}
          </div>
        </div>

        {!currentSessionId ? renderEmptyState() : (
          <>
            {/* SỬA: Gắn ref vào container này để scroll */}
            <div className="messages-container" ref={chatContainerRef}>
              {messages.map((msg, idx) => (
                <div key={idx} className={`message-group ${msg.role === 'user' ? 'user' : 'ai'}`}>
                  <div className="msg-avatar">{msg.role === 'user' ? '🧑‍🎓' : '🤖'}</div>
                  <div className="msg-bubble">
                    <div>{msg.content}</div>
                    
                    {msg.role === 'assistant' && (
                      <div className="ai-meta">
                         <button className="btn-icon-text" onClick={() => playAudio(msg.content, 'ja')}>
                           <SpeakerIcon /> Nghe lại
                         </button>
                         {msg.correction && (
                           <div className="meta-correction">💡 {msg.correction}</div>
                         )}
                         {msg.vietnameseTranslation && (
                           <div className="meta-translation">{msg.vietnameseTranslation}</div>
                         )}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {isListening && transcriptText && (
                 <div className="message-group user" style={{opacity: 0.7}}>
                    <div className="msg-avatar">...</div>
                    <div className="msg-bubble" style={{border: '1px dashed #6366f1'}}>
                      {transcriptText} <span className="loading-dots"></span>
                    </div>
                 </div>
              )}

              {loading && <div style={{textAlign:'center', color:'#94a3b8', fontStyle:'italic', marginTop:'10px'}}>Sensei đang suy nghĩ...</div>}
              {/* Bỏ messagesEndRef ở đây vì ta dùng scrollToBottom trên container cha */}
            </div>

            <div className="chat-footer">
              <div className="mic-wrapper">
                <button 
                  className={`btn-mic ${isListening ? 'listening' : ''}`} 
                  onClick={toggleMic}
                  disabled={loading}
                >
                  {isListening ? <StopIcon /> : <MicIcon />}
                </button>
              </div>
              <div className="status-text">
                {isListening ? 'Nhấn để dừng và gửi' : 'Nhấn vào micro để nói'}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default JapaneseVoiceChat;
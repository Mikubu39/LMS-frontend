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
  // Lấy User từ Redux
  const user = useSelector(selectUser);

  // --- STATE ---
  const [history, setHistory] = useState([]);
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [customTopic, setCustomTopic] = useState("");
  
  // Mic & UI State
  const [isListening, setIsListening] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  
  // Text đang nói dở (chưa gửi)
  const [transcriptText, setTranscriptText] = useState(""); 

  const recognitionRef = useRef(null);
  const messagesEndRef = useRef(null);

  // 1. Load History khi có User
  useEffect(() => {
    if (user && user.user_id) {
      fetchHistory();
    }
  }, [user]);

  const fetchHistory = async () => {
    try {
      const data = await AiChatService.getHistory(user.user_id); 
      if(Array.isArray(data)) setHistory(data);
    } catch (error) {
      console.error("Failed to load history", error);
    }
  };

  // 2. Cấu hình Mic (Chế độ Continuous)
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      
      // Quan trọng: Giữ mic luôn bật, không tự ngắt khi ngưng nói
      recognitionRef.current.continuous = true; 
      // Hiển thị kết quả tạm thời
      recognitionRef.current.interimResults = true; 
      recognitionRef.current.lang = 'ja-JP';

      recognitionRef.current.onresult = (event) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }
        
        // Cập nhật text hiển thị realtime (ưu tiên final, nếu ko có thì dùng interim)
        // Lưu ý: Logic này để hiển thị preview, khi gửi ta sẽ lấy giá trị này
        const currentText = finalTranscript || interimTranscript;
        if (currentText) {
             setTranscriptText(prev => finalTranscript ? (prev + " " + finalTranscript) : finalTranscript || interimTranscript);
             // Logic trên hơi phức tạp để nối chuỗi, ta làm đơn giản hơn cho bản demo:
             // Chỉ lấy cái mới nhất mic nghe được (vì continuous = true nó sẽ cộng dồn)
             let completeTranscript = "";
             for (let i = 0; i < event.results.length; ++i) {
                completeTranscript += event.results[i][0].transcript;
             }
             setTranscriptText(completeTranscript);
        }
      };

      recognitionRef.current.onerror = (e) => {
        console.error("Mic Error:", e.error);
        if(e.error !== 'no-speech') setIsListening(false);
      };
      
      recognitionRef.current.onend = () => {
        // Mic tắt hẳn thì set state false
        setIsListening(false);
      };
    }
  }, [currentSessionId]);

  // 3. Auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, transcriptText, loading]);

  // --- ACTIONS ---

  const handleCreateSession = async () => {
    if (!customTopic.trim()) return;

    if (!user || !user.user_id) {
      alert("Vui lòng đăng nhập để sử dụng tính năng này!");
      return;
    }

    setLoading(true);
    try {
      const data = await AiChatService.startSession(user.user_id, customTopic);
      
      const newSession = { id: data.id, topic: customTopic, created_at: new Date() };
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
    } catch (error) {
      console.error(error);
      alert("Lỗi tạo phòng chat. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectSession = async (session) => {
    if (session.id === currentSessionId) return;
    setLoading(true);
    setCurrentSessionId(session.id);
    setShowSidebar(false);
    setMessages([]); // Clear cũ trước khi load mới
    try {
      const detail = await AiChatService.getSessionDetail(session.id);
      setMessages(detail.messages || []);
    } catch (error) {
      console.error("Lỗi tải tin nhắn cũ");
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (text) => {
    if (!text || !currentSessionId) return;
    
    // 1. UI Update ngay lập tức
    const userMsg = { role: 'user', content: text };
    setMessages(prev => [...prev, userMsg]);
    setTranscriptText(""); // Xóa text tạm
    setLoading(true);

    try {
      // 2. Gọi API
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

  // --- LOGIC MIC MỚI: MANUAL STOP ---
  const toggleMic = () => {
    if (!recognitionRef.current) return alert("Trình duyệt không hỗ trợ");

    if (isListening) {
      // Đang nghe -> Bấm dừng -> Gửi tin nhắn
      recognitionRef.current.stop();
      setIsListening(false);
      
      if (transcriptText.trim()) {
        handleSendMessage(transcriptText);
      }
    } else {
      // Đang tắt -> Bấm nói -> Reset text -> Bắt đầu
      setTranscriptText("");
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  // --- RENDER HELPERS ---
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
      {/* SIDEBAR - HISTORY */}
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
          {history.length === 0 && (
            <li style={{padding: '20px', textAlign: 'center', color: '#94a3b8', fontSize: '0.85rem'}}>
              {user ? "Chưa có lịch sử" : "Vui lòng đăng nhập"}
            </li>
          )}
        </ul>
      </div>

      {/* OVERLAY MOBILE */}
      {showSidebar && <div className="overlay" onClick={() => setShowSidebar(false)} style={{position:'absolute', inset:0, background:'rgba(0,0,0,0.5)', zIndex:40}}/>}

      {/* MAIN CHAT AREA */}
      <div className="chat-main">
        {/* Topbar */}
        <div className="chat-topbar">
          <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
             <button className="btn-icon-text" style={{fontSize:'1.5rem', color:'#333'}} onClick={() => setShowSidebar(true)}>
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
            <div className="messages-container">
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

              {/* [REAL-TIME PREVIEW] Bong bóng hiển thị text đang nói */}
              {isListening && transcriptText && (
                 <div className="message-group user" style={{opacity: 0.7}}>
                    <div className="msg-avatar">...</div>
                    <div className="msg-bubble" style={{border: '1px dashed #6366f1'}}>
                      {transcriptText} <span className="loading-dots"></span>
                    </div>
                 </div>
              )}

              {loading && <div style={{textAlign:'center', color:'#94a3b8', fontStyle:'italic'}}>Sensei đang suy nghĩ...</div>}
              <div ref={messagesEndRef} />
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
                {isListening ? 'Nhấn để dừng và gửi' : 'Nhấn vào micro để nói (không tự ngắt)'}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default JapaneseVoiceChat;
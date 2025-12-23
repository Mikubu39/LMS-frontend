// src/pages/TopicDetailPage.jsx
import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Spin, message, Tooltip, Tag } from "antd";
import { LeftOutlined } from "@ant-design/icons";
import "../css/topic-detail.css";

import { VocabularyApi } from "../services/api/vocabularyApi";
import { TopicsApi } from "../services/api/topicsApi";

/* --- ICONS SVG --- */
const MicIcon = ({ color }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <path d="M12 15C13.66 15 15 13.66 15 12V6C15 4.34 13.66 3 12 3C10.34 3 9 4.34 9 6V12C9 13.66 10.34 15 12 15Z" stroke={color || "currentColor"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M19 10V12C19 15.87 15.87 19 12 19C8.13 19 5 15.87 5 12V10" stroke={color || "currentColor"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M12 19V22" stroke={color || "currentColor"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const SpeakerIcon = ({ color }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <path d="M11 5L6 9H2V15H6L11 19V5Z" stroke={color || "currentColor"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M19.07 4.93C20.98 6.84 20.98 9.95 19.07 11.86" stroke={color || "currentColor"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M15.54 8.46C15.93 8.85 15.93 9.49 15.54 9.88" stroke={color || "currentColor"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export default function TopicDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  // Data State
  const [topic, setTopic] = useState(null);
  const [vocabList, setVocabList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Learning State
  const [selectedVocab, setSelectedVocab] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Recording State
  const [isRecording, setIsRecording] = useState(false);
  const [feedback, setFeedback] = useState(null); // Kết quả chấm điểm: { type: 'success' | 'error', text: '...' }
  
  // Ref để lưu trữ đối tượng Recognition (tránh tạo lại nhiều lần)
  const recognitionRef = useRef(null);

  // --- 1. INITIAL LOAD ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [topicRes, vocabRes] = await Promise.all([
            TopicsApi.getById(id),
            VocabularyApi.getAll({ topic_id: id, limit: 100 })
        ]);
        setTopic(topicRes);
        setVocabList(vocabRes.data);
      } catch (error) {
        message.error("Không tìm thấy chủ đề hoặc lỗi kết nối");
        navigate("/topics");
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchData();
  }, [id, navigate]);

  // --- 2. HÀM XỬ LÝ ÂM THANH (QUAN TRỌNG) ---

  // A. Text-to-Speech (Đọc từ vựng)
  const handleSpeak = (text) => {
    if (!window.speechSynthesis) {
        message.error("Trình duyệt không hỗ trợ phát âm!");
        return;
    }
    // Dừng âm thanh đang đọc dở
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "ja-JP"; // Giọng Nhật
    utterance.rate = 0.8;     // Tốc độ chậm vừa phải
    window.speechSynthesis.speak(utterance);
  };

  // B. Speech-to-Text (Thu âm & Kiểm tra phát âm)
  const handleRecord = () => {
    // Kiểm tra trình duyệt có hỗ trợ không
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      message.error("Trình duyệt này không hỗ trợ thu âm (Dùng Chrome/Edge nhé!)");
      return;
    }

    if (isRecording) {
      // Nếu đang ghi âm thì bấm lần nữa để dừng
      recognitionRef.current?.stop();
      setIsRecording(false);
      return;
    }

    // Bắt đầu ghi âm
    setFeedback(null); // Reset kết quả cũ
    setIsRecording(true);

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    
    recognition.lang = "ja-JP"; // Ngôn ngữ lắng nghe: Tiếng Nhật
    recognition.continuous = false; // Ngắt ngay khi nói xong câu
    recognition.interimResults = false;

    recognition.onstart = () => {
      // Bắt đầu thu...
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript; // Lấy văn bản máy nghe được
      console.log("User said:", transcript);
      
      // LOGIC CHẤM ĐIỂM
      checkPronunciation(transcript);
    };

    recognition.onerror = (event) => {
      console.error("Lỗi thu âm:", event.error);
      setIsRecording(false);
      setFeedback({ type: 'error', text: "Không nghe rõ, hãy thử lại!" });
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognition.start();
  };

  // C. Hàm so sánh kết quả
  const checkPronunciation = (userSpoke) => {
    if (!selectedVocab) return;

    // Chuẩn hóa chuỗi (bỏ dấu cách thừa, đưa về chữ thường)
    const targetWord = selectedVocab.word.trim(); // Ví dụ: 日本
    const targetReading = selectedVocab.reading.trim(); // Ví dụ: にほん
    const userSpokeClean = userSpoke.trim();

    // So sánh: Nếu người dùng nói đúng Kanji HOẶC nói đúng Hiragana
    // (Vì Google Speech đôi khi trả về Kanji, đôi khi trả về Hiragana)
    if (userSpokeClean === targetWord || userSpokeClean === targetReading) {
      setFeedback({ 
        type: 'success', 
        text: `Tuyệt vời! Bạn nói: "${userSpokeClean}" (Chính xác)` 
      });
      // Phát tiếng 'ding' chúc mừng (tuỳ chọn)
    } else {
      setFeedback({ 
        type: 'error', 
        text: `Sai rồi. Bạn nói: "${userSpokeClean}". Hãy thử lại!` 
      });
    }
  };


  // --- 3. UI HANDLERS ---
  const handleCardClick = (vocab) => {
    setSelectedVocab(vocab);
    setFeedback(null); // Reset feedback cũ
    setIsModalOpen(true);
    handleSpeak(vocab.word); // Tự động đọc khi mở
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedVocab(null);
    window.speechSynthesis.cancel(); // Tắt tiếng nếu đang đọc
    if (isRecording) recognitionRef.current?.stop();
  };

  if (loading) return <div className="loading-container"><Spin size="large" tip="Đang tải bài học..." /></div>;

  return (
    <div className="detail-container">
      {/* HEADER */}
      <header className="detail-header">
        <button className="back-btn" onClick={() => navigate("/topics")}>
          <LeftOutlined /> Quay lại
        </button>
        <div className="header-info">
            <h1>{topic?.name}</h1>
            <span className="subtitle">{vocabList.length} từ vựng • {topic?.level}</span>
        </div>
      </header>

      {/* GRID TỪ VỰNG */}
      <div className="vocab-grid">
        {vocabList.map((vocab) => (
          <div 
            key={vocab.id} 
            className="vocab-card"
            onClick={() => handleCardClick(vocab)}
          >
            <div className="card-main">{vocab.word}</div>
            <div className="card-sub">{vocab.reading}</div>
            <div className="card-meaning">{vocab.meaning}</div>
          </div>
        ))}
      </div>

      {/* MODAL FLASHCARD */}
      {isModalOpen && selectedVocab && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={closeModal}>✕</button>
            
            <div className="flashcard-display">
              <div className="main-word">{selectedVocab.word}</div>
              
              <div className="action-row">
                 {/* NÚT LOA */}
                 <button className="icon-btn" onClick={() => handleSpeak(selectedVocab.word)}>
                    <SpeakerIcon />
                 </button>
                 
                 {/* NÚT MIC */}
                 <button 
                    className={`icon-btn ${isRecording ? 'recording' : ''}`} 
                    onClick={handleRecord}
                 >
                    <MicIcon />
                 </button>
              </div>

              {/* KHU VỰC HIỂN THỊ KẾT QUẢ CHECK MIC */}
              {isRecording && (
                <div className="feedback-box listening">
                    Đang nghe... 🎤
                </div>
              )}

              {feedback && !isRecording && (
                <div className={`feedback-box ${feedback.type}`}>
                    {feedback.text}
                </div>
              )}

              <div className="info-section">
                 <div className="reading-text">{selectedVocab.reading}</div>
                 <div className="meaning-text">{selectedVocab.meaning}</div>
              </div>

              {/* PHÂN TÍCH KANJI */}
              {selectedVocab.kanjiList && selectedVocab.kanjiList.length > 0 && (
                  <div className="kanji-breakdown-section">
                      <div className="section-title">Phân tích Hán tự:</div>
                      <div className="kanji-chips">
                          {selectedVocab.kanjiList.map(k => (
                              <Tooltip key={k.id} title={`${k.meanings?.join(", ")} (Âm On: ${k.onyomi})`}>
                                  <Tag color="purple" style={{ fontSize: 16, padding: '4px 10px', cursor: 'pointer' }}>
                                      {k.kanji} - {k.meanings?.[0]}
                                  </Tag>
                              </Tooltip>
                          ))}
                      </div>
                  </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
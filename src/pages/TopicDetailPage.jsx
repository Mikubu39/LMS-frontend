// src/pages/TopicDetailPage.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "../css/topic-detail.css";

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
    <path d="M15 8.5C15.83 9.33 15.83 10.67 15 11.5" stroke={color || "currentColor"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M17.5 6C19.17 7.67 19.17 10.33 17.5 12" stroke={color || "currentColor"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M2 13.86V10.14C2 9.59 2.45 9.14 3 9.14H6.29C6.56 9.14 6.81 9.04 7 8.85L10.3 5.55C10.86 4.99 11.79 5.39 11.79 6.18V17.82C11.79 18.61 10.86 19.01 10.3 18.45L7 15.15C6.81 14.96 6.56 14.86 6.29 14.86H3C2.45 14.86 2 14.41 2 13.86Z" stroke={color || "currentColor"} strokeWidth="1.5"/>
  </svg>
);

/* --- MOCK DATA --- */
const MOCK_DB = {
  common: {
    title: "Thông dụng",
    vocabs: [
      { id: 1, kanji: "時間", hiragana: "じかん", meaning: "Thời gian" },
      { id: 2, kanji: "友達", hiragana: "ともだち", meaning: "Bạn bè" },
      { id: 3, kanji: "学校", hiragana: "がっこう", meaning: "Trường học" },
      { id: 4, kanji: "水", hiragana: "みず", meaning: "Nước" },
      { id: 5, kanji: "本", hiragana: "ほん", meaning: "Quyển sách" },
      { id: 6, kanji: "先生", hiragana: "せんせい", meaning: "Giáo viên" },
    ]
  },
};

/* --- COMPONENT --- */
export default function TopicDetailPage() {
  const { slug } = useParams();
  const [data, setData] = useState(null);
  
  const [selectedVocab, setSelectedVocab] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [score, setScore] = useState(null);

  useEffect(() => {
    if (MOCK_DB[slug]) {
      setData(MOCK_DB[slug]);
    } else {
      setData(MOCK_DB['common']);
    }
  }, [slug]);

  const handleOpenModal = (vocab) => {
    setSelectedVocab(vocab);
    setScore(null);
    setIsRecording(false);
  };

  const handleCloseModal = (e) => {
    if (e.target.classList.contains("modal-overlay")) {
      setSelectedVocab(null);
    }
  };

  const handleSpeak = (text) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ja-JP';
      utterance.rate = 0.8;
      window.speechSynthesis.speak(utterance);
    } else {
      alert("Trình duyệt không hỗ trợ.");
    }
  };

  const handleRecord = () => {
    if (isRecording) return;
    setIsRecording(true);
    setScore(null);

    setTimeout(() => {
      setIsRecording(false);
      // Random điểm từ 0 - 100 để test đủ các trường hợp
      const randomScore = Math.floor(Math.random() * 101);
      setScore(randomScore);
    }, 2000);
  };

  // 🟢 Hàm xử lý phản hồi dựa trên điểm số
  const getFeedback = (s) => {
    if (s < 30) return { text: "Tệ", className: "bad" };
    if (s < 50) return { text: "Tàm tạm", className: "average" };
    if (s < 80) return { text: "Khá tốt", className: "good" };
    return { text: "Amazing good chóp em", className: "excellent" };
  };

  if (!data) return <div style={{padding: 40}}>Loading...</div>;

  // Tính toán feedback nếu đã có điểm
  const feedback = score !== null ? getFeedback(score) : null;

  return (
    <div className="topic-detail-container">
      <h2 className="topic-detail-title">Chủ đề “{data.title}”</h2>

      <div className="vocab-grid">
        {data.vocabs.map((vocab) => (
          <div key={vocab.id} className="vocab-card">
            <div className="vocab-header">
              <span className="vocab-label">Từ vựng:</span>
              <div className="vocab-actions">
                <button 
                  className="vocab-icon-btn" 
                  title="Ghi âm"
                  onClick={() => handleOpenModal(vocab)}
                >
                  <MicIcon color="#FF8A65" />
                </button>
                <button 
                  className="vocab-icon-btn" 
                  title="Nghe phát âm"
                  onClick={() => handleSpeak(vocab.kanji)}
                >
                  <SpeakerIcon color="#42A5F5" />
                </button>
              </div>
            </div>
            <div className="vocab-word">{vocab.kanji}</div>
            <div className="vocab-info-box">{vocab.hiragana}</div>
            <div className="vocab-info-box">{vocab.meaning}</div>
          </div>
        ))}
      </div>

      {selectedVocab && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content">
            <div className="modal-header">
              <div>
                <span className="modal-vocab-label">Từ vựng:</span>
                <div className="modal-kanji">{selectedVocab.kanji}</div>
              </div>
              <div className="modal-actions">
                <button 
                  className={`action-btn btn-mic ${isRecording ? 'recording' : ''}`}
                  onClick={handleRecord}
                  title="Bấm để thu âm"
                >
                  <MicIcon color={isRecording ? "#FFF" : "#FF8A65"} />
                </button>
                <button 
                  className="action-btn btn-speaker"
                  onClick={() => handleSpeak(selectedVocab.kanji)}
                  title="Nghe phát âm mẫu"
                >
                  <SpeakerIcon color="#42A5F5" />
                </button>
              </div>
            </div>

            <div className="modal-info-box">{selectedVocab.hiragana}</div>
            <div className="modal-info-box">{selectedVocab.meaning}</div>

            {isRecording && (
              <div className="score-result" style={{backgroundColor: '#f5f5f5', color: '#666'}}>
                Đang lắng nghe giọng nói của bạn...
              </div>
            )}
            
            {/* 🟢 Hiển thị kết quả chấm điểm */}
            {!isRecording && score !== null && feedback && (
              <div className={`score-result ${feedback.className}`}>
                Chính xác: {score}% - {feedback.text}
              </div>
            )}

          </div>
        </div>
      )}
    </div>
  );
}
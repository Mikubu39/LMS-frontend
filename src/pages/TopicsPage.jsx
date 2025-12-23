// src/pages/TopicsPage.jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Spin, Empty, Tag } from "antd"; // Dùng thêm Antd cho Loading/Empty đẹp
import "../css/topics.css"; 

// 🟢 IMPORT API
import { TopicsApi } from "../services/api/topicsApi";

/* --- CÁC ICON SVG (Giữ nguyên để trang trí) --- */
const BookIcon = () => (
  <svg className="topic-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
  </svg>
);

export default function TopicsPage() {
  const [loading, setLoading] = useState(false);
  const [topics, setTopics] = useState([]);

  useEffect(() => {
    const fetchTopics = async () => {
      setLoading(true);
      try {
        // Gọi API lấy danh sách Topic
        const res = await TopicsApi.getAll({ limit: 100 }); 
        setTopics(res.data);
      } catch (error) {
        console.error("Lỗi tải topics:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTopics();
  }, []);

  if (loading) return <div style={{ textAlign: "center", marginTop: 50 }}><Spin size="large" /></div>;

  return (
    <div className="topics-container">
      <header className="topics-header">
        <h1>Chủ đề từ vựng</h1>
        <p>Chọn một chủ đề để bắt đầu luyện tập</p>
      </header>

      {topics.length === 0 ? (
        <Empty description="Chưa có chủ đề nào" />
      ) : (
        <div className="topics-grid">
          {topics.map((topic) => (
            // ⚠️ Lưu ý: Đường dẫn giờ là /topic/:id (UUID)
           <Link to={`/topics/${topic.id}`} key={topic.id} className="topic-card">
              <div className="topic-icon">
                 {/* Vì DB chưa lưu icon, ta dùng icon mặc định */}
                 <BookIcon />
              </div>
              <div className="topic-info">
                <h3 className="topic-title">{topic.name}</h3>
                <div className="topic-meta">
                   <Tag color="blue">{topic.level}</Tag>
                   <span className="topic-count">{topic.vocabCount || 0} từ</span>
                </div>
              </div>
              <div className="topic-progress-bar">
                <div className="progress-fill" style={{ width: `0%` }}></div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
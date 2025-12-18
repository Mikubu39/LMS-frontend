// src/pages/TopicsPage.jsx
import React from "react";
import { Link } from "react-router-dom";
import "../css/topics.css"; // Nhớ import file CSS vừa tạo

/* --- CÁC ICON SVG (Vẽ lại theo hình mẫu) --- */

const NumberIcon = () => (
  <svg className="topic-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="8" cy="8" r="3" stroke="#4A85F6" />
    <path d="M8 7v2" stroke="#4A85F6"/>
    <circle cx="16" cy="10" r="3" stroke="#4A85F6" strokeOpacity="0.6"/>
    <circle cx="10" cy="18" r="3" stroke="#4A85F6" strokeOpacity="0.6"/>
    <path d="M16 9v2" stroke="#4A85F6" strokeOpacity="0.6"/>
  </svg>
);

const LoveIcon = () => (
  <svg className="topic-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" stroke="#4A85F6"/>
    <path d="M15 8l4-4m0 4l-4-4" stroke="#4A85F6"/> 
  </svg>
);

const FamilyIcon = () => (
  <svg className="topic-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="#4A85F6"/>
    <circle cx="9" cy="7" r="4" stroke="#4A85F6"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" stroke="#4A85F6"/>
    <path d="M16 3.13a4 4 0 0 1 0 7.75" stroke="#4A85F6"/>
  </svg>
);

const CommonIcon = () => (
  <svg className="topic-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke="#4A85F6"/>
    <line x1="16" y1="2" x2="16" y2="6" stroke="#4A85F6"/>
    <line x1="8" y1="2" x2="8" y2="6" stroke="#4A85F6"/>
    <line x1="3" y1="10" x2="21" y2="10" stroke="#4A85F6"/>
    <circle cx="15.5" cy="16.5" r="2.5" stroke="#4A85F6"/>
    <polyline points="15.5 15 15.5 16.5 16.5 16.5" stroke="#4A85F6"/>
  </svg>
);

/* --- DỮ LIỆU GIẢ LẬP --- */
const TOPICS_DATA = [
  { id: 1, title: "Số đếm", count: 0, icon: <NumberIcon />, slug: "numbers" },
  { id: 2, title: "Tình yêu", count: 0, icon: <LoveIcon />, slug: "love" },
  { id: 3, title: "Gia đình", count: 0, icon: <FamilyIcon />, slug: "family" },
  { id: 4, title: "Thông dụng", count: 6, icon: <CommonIcon />, slug: "common" },
];

/* --- MAIN COMPONENT --- */
export default function TopicsPage() {
  return (
    <div className="topics-container">
      <h2 className="topics-header">Tiếng Nhật theo chủ đề</h2>
      
      <div className="topics-grid">
        {TOPICS_DATA.map((topic) => (
          <Link to={`/topics/${topic.slug}`} key={topic.id} className="topic-card">
            <div className="topic-icon-box">
              {topic.icon}
            </div>
            
            <span className="topic-label">Chủ đề</span>
            <h3 className="topic-title">{topic.title}</h3>
            
            <span className="topic-count">{topic.count} từ vựng</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
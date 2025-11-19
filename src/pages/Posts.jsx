// src/pages/Posts.jsx
import { useEffect } from "react";
import BlogCard from "../components/BlogCard";
import "../css/posts.css";

// 9 bài viết để được 3 cột × 3 hàng
const MOCK_POSTS = Array.from({ length: 9 }).map((_, idx) => ({
  id: idx + 1,
  title: "Authentication & Authorization trong ReactJS",
  tag: "Front-End",
  excerpt:
    "Lorem ipsum dolor sit amet consectetur. Ornare neque accumsan metus nulla ultricies massa ultrices rhoncus...",
  readTime: "6 phút đọc",
  category: "ReactJS",
}));

export default function Posts() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="posts-page">
      {/* HERO CAM */}
      <section className="posts-hero">
        <div className="posts-hero-inner">
          <div className="posts-hero-breadcrumb">
            Trang chủ / <span>Bài viết</span>
          </div>
          <h1 className="posts-hero-title">Bài viết</h1>
        </div>
      </section>

      {/* SECTION LIST BÀI VIẾT */}
      <section className="posts-section">
        <div className="posts-container">
          {/* thanh tiêu đề + filter + sort */}
          <div className="posts-header-row">
            <div className="posts-header-left">
              <h2 className="posts-section-title">Tất cả bài viết</h2>
              <span className="posts-count-badge">128</span>
            </div>

            <div className="posts-header-right">
              <span className="posts-sort-label">Sắp xếp:</span>
              <select className="posts-sort-select" defaultValue="popular">
                <option value="popular">Phổ biến</option>
                <option value="newest">Mới nhất</option>
                <option value="oldest">Cũ nhất</option>
              </select>
            </div>
          </div>

          {/* GRID 3 CỘT */}
          <div className="posts-grid">
            {MOCK_POSTS.map((p) => (
              <BlogCard key={p.id} post={p} />
            ))}
          </div>

          {/* PHÂN TRANG */}
          <div className="posts-pagination">
            <button className="posts-page-btn" disabled>
              Trước
            </button>

            <div className="posts-page-numbers">
              <button className="posts-page-number posts-page-number--active">
                1
              </button>
              <button className="posts-page-number">2</button>
              <button className="posts-page-number">3</button>
              <span className="posts-page-dots">...</span>
              <button className="posts-page-number">8</button>
            </div>

            <button className="posts-page-btn">Sau</button>
          </div>
        </div>
      </section>
    </div>
  );
}

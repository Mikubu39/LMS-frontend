import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../css/post-detail.css"; 

import { PostApi } from "@/services/api/postApi";

/* ===== ICONS ===== */
const TimeIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
);
const BookIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>
);
const EyeIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
);

// Ảnh fallback
const fallbackImg = "https://placehold.co/600x400?text=No+Image";

export default function PostDetail() {
  const params = useParams(); // Lấy toàn bộ params object
  const navigate = useNavigate();

  // 👉 FALLBACK: Thử lấy id từ các tên phổ biến (id, postId, slug)
  const id = params.id || params.postId || params.slug;

  const [loading, setLoading] = useState(true);
  const [post, setPost] = useState(null);
  const [relatedPosts, setRelatedPosts] = useState([]);

  const formatDate = (isoString) => {
    if (!isoString) return "";
    return new Date(isoString).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  // 1. Fetch bài viết
  useEffect(() => {
    window.scrollTo(0, 0);

    const fetchPost = async () => {
      // LOG DEBUG QUAN TRỌNG: Xem params thực tế là gì
      console.log("--> [PostDetail] Full Params:", params);
      console.log("--> [PostDetail] Detected ID:", id);

      // SỬA LỖI: Nếu không có ID, tắt loading ngay và return
      if (!id) {
        console.error("Lỗi: Không tìm thấy ID trong URL! Hãy kiểm tra file App.jsx xem Route đã định nghĩa '/:id' chưa?");
        setLoading(false);
        return;
      }
      
      setLoading(true); 
      try {
        console.log("Đang gọi API lấy bài viết ID:", id);
        const data = await PostApi.getPostById(id);
        console.log("Dữ liệu trả về:", data);
        
        if (data) {
          setPost(data);
        } else {
          setPost(null); 
        }
      } catch (error) {
        console.error("Lỗi khi tải bài viết:", error);
        setPost(null);
      } finally {
        setLoading(false); // Luôn tắt loading dù thành công hay thất bại
      }
    };

    fetchPost();
  }, [id, params]); // Thêm params vào dependency

  // 2. Fetch bài liên quan
  useEffect(() => {
    if (!post || !post.category) return;
    
    const fetchRelated = async () => {
      try {
        const { posts } = await PostApi.getPosts({
          page: 1,
          limit: 4,
          search: post.category, 
        });
        setRelatedPosts(posts.filter((p) => p.id !== post.id).slice(0, 3));
      } catch (error) {
        console.error("Lỗi tải bài liên quan:", error);
      }
    };
    fetchRelated();
  }, [post]);

  // --- RENDER ---

  if (loading) {
    return (
      <div className="pd-loading" style={{ padding: "100px 0", textAlign: "center" }}>
        <div className="spinner" style={{ 
          display: "inline-block", 
          width: "40px", 
          height: "40px", 
          border: "4px solid #f3f3f3", 
          borderTop: "4px solid #3498db", 
          borderRadius: "50%", 
          animation: "spin 1s linear infinite" 
        }}></div>
        <p style={{ marginTop: "16px", color: "#666" }}>Đang tải nội dung...</p>
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="pd-not-found" style={{ padding: "100px 0", textAlign: "center" }}>
        <h2 style={{ fontSize: "24px", marginBottom: "16px" }}>Không tìm thấy bài viết</h2>
        <p style={{ color: "#666", marginBottom: "24px" }}>
          Có thể đường dẫn bị sai hoặc bài viết đã bị xóa.<br/>
          (Tham số URL nhận được: {JSON.stringify(params)})
        </p>
        <div style={{ marginBottom: "20px", color: "red", fontWeight: "bold" }}>
           {!id ? "⚠️ LỖI: Route chưa định nghĩa tham số :id" : ""}
        </div>
        <button 
          onClick={() => navigate("/")}
          style={{
            padding: "10px 20px",
            background: "#1890ff",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer"
          }}
        >
          Về trang chủ
        </button>
      </div>
    );
  }

  return (
    <div className="pd-page">
      <div className="pd-container">
        {/* Breadcrumb */}
        <nav className="pd-breadcrumb">
          <span onClick={() => navigate("/")}>Trang chủ</span>
          <span className="sep">/</span>
          <span className="cat">{post.category || "Chi tiết bài viết"}</span>
        </nav>

        <div className="pd-grid">
          {/* CỘT TRÁI */}
          <main className="pd-main">
            <header className="pd-header">
              <h1 className="pd-title">{post.title}</h1>
              
              <div className="pd-meta">
                <span className="pd-meta-item author">
                  Bởi <strong>{post.author || "Admin"}</strong>
                </span>
                <span className="dot">•</span>
                <span className="pd-meta-item">
                  <TimeIcon /> {formatDate(post.publishedAt)}
                </span>
                <span className="dot">•</span>
                <span className="pd-meta-item">
                  <BookIcon /> {post.readMins || 5} phút đọc
                </span>
                 <span className="dot">•</span>
                <span className="pd-meta-item">
                  <EyeIcon /> {post.views} lượt xem
                </span>
              </div>
            </header>

            {post.coverUrl && (
              <div className="pd-image-block">
                <img src={post.coverUrl} alt={post.title} />
              </div>
            )}

            {post.excerpt && (
              <div className="pd-excerpt" style={{
                fontSize: "18px",
                lineHeight: "1.6",
                fontStyle: "italic",
                color: "#555",
                marginBottom: "32px",
                borderLeft: "4px solid #1890ff",
                paddingLeft: "16px"
              }}>
                {post.excerpt}
              </div>
            )}

            <article 
              className="ck-content" 
              dangerouslySetInnerHTML={{ __html: post.content }} 
            />

            {post.tags && post.tags.length > 0 && (
              <div className="pd-tags" style={{ marginTop: "40px", paddingTop: "20px", borderTop: "1px solid #eee" }}>
                <span style={{ marginRight: "8px", fontWeight: "bold" }}>Tags:</span>
                {post.tags.map((tag, idx) => (
                  <span key={idx} className="pd-tag" style={{ marginRight: "8px" }}>
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </main>

          {/* CỘT PHẢI */}
          <aside className="pd-sidebar">
            <h3 className="pd-sidebar-title">Bài viết liên quan</h3>
            <div className="pd-sidebar-list">
              {relatedPosts.length === 0 && <p style={{ color: "#999" }}>Chưa có bài viết liên quan.</p>}
              
              {relatedPosts.map((p) => (
                <div key={p.id} className="pd-sidebar-card" onClick={() => navigate(`/posts/${p.id}`)}>
                  <div className="pd-sidebar-thumb">
                    <img src={p.coverUrl || fallbackImg} alt={p.title} />
                  </div>
                  <div className="pd-sidebar-content">
                    <h4 className="pd-sidebar-card-title">{p.title}</h4>
                    <div className="pd-sidebar-meta">
                      <span>{formatDate(p.publishedAt)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
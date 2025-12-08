import { useEffect, useState, useCallback } from "react";
import BlogCard from "../components/BlogCard";
import "../css/posts.css";

import { PostApi } from "@/services/api/postApi";

// Helper tính danh sách số trang để hiển thị
function getPageNumbers(current, totalPages) {
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  if (current <= 3) {
    return [1, 2, 3, "...", totalPages];
  }

  if (current >= totalPages - 2) {
    return [1, "...", totalPages - 2, totalPages - 1, totalPages];
  }

  return [1, "...", current - 1, current, current + 1, "...", totalPages];
}

export default function Posts() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);

  const [page, setPage] = useState(1);
  const [limit] = useState(9); // 3 cột × 3 hàng
  const [total, setTotal] = useState(0);

  const totalPages = Math.max(1, Math.ceil(total / limit) || 1);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Gọi API lấy posts
  const fetchPosts = useCallback(
    async (pageParam = 1) => {
      try {
        setLoading(true);
        const { posts: list, meta } = await PostApi.getPosts({
          page: pageParam,
          limit,
          search: "",
        });

        console.log("--> [Posts] Raw API Data:", list); // Debug xem API trả về gì

        // Map backend Post -> dữ liệu cho BlogCard
        const mapped = (list || []).map((p) => {
          // Xử lý ảnh fallback nếu coverUrl null/rỗng
          const displayImage = p.coverUrl || "https://placehold.co/600x400?text=No+Image";

          return {
            id: p.id,
            title: p.title,
            
            // 👉 QUAN TRỌNG: Map vào nhiều tên biến khác nhau để BlogCard chắc chắn nhận được
            coverUrl: displayImage, 
            image: displayImage,     // BlogCard thường dùng cái này
            thumbnail: displayImage, // Hoặc cái này
            
            tag: (p.tags && p.tags[0]) || p.category || "Khác",
            excerpt:
              p.excerpt ||
              (p.content
                ? p.content.replace(/<[^>]+>/g, "").slice(0, 120) + "..."
                : ""),
            readTime: p.readMins ? `${p.readMins} phút đọc` : "—",
            category: p.category || "",
            raw: p,
          };
        });

        setPosts(mapped);
        setTotal(meta?.total || mapped.length);
      } catch (err) {
        console.error("Lỗi load posts (public):", err);
      } finally {
        setLoading(false);
      }
    },
    [limit]
  );

  // load lần đầu & khi đổi page
  useEffect(() => {
    fetchPosts(page);
  }, [page, fetchPosts]);

  const handleChangePage = (nextPage) => {
    if (nextPage < 1 || nextPage > totalPages || nextPage === page) return;
    setPage(nextPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

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
              <span className="posts-count-badge">{total}</span>
            </div>

            <div className="posts-header-right">
              <span className="posts-sort-label">Sắp xếp:</span>
              {/* hiện tại sort chưa gọi backend, chỉ là UI */}
              <select className="posts-sort-select" defaultValue="popular">
                <option value="popular">Phổ biến</option>
                <option value="newest">Mới nhất</option>
                <option value="oldest">Cũ nhất</option>
              </select>
            </div>
          </div>

          {/* trạng thái loading */}
          {loading && (
            <div style={{ marginBottom: 16, color: "#6b7280" }}>
              Đang tải bài viết...
            </div>
          )}

          {/* GRID 3 CỘT */}
          <div className="posts-grid">
            {posts.map((p) => (
              <BlogCard key={p.id} post={p} />
            ))}

            {!loading && posts.length === 0 && (
              <div style={{ gridColumn: "1 / -1", textAlign: "center" }}>
                Chưa có bài viết nào.
              </div>
            )}
          </div>

          {/* PHÂN TRANG */}
          <div className="posts-pagination">
            <button
              className="posts-page-btn"
              disabled={page === 1}
              onClick={() => handleChangePage(page - 1)}
            >
              Trước
            </button>

            <div className="posts-page-numbers">
              {getPageNumbers(page, totalPages).map((item, idx) => {
                if (item === "...") {
                  return (
                    <span key={`dots-${idx}`} className="posts-page-dots">
                      ...
                    </span>
                  );
                }

                const pageNumber = item;
                const isActive = pageNumber === page;

                return (
                  <button
                    key={pageNumber}
                    className={
                      "posts-page-number" +
                      (isActive ? " posts-page-number--active" : "")
                    }
                    onClick={() => handleChangePage(pageNumber)}
                  >
                    {pageNumber}
                  </button>
                );
              })}
            </div>

            <button
              className="posts-page-btn"
              disabled={page === totalPages}
              onClick={() => handleChangePage(page + 1)}
            >
              Sau
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
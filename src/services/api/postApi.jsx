// src/services/api/postApi.js
import http from "@/services/http";

/**
 * DTO mẫu (CreatePostDto / UpdatePostDto):
 * {
 *   title: string;
 *   slug: string;
 *   content: string;
 *   excerpt: string;
 *   category: string;
 *   status: string;       // 'draft' | 'published'
 *   coverUrl: string;
 *   tags: string[];
 *   author: string;
 *   featured: boolean;
 *   views: number;
 *   readMins: number;
 *   seoTitle: string;
 *   seoDesc: string;
 *   publishedAt: string;  // ISO datetime
 * }
 */

/* ================== HELPERS ================== */

/**
 * Chuẩn hoá response danh sách:
 *  - Có thể là: Post[]
 *  - Hoặc: { data: Post[], meta }
 *  - Hoặc: { items: Post[], meta }
 *  - Hoặc: { posts: Post[], meta }
 */
function normalizePostListResponse(src, page, limit) {
  if (!src || typeof src !== "object") {
    return {
      posts: [],
      meta: { total: 0, page, limit },
    };
  }

  let list = [];
  let meta = null;

  // 1. Nhiều backend trả thẳng mảng
  if (Array.isArray(src)) {
    list = src;
  }
  // 2. Kiểu { data: [...], meta }
  else if (Array.isArray(src.data)) {
    list = src.data;
    meta = src.meta || src.pagination || null;
  }
  // 3. Kiểu { items: [...], meta }
  else if (Array.isArray(src.items)) {
    list = src.items;
    meta = src.meta || src.pagination || null;
  }
  // 4. Kiểu { posts: [...], meta }
  else if (Array.isArray(src.posts)) {
    list = src.posts;
    meta = src.meta || src.pagination || null;
  }

  // Nếu meta chưa có, tự suy ra
  if (!meta) {
    meta = {
      total: src.total ?? list.length,
      page: src.page ?? page,
      limit: src.limit ?? limit,
    };
  }

  // 👉 Bật log một thời gian để check shape thật (xong ok thì có thể comment lại)
  console.log("[PostApi] /posts raw:", src);
  console.log("[PostApi] /posts normalized:", list, meta);

  return { posts: list, meta };
}

/**
 * Chuẩn hoá response chi tiết:
 *  - Có thể là: { id, ... }
 *  - Hoặc: { data: { ... } }
 *  - Hoặc: { post: { ... } }
 */
function normalizeSinglePost(src) {
  if (!src || typeof src !== "object") return null;

  if (src.data && !Array.isArray(src.data)) {
    return src.data;
  }

  if (src.post && !Array.isArray(src.post)) {
    return src.post;
  }

  // fallback: assume src chính là object post
  return src;
}

/* ================== API ================== */

export const PostApi = {
  /**
   * Lấy danh sách posts (có phân trang + search)
   * GET /posts?page=&limit=&search=
   */
  async getPosts({ page = 1, limit = 10, search = "" } = {}) {
    const { data } = await http.get("/posts", {
      params: { page, limit, search },
    });

    return normalizePostListResponse(data, page, limit);
  },

  /**
   * Lấy chi tiết 1 post
   * GET /posts/:id
   */
  async getPostById(id) {
    const { data } = await http.get(`/posts/${id}`);
    const post = normalizeSinglePost(data);

    console.log("[PostApi] getPostById raw:", data, "→ post:", post);

    return post;
  },

  /**
   * Tạo post mới
   * POST /posts
   * body nên đúng DTO phía trên
   */
  async createPost(body) {
    const { data } = await http.post("/posts", body);
    return normalizeSinglePost(data);
  },

  /**
   * Cập nhật post
   * PATCH /posts/:id
   */
  async updatePost(id, body) {
    const { data } = await http.patch(`/posts/${id}`, body);
    return normalizeSinglePost(data);
  },

  /**
   * Xoá post
   * DELETE /posts/:id
   */
  async deletePost(id) {
    const { data } = await http.delete(`/posts/${id}`);
    return data;
  },
};

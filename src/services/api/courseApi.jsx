// ✅ src/services/api/courseApi.jsx
import http from "@/services/http";

/**
 * Chuẩn hóa response findAll:
 * - Nếu backend trả mảng: [course, ...]
 * - Hoặc trả { items: [...], meta: {...} } / { data: [...], meta: {...} }
 */
function normalizeListResponse(data, page, limit) {
  let list = [];

  if (Array.isArray(data)) {
    list = data;
  } else if (Array.isArray(data?.items)) {
    list = data.items;
  } else if (Array.isArray(data?.data)) {
    list = data.data;
  } else if (Array.isArray(data?.results)) {
    list = data.results;
  }

  const meta = data?.meta || data?.pagination || {
    total: list.length,
    page,
    limit,
  };

  return { courses: list, meta };
}

export const CourseApi = {
  /**
   * Lấy danh sách khóa học (có phân trang)
   * backend: GET /courses?page=1&limit=10
   */
  async getCourses({ page = 1, limit = 10 } = {}) {
    const { data } = await http.get("/courses", {
      params: { page, limit },
    });

    return normalizeListResponse(data, page, limit);
  },

  /**
   * Lấy chi tiết 1 khóa học
   * GET /courses/:id
   */
  async getCourseById(id) {
    const { data } = await http.get(`/courses/${id}`);
    return data;
  },

  /**
   * Tạo mới khóa học
   * POST /courses
   * body: { title, description, price, thumbnail, level }
   * instructor sẽ được lấy từ token (req.user) ở backend
   */
  async createCourse(body) {
    const { data } = await http.post("/courses", body);
    return data;
  },

  /**
   * Cập nhật khóa học
   * PATCH /courses/:id
   */
  async updateCourse(id, body) {
    const { data } = await http.patch(`/courses/${id}`, body);
    return data;
  },

  /**
   * Xóa khóa học
   * DELETE /courses/:id
   */
  async deleteCourse(id) {
    const { data } = await http.delete(`/courses/${id}`);
    return data;
  },
};

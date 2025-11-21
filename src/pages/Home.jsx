// src/pages/Home.jsx
import { useEffect, useState } from "react";
import Hero from "../components/Hero";
import CourseCard from "../components/CourseCard";
import "../css/home.css";

import { CourseApi } from "@/services/api/courseApi";

const PAGE_SIZE = 12; // 3 cột × 4 hàng

export default function Home() {
  const [courses, setCourses] = useState([]);
  const [meta, setMeta] = useState({
    page: 1,
    limit: PAGE_SIZE,
    total: 0,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchCourses(1);
  }, []);

  const fetchCourses = async (page = 1) => {
    try {
      setLoading(true);

      // 👇 KHÔNG dùng biến meta ở đây nữa, dùng PAGE_SIZE
      const { courses, meta: apiMeta } = await CourseApi.getCourses({
        page,
        limit: PAGE_SIZE,
      });

      console.log("[Home] courses from api:", courses, apiMeta);

      setCourses(courses || []);

      setMeta({
        page: apiMeta?.page ?? page,
        limit: apiMeta?.limit ?? PAGE_SIZE,
        total: apiMeta?.total ?? (courses?.length || 0),
      });
    } catch (err) {
      console.error("Lỗi load courses:", err);
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.max(
    1,
    Math.ceil((meta.total || courses.length || 1) / (meta.limit || PAGE_SIZE))
  );

  // chuẩn hoá 1 course cho hợp với CourseCard
  const normalizeCourse = (raw) => {
    if (!raw) return null;

    return {
      id: raw.id ?? raw.course_id ?? raw.courseId,
      title: raw.title ?? raw.name ?? raw.course_name,
      image:
        raw.thumbnail ??
        raw.image ??
        "/src/assets/course card.jpg",
      level: raw.level ?? "Beginner",
      minutes: raw.minutes ?? raw.totalMinutes ?? raw.duration ?? 0,
      modules: raw.modules ?? raw.totalModules ?? raw.lessonCount ?? 0,
      teacher:
        raw.teacher ??
        raw.instructorName ??
        raw.instructor?.fullName ??
        "Giang Sensei",
    };
  };

  const handleChangePage = (page) => {
    if (page < 1 || page > totalPages) return;
    fetchCourses(page);
  };

  return (
    <div className="home-page">
      <Hero />

      <section className="home-courses-section">
        <div className="home-container">
          <h2 className="home-courses-title">TẤT CẢ KHÓA HỌC</h2>

          {loading ? (
            <div className="home-courses-loading">Đang tải khóa học...</div>
          ) : courses.length === 0 ? (
            <div className="home-courses-empty">Chưa có khóa học nào</div>
          ) : (
            <div className="home-courses-grid">
              {courses.map((item) => {
                const c = normalizeCourse(item);
                if (!c) return null;
                return <CourseCard key={c.id} c={c} />;
              })}
            </div>
          )}

          {/* Phân trang */}
          <div className="home-pagination">
            <button
              className="home-page-btn"
              onClick={() => handleChangePage(meta.page - 1)}
              disabled={meta.page <= 1}
            >
              {"<"}
            </button>

            {Array.from({ length: totalPages }).map((_, idx) => {
              const p = idx + 1;
              return (
                <button
                  key={p}
                  className={
                    "home-page-btn " +
                    (p === meta.page ? "home-page-btn--active" : "")
                  }
                  onClick={() => handleChangePage(p)}
                >
                  {p}
                </button>
              );
            })}

            <button
              className="home-page-btn"
              onClick={() => handleChangePage(meta.page + 1)}
              disabled={meta.page >= totalPages}
            >
              {">"}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

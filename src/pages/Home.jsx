// src/pages/Home.jsx
import { useEffect } from "react";
import Hero from "../components/Hero";
import CourseCard from "../components/CourseCard";
import "../css/home.css"; // 👈 ĐÚNG PATH: src/css/home.css

// 12 khoá học để ra 3 cột × 4 hàng
const MOCK_COURSES = [
  {
    id: 1,
    title: "N1 CHILL CLASS",
    image: "/src/assets/course card.jpg",
    level: "Beginner",
    minutes: 360,
    modules: 32,
    teacher: "Giang Sensei",
  },
  {
    id: 2,
    title: "N2 CHILL CLASS",
    image: "/src/assets/course card.jpg",
    level: "Beginner",
    minutes: 360,
    modules: 32,
    teacher: "Giang Sensei",
  },
  {
    id: 3,
    title: "PHÁT ÂM - VOICE",
    image: "/src/assets/course card.jpg",
    level: "Beginner",
    minutes: 240,
    modules: 20,
    teacher: "Giang Sensei",
  },
  {
    id: 4,
    title: "IT TALK",
    image: "/src/assets/course card.jpg",
    level: "Beginner",
    minutes: 180,
    modules: 12,
    teacher: "Giang Sensei",
  },
  {
    id: 5,
    title: "N3 CHILL CLASS",
    image: "/src/assets/course card.jpg",
    level: "Beginner",
    minutes: 300,
    modules: 28,
    teacher: "Giang Sensei",
  },
  {
    id: 6,
    title: "N4 CHILL CLASS",
    image: "/src/assets/course card.jpg",
    level: "Beginner",
    minutes: 280,
    modules: 24,
    teacher: "Giang Sensei",
  },
  {
    id: 7,
    title: "N5 CHILL CLASS",
    image: "/src/assets/course card.jpg",
    level: "Beginner",
    minutes: 260,
    modules: 22,
    teacher: "Giang Sensei",
  },
  {
    id: 8,
    title: "NGỮ PHÁP CƠ BẢN",
    image: "/src/assets/course card.jpg",
    level: "Beginner",
    minutes: 200,
    modules: 18,
    teacher: "Giang Sensei",
  },
  {
    id: 9,
    title: "TỪ VỰNG CHỦ ĐỀ",
    image: "/src/assets/course card.jpg",
    level: "Beginner",
    minutes: 220,
    modules: 16,
    teacher: "Giang Sensei",
  },
  {
    id: 10,
    title: "BUSINESS JAPANESE",
    image: "/src/assets/course card.jpg",
    level: "Intermediate",
    minutes: 240,
    modules: 18,
    teacher: "Giang Sensei",
  },
  {
    id: 11,
    title: "GIAO TIẾP HẰNG NGÀY",
    image: "/src/assets/course card.jpg",
    level: "Beginner",
    minutes: 210,
    modules: 15,
    teacher: "Giang Sensei",
  },
  {
    id: 12,
    title: "LUYỆN ĐỌC - SPEED",
    image: "/src/assets/course card.jpg",
    level: "Intermediate",
    minutes: 230,
    modules: 17,
    teacher: "Giang Sensei",
  },
];

export default function Home() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="home-page">
      {/* Hero cam ở trên */}
      <Hero />

      {/* Khối TẤT CẢ KHÓA HỌC */}
      <section className="home-courses-section">
        <div className="home-container">
          <h2 className="home-courses-title">TẤT CẢ KHÓA HỌC</h2>

          <div className="home-courses-grid">
            {MOCK_COURSES.map((c) => (
              <CourseCard key={c.id} c={c} />
            ))}
          </div>

          <div className="home-pagination">
            <button className="home-page-btn home-page-btn--active">1</button>
            <button className="home-page-btn">2</button>
            <button className="home-page-btn">3</button>
            <span className="home-page-dots">...</span>
            <button className="home-page-btn">{">"}</button>
          </div>
        </div>
      </section>
    </div>
  );
}

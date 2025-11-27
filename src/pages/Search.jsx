// src/pages/Search.jsx
/* eslint-disable react-refresh/only-export-components */
import "../css/search.css";

import courseThumb from "../assets/course card.jpg";
import postImg1 from "../assets/post1.png";
import postImg2 from "../assets/post2.png";
import postImg3 from "../assets/post3.png";

/* ====== ICONS 20x20 (dùng trong meta card) ====== */

// Icon thời lượng (vòng tròn + “play”)
const DurationIcon = () => (
  <svg
    className="sr-meta-icon"
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M10 2.1665C14.3154 2.1665 17.8338 5.68414 17.834 9.99951C17.834 14.315 14.3155 17.8335 10 17.8335C5.68462 17.8333 2.16699 14.3149 2.16699 9.99951C2.16717 5.68424 5.68473 2.16668 10 2.1665ZM9.69238 5.14111C9.0747 5.14111 8.5676 5.64848 8.56738 6.26611V9.68311C8.56738 10.6001 9.13397 11.6047 9.92676 12.0786L9.92773 12.0796L12.5107 13.6206V13.6196C12.7014 13.7405 12.9024 13.7827 13.084 13.7827C13.4673 13.7826 13.845 13.5889 14.0566 13.2261C14.3791 12.6874 14.1981 12.0011 13.6641 11.687H13.665L11.082 10.145L11.0762 10.1421C11.0521 10.1279 10.9802 10.0628 10.9092 9.93799C10.8382 9.81325 10.8174 9.71474 10.8174 9.68311V6.26611C10.8172 5.64861 10.3099 5.14133 9.69238 5.14111Z"
      fill="#DD673C"
      stroke="#DD673C"
    />
  </svg>
);

// Icon “số chương / bài”
const ChaptersIcon = () => (
  <svg
    className="sr-meta-icon"
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M16.5254 2.7334C17.2491 2.73361 17.833 3.31826 17.833 4.04199V13.9502C17.8329 14.5037 17.3655 15.034 16.8057 15.1035L16.8027 15.1045L16.5439 15.1377H16.542C15.1213 15.3283 13.1538 15.9095 11.5752 16.5713C11.372 16.6557 11.1253 16.5036 11.125 16.2588V4.66699C11.125 4.55085 11.1912 4.43015 11.3135 4.36328C12.7809 3.56968 15.0106 2.86431 16.499 2.7334H16.5254Z"
      fill="#DD673C"
      stroke="#DD673C"
    />
    <path
      d="M8.92487 3.92507C7.39987 3.10007 5.09154 2.36673 3.52487 2.2334H3.46654C2.46654 2.2334 1.6582 3.04173 1.6582 4.04173V13.9501C1.6582 14.7584 2.31654 15.5001 3.12487 15.6001L3.3832 15.6334C4.74987 15.8167 6.67487 16.3834 8.22487 17.0334C8.76654 17.2584 9.36654 16.8501 9.36654 16.2584V4.66673C9.36654 4.35006 9.19987 4.07507 8.92487 3.92507ZM4.16654 6.45006H6.04154C6.3832 6.45006 6.66654 6.7334 6.66654 7.07506C6.66654 7.42506 6.3832 7.70006 6.04154 7.70006H4.16654C3.82487 7.70006 3.54154 7.42506 3.54154 7.07506C3.54154 6.7334 3.82487 6.45006 4.16654 6.45006ZM6.66654 10.2001H4.16654C3.82487 10.2001 3.54154 9.92506 3.54154 9.57506C3.54154 9.2334 3.82487 8.95006 4.16654 8.95006H6.66654C7.0082 8.95006 7.29154 9.2334 7.29154 9.57506C7.29154 9.92506 7.0082 10.2001 6.66654 10.2001Z"
      fill="#DD673C"
    />
  </svg>
);

// Icon “học viên”
const LearnerIcon = () => (
  <svg
    className="sr-meta-icon"
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M10 2.1665C11.8475 2.1665 13.3611 3.62203 13.4541 5.44678L13.459 5.62451C13.4509 7.49829 11.987 9.00921 10.124 9.07471H10.084C10.0247 9.07013 9.96549 9.06975 9.90918 9.07373C7.99574 9.00375 6.54199 7.49049 6.54199 5.62451C6.54217 3.71758 8.09307 2.16668 10 2.1665Z"
      fill="#DD673C"
      stroke="#DD673C"
    />
    <path
      d="M14.2338 11.7919C11.9088 10.2419 8.11712 10.2419 5.77546 11.7919C4.71712 12.5002 4.13379 13.4586 4.13379 14.4836C4.13379 15.5086 4.71712 16.4586 5.76712 17.1586C6.93379 17.9419 8.46712 18.3336 10.0005 18.3336C11.5338 18.3336 13.0671 17.9419 14.2338 17.1586C15.2838 16.4502 15.8671 15.5002 15.8671 14.4669C15.8588 13.4419 15.2838 12.4919 14.2338 11.7919Z"
      fill="#DD673C"
    />
  </svg>
);

// Icon “giảng viên” (giống LearnerIcon theo Figma)
const TeacherIcon = () => (
  <svg
    className="sr-meta-icon"
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M10 2.1665C11.8475 2.1665 13.3611 3.62203 13.4541 5.44678L13.459 5.62451C13.4509 7.49829 11.987 9.00921 10.124 9.07471H10.084C10.0247 9.07013 9.96549 9.06975 9.90918 9.07373C7.99574 9.00375 6.54199 7.49049 6.54199 5.62451C6.54217 3.71758 8.09307 2.16668 10 2.1665Z"
      fill="#DD673C"
      stroke="#DD673C"
    />
    <path
      d="M14.2338 11.7919C11.9088 10.2419 8.11712 10.2419 5.77546 11.7919C4.71712 12.5002 4.13379 13.4586 4.13379 14.4836C4.13379 15.5086 4.71712 16.4586 5.76712 17.1586C6.93379 17.9419 8.46712 18.3336 10.0005 18.3336C11.5338 18.3336 13.0671 17.9419 14.2338 17.1586C15.2838 16.4502 15.8671 15.5002 15.8671 14.4669C15.8588 13.4419 15.2838 12.4919 14.2338 11.7919Z"
      fill="#DD673C"
    />
  </svg>
);

export default function SearchPage() {
  // dữ liệu mock cho course & post – sau này bạn thay bằng API
  const courses = Array.from({ length: 6 }).map((_, idx) => ({
    id: idx + 1,
    title: "N1 Chill Class",
    level: "Beginner",
    duration: "360 phút",
    chapters: "32 Chương",
    teacher: "Giảng Sensei",
    image: courseThumb,
  }));

  const posts = [
    {
      id: 1,
      tag: "Front-End",
      title: "Authentication & Authorization trong ReactJS",
      excerpt:
        "Chào bạn! Nếu bạn đã đi học khóa Pro của Rikkei Academy, chắc hẳn bạn đã biết Dev Mode...",
      image: postImg1,
    },
    {
      id: 2,
      tag: "Front-End",
      title: "Authentication & Authorization trong ReactJS",
      excerpt:
        "Chào bạn! Nếu bạn đã đi học khóa Pro của Rikkei Academy, chắc hẳn bạn đã biết Dev Mode...",
      image: postImg2,
    },
    {
      id: 3,
      tag: "Front-End",
      title: "Authentication & Authorization trong ReactJS",
      excerpt:
        "Chào bạn! Nếu bạn đã đi học khóa Pro của Rikkei Academy, chắc hẳn bạn đã biết Dev Mode...",
      image: postImg3,
    },
  ];

  const keyword = "Web";
  const totalResults = courses.length + posts.length;

  return (
    <div className="sr-page">
      {/* ===== HERO CAM ===== */}
      <section className="sr-hero">
        <div className="sr-hero-inner">
          <div className="sr-breadcrumb">
            <span className="sr-breadcrumb-link">Trang chủ</span>
            <span className="sr-breadcrumb-sep">/</span>
            <span className="sr-breadcrumb-current">Tìm kiếm</span>
          </div>
          <h1 className="sr-hero-title">Tìm kiếm</h1>
        </div>
      </section>

      {/* ===== SEARCH BAR (float trên hero) ===== */}
      <section className="sr-search-bar-wrapper">
        <div className="sr-search-bar">
          <input
            className="sr-search-input"
            placeholder="Tìm kiếm khóa học, bài viết,…"
          />
          <button className="sr-search-btn">Cập nhật</button>
        </div>
      </section>

      {/* ===== RESULTS ===== */}
      <section className="sr-results">
        <div className="sr-results-header">
          <div className="sr-results-count">
            Có <span className="sr-results-count-number">{totalResults}</span>{" "}
            kết quả cho từ khóa <b>“{keyword}”</b>
          </div>

          <div className="sr-results-sort">
            <span className="sr-results-sort-label">Sắp xếp:</span>
            <button className="sr-results-sort-btn">
              Mới nhất
              <span className="sr-results-sort-arrow">▾</span>
            </button>
          </div>
        </div>

        {/* ===== GRID COURSES ===== */}
        <div className="sr-grid">
          {courses.map((course) => (
            <article key={course.id} className="sr-card sr-card--course">
              <div className="sr-card-thumb">
                <img src={course.image} alt={course.title} />
              </div>

              <div className="sr-card-body">
                <div className="sr-card-tag sr-card-tag--level">
                  {course.level}
                </div>

                <h3 className="sr-card-title">{course.title}</h3>

                <div className="sr-card-meta-row">
                  <div className="sr-card-meta-item">
                    <DurationIcon />
                    <span>{course.duration}</span>
                  </div>
                  <div className="sr-card-meta-item">
                    <ChaptersIcon />
                    <span>{course.chapters}</span>
                  </div>
                  <div className="sr-card-meta-item">
                    <TeacherIcon />
                    <span>{course.teacher}</span>
                  </div>
                </div>
              </div>

              <div className="sr-card-footer">
                <button className="sr-card-cta">HỌC NGAY ↗</button>
              </div>
            </article>
          ))}

          {/* ===== GRID POSTS ===== */}
          {posts.map((post) => (
            <article key={post.id} className="sr-card sr-card--article">
              <div className="sr-card-thumb">
                <img src={post.image} alt={post.title} />
              </div>

              <div className="sr-card-body">
                <div className="sr-card-tag sr-card-tag--category">
                  {post.tag}
                </div>

                <h3 className="sr-card-title">{post.title}</h3>
                <p className="sr-card-excerpt">{post.excerpt}</p>

                <div className="sr-card-meta-row sr-card-meta-row--article">
                  <div className="sr-card-meta-item">
                    <DurationIcon />
                    <span>8 tháng trước</span>
                  </div>
                  <div className="sr-card-meta-item">
                    <LearnerIcon />
                    <span>10–15 phút đọc</span>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

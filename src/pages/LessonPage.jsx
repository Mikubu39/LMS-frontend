// src/pages/LessonPage.jsx
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "../css/lesson.css";
import thumbImg from "../assets/course card.jpg";

// ICON 3 GẠCH (menu)
const ListIcon = () => (
  <svg
    className="ls-icon"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M21 7.75H3C2.59 7.75 2.25 7.41 2.25 7C2.25 6.59 2.59 6.25 3 6.25H21C21.41 6.25 21.75 6.59 21.75 7C21.75 7.41 21.41 7.75 21 7.75Z"
      fill="#DD673C"
    />
    <path
      d="M21 12.75H3C2.59 12.75 2.25 12.41 2.25 12C2.25 11.59 2.59 11.25 3 11.25H21C21.41 11.25 21.75 11.59 21.75 12C21.75 12.41 21.41 12.75 21 12.75Z"
      fill="#DD673C"
    />
    <path
      d="M21 17.75H3C2.59 17.75 2.25 17.41 2.25 17C2.25 16.59 2.59 16.25 3 16.25H21C21.41 16.25 21.75 16.59 21.75 17C21.75 17.41 21.41 17.75 21 17.75Z"
      fill="#DD673C"
    />
  </svg>
);

// fake data session/lesson cho UI
const MOCK_SESSIONS = [
  {
    id: "session-1",
    title: "Session 1: Vỡ lòng",
    lessons: [
      { id: "l1", title: "Form & Table", duration: "10:34" },
      { id: "l2", title: "Layout Flexbox", duration: "15:20" },
      { id: "l3", title: "Typography cơ bản", duration: "08:45" },
    ],
  },
  {
    id: "session-2",
    title: "Session 2: HTML nâng cao",
    lessons: [
      { id: "l4", title: "Semantic HTML", duration: "12:10" },
      { id: "l5", title: "SEO cơ bản", duration: "09:30" },
    ],
  },
  {
    id: "session-3",
    title: "Session 3: Mini project",
    lessons: [
      { id: "l6", title: "Xây dựng landing page", duration: "18:05" },
    ],
  },
];

export default function LessonPage() {
  const navigate = useNavigate();
  const { courseId } = useParams();

  // true = sidebar full; false = thu gọn (chỉ còn cột nhỏ với icon)
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // chỉ cho 1 session mở tại 1 thời điểm (accordion)
  const [openSessionId, setOpenSessionId] = useState(
    MOCK_SESSIONS[0]?.id || null
  );

  const courseTitle = courseId
    ? courseId
        .replace(/-/g, " ")
        .replace(/\b\w/g, (ch) => ch.toUpperCase())
    : "N1 Chill Class";

  const currentLesson = MOCK_SESSIONS[0].lessons[0];

  const handleSelectLesson = (lessonId) => {
    console.log("Go to lesson:", lessonId, "of course", courseId);
    // sau này navigate thật:
    // navigate(`/lesson/${courseId}?lesson=${lessonId}`);
  };

  const handleToggleSession = (sessionId) => {
    setOpenSessionId((prev) => (prev === sessionId ? null : sessionId));
  };

  return (
    <div className="ls-page">
      <div className="ls-inner">
        {/* breadcrumb + action */}
        <div className="ls-breadcrumb-row">
          <div className="ls-breadcrumb">
            <span className="ls-breadcrumb-link" onClick={() => navigate("/")}>
              Trang chủ
            </span>
            <span className="ls-breadcrumb-sep">/</span>
            <span className="ls-breadcrumb-course">{courseTitle}</span>
          </div>

          <button className="ls-report-btn">Báo lỗi bài học</button>
        </div>

        {/* layout: video + sidebar */}
        <div
          className={
            "ls-layout" + (sidebarOpen ? "" : " ls-layout--collapsed")
          }
        >
          {/* MAIN */}
          <main className="ls-main">
            <div className="ls-video-card">
              <div className="ls-video-thumb-wrapper">
                <img
                  src={thumbImg}
                  alt={courseTitle}
                  className="ls-video-thumb"
                />
                <button className="ls-video-play-btn">▶</button>
              </div>

              <div className="ls-video-meta-bar">
                <div className="ls-video-meta-left">
                  <span className="ls-video-time">
                    {currentLesson.duration}
                  </span>
                  <span className="ls-video-dot">•</span>
                  <span className="ls-video-updated">
                    Cập nhật 24 tháng 06 2023
                  </span>
                </div>
                <div className="ls-video-meta-right">
                  <span className="ls-video-view">1700 lượt học</span>
                </div>
              </div>
            </div>

            <h1 className="ls-lesson-title">{currentLesson.title}</h1>

            <div className="ls-lesson-submeta">
              <span className="ls-lesson-submeta-text">
                24 tháng 06 năm 2023
              </span>
              <span className="ls-lesson-dot">•</span>
              <span className="ls-lesson-submeta-text">{courseTitle}</span>
            </div>

            {/* Mô tả */}
            <section className="ls-section">
              <h2 className="ls-section-title">Mô tả</h2>

              <div className="ls-section-body">
                {/* ... nội dung mô tả giữ nguyên ... */}
                <p>
                  Lorem ipsum dolor sit amet consectetur. Ornare neque accumsan
                  metus nulla ultricies massa ultrices rhoncus ultrices eros.
                  Vestibulum varius adipiscing pellentesque amet phasellus
                  mauris volutpat at tortor sodales sit. Sit morbi pellentesque
                  adipiscing pellentesque habitant ullamcorper orci.
                </p>
                <p>
                  Senectus netus lacus facilisis massa amet eget facilisis
                  dignissim. Netus massa molestie turpis feugiat nullam euismod
                  nisl.
                </p>
                <ul className="ls-bullet-list">
                  <li>Semper netus netus lacus facilisis massa eget.</li>
                  <li>
                    Malesuada elit tincidunt at mi pharetra egestas sagittis.
                  </li>
                  <li>
                    Facilisis fermentum suspendisse sagittis faucibus viverra
                    fermentum in gravida mauris ut.
                  </li>
                </ul>
                <p>
                  Lorem ipsum dolor sit amet consectetur. Arcu et nisl aenean
                  ultrices lacus ut. Vestibulum varius adipiscing pellentesque
                  amet phasellus mauris volutpat at tortor sodales sit.
                </p>

                <button className="ls-see-more-btn">Xem thêm</button>
              </div>
            </section>
          </main>

          {/* SIDEBAR DANH SÁCH BÀI HỌC – THU GỌN */}
          <aside
            className={
              "ls-sidebar" + (sidebarOpen ? "" : " ls-sidebar--collapsed")
            }
          >
            <div className="ls-sidebar-header">
              {/* bấm vào cả cụm 3 gạch + chữ để thu gọn/mở */}
              <button
                type="button"
                className="ls-sidebar-toggle-btn"
                onClick={() => setSidebarOpen((prev) => !prev)}
              >
                <ListIcon />
                {sidebarOpen && (
                  <span className="ls-sidebar-title-text">
                    Danh sách bài học
                  </span>
                )}
              </button>
            </div>

            {/* body chỉ hiển thị khi không thu gọn */}
            {sidebarOpen && (
              <div className="ls-sidebar-body">
                {MOCK_SESSIONS.map((session) => {
                  const isSessionOpen = session.id === openSessionId;

                  return (
                    <div key={session.id} className="ls-session">
                      <button
                        type="button"
                        className={
                          "ls-session-title" +
                          (isSessionOpen ? " ls-session-title--open" : "")
                        }
                        onClick={() => handleToggleSession(session.id)}
                      >
                        {session.title}
                        <span className="ls-session-toggle-indicator">
                          {isSessionOpen ? "−" : "+"}
                        </span>
                      </button>

                      {isSessionOpen && (
                        <div className="ls-lesson-list">
                          {session.lessons.map((lesson) => {
                            const isActive = lesson.id === currentLesson.id;
                            return (
                              <button
                                key={lesson.id}
                                className={
                                  "ls-lesson-item" +
                                  (isActive ? " ls-lesson-item--active" : "")
                                }
                                onClick={() => handleSelectLesson(lesson.id)}
                              >
                                <div className="ls-lesson-item-main">
                                  <span className="ls-lesson-item-title">
                                    {lesson.title}
                                  </span>
                                  <span className="ls-lesson-item-duration">
                                    {lesson.duration}
                                  </span>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}

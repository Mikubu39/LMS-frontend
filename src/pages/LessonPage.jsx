// src/pages/LessonPage.jsx
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "../css/lesson.css";
import thumbImg from "../assets/course card.jpg";

import { SessionApi } from "@/services/api/sessionApi";
import { LessonApi } from "@/services/api/lessonApi";
import { LessonVideoApi } from "@/services/api/lessonVideoApi";

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

// ===== Helper normalize từ backend =====
const normalizeSession = (raw) => {
  if (!raw) return null;
  return {
    id: raw.id ?? raw.session_id ?? raw.sessionId,
    title: raw.title ?? raw.name ?? "Session",
    courseId:
      raw.courseId ?? raw.course_id ?? raw.course?.id ?? raw.course?.courseId,
    order: raw.order ?? raw.sessionOrder ?? 0,
  };
};

const normalizeLesson = (raw) => {
  if (!raw) return null;

  const durationMinutes =
    raw.duration ?? raw.durationMinutes ?? raw.time ?? raw.length ?? 0;

  const durationText = raw.durationText
    ? raw.durationText
    : durationMinutes
    ? `${durationMinutes} phút`
    : "—";

  return {
    id: raw.id ?? raw.lesson_id ?? raw.lessonId,
    title: raw.title ?? raw.name ?? "Bài học",
    sessionId: raw.sessionId ?? raw.session_id ?? raw.session?.id,
    durationMinutes,
    durationText,
  };
};

// Lấy thêm thông tin video cho 1 lesson (title/description/videoUrl/duration)
const enrichLessonWithVideo = async (lesson) => {
  if (!lesson?.id) return lesson;
  try {
    const video = await LessonVideoApi.getLessonVideoById(lesson.id);
    console.log("[LessonPage] lesson-video for", lesson.id, ":", video);

    const durationText =
      video?.duration != null
        ? `${video.duration} phút`
        : lesson.durationText;

    return {
      ...lesson,
      title: video.title ?? lesson.title,
      description: video.description ?? "",
      videoUrl: video.videoUrl ?? "",
      durationMinutes: video.duration ?? lesson.durationMinutes,
      durationText,
    };
  } catch (e) {
    console.error("Lỗi load lesson-video:", e);
    return {
      ...lesson,
      description: lesson.description ?? "",
      videoUrl: lesson.videoUrl ?? "",
    };
  }
};

export default function LessonPage() {
  const navigate = useNavigate();
  const { courseId } = useParams();

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sessions, setSessions] = useState([]); // [{id,title,lessons:[]}]
  const [openSessionId, setOpenSessionId] = useState(null);
  const [currentLesson, setCurrentLesson] = useState(null);
  const [loading, setLoading] = useState(false);

  const courseTitle = courseId
    ? courseId
        .replace(/-/g, " ")
        .replace(/\b\w/g, (ch) => ch.toUpperCase())
    : "N1 Chill Class";

  // ===== Load sessions + lessons từ API =====
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        // Lấy toàn bộ sessions + lessons
        const [rawSessions, rawLessons] = await Promise.all([
          SessionApi.getSessions(),
          LessonApi.getLessons(),
        ]);

        console.log("[LessonPage] sessions raw:", rawSessions);
        console.log("[LessonPage] lessons raw:", rawLessons);

        // Chuẩn hoá
        const allSessions = (rawSessions || [])
          .map(normalizeSession)
          .filter(Boolean);

        const allLessons = (rawLessons || [])
          .map(normalizeLesson)
          .filter(Boolean);

        // Lọc sessions theo courseId (nếu có)
        const filteredSessions = courseId
          ? allSessions.filter(
              (s) => String(s.courseId) === String(courseId)
            )
          : allSessions;

        // Gắn lessons vào từng session
        const grouped = filteredSessions
          .map((session) => ({
            ...session,
            lessons: allLessons.filter(
              (lesson) => String(lesson.sessionId) === String(session.id)
            ),
          }))
          // sort theo order nếu có
          .sort((a, b) => (a.order || 0) - (b.order || 0));

        setSessions(grouped);

        // chọn session + lesson đầu tiên làm current + lấy video
        if (grouped.length > 0 && grouped[0].lessons.length > 0) {
          setOpenSessionId(grouped[0].id);
          const firstLesson = grouped[0].lessons[0];
          const lessonWithVideo = await enrichLessonWithVideo(firstLesson);
          setCurrentLesson(lessonWithVideo);
        } else {
          setOpenSessionId(grouped[0]?.id ?? null);
          setCurrentLesson(null);
        }
      } catch (err) {
        console.error("Lỗi load sessions/lessons:", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [courseId]);

  const handleSelectLesson = async (lesson) => {
    console.log("Go to lesson:", lesson.id, "of course", courseId);
    const lessonWithVideo = await enrichLessonWithVideo(lesson);
    setCurrentLesson(lessonWithVideo);

    // sau này navigate thật:
    // navigate(`/lesson/${courseId}?lesson=${lesson.id}`);
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
            {loading ? (
              <div className="ls-loading">Đang tải bài học...</div>
            ) : !currentLesson ? (
              <div className="ls-empty">
                Chưa có bài học nào cho khóa <b>{courseTitle}</b>
              </div>
            ) : (
              <>
                <div className="ls-video-card">
                  <div className="ls-video-thumb-wrapper">
                    <img
                      src={thumbImg}
                      alt={courseTitle}
                      className="ls-video-thumb"
                    />
                    <button
                      className="ls-video-play-btn"
                      onClick={() => {
                        if (currentLesson.videoUrl) {
                          window.open(currentLesson.videoUrl, "_blank");
                        }
                      }}
                    >
                      ▶
                    </button>
                  </div>

                  <div className="ls-video-meta-bar">
                    <div className="ls-video-meta-left">
                      <span className="ls-video-time">
                        {currentLesson.durationText}
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
                    <p>
                      {currentLesson.description ||
                        "Chưa có mô tả cho bài học này."}
                    </p>

                    {/* Nếu muốn vẫn giữ thêm đoạn lorem demo thì để dưới */}
                    {/* <button className="ls-see-more-btn">Xem thêm</button> */}
                  </div>
                </section>
              </>
            )}
          </main>

          {/* SIDEBAR DANH SÁCH BÀI HỌC – THU GỌN */}
          <aside
            className={
              "ls-sidebar" + (sidebarOpen ? "" : " ls-sidebar--collapsed")
            }
          >
            <div className="ls-sidebar-header">
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

            {sidebarOpen && (
              <div className="ls-sidebar-body">
                {sessions.length === 0 ? (
                  <div className="ls-sidebar-empty">
                    Chưa có session / bài học nào
                  </div>
                ) : (
                  sessions.map((session) => {
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
                            {session.lessons.length === 0 ? (
                              <div className="ls-lesson-empty">
                                Chưa có bài học
                              </div>
                            ) : (
                              session.lessons.map((lesson) => {
                                const isActive =
                                  currentLesson &&
                                  lesson.id === currentLesson.id;
                                return (
                                  <button
                                    key={lesson.id}
                                    className={
                                      "ls-lesson-item" +
                                      (isActive
                                        ? " ls-lesson-item--active"
                                        : "")
                                    }
                                    onClick={() => handleSelectLesson(lesson)}
                                  >
                                    <div className="ls-lesson-item-main">
                                      <span className="ls-lesson-item-title">
                                        {lesson.title}
                                      </span>
                                      <span className="ls-lesson-item-duration">
                                        {lesson.durationText}
                                      </span>
                                    </div>
                                  </button>
                                );
                              })
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}

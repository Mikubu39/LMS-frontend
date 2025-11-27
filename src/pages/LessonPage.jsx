/* eslint-disable react-refresh/only-export-components */
// src/pages/LessonPage.jsx
import { useMemo, useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { message, Spin, Empty, Button } from "antd";
import { QuestionCircleOutlined } from "@ant-design/icons";

import "../css/lesson.css";

// 👇 Import API & Component
import { CourseApi } from "@/services/api/courseApi";
import { SessionApi } from "@/services/api/sessionApi";
import { LessonApi } from "@/services/api/lessonApi";
import QuizRunner from "../components/QuizRunner";

/* ===== ICONS CUSTOM (GIỮ NGUYÊN TỪ CODE CŨ) ===== */
const VideoItemIcon = () => (
  <svg className="ls-icon" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M7.49951 1.5415H11.6665C11.6967 1.5415 11.7278 1.55395 11.7534 1.57959C11.7791 1.60523 11.7915 1.63636 11.7915 1.6665C11.7915 1.69665 11.7791 1.72777 11.7534 1.75342C11.7278 1.77906 11.6967 1.7915 11.6665 1.7915H7.49951C5.54356 1.79154 4.06827 2.13388 3.10107 3.10107C2.13388 4.06827 1.79154 5.54356 1.7915 7.49951V12.4995C1.7915 14.4554 2.13407 15.9307 3.10107 16.8979C4.06827 17.8651 5.54356 18.2085 7.49951 18.2085H12.4995C14.4556 18.2085 15.9307 17.8652 16.8979 16.8979C17.8652 15.9307 18.2085 14.4556 18.2085 12.4995V8.3335C18.2085 8.30335 18.2209 8.27223 18.2466 8.24658C18.2722 8.22094 18.3033 8.2085 18.3335 8.2085C18.3635 8.20858 18.3949 8.22103 18.4204 8.24658C18.4458 8.27216 18.4585 8.30348 18.4585 8.3335V12.4995C18.4585 14.7046 17.9856 16.1599 17.0728 17.0728C16.1599 17.9856 14.7046 18.4585 12.4995 18.4585H7.49951C5.29472 18.4584 3.84004 17.9854 2.92725 17.0728C2.01442 16.1599 1.5415 14.7046 1.5415 12.4995V7.49951C1.54155 5.29459 2.01446 3.84003 2.92725 2.92725C3.84003 2.01446 5.29459 1.54155 7.49951 1.5415Z" fill="#505050" stroke="#505050"/>
    <path d="M11.6216 1.55176C11.6553 1.53729 11.7097 1.53881 11.7593 1.58398L18.4214 8.24512C18.4558 8.27958 18.4658 8.33778 18.4487 8.37793C18.426 8.43102 18.3794 8.45788 18.3335 8.45801H14.9995C13.6206 8.45797 12.7974 8.18655 12.3052 7.69434C11.8131 7.20206 11.5415 6.37891 11.5415 5V1.66699C11.5415 1.64176 11.5494 1.61642 11.563 1.5957C11.5764 1.57541 11.5928 1.56258 11.6079 1.55664L11.6147 1.55469L11.6216 1.55176ZM11.7915 5C11.7915 6.07521 11.9199 6.94756 12.4858 7.51367C13.0519 8.07972 13.9243 8.20798 14.9995 8.20801H18.0317L11.7915 1.96777V5Z" fill="#505050" stroke="#505050"/>
    <path d="M10.8335 11.4585H5.8335C5.49183 11.4585 5.2085 11.1752 5.2085 10.8335C5.2085 10.4918 5.49183 10.2085 5.8335 10.2085H10.8335C11.1752 10.2085 11.4585 10.4918 11.4585 10.8335C11.4585 11.1752 11.1752 11.4585 10.8335 11.4585Z" fill="#505050"/>
    <path d="M9.16683 14.7915H5.8335C5.49183 14.7915 5.2085 14.5082 5.2085 14.1665C5.2085 13.8248 5.49183 13.5415 5.8335 13.5415H9.16683C9.5085 13.5415 9.79183 13.8248 9.79183 14.1665C9.79183 14.5082 9.5085 14.7915 9.16683 14.7915Z" fill="#505050"/>
  </svg>
);

const TimeSmallIcon = () => (
  <svg className="ls-icon" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M9.97461 1.5415C14.632 1.5415 18.4334 5.33444 18.4336 9.99951C18.4336 14.665 14.6401 18.4585 9.97461 18.4585C5.31726 18.4583 1.5166 14.6646 1.5166 9.99951C1.51678 5.33455 5.31737 1.54168 9.97461 1.5415ZM9.97461 1.7915C5.44872 1.79168 1.76678 5.47363 1.7666 9.99951C1.7666 14.5255 5.44862 18.2083 9.97461 18.2085C14.5008 18.2085 18.1836 14.5257 18.1836 9.99951C18.1834 5.47352 14.5006 1.7915 9.97461 1.7915Z" fill="#505050" stroke="#505050"/>
    <path d="M8.01758 6.93262C8.53335 6.63275 9.2441 6.6431 10.0664 7.11719H10.0674L12.4834 8.50879C13.304 8.98199 13.667 9.58939 13.667 10.1924C13.6668 10.7878 13.3028 11.4025 12.4834 11.875L10.0674 13.2666L10.0605 13.2705C9.60869 13.5402 9.1709 13.6582 8.7998 13.6582C8.51748 13.6582 8.25266 13.5882 8.02148 13.457C7.50455 13.154 7.1582 12.5339 7.1582 11.5918V8.7998C7.15831 7.85152 7.50081 7.2332 8.01758 6.93262ZM8.7998 6.97559C8.637 6.97559 8.46207 7.0016 8.29785 7.06836L8.14941 7.14258C7.59559 7.46321 7.40829 8.14433 7.4082 8.7998V11.5918C7.4082 12.2273 7.59002 12.921 8.14453 13.2373V13.2383C8.70726 13.562 9.39521 13.371 9.94531 13.0605L12.3662 11.667C12.9332 11.3373 13.4248 10.8314 13.4248 10.2002C13.4248 9.56661 12.9216 9.06128 12.3711 8.73633L9.94922 7.3418C9.57174 7.11732 9.17704 6.97559 8.7998 6.97559Z" fill="#505050" stroke="#505050"/>
  </svg>
);

const CheckIcon = () => (
  <svg className="ls-icon" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M9.99951 2.1665C14.3149 2.1665 17.8333 5.68414 17.8335 9.99951C17.8335 14.315 14.315 17.8335 9.99951 17.8335C5.68414 17.8333 2.1665 14.3149 2.1665 9.99951C2.16668 5.68424 5.68424 2.16668 9.99951 2.1665ZM14.3364 6.84619C13.8995 6.40952 13.1835 6.40952 12.7466 6.84619L8.81592 10.7759L7.25342 9.21338C6.81649 8.77645 6.09953 8.77645 5.6626 9.21338C5.22615 9.65026 5.22606 10.3664 5.6626 10.8032L8.021 13.1616C8.23036 13.371 8.51611 13.4917 8.81689 13.4917C9.11753 13.4916 9.40254 13.3709 9.61182 13.1616L14.3423 8.43115C14.7681 7.9907 14.7766 7.28636 14.3364 6.84619Z" fill="#12B76A" stroke="#12B76A"/>
  </svg>
);

const EssayClockIcon = () => (
  <svg className="lesson-essay-meta-icon" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M9.99996 1.6665C5.40829 1.6665 1.66663 5.40817 1.66663 9.99984C1.66663 14.5915 5.40829 18.3332 9.99996 18.3332C14.5916 18.3332 18.3333 14.5915 18.3333 9.99984C18.3333 5.40817 14.5916 1.6665 9.99996 1.6665ZM13.625 12.9748C13.5083 13.1748 13.3 13.2832 13.0833 13.2832C12.975 13.2832 12.8666 13.2582 12.7666 13.1915L10.1833 11.6498C9.54163 11.2665 9.06663 10.4248 9.06663 9.68317V6.2665C9.06663 5.92484 9.34996 5.6415 9.69163 5.6415C10.0333 5.6415 10.3166 5.92484 10.3166 6.2665V9.68317C10.3166 9.98317 10.5666 10.4248 10.825 10.5748L13.4083 12.1165C13.7083 12.2915 13.8083 12.6748 13.625 12.9748Z" fill="#676767"/>
  </svg>
);

const EssayUploadIcon = () => (
  <svg className="lesson-essay-upload-icon" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M7.76672 5.41654L9.90006 3.2832L12.0334 5.41654" stroke="white" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M9.90002 11.8168V3.3418" stroke="white" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M3.33337 10C3.33337 13.6833 5.83337 16.6667 10 16.6667C14.1667 16.6667 16.6667 13.6833 16.6667 10" stroke="white" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const AttachFileIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M17.8666 9.2081L10.2082 16.8664C9.27005 17.8046 7.99757 18.3317 6.67075 18.3317C5.34393 18.3317 4.07145 17.8046 3.13325 16.8664C2.19505 15.9282 1.66797 14.6558 1.66797 13.3289C1.66797 12.0021 2.19505 10.7296 3.13325 9.79144L10.7916 2.1331C11.4171 1.50763 12.2654 1.15625 13.1499 1.15625C14.0345 1.15625 14.8828 1.50763 15.5082 2.1331C16.1337 2.75857 16.4851 3.60689 16.4851 4.49144C16.4851 5.37598 16.1337 6.2243 15.5082 6.84977L7.84158 14.5081C7.52885 14.8208 7.10469 14.9965 6.66242 14.9965C6.22014 14.9965 5.79598 14.8208 5.48325 14.5081C5.17051 14.1954 4.99482 13.7712 4.99482 13.3289C4.99482 12.8867 5.17051 12.4625 5.48325 12.1498L12.5582 5.0831" stroke="#3D3D3D" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

/* ===== HELPER ===== */
function getYoutubeEmbedUrl(url) {
  if (!url) return "";
  try {
    const u = new URL(url);
    const v = u.searchParams.get("v");
    if (v) return `https://www.youtube.com/embed/${v}`;
    return url.replace("watch?v=", "embed/");
  } catch {
    return url;
  }
}

function getEssayDurationLabel(item) {
  if (!item || item.duration == null) return "";
  if (typeof item.duration === "number") return `${item.duration} phút`;
  return item.duration;
}

/* ===== PAGE ===== */

export default function LessonPage() {
  // 👇 1. Lấy courseId từ URL
  const { courseId } = useParams(); 
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [currentItem, setCurrentItem] = useState(null);

  const [loading, setLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [openSessions, setOpenSessions] = useState({});
  const [openLessons, setOpenLessons] = useState({});

  // State cho Modal Nộp bài (Essay)
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false); 
  
  // State cho Modal Quiz
  const [isQuizRunnerOpen, setIsQuizRunnerOpen] = useState(false);

  const isVideoItem = currentItem?.type === "Video";
  const isEssayItem = currentItem?.type === "Essay";
  const isTextItem = currentItem?.type === "Text"; 
  const isQuizItem = currentItem?.type === "Quiz";

  // --- Fetch Data Chính Xác Theo CourseID ---
  useEffect(() => {
    const fetchCourseData = async () => {
      if (!courseId) return;
      setLoading(true);
      try {
        // 1. Lấy thông tin khóa học (tiêu đề...)
        const courseInfo = await CourseApi.getCourseById(courseId);
        
        // 2. Lấy cấu trúc bài học chuẩn (Session -> Lesson -> Items)
        const sessionsData = await SessionApi.getSessionsByCourse(courseId);

        // 3. Sắp xếp dữ liệu (Session -> Lesson -> Items)
        const sortedSessions = (sessionsData || []).map(session => {
            const sortedLessons = (session.lessons || []).sort((a, b) => (a.order || 0) - (b.order || 0));
            sortedLessons.forEach(l => {
                if(l.items) l.items.sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0));
            });
            return { ...session, lessons: sortedLessons };
        }).sort((a, b) => (a.order || 0) - (b.order || 0));

        // 4. Gộp data
        const fullCourse = {
            ...courseInfo,
            sessions: sortedSessions
        };
        setCourse(fullCourse);

        // 5. Mở bài học đầu tiên mặc định
        const firstSession = sortedSessions[0];
        const firstLesson = firstSession?.lessons?.[0];
        if (firstLesson) {
            setOpenSessions(prev => ({ ...prev, [firstSession.id]: true }));
            setOpenLessons(prev => ({ ...prev, [firstLesson.id]: true }));
            
            if (firstLesson.items && firstLesson.items.length > 0) {
                setCurrentItem(firstLesson.items[0]);
            } else {
                setCurrentItem(null); 
            }
        }

      } catch (error) {
        console.error("Lỗi tải khóa học:", error);
        message.error("Không thể tải nội dung khóa học");
      } finally {
        setLoading(false);
      }
    };

    fetchCourseData();
  }, [courseId]);

  // --- HANDLERS ---

  const toggleSession = (sId) => {
    setOpenSessions((prev) => ({ ...prev, [sId]: !prev[sId] }));
  };

  const toggleLesson = (lId) => {
    setOpenLessons((prev) => ({ ...prev, [lId]: !prev[lId] }));
  };

  // Essay Submit Handlers
  const handleOpenSubmitModal = () => setIsSubmitModalOpen(true);
  const handleCloseSubmitModal = () => setIsSubmitModalOpen(false);
  const handleSubmitAssignment = (e) => {
    e.preventDefault();
    message.success("Đã gửi bài (demo)");
    setIsSubmitModalOpen(false);
  };

  // Quiz Handlers
  const handleStartQuiz = () => {
    setIsQuizRunnerOpen(true);
  };

  const currentVideoUrl = useMemo(
    () => isVideoItem && currentItem?.videoUrl ? getYoutubeEmbedUrl(currentItem.videoUrl) : "",
    [currentItem, isVideoItem]
  );

  if (loading) return <div className="lesson-page"><div className="lesson-main"><Spin tip="Đang tải..." size="large" style={{marginTop: 50}}/></div></div>;
  if (!course) return <div className="lesson-page"><div className="lesson-main"><Empty description="Không tìm thấy khóa học" style={{marginTop: 50}}/></div></div>;

  return (
    <div className="lesson-page">
      <div className="lesson-main">
        <div className="lesson-breadcrumb">Trang chủ / <span>{course.title}</span></div>

        <div className={`lesson-layout ${isSidebarOpen ? "" : "sidebar-collapsed"}`}>
          {/* ==== LEFT: Main content ==== */}
          <div className="lesson-left">
            <div className="lesson-header-row">
              <h1 className="lesson-course-title">{currentItem?.title || course.title}</h1>
              <div className="lesson-nav">
                <button className="lesson-nav-btn">Bài trước</button>
                <span className="lesson-nav-divider" />
                <button className="lesson-nav-btn lesson-nav-btn-next">Bài tiếp theo</button>
              </div>
            </div>

            {/* MODE: VIDEO */}
            {isVideoItem && (
              <>
                <div className="lesson-video-wrapper">
                  {currentVideoUrl ? (
                    <iframe className="lesson-video-iframe" src={currentVideoUrl} title="Video" allowFullScreen />
                  ) : <div className="lesson-video-placeholder">Video không khả dụng</div>}
                </div>
                <div className="lesson-info-row">
                    <h2>{currentItem.title}</h2>
                </div>
              </>
            )}

            {/* MODE: ESSAY (Tự luận) */}
            {isEssayItem && (
              <div className="lesson-essay-wrapper">
                <div className="lesson-essay-meta-row">
                  <div className="lesson-essay-meta-time"><EssayClockIcon /><span>Bài tập • {getEssayDurationLabel(currentItem)}</span></div>
                </div>
                <section className="lesson-essay-card">
                  {currentItem.textContent ? (
                    <div className="lesson-essay-content" dangerouslySetInnerHTML={{ __html: currentItem.textContent }} />
                  ) : <Empty description="Không có nội dung đề bài" />}
                </section>
                <div className="lesson-essay-footer">
                  <button className="lesson-essay-submit-btn" onClick={handleOpenSubmitModal}><EssayUploadIcon /><span>Nộp bài</span></button>
                </div>
              </div>
            )}

            {/* MODE: TEXT (Bài đọc) */}
            {isTextItem && (
               <div className="lesson-essay-wrapper"> 
                  <section className="lesson-essay-card" style={{minHeight: 400, padding: 40}}>
                     {currentItem.textContent ? (
                        <div className="lesson-text-content" dangerouslySetInnerHTML={{ __html: currentItem.textContent }} />
                     ) : <Empty description="Nội dung trống" />}
                  </section>
               </div>
            )}

            {/* MODE: QUIZ (Trắc nghiệm) */}
            {isQuizItem && (
               <div className="lesson-essay-wrapper">
                  <div className="lesson-quiz-intro" style={{ padding: 60, textAlign: 'center', background: '#fff', borderRadius: 8 }}>
                      <QuestionCircleOutlined style={{ fontSize: 64, color: '#faad14', marginBottom: 24 }} />
                      <h2 style={{fontSize: 24, marginBottom: 12}}>Bài kiểm tra trắc nghiệm</h2>
                      <p style={{color: '#666', fontSize: 16}}>Bạn cần hoàn thành bài kiểm tra này để được tính điểm.</p>
                      <Button type="primary" size="large" onClick={handleStartQuiz} style={{ marginTop: 24, height: 48, padding: '0 40px', fontSize: 16 }}>
                          Bắt đầu làm bài
                      </Button>
                  </div>
               </div>
            )}

            {/* Fallback */}
            {!isVideoItem && !isEssayItem && !isTextItem && !isQuizItem && (
              <div className="lesson-video-placeholder"><span className="lesson-video-placeholder-text">Chọn nội dung bên phải để học</span></div>
            )}
          </div>

          {/* ==== RIGHT: Sidebar ==== */}
          {isSidebarOpen ? (
            <aside className="lesson-sidebar">
              <div className="lesson-sidebar-header lesson-sidebar-toggle" onClick={() => setIsSidebarOpen(false)}>
                <div className="lesson-sidebar-title-row"><span className="lesson-sidebar-menu-icon">≡</span><span className="lesson-sidebar-title">Nội dung khóa học</span></div>
                <span className="lesson-sidebar-collapse">⌃</span>
              </div>

              <div className="lesson-sidebar-content">
                {course.sessions.map((session, sIndex) => {
                    const isSessionOpen = openSessions[session.id] ?? false;
                    return (
                      <div key={session.id} className="ls-section">
                        <div className="ls-section-header" onClick={() => toggleSession(session.id)}>
                          <div><span className="ls-section-name">Chương {sIndex + 1}:</span><span className="ls-section-title"> {session.title}</span></div>
                          <span className="ls-section-chevron">{isSessionOpen ? "⌃" : "⌄"}</span>
                        </div>

                        {isSessionOpen && session.lessons.map((lesson, lIndex) => {
                              const isLessonOpen = openLessons[lesson.id] ?? false;
                              return (
                                <div key={lesson.id} className="ls-lesson-block">
                                  <div className="ls-lesson-title" onClick={() => toggleLesson(lesson.id)}>
                                    <span>{lIndex + 1}. {lesson.title}</span>
                                    <span className="ls-lesson-chevron">{isLessonOpen ? "⌃" : "⌄"}</span>
                                  </div>

                                  {isLessonOpen && lesson.items && (
                                      <div className="ls-items">
                                        {lesson.items.map((item) => {
                                          const isActive = currentItem && currentItem.id === item.id;
                                          return (
                                            <button
                                              key={item.id}
                                              className={`ls-item-row ${isActive ? "is-active" : ""}`}
                                              onClick={() => setCurrentItem(item)}
                                            >
                                              <div className="ls-item-icon-col"><VideoItemIcon /></div>
                                              <div className="ls-item-main">
                                                <div className="ls-item-title">{item.title}</div>
                                                <div className="ls-item-meta">
                                                   <span className="ls-badge">{item.type}</span>
                                                   {item.duration && <span className="ls-time-text">{item.duration}p</span>}
                                                </div>
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
                    );
                  })}
              </div>
            </aside>
          ) : (
            <aside className="lesson-sidebar lesson-sidebar--collapsed">
              <button className="lesson-sidebar-collapsed-btn" onClick={() => setIsSidebarOpen(true)}>
                <span className="lesson-sidebar-menu-icon">≡</span>
              </button>
            </aside>
          )}
        </div>

        {/* ===== POPUP NỘP BÀI ===== */}
        {isSubmitModalOpen && (
          <div className="lesson-submit-modal-backdrop" onClick={handleCloseSubmitModal}>
            <div className="lesson-submit-modal" onClick={(e) => e.stopPropagation()}>
              <form onSubmit={handleSubmitAssignment}>
                <div className="lesson-submit-modal-header"><h2 className="lesson-submit-modal-title">Nộp bài</h2></div>
                <div className="lesson-submit-modal-body">
                  <div className="lesson-submit-field"><label className="lesson-submit-label">Bài học</label><input className="lesson-submit-input" type="text" defaultValue={currentItem?.title} disabled/></div>
                  <div className="lesson-submit-field"><label className="lesson-submit-label">Link Github</label><input className="lesson-submit-input" type="text" placeholder="https://github.com/…" /></div>
                </div>
                <div className="lesson-submit-modal-footer">
                  <button type="button" className="lesson-submit-btn lesson-submit-btn-cancel" onClick={handleCloseSubmitModal}>Hủy</button>
                  <button type="submit" className="lesson-submit-btn lesson-submit-btn-primary"><span>Nộp bài</span></button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ===== QUIZ RUNNER COMPONENT ===== */}
        <QuizRunner 
            isOpen={isQuizRunnerOpen}
            onClose={() => setIsQuizRunnerOpen(false)}
            quizId={currentItem?.resource_quiz_id} 
            lessonItemId={currentItem?.id}
            onComplete={() => console.log("Đã làm xong quiz")}
        />

      </div>
    </div>
  );
}
/* eslint-disable react-refresh/only-export-components */
// src/pages/LessonPage.jsx
import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { message, Spin, Empty, Button, Progress, Tag } from "antd";
import { CheckCircleFilled } from "@ant-design/icons";

import "../css/lesson.css";
import quizCatImg from "../assets/khongchotua.png"; 

// 👇 Import API & Component & Selectors
import { CourseApi } from "@/services/api/courseApi";
import { SessionApi } from "@/services/api/sessionApi";
import { SubmissionApi } from "@/services/api/submissionApi";
import { ProgressApi } from "@/services/api/progressApi"; 
import { selectUser } from "@/redux/authSlice"; 

import QuizRunner from "../components/QuizRunner";
import YouTubeSecurePlayer from "../components/YouTubeSecurePlayer"; 

/* ===== ICONS CUSTOM ===== */
const VideoItemIcon = () => (
  <svg className="ls-icon" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M7.49951 1.5415H11.6665C11.6967 1.5415 11.7278 1.55395 11.7534 1.57959C11.7791 1.60523 11.7915 1.63636 11.7915 1.6665C11.7915 1.69665 11.7791 1.72777 11.7534 1.75342C11.7278 1.77906 11.6967 1.7915 11.6665 1.7915H7.49951C5.54356 1.79154 4.06827 2.13388 3.10107 3.10107C2.13388 4.06827 1.79154 5.54356 1.7915 7.49951V12.4995C1.7915 14.4554 2.13407 15.9307 3.10107 16.8979C4.06827 17.8651 5.54356 18.2085 7.49951 18.2085H12.4995C14.4556 18.2085 15.9307 17.8652 16.8979 16.8979C17.8652 15.9307 18.2085 14.4556 18.2085 12.4995V8.3335C18.2085 8.30335 18.2209 8.27223 18.2466 8.24658C18.2722 8.22094 18.3033 8.2085 18.3335 8.2085C18.3635 8.20858 18.3949 8.22103 18.4204 8.24658C18.4458 8.27216 18.4585 8.30348 18.4585 8.3335V12.4995C18.4585 14.7046 17.9856 16.1599 17.0728 17.0728C16.1599 17.9856 14.7046 18.4585 12.4995 18.4585H7.49951C5.29472 18.4584 3.84004 17.9854 2.92725 17.0728C2.01442 16.1599 1.5415 14.7046 1.5415 12.4995V7.49951C1.54155 5.29459 2.01446 3.84003 2.92725 2.92725C3.84003 2.01446 5.29459 1.54155 7.49951 1.5415Z" fill="#505050" stroke="#505050" />
    <path d="M11.6216 1.55176C11.6553 1.53729 11.7097 1.53881 11.7593 1.58398L18.4214 8.24512C18.4558 8.27958 18.4658 8.33778 18.4487 8.37793C18.426 8.43102 18.3794 8.45788 18.3335 8.45801H14.9995C13.6206 8.45797 12.7974 8.18655 12.3052 7.69434C11.8131 7.20206 11.5415 6.37891 11.5415 5V1.66699C11.5415 1.64176 11.5494 1.61642 11.563 1.5957C11.5764 1.57541 11.5928 1.56258 11.6079 1.55664L11.6147 1.55469L11.6216 1.55176ZM11.7915 5C11.7915 6.07521 11.9199 6.94756 12.4858 7.51367C13.0519 8.07972 13.9243 8.20798 14.9995 8.20801H18.0317L11.7915 1.96777V5Z" fill="#505050" stroke="#505050" />
    <path d="M10.8335 11.4585H5.8335C5.49183 11.4585 5.2085 11.1752 5.2085 10.8335C5.2085 10.4918 5.49183 10.2085 5.8335 10.2085H10.8335C11.1752 10.2085 11.4585 10.4918 11.4585 10.8335C11.4585 11.1752 11.1752 11.4585 10.8335 11.4585Z" fill="#505050" />
    <path d="M9.16683 14.7915H5.8335C5.49183 14.7915 5.2085 14.5082 5.2085 14.1665C5.2085 13.8248 5.49183 13.5415 5.8335 13.5415H9.16683C9.5085 13.5415 9.79183 13.8248 9.79183 14.1665C9.79183 14.5082 9.5085 14.7915 9.16683 14.7915Z" fill="#505050" />
  </svg>
);

const EssayClockIcon = () => (
  <svg className="lesson-essay-meta-icon" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M9.99996 1.6665C5.40829 1.6665 1.66663 5.40817 1.66663 9.99984C1.66663 14.5915 5.40829 18.3332 9.99996 18.3332C14.5916 18.3332 18.3333 14.5915 18.3333 9.99984C18.3333 5.40817 14.5916 1.6665 9.99996 1.6665ZM13.625 12.9748C13.5083 13.1748 13.3 13.2832 13.0833 13.2832C12.975 13.2832 12.8666 13.2582 12.7666 13.1915L10.1833 11.6498C9.54163 11.2665 9.06663 10.4248 9.06663 9.68317V6.2665C9.06663 5.92484 9.34996 5.6415 9.69163 5.6415C10.0333 5.6415 10.3166 5.92484 10.3166 6.2665V9.68317C10.3166 9.98317 10.5666 10.4248 10.825 10.5748L13.4083 12.1165C13.7083 12.2915 13.8083 12.6748 13.625 12.9748Z" fill="#676767" />
  </svg>
);

const EssayUploadIcon = () => (
  <svg className="lesson-essay-upload-icon" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M7.76672 5.41654L9.90006 3.2832L12.0334 5.41654" stroke="white" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M9.90002 11.8168V3.3418" stroke="white" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M3.33337 10C3.33337 13.6833 5.83337 16.6667 10 16.6667C14.1667 16.6667 16.6667 13.6833 16.6667 10" stroke="white" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const ArrowRightIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M11.6667 5.8335L15.8333 10.0002M15.8333 10.0002L11.6667 14.1668M15.8333 10.0002H4.16667" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

/* ===== HELPER ===== */
function getEssayDurationLabel(item) {
  if (!item || item.duration == null) return "";
  if (typeof item.duration === "number") return `${item.duration} phút`;
  return item.duration;
}

function getQuizQuestionLabel(item) {
  if (!item) return "";
  const questionCount =
    item.questionCount ??
    item.totalQuestions ??
    item.quizQuestionsCount ??
    (Array.isArray(item.questions) ? item.questions.length : undefined);

  return questionCount ? ` • ${questionCount} câu hỏi` : "";
}

// Hàm lấy ID Video từ URL Youtube
function getYoutubeId(url) {
    if(!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
}

// Hàm tạo key lưu trữ nháp cho LocalStorage (Essay)
const getDraftKey = (itemId) => `essay_draft_${itemId}`;

/* ===== PAGE ===== */

export default function LessonPage() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  
  const user = useSelector(selectUser);
  const userId = user?.id;

  const [course, setCourse] = useState(null);
  const [currentItem, setCurrentItem] = useState(null);

  // 🟢 STATE CHO SECURE PLAYER & API
  const [currentContext, setCurrentContext] = useState({});
  const [videoInitialData, setVideoInitialData] = useState(null);
  const [isVideoLoading, setIsVideoLoading] = useState(false);

  const [loading, setLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [openSessions, setOpenSessions] = useState({});
  const [openLessons, setOpenLessons] = useState({});

  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [gitLink, setGitLink] = useState("");
  const [description, setDescription] = useState("");
  const [submitLoading, setSubmitLoading] = useState(false);
  
  const [currentSubmission, setCurrentSubmission] = useState(null);
  const [isQuizRunnerOpen, setIsQuizRunnerOpen] = useState(false);
  
  // State quản lý hiển thị badge hoàn thành trên UI
  const [isItemCompleted, setIsItemCompleted] = useState(false);

  // State: Tiến độ đọc Text (0-100)
  const [textProgress, setTextProgress] = useState(0);

  // Auto-scroll
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [courseId]);

  const isVideoItem = currentItem?.type === "Video";
  const isEssayItem = currentItem?.type === "Essay";
  const isTextItem = currentItem?.type === "Text";
  const isQuizItem = currentItem?.type === "Quiz";

  // 🔥 🟢 HÀM CHUNG ĐỂ LƯU TIẾN ĐỘ CHO TEXT / ESSAY / QUIZ
  const handleUpdateProgress = async (status = 'completed', percentage = 100) => {
    if (!userId || !currentItem) return;

    try {
      await ProgressApi.upsert({
        userId: userId,
        courseId: courseId,
        sessionId: currentContext.sessionId,
        lessonId: currentContext.lessonId,
        lessonItemId: currentItem.id,
        status: status,
        percentage: percentage,
        lastPosition: 0 // Text/Essay/Quiz ko cần lastPosition
      });

      if (status === 'completed' || percentage === 100) {
        setIsItemCompleted(true);
        if (isTextItem) setTextProgress(100);
        message.success("Đã hoàn thành bài học!");
      }
    } catch (error) {
      console.error("Lỗi lưu tiến độ:", error);
    }
  };

  /* ===== TEXT PROGRESS (SCROLL TO FINISH) ===== */
  const textEndRef = useRef(null); 

  useEffect(() => {
    // Chỉ chạy nếu là Text và chưa hoàn thành
    if (!isTextItem || !textEndRef.current || !currentItem || isItemCompleted) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          console.log("Đã cuộn hết bài Text -> Đánh dấu hoàn thành");
          
          // 🔥 🟢 Gọi hàm lưu tiến độ
          handleUpdateProgress('completed', 100);
          
          observer.disconnect();
        }
      },
      { threshold: 0.1 } 
    );
    observer.observe(textEndRef.current);
    return () => observer.disconnect();
  }, [currentItem, isTextItem, isItemCompleted]); 

  // Logic tính toán % cuộn trang thực tế (UI Only)
  useEffect(() => {
    if (!isTextItem) return;
    if (isItemCompleted) { setTextProgress(100); } else { setTextProgress(0); }

    const handleScroll = () => {
        const scrollTop = window.scrollY;
        const windowHeight = window.innerHeight;
        const docHeight = document.documentElement.scrollHeight;
        const totalScrollable = docHeight - windowHeight;

        if (totalScrollable <= 0) {
            setTextProgress(100);
            return;
        }
        let percent = Math.round((scrollTop / totalScrollable) * 100);
        if (percent > 100) percent = 100;
        // Chỉ update state UI nếu chưa completed để tránh re-render nhiều
        if (!isItemCompleted) setTextProgress(percent);
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isTextItem, currentItem, isItemCompleted]);


  const isSubmissionGraded =
    currentSubmission &&
    (currentSubmission.status === "GRADED" ||
      typeof currentSubmission.score === "number");

  // --- Load hàm helper để đọc Draft Essay ---
  const loadDraftFromStorage = (itemId) => {
    try {
      const key = getDraftKey(itemId);
      const savedDraft = localStorage.getItem(key);
      if (savedDraft) {
        const parsedDraft = JSON.parse(savedDraft);
        setGitLink(parsedDraft.gitLink || "");
        setDescription(parsedDraft.description || "");
        return true;
      }
    } catch (e) {
      console.error("Lỗi đọc draft:", e);
    }
    return false;
  };

  // --- Fetch Data Course ---
  useEffect(() => {
    const fetchCourseData = async () => {
      if (!courseId) return;
      setLoading(true);
      try {
        const courseInfo = await CourseApi.getCourseById(courseId);
        const sessionsData = await SessionApi.getSessionsByCourse(courseId);

        const sortedSessions = (sessionsData || [])
          .map((session) => {
            const sortedLessons = (session.lessons || []).sort(
              (a, b) => (a.order || 0) - (b.order || 0)
            );
            sortedLessons.forEach((l) => {
              if (l.items)
                l.items.sort(
                  (a, b) => (a.orderIndex || 0) - (b.orderIndex || 0)
                );
            });
            return { ...session, lessons: sortedLessons };
          })
          .sort((a, b) => (a.order || 0) - (b.order || 0));

        const fullCourse = { ...courseInfo, sessions: sortedSessions };
        setCourse(fullCourse);

        // Mặc định mở bài đầu tiên
        const firstSession = sortedSessions[0];
        const firstLesson = firstSession?.lessons?.[0];
        if (firstLesson) {
          setOpenSessions((prev) => ({ ...prev, [firstSession.id]: true }));
          setOpenLessons((prev) => ({ ...prev, [firstLesson.id]: true }));
          if (firstLesson.items && firstLesson.items.length > 0) {
            const firstItem = firstLesson.items[0];
            setCurrentItem(firstItem);
            
            if(userId) {
                setCurrentContext({
                    userId: userId,
                    courseId: courseId,
                    sessionId: firstSession.id,
                    lessonId: firstLesson.id,
                    lessonItemId: firstItem.id
                });
            }
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
  }, [courseId, userId]);

  // ⭐⭐ FETCH SUBMISSION & VIDEO PROGRESS ⭐⭐
  useEffect(() => {
    setIsQuizRunnerOpen(false);
    setIsItemCompleted(false);
    setTextProgress(0);
    setVideoInitialData(null); 

    setGitLink("");
    setDescription("");
    setCurrentSubmission(null);
    
    if (!currentItem || !userId) return;

    // A. LOGIC LOAD TIẾN ĐỘ VIDEO TỪ API
    if (currentItem.type === "Video") {
        const fetchVideoProgress = async () => {
            setIsVideoLoading(true);
            try {
                // Gọi API lấy progress
                const res = await ProgressApi.get({
                    userId: userId,
                    lessonItemId: currentItem.id,
                    courseId: courseId
                });
                
                // 🔥 🟢 FIX LOGIC LẤY DATA (Xử lý Array/Object)
                // Lấy data thực từ response axios
                const responseData = res.data ? res.data : res; 
                // Nếu Backend trả về mảng [progress], lấy phần tử đầu tiên
                const data = Array.isArray(responseData) ? responseData[0] : responseData;

                if (data) {
                    console.log("🔥 Loaded Progress:", data);
                    setVideoInitialData({
                        lastPosition: data.lastPosition || 0,
                        percentage: data.percentage || 0,
                        status: data.status
                    });

                    if (data.status === 'completed' || data.percentage >= 95) {
                        setIsItemCompleted(true);
                    }
                } else {
                    setVideoInitialData({ lastPosition: 0, percentage: 0, status: 'new' });
                }

            } catch (err) {
                console.warn("Lỗi fetch video progress:", err);
                setVideoInitialData({ lastPosition: 0, percentage: 0, status: 'error' });
            } finally {
                setIsVideoLoading(false);
            }
        };
        fetchVideoProgress();
    }

    // B. LOGIC ESSAY (SUBMISSION)
    if (currentItem.type === "Essay") {
      const fetchSubmission = async () => {
        try {
          const data = await SubmissionApi.getSubmissionByLessonItemId(currentItem.id);
          if (data) {
            setCurrentSubmission(data);
            setGitLink(data.gitLink || "");
            setDescription(data.description || "");
            localStorage.removeItem(getDraftKey(currentItem.id));
            
            // Nếu đã nộp bài thì coi như hoàn thành (hoặc check status nếu cần)
            setIsItemCompleted(true);
          } else {
            loadDraftFromStorage(currentItem.id);
          }
        } catch (err) {
            loadDraftFromStorage(currentItem.id);
        }
      };
      fetchSubmission();
    }
    
    // C. LOGIC TEXT / QUIZ CHECK COMPLETED (Optional: Nếu BE trả về)
    if (isTextItem || isQuizItem) {
        // Tái sử dụng ProgressApi.get để check đã hoàn thành chưa
        const checkStatus = async () => {
            try {
                const res = await ProgressApi.get({ userId, lessonItemId: currentItem.id });
                const responseData = res.data ? res.data : res; 
                const data = Array.isArray(responseData) ? responseData[0] : responseData;
                if(data && data.status === 'completed') {
                    setIsItemCompleted(true);
                    if(isTextItem) setTextProgress(100);
                }
            } catch(e) {}
        }
        checkStatus();
    }

  }, [currentItem, userId, courseId, isTextItem, isQuizItem]);

  // ⭐⭐ AUTO-SAVE DRAFT ⭐⭐
  useEffect(() => {
    if (currentItem?.type === "Essay") {
        const key = getDraftKey(currentItem.id);
        const draftData = { gitLink, description };
        localStorage.setItem(key, JSON.stringify(draftData));
    }
  }, [gitLink, description, currentItem]);

  // Handle Video Complete Callback
  const handleVideoComplete = () => {
      setIsItemCompleted(true);
  };

  const toggleSession = (sId) => {
    setOpenSessions((prev) => ({ ...prev, [sId]: !prev[sId] }));
  };

  const toggleLesson = (lId) => {
    setOpenLessons((prev) => ({ ...prev, [lId]: !prev[lId] }));
  };

  const handleOpenSubmitModal = () => {
    if (!currentItem || !isEssayItem) {
      message.warning("Chỉ có thể nộp bài cho bài tập tự luận.");
      return;
    }
    setIsSubmitModalOpen(true);
  };

  const handleCloseSubmitModal = () => {
    if (submitLoading) return;
    setIsSubmitModalOpen(false);
  };

  const handleSubmitAssignment = async (e) => {
    e.preventDefault();
    if (!currentItem?.id) return;
    if (!gitLink.trim()) {
      message.warning("Vui lòng nhập đường dẫn bài làm.");
      return;
    }

    const payload = {
      lessonItemId: currentItem.id,
      gitLink: gitLink.trim(),
      description: description.trim() || undefined,
    };

    try {
      setSubmitLoading(true);
      if (currentSubmission && !isSubmissionGraded) {
        const updated = await SubmissionApi.updateSubmission(
          currentSubmission.id,
          payload
        );
        message.success("Cập nhật bài nộp thành công!");
        setCurrentSubmission(updated || { ...currentSubmission, ...payload });
      } else {
        const created = await SubmissionApi.createSubmission(payload);
        message.success("Nộp bài thành công!");
        setCurrentSubmission(created || { ...payload, status: "PENDING" });
      }

      // 🔥 🟢 LƯU TIẾN ĐỘ NGAY KHI NỘP BÀI
      await handleUpdateProgress('completed', 100);

      localStorage.removeItem(getDraftKey(currentItem.id));
      setIsSubmitModalOpen(false);
    } catch (error) {
      if (currentSubmission && error?.response?.status === 404) {
         try {
           const created = await SubmissionApi.createSubmission(payload);
           message.success("Nộp bài thành công (Tạo mới)!");
           setCurrentSubmission(created || { ...payload, status: "PENDING" });
           
           // Lưu tiến độ khi tạo lại
           await handleUpdateProgress('completed', 100);
           
           localStorage.removeItem(getDraftKey(currentItem.id));
           setIsSubmitModalOpen(false);
           return;
         } catch (e2) {}
      }
      const errMsg = error?.response?.data?.message || error?.message || "Có lỗi xảy ra";
      message.error(Array.isArray(errMsg) ? errMsg[0] : errMsg);
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleStartQuiz = () => {
    setIsQuizRunnerOpen(true);
  };

  if (loading)
    return (
      <div className="lesson-page">
        <div className="lesson-main">
          <div style={{ marginTop: 50 }}>
            <Spin tip="Đang tải..." size="large" spinning>
              <div style={{ minHeight: 120 }} />
            </Spin>
          </div>
        </div>
      </div>
    );

  if (!course)
    return (
      <div className="lesson-page">
        <div className="lesson-main">
          <Empty description="Không tìm thấy khóa học" style={{ marginTop: 50 }} />
        </div>
      </div>
    );

  return (
    <div className="lesson-page">
      <div className="lesson-main">
        <div className="lesson-breadcrumb">
          Trang chủ / <span>{course.title}</span>
        </div>

        <div className={`lesson-layout ${isSidebarOpen ? "" : "sidebar-collapsed"}`}>
          {/* ==== LEFT: Main content ==== */}
          <div className="lesson-left">
            <div className="lesson-header-row">
              <h1 className="lesson-course-title" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                {currentItem?.title || course.title}

                {/* 👇 HIỂN THỊ TRẠNG THÁI HOÀN THÀNH */}
                {isItemCompleted && (
                    <Tag 
                        color="#039855" 
                        style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: 4, 
                            fontSize: 14, 
                            padding: '4px 10px',
                            borderRadius: 20,
                            fontWeight: 600,
                            backgroundColor: '#ECFDF3',
                            color: '#027A48',
                            border: '1px solid #D1FADF',
                            marginTop: 4
                        }}
                    >
                        <CheckCircleFilled /> Hoàn thành
                    </Tag>
                  )}
              </h1>

              {/* 👇 PHẦN ĐIỀU HƯỚNG */}
              <div className="lesson-nav" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                
                {isTextItem && (
                  <>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Progress 
                            type="circle" 
                            percent={isItemCompleted ? 100 : textProgress} 
                            width={34} 
                            strokeWidth={10}
                            strokeColor="#E65D25" 
                            trailColor="#F2F4F7"
                        />
                        <span className="hidden-mobile" style={{ fontSize: 13, fontWeight: 600, color: '#475467' }}>
                            {isItemCompleted ? 100 : textProgress}%
                        </span>
                    </div>
                    <div style={{ width: 1, height: 24, background: '#EAECF0' }} className="hidden-mobile"></div>
                  </>
                )}

                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <button className="lesson-nav-btn">Bài trước</button>
                    <span className="lesson-nav-divider" />
                    <button className="lesson-nav-btn lesson-nav-btn-next">
                      Bài tiếp theo
                    </button>
                </div>
              </div>
            </div>

            {/* 👇👇👇 MODE: VIDEO 👇👇👇 */}
            {isVideoItem && (
              <>
                <div className="lesson-video-wrapper" style={{ aspectRatio: '16/9', backgroundColor: '#000', borderRadius: 8, overflow: 'hidden' }}>
                  {isVideoLoading ? (
                    <div style={{height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column'}}>
                        <Spin size="large" />
                        <div style={{marginTop: 10, color: '#fff'}}>Đang đồng bộ dữ liệu học tập...</div>
                    </div>
                  ) : currentItem?.videoUrl ? (
                    <YouTubeSecurePlayer
                        videoId={getYoutubeId(currentItem.videoUrl)}
                        contextData={currentContext} 
                        initialData={videoInitialData}
                        onComplete={handleVideoComplete}
                        onProgress={(percent) => {
                             console.log("Current Percent:", percent);
                        }}
                    />
                  ) : (
                    <div className="lesson-video-placeholder">
                      Video không khả dụng
                    </div>
                  )}
                </div>

                <div className="lesson-info-row">
                  <h2>{currentItem.title}</h2>
                </div>
              </>
            )}

            {/* MODE: ESSAY */}
            {isEssayItem && (
              <div className="lesson-essay-wrapper">
                <div className="lesson-essay-meta-row">
                  <div className="lesson-essay-meta-time">
                    <EssayClockIcon />
                    <span>Bài tập • {getEssayDurationLabel(currentItem)}</span>
                  </div>
                </div>
                <section className="lesson-essay-card">
                  {currentItem.textContent ? (
                    <div
                      className="lesson-essay-content"
                      dangerouslySetInnerHTML={{ __html: currentItem.textContent }}
                    />
                  ) : (
                    <Empty description="Không có nội dung đề bài" />
                  )}
                </section>
                
                <div className="lesson-essay-footer" style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    {!currentSubmission && (
                      <button className="lesson-essay-submit-btn" onClick={handleOpenSubmitModal}>
                        <EssayUploadIcon />
                        <span>Nộp bài</span>
                      </button>
                    )}
                    {currentSubmission && !isSubmissionGraded && (
                      <button
                        className="lesson-essay-submit-btn lesson-essay-submit-btn--secondary"
                        onClick={handleOpenSubmitModal}
                        style={{ marginLeft: 0 }} 
                      >
                        <EssayUploadIcon />
                        <span>Sửa link bài nộp</span>
                      </button>
                    )}
                  </div>

                  {true && (
                    <div style={{ marginTop: 24, width: '100%', backgroundColor: '#F9FAFB', border: '1px solid #EAECF0', borderRadius: 12, padding: 24 }}>
                      <h4 style={{ margin: '0 0 16px', fontSize: 16, fontWeight: 700, color: '#101828' }}>
                        Kết quả bài làm 
                      </h4>
                      <div style={{ display: 'flex', gap: 32, alignItems: 'flex-start', flexWrap: 'wrap' }}>
                        <div style={{ textAlign: 'center', minWidth: 80 }}>
                          <div style={{ fontSize: 14, color: '#667085', marginBottom: 4 }}>Điểm số</div>
                          <div style={{ fontSize: 32, fontWeight: 800, color: (currentSubmission?.score ?? 8.5) >= 5 ? '#039855' : '#D92D20', lineHeight: 1 }}>
                            {currentSubmission?.score ?? 7.5}
                            <span style={{ fontSize: 16, color: '#98A2B3', fontWeight: 600 }}>/10</span>
                          </div>
                        </div>
                        <div style={{ width: 1, height: 60, backgroundColor: '#EAECF0' }} className="hidden-mobile"></div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 14, color: '#667085', marginBottom: 6 }}>Nhận xét của giảng viên</div>
                          <div style={{ fontSize: 16, color: '#101828', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>
                            {currentSubmission?.feedback || currentSubmission?.comment || "Bài làm tốt, cấu trúc rõ ràng."}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* MODE: TEXT */}
            {isTextItem && (
              <div className="lesson-essay-wrapper">
                <section className="lesson-essay-card" style={{ minHeight: 400, padding: 40 }}>
                  {currentItem.textContent ? (
                    <>
                      <div
                        className="lesson-text-content"
                        dangerouslySetInnerHTML={{ __html: currentItem.textContent }}
                      />
                      {/* Thẻ div rỗng để IntersectionObserver bắt sự kiện cuộn hết */}
                      <div ref={textEndRef} style={{ width: '100%', height: 1 }} />
                    </>
                  ) : (
                    <Empty description="Nội dung trống" />
                  )}
                </section>
              </div>
            )}

            {/* MODE: QUIZ */}
            {isQuizItem && (
              <div className="lesson-essay-wrapper lesson-quiz-wrapper">
                {!isQuizRunnerOpen ? (
                  <section className="lesson-quiz-hero" style={{ textAlign: 'center', padding: '40px 20px' }}>
                      <div style={{ marginBottom: 20 }}>
                        <img src={quizCatImg} alt="Quiz illustration" style={{ maxWidth: '280px', height: 'auto' }} />
                      </div>
                      <h2 style={{ fontSize: 32, fontWeight: 700, marginBottom: 8, color: '#101828' }}>
                        [Quizz] {currentItem?.title || "Bài kiểm tra"}
                      </h2>
                      <p style={{ color: '#667085', fontSize: 16, marginBottom: 16 }}>
                        Bài kiểm tra {getQuizQuestionLabel(currentItem)}
                      </p>
                      <p style={{ color: '#667085', maxWidth: 600, margin: '0 auto 32px', lineHeight: 1.6 }}>
                        {currentItem?.description || "Mô tả bài kiểm tra..."}
                      </p>
                      <Button 
                        type="primary" 
                        size="large"
                        onClick={handleStartQuiz}
                        style={{ backgroundColor: '#E65D25', borderColor: '#E65D25', height: 48, padding: '0 24px', fontSize: 16, fontWeight: 600, borderRadius: 8, display: 'inline-flex', alignItems: 'center', gap: 8 }}
                      >
                        Bắt đầu làm bài <ArrowRightIcon />
                      </Button>
                  </section>
                ) : (
                  <QuizRunner
                    isOpen={isQuizRunnerOpen}
                    onClose={() => setIsQuizRunnerOpen(false)}
                    quizId={currentItem?.resource_quiz_id}
                    lessonItemId={currentItem?.id}
                    // 🔥 🟢 GỌI HÀM LƯU TIẾN ĐỘ KHI QUIZ XONG
                    onComplete={() => {
                        console.log("Đã làm xong quiz");
                        handleUpdateProgress('completed', 100);
                        setIsQuizRunnerOpen(false); 
                    }}
                  />
                )}
              </div>
            )}

            {!isVideoItem && !isEssayItem && !isTextItem && !isQuizItem && (
              <div className="lesson-video-placeholder">
                <span className="lesson-video-placeholder-text">Chọn nội dung bên phải để học</span>
              </div>
            )}
          </div>

          {/* ==== RIGHT: Sidebar ==== */}
          {isSidebarOpen ? (
            <aside className="lesson-sidebar">
              <div className="lesson-sidebar-header lesson-sidebar-toggle" onClick={() => setIsSidebarOpen(false)}>
                <div className="lesson-sidebar-title-row">
                  <span className="lesson-sidebar-menu-icon">≡</span>
                  <span className="lesson-sidebar-title">Nội dung khóa học</span>
                </div>
                <span className="lesson-sidebar-collapse">⌃</span>
              </div>

              <div className="lesson-sidebar-content">
                {course.sessions.map((session, sIndex) => {
                  const isSessionOpen = openSessions[session.id] ?? false;
                  return (
                    <div key={session.id} className="ls-section">
                      <div className="ls-section-header" onClick={() => toggleSession(session.id)}>
                        <div>
                          <span className="ls-section-name">Chương {sIndex + 1}:</span>
                          <span className="ls-section-title"> {session.title}</span>
                        </div>
                        <span className="ls-section-chevron">{isSessionOpen ? "⌃" : "⌄"}</span>
                      </div>
                      {isSessionOpen &&
                        session.lessons.map((lesson, lIndex) => {
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
                                        onClick={() => {
                                            setCurrentItem(item);
                                            setCurrentContext({
                                                userId: userId,
                                                courseId: courseId,
                                                sessionId: session.id,
                                                lessonId: lesson.id,
                                                lessonItemId: item.id
                                            });
                                        }}
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
                <div className="lesson-submit-modal-header">
                  <h2 className="lesson-submit-modal-title">
                    {currentSubmission && !isSubmissionGraded ? "Sửa bài nộp" : "Nộp bài"}
                  </h2>
                </div>
                <div className="lesson-submit-modal-body">
                  <div className="lesson-submit-field">
                    <label className="lesson-submit-label">Bài học</label>
                    <input className="lesson-submit-input" type="text" value={currentItem?.title || ""} disabled />
                  </div>
                  <div className="lesson-submit-field">
                    <label className="lesson-submit-label">Đường dẫn bài làm</label>
                    <input
                      className="lesson-submit-input"
                      type="text"
                      placeholder="Ví dụ: link GitHub, Google Drive, Docs, v.v."
                      value={gitLink}
                      onChange={(e) => setGitLink(e.target.value)}
                    />
                  </div>
                </div>
                <div className="lesson-submit-modal-footer">
                  <button type="button" className="lesson-submit-btn lesson-submit-btn-cancel" onClick={handleCloseSubmitModal} disabled={submitLoading}>
                    Hủy
                  </button>
                  <button type="submit" className="lesson-submit-btn lesson-submit-btn-primary" disabled={submitLoading}>
                    <span>{submitLoading ? "Đang xử lý..." : currentSubmission && !isSubmissionGraded ? "Lưu thay đổi" : "Nộp bài"}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
// src/pages/Home.jsx
import { useEffect, useState } from "react";
import { FloatButton } from "antd"; 
import { MessageOutlined } from "@ant-design/icons"; 
import io from 'socket.io-client'; 

import Hero from "../components/Hero";
import CourseCard from "../components/CourseCard";
import ChatWidget from "../components/ChatWidget"; 
import "../css/home.css";

import { CourseApi } from "@/services/api/courseApi";
import { ChatApi } from "@/services/api/chatApi"; 

const PAGE_SIZE = 12;

export default function Home() {
  const [courses, setCourses] = useState([]);
  const [meta, setMeta] = useState({
    page: 1,
    limit: PAGE_SIZE,
    total: 0,
  });
  const [loading, setLoading] = useState(false);

  // State cho Chat & Badge
  const [chatOpen, setChatOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0); 

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchCourses(1);
    
    // 👇 LOGIC USER & SOCKET
    try {
      const userStr = localStorage.getItem("user");
      if (userStr) {
        const user = JSON.parse(userStr);
        setCurrentUser(user);

        // 1. Gọi API lấy số lượng tin chưa đọc ban đầu
        ChatApi.getUnreadCount()
          .then((res) => setUnreadCount(res.count))
          .catch((err) => console.error("Lỗi lấy unread count:", err));

        // 👇 2. KẾT NỐI SOCKET VỚI USER ID (QUAN TRỌNG)
        const socket = io('http://localhost:3000', {
            query: { userId: user.user_id } // Gửi ID để Backend biết đường bắn thông báo
        });
        
        socket.on('receiveMessage', (newMsg) => {
          // Nếu có tin nhắn mới VÀ người gửi không phải là mình
          if (newMsg.sender.user_id !== user.user_id) {
             // Tăng số lượng tin chưa đọc lên 1
             setUnreadCount((prev) => prev + 1);
          }
        });

        return () => {
          socket.disconnect();
        };
      }
    } catch (error) {
      console.error("Lỗi đọc user home", error);
    }
  }, []);

  const fetchCourses = async (page = 1) => {
    try {
      setLoading(true);
      const { courses, meta: apiMeta } = await CourseApi.getCourses({
        page,
        limit: PAGE_SIZE,
      });

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

  const normalizeCourse = (raw) => {
    if (!raw) return null;
    return {
      id: raw.id ?? raw.course_id ?? raw.courseId,
      title: raw.title ?? raw.name ?? raw.course_name,
      image: raw.thumbnail ?? raw.image ?? "/src/assets/course card.jpg",
      level: raw.level ?? "Beginner",
      minutes: raw.minutes ?? raw.totalMinutes ?? raw.duration ?? 0,
      modules: raw.modules ?? raw.totalModules ?? raw.lessonCount ?? 0,
      teacher: raw.teacher ?? raw.instructorName ?? raw.instructor?.fullName ?? "Giang Sensei",
    };
  };

  const handleChangePage = (page) => {
    if (page < 1 || page > totalPages) return;
    fetchCourses(page);
  };

  const handleOpenChat = () => {
    setChatOpen(true);
    setUnreadCount(0); // Reset badge
  };

  return (
    <div className="home-page">
      <Hero />

      <section className="home-courses-section">
        <div className="home-container">
          <h2 className="home-courses-title">TẤT CẢ KHÓA HỌC</h2>
          {/* ... (Phần hiển thị khóa học giữ nguyên) ... */}
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

          <div className="home-pagination">
             {/* ... (Code phân trang giữ nguyên) ... */}
            <button className="home-page-btn" onClick={() => handleChangePage(meta.page - 1)} disabled={meta.page <= 1}>{"<"}</button>
            {Array.from({ length: totalPages }).map((_, idx) => (
                <button key={idx + 1} className={"home-page-btn " + (idx + 1 === meta.page ? "home-page-btn--active" : "")} onClick={() => handleChangePage(idx + 1)}>{idx + 1}</button>
            ))}
            <button className="home-page-btn" onClick={() => handleChangePage(meta.page + 1)} disabled={meta.page >= totalPages}>{">"}</button>
          </div>
        </div>
      </section>

      {/* 👇 Nút Chat Nổi */}
      {currentUser && (
        <FloatButton
          icon={<MessageOutlined />}
          type="primary"
          style={{ right: 24, bottom: 24, width: 50, height: 50 }}
          onClick={handleOpenChat}
          // 👇 LOGIC HIỂN THỊ DOT: Chỉ hiện count nếu > 0
          badge={{ count: unreadCount, overflowCount: 99 }} 
          tooltip="Hỗ trợ học tập"
        />
      )}

      <ChatWidget 
        open={chatOpen} 
        onClose={() => setChatOpen(false)} 
        currentUser={currentUser}
      />
    </div>
  );
}
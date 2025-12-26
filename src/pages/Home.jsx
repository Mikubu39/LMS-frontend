// src/pages/Home.jsx
import { useEffect, useState, useRef } from "react";
import { FloatButton, message } from "antd"; 
import { MessageOutlined } from "@ant-design/icons"; 
import io from 'socket.io-client'; 
import { useNavigate } from "react-router-dom";

import Hero from "../components/Hero";
import CourseCard from "../components/CourseCard";
import ChatWidget from "../components/ChatWidget"; 
import "../css/home.css";

import { UserApi } from "@/services/api/userApi"; // 👈 Đổi/Thêm import này
import { ChatApi } from "@/services/api/chatApi"; 
import { ClassApi } from "@/services/api/classApi"; 

export default function Home() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Mapping: { [courseId]: classId }
  const [myClasses, setMyClasses] = useState({});

  // Chat State
  const [chatOpen, setChatOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0); 
  const chatOpenRef = useRef(chatOpen);

  useEffect(() => {
    chatOpenRef.current = chatOpen;
  }, [chatOpen]);

  useEffect(() => {
    window.scrollTo(0, 0);
    
    // Kiểm tra user đăng nhập
    try {
      const userStr = localStorage.getItem("user");
      if (userStr) {
        const user = JSON.parse(userStr);
        setCurrentUser(user);

        // 1. Gọi API lấy mapping lớp học để biết classId điều hướng
        ClassApi.getMyEnrollments()
          .then((data) => {
              if (Array.isArray(data)) {
                  const mapping = {};
                  data.forEach(enrol => {
                      const cId = enrol.courseId || enrol.course?.id || enrol.course_id;
                      const clId = enrol.classId || enrol.class?.id || enrol.class_id || enrol.id;
                      if(cId && clId) {
                          mapping[cId] = clId;
                      }
                  });
                  setMyClasses(mapping);
              }
          })
          .catch(err => console.log("Lỗi load lớp:", err));

        // 2. Gọi API lấy danh sách khóa học CỦA TÔI
        fetchMyCourses();

        // Chat logic
        ChatApi.getUnreadCount()
          .then((res) => setUnreadCount(res.count))
          .catch((err) => console.error(err));

        const socket = io(import.meta.env.VITE_API_BASE_URL, { query: { userId: user.user_id } });
        socket.on('receiveMessage', (newMsg) => {
          if (newMsg.sender.user_id !== user.user_id) {
             if (!chatOpenRef.current) {
                setUnreadCount((prev) => prev + 1);
             }
          }
        });
        return () => { socket.disconnect(); };
      } else {
        // Nếu chưa đăng nhập, set rỗng hoặc điều hướng về Login tùy bạn
        setCourses([]);
      }
    } catch (error) { console.error("Lỗi đọc user home", error); }
  }, []);

  // 👇 Thay đổi logic fetch: Gọi UserApi.getMyCourses
  const fetchMyCourses = async () => {
    try {
      setLoading(true);
      const res = await UserApi.getMyCourses();
      // Backend trả về { courses: [...] }
      setCourses(res.courses || []);
    } catch (err) { 
      console.error(err); 
      message.error("Không thể tải danh sách khóa học của bạn");
    } finally { 
      setLoading(false); 
    }
  };

  const normalizeCourse = (raw) => {
    if (!raw) return null;
    const cId = raw.id;
    
    return {
      id: cId,
      // Kiểm tra classId từ mapping (thường API getMyCourses sẽ trả về khóa học đã enroll nên chắc chắn có classId)
      classId: myClasses[cId] || null, 
      
      title: raw.title,
      image: raw.thumbnail || "/src/assets/course card.jpg",
      level: raw.level || "Beginner",
      // Các trường này lấy từ DTO mới cập nhật
      minutes: raw.duration || 0,
      modules: raw.modules || 0,
      teacher: raw.teacherName || "Giang Sensei",
    };
  };

  const handleCourseClick = (course) => {
      if (course.classId) {
          navigate(`/class/${course.classId}/lesson/${course.id}`);
      } else {
          // Trường hợp hiếm: Có trong list myCourses nhưng chưa load xong myClasses mapping
          message.warning("Đang đồng bộ thông tin lớp học, vui lòng thử lại...");
      }
  };

  const handleOpenChat = () => setChatOpen(true);

  return (
    <div className="home-page">
      <Hero />
      <section className="home-courses-section">
         <div className="home-container">
          <h2 className="home-courses-title">KHÓA HỌC CỦA TÔI</h2> 
          
          {loading ? (
             <div className="home-courses-loading">Đang tải khóa học...</div>
          ) : !currentUser ? (
             <div className="home-courses-empty">Vui lòng đăng nhập để xem khóa học.</div>
          ) : courses.length === 0 ? (
             <div className="home-courses-empty">Bạn chưa đăng ký khóa học nào.</div>
          ) : (
             <div className="home-courses-grid">
               {courses.map((item) => { 
                   const c = normalizeCourse(item); 
                   return c ? (
                       <div key={c.id} onClick={() => handleCourseClick(c)} style={{ cursor: 'pointer' }}>
                           <CourseCard c={c} />
                       </div>
                   ) : null; 
               })}
             </div>
          )}

           {/* Ẩn phân trang vì API My Courses thường trả về list full */}
           {/* Nếu muốn phân trang client-side thì code thêm logic slice mảng courses */}
        </div>
      </section>

      {currentUser && (
        <FloatButton
          icon={<MessageOutlined />}
          type="primary"
          style={{ right: 24, bottom: 24, width: 50, height: 50 }}
          onClick={handleOpenChat}
          badge={{ count: unreadCount, overflowCount: 99 }} 
          tooltip="Hỗ trợ học tập"
        />
      )}

      <ChatWidget 
        open={chatOpen} 
        onClose={() => setChatOpen(false)} 
        currentUser={currentUser}
        onRead={() => setUnreadCount(0)} 
      />
    </div>
  );
}

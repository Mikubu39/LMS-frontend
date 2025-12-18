// src/App.jsx
import { Routes, Route, Navigate, useLocation } from "react-router-dom";

import Header from "./components/Header.jsx";
import Footer from "./components/Footer.jsx";

import Home from "./pages/Home.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Login from "./pages/auth/Login.jsx";
import Profile from "./pages/Profile.jsx";
import LessonPage from "./pages/LessonPage.jsx";
import Posts from "./pages/Posts.jsx";
import PostDetail from "./pages/PostDetail.jsx";
import RequireAuth from "./pages/auth/RequireAuth.jsx";
import SearchPage from "./pages/Search.jsx";
import EssayManagementPage from "./pages/EssayManagementPage.jsx";

// 🟢 Client Pages
import TopicsPage from "./pages/TopicsPage.jsx";
import TopicDetailPage from "./pages/TopicDetailPage.jsx";

// ===== ADMIN PAGES =====
import AdminLayout from "./layouts/AdminLayout.jsx";
import AdminDashboard from "./pages/admin/AdminDashboard.jsx";
import CourseManagement from "./pages/admin/CourseManagement.jsx";
import CourseManager from "./pages/admin/CourseManager.jsx";    
import PostManagement from "./pages/admin/PostManagement.jsx";   
import QuestionManager from "./pages/admin/QuestionManager.jsx";
import QuizManager from "./pages/admin/QuizManager.jsx"
import ClassManagement from "./pages/admin/ClassManagement.jsx";
import ClassDetail from "./pages/admin/ClassDetail.jsx"
import StudentManager from "./pages/admin/StudentManager.jsx";
import TeacherManager from "./pages/admin/TeacherManager.jsx";
import AdminProfile from "./pages/admin/AdminProfile";    
import AdminSettings from "./pages/admin/AdminSettings";

// 🟢 Admin Topic Management
import TopicManager from "./pages/admin/TopicManager.jsx";
// 🟢 MỚI THÊM: Import trang Quản lý từ vựng riêng biệt
import VocabularyManager from "./pages/admin/VocabularyManager.jsx";

// ===== TEACHER PAGES & LAYOUT =====
import TeacherLayout from "./layouts/TeacherLayout.jsx";
import TeacherDashboard from "./pages/teacher/TeacherDashboard.jsx";
import TeacherCourseManagement from "./pages/teacher/TeacherCourseManagement.jsx"; 
import TeacherClassManagement from "./pages/teacher/TeacherClassManagement.jsx"; 
import TeacherClassDetail from "./pages/teacher/TeacherClassDetail.jsx";
import TeacherPostManagement from "./pages/teacher/TeacherPostManagement.jsx";

export default function App() {
  const location = useLocation();
  const isAuthPage = location.pathname.startsWith("/login");
  const isAdminDomain = location.pathname.startsWith("/admin");
  const isTeacherDomain = location.pathname.startsWith("/teacher");

  const isDashBoardLike = isAuthPage || isAdminDomain || isTeacherDomain;
  const mainMinHeight = isDashBoardLike ? "100vh" : "calc(100vh - 64px - 160px)";

  return (
    <div className="app-shell">
      {!isAuthPage && !isAdminDomain && !isTeacherDomain && <Header />}

      <main
        style={{
          minHeight: mainMinHeight,
          backgroundColor: isDashBoardLike ? "#ffffff" : "#f5f5f7",
          paddingTop: isDashBoardLike ? 0 : 24,
        }}
      >
        <Routes>
          <Route path="/login" element={<Login />} />

          {/* ===== PUBLIC / STUDENT ROUTES ===== */}
          <Route element={<RequireAuth />}>
            <Route path="/" element={<Home />} />
            <Route path="/posts" element={<Posts />} />
            <Route path="/posts/:postId" element={<PostDetail />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/profile" element={<Profile />} />
            
            <Route path="/class/:classId/lesson/:courseId" element={<LessonPage />} />
            <Route path="/search" element={<SearchPage />} />
            
            {/* Route Client: Danh sách & Chi tiết chủ đề */}
            <Route path="/topics" element={<TopicsPage />} />
            <Route path="/topics/:slug" element={<TopicDetailPage />} />
            
            <Route path="/my-essays" element={<EssayManagementPage />} />
          </Route>

          {/* ===== TEACHER ROUTES ===== */}
          <Route element={<RequireAuth allowedRoles={["teacher", "admin"]} />}>
             <Route path="/teacher/*" element={<TeacherLayout />}>
                <Route index element={<TeacherDashboard />} />
                <Route path="dashboard" element={<TeacherDashboard />} />
                
                <Route path="classes" element={<TeacherClassManagement />} />
                <Route path="classes/:classId" element={<TeacherClassDetail />} />
                
                <Route path="courses" element={<TeacherCourseManagement />} />
                <Route path="courses/:courseId/manage" element={<CourseManager />} />
                
                <Route path="question-banks" element={<QuizManager />} />
                <Route path="questions" element={<QuestionManager />} />
                
                <Route path="posts" element={<TeacherPostManagement />} />
                
                <Route path="profile" element={<AdminProfile />} /> 
                <Route path="settings" element={<AdminSettings />} />
             </Route>
          </Route>

          {/* ===== ADMIN ROUTES ===== */}
          <Route element={<RequireAuth allowedRoles={["admin"]} />}>
            <Route path="/admin/*" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="courses" element={<CourseManagement />} />
              <Route path="courses/:courseId/manage" element={<CourseManager />} />
              
              {/* 🟢 QUẢN LÝ CHỦ ĐỀ & TỪ VỰNG */}
              <Route path="topics" element={<TopicManager />} />
              {/* Route con để quản lý từ vựng của 1 chủ đề cụ thể */}
              <Route path="topics/:topicId/vocab" element={<VocabularyManager />} />

              <Route path="question-banks" element={<QuizManager />} />
              <Route path="questions" element={<QuestionManager />} />
              <Route path="classes" element={<ClassManagement />} />
              <Route path="classes/:classId" element={<ClassDetail />} /> 
              <Route path="posts" element={<PostManagement />} />
              <Route path="students" element={<StudentManager />} />
              <Route path="teachers" element={<TeacherManager />} />
              <Route path="profile" element={<AdminProfile />} />
              <Route path="settings" element={<AdminSettings />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {!isAuthPage && !isAdminDomain && !isTeacherDomain && <Footer />}
    </div>
  );
}
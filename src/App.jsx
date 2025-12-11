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
import SearchPage from "./pages/Search.jsx"
// ===== ADMIN PAGES =====
import AdminProfile from "./pages/admin/AdminProfile";   
import AdminSettings from "./pages/admin/AdminSettings";
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

// ===== TEACHER =====
import TeacherDashboard from "./pages/teacher/TeacherDashboard.jsx";

export default function App() {
  const location = useLocation();

  // Ẩn Header/Footer ở trang login
  const isAuthPage = location.pathname.startsWith("/login");
  // Ẩn Header/Footer ở domain admin (admin có layout riêng)
  const isAdminDomain = location.pathname.startsWith("/admin");

  const mainMinHeight =
    isAuthPage || isAdminDomain
      ? "100vh"
      : "calc(100vh - 64px - 160px)"; // trừ header + footer tương đối

  return (
    <div className="app-shell">
      {/* Header chỉ xuất hiện ở student / teacher, KHÔNG hiển thị ở /login và /admin */}
      {!isAuthPage && !isAdminDomain && <Header />}

      {/* Thân trang: chứa các route */}
      <main
        style={{
          minHeight: mainMinHeight,
          backgroundColor: isAuthPage || isAdminDomain ? "#ffffff" : "#f5f5f7",
          paddingTop: isAuthPage || isAdminDomain ? 0 : 24,
        }}
      >
        <Routes>
          {/* ========= AUTH PUBLIC ========= */}
          <Route path="/login" element={<Login />} />

          {/* ========= STUDENT DOMAIN ========= */}
          <Route element={<RequireAuth />}>
            <Route path="/" element={<Home />} />
            <Route path="/posts" element={<Posts />} />
            <Route path="/posts/:postId" element={<PostDetail />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/lesson/:courseId" element={<LessonPage />} />
            <Route path="/search" element={<SearchPage />} />
          </Route>

          {/* ========= TEACHER DOMAIN ========= */}
          <Route element={<RequireAuth allowedRoles={["teacher", "admin"]} />}>
            <Route
              path="/teacher"
              element={<Navigate to="/teacher/dashboard" replace />}
            />
            <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
            {/* sau này có thể thêm: /teacher/courses, /teacher/lessons,... */}
          </Route>

          {/* ========= ADMIN DOMAIN ========= */}
          <Route element={<RequireAuth allowedRoles={["admin"]} />}>
            <Route path="/admin/*" element={<AdminLayout />}>
              {/* /admin */}
              <Route index element={<AdminDashboard />} />

              {/* /admin/courses - danh sách khoá */}
              <Route path="courses" element={<CourseManagement />} />

              {/* /admin/courses/:courseId/manage - quản lý khoá (giống ảnh bạn gửi) */}
              <Route
                path="courses/:courseId/manage"
                element={<CourseManager />}
              />
              <Route path="question-banks" element={<QuizManager />} />
              <Route path="questions" element={<QuestionManager />} />
              <Route path="classes" element={<ClassManagement />} />
              <Route path="classes/:classId" element={<ClassDetail />} /> {/* Route Mới */}
              {/* /admin/posts - quản lý bài viết */}
              <Route path="posts" element={<PostManagement />} />
              <Route path="students" element={<StudentManager />} />
              <Route path="teachers" element={<TeacherManager />} />
              {/* sau này thêm: /admin/classes, /admin/users,... */}
              <Route path="profile" element={<AdminProfile />} />
              <Route path="settings" element={<AdminSettings />} />
            </Route>
          </Route>

          {/* Fallback: route lạ -> về trang chủ (student) */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* Footer chỉ xuất hiện ở student / teacher */}
      {!isAuthPage && !isAdminDomain && <Footer />}
    </div>
  );
}

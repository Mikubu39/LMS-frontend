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

// ===== ADMIN PAGES =====
import AdminLayout from "./layouts/AdminLayout.jsx";
import AdminDashboard from "./pages/admin/AdminDashboard.jsx";
import CourseManagement from "./pages/admin/CourseManagement.jsx";
import CourseManager from "./pages/admin/CourseManager.jsx";      // 👈 trang quản lý 1 khoá
import PostManagement from "./pages/admin/PostManagement.jsx";   // 👈 quản lý bài viết

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

              {/* /admin/posts - quản lý bài viết */}
              <Route path="posts" element={<PostManagement />} />

              {/* sau này thêm: /admin/classes, /admin/users,... */}
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

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

// ===== TEACHER =====
import TeacherDashboard from "./pages/teacher/TeacherDashboard.jsx";

export default function App() {
  const location = useLocation();
  const isAuthPage = location.pathname.startsWith("/login");
  const isAdminDomain = location.pathname.startsWith("/admin");
  const mainMinHeight = isAuthPage || isAdminDomain ? "100vh" : "calc(100vh - 64px - 160px)";

  return (
    <div className="app-shell">
      {!isAuthPage && !isAdminDomain && <Header />}

      <main
        style={{
          minHeight: mainMinHeight,
          backgroundColor: isAuthPage || isAdminDomain ? "#ffffff" : "#f5f5f7",
          paddingTop: isAuthPage || isAdminDomain ? 0 : 24,
        }}
      >
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route element={<RequireAuth />}>
            <Route path="/" element={<Home />} />
            <Route path="/posts" element={<Posts />} />
            <Route path="/posts/:postId" element={<PostDetail />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/profile" element={<Profile />} />
            
            {/* 👇 SỬA ROUTE NÀY: Dùng Params thay vì Query String */}
            <Route path="/class/:classId/lesson/:courseId" element={<LessonPage />} />
            
            <Route path="/search" element={<SearchPage />} />
            <Route path="/my-essays" element={<EssayManagementPage />} />
          </Route>

          <Route element={<RequireAuth allowedRoles={["teacher", "admin"]} />}>
            <Route path="/teacher" element={<Navigate to="/teacher/dashboard" replace />} />
            <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
          </Route>

          <Route element={<RequireAuth allowedRoles={["admin"]} />}>
            <Route path="/admin/*" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="courses" element={<CourseManagement />} />
              <Route path="courses/:courseId/manage" element={<CourseManager />} />
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

      {!isAuthPage && !isAdminDomain && <Footer />}
    </div>
  );
}
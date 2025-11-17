// src/App.jsx
import { Routes, Route, Navigate, useLocation } from "react-router-dom";

import Header from "./components/Header.jsx";
import Footer from "./components/Footer.jsx";

import Dashboard from "./pages/Dashboard.jsx";
import Login from "./pages/auth/Login.jsx";
import Profile from "./pages/Profile.jsx";       // 👈 THÊM: trang hồ sơ
import RequireAuth from "./pages/auth/RequireAuth.jsx"; // guard đăng nhập

export default function App() {
  const location = useLocation();

  // 👇 Chỉ ẩn Header/Footer ở trang login
  const isAuthPage = location.pathname.startsWith("/login");

  const mainMinHeight = isAuthPage
    ? "100vh"
    : "calc(100vh - 64px - 160px)"; // trừ header + footer tương đối

  return (
    <div className="app-shell">
      {/* Chỉ hiển thị Header nếu KHÔNG phải trang login */}
      {!isAuthPage && <Header />}

      {/* Thân trang: chứa các route */}
      <main
        style={{
          minHeight: mainMinHeight,
          backgroundColor: isAuthPage ? "#ffffff" : "#f5f5f7",
          paddingTop: isAuthPage ? 0 : 24,
        }}
      >
        <Routes>
          {/* Mặc định truy cập "/" thì vào trang đăng nhập */}
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* Trang đăng nhập */}
          <Route path="/login" element={<Login />} />

          {/* Các route cần đăng nhập */}
          <Route element={<RequireAuth />}>
            {/* Trang dashboard sau khi đăng nhập */}
            <Route path="/dashboard" element={<Dashboard />} />

            {/* 👇 Trang hồ sơ, đi từ "Hồ sơ của tôi" trong Header */}
            <Route path="/profile" element={<Profile />} />
          </Route>

          {/* Fallback: route không khớp -> về /login */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </main>

      {/* Chỉ hiển thị Footer nếu KHÔNG phải trang login */}
      {!isAuthPage && <Footer />}
    </div>
  );
}

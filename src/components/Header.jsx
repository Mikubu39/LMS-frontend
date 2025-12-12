// src/components/Header.jsx
import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import logo from "../assets/logo.png";
import "../css/header.css";

import {
  selectUser,
  selectIsAuthenticated,
  logout,
} from "../redux/authSlice";

/* ========== ICONS ========== */
const SearchIcon = () => (
  <svg className="mk-icon" width="24" height="24" viewBox="0 0 24 24" fill="none">
    <path d="M11.5 21.75C5.85 21.75 1.25 17.15 1.25 11.5C1.25 5.85 5.85 1.25 11.5 1.25C17.15 1.25 21.75 5.85 21.75 11.5C21.75 17.15 17.15 21.75 11.5 21.75ZM11.5 2.75C6.67 2.75 2.75 6.68 2.75 11.5C2.75 16.32 6.67 20.25 11.5 20.25C16.33 20.25 20.25 16.32 20.25 11.5C20.25 6.68 16.33 2.75 11.5 2.75Z" fill="#292D32" />
    <path d="M22.0004 22.75C21.8104 22.75 21.6204 22.68 21.4704 22.53L19.4704 20.53C19.1804 20.24 19.1804 19.76 19.4704 19.47C19.7604 19.18 20.2404 19.18 20.5304 19.47L22.5304 21.47C22.8204 21.76 22.8204 22.24 22.5304 22.53C22.3804 22.68 22.1904 22.75 22.0004 22.75Z" fill="#292D32" />
  </svg>
);

const BellIcon = () => (
  <svg className="mk-icon" width="24" height="24" viewBox="0 0 24 24" fill="none">
    <path d="M12.0199 20.53C9.68987 20.53 7.35987 20.16 5.14987 19.42C4.30987 19.13 3.66987 18.54 3.38987 17.77C3.09987 17 3.19987 16.15 3.65987 15.39L4.80987 13.48C5.04987 13.08 5.26987 12.28 5.26987 11.81V8.92001C5.26987 5.20001 8.29987 2.17001 12.0199 2.17001C15.7399 2.17001 18.7699 5.20001 18.7699 8.92001V11.81C18.7699 12.27 18.9899 13.08 19.2299 13.49L20.3699 15.39C20.7999 16.11 20.8799 16.98 20.5899 17.77C20.2999 18.56 19.6699 19.16 18.8799 19.42C16.6799 20.16 14.3499 20.53 12.0199 20.53Z" fill="#292D32" />
    <path d="M13.8796 3.93999C13.8096 3.93999 13.7396 3.92999 13.6696 3.90999C13.3796 3.82999 13.0996 3.76999 12.8296 3.72999C11.9796 3.61999 11.1596 3.67999 10.3896 3.90999C10.1096 3.99999 9.80963 3.90999 9.61963 3.69999C9.42963 3.48999 9.36963 3.18999 9.47963 2.91999C9.88963 1.86999 10.8896 1.17999 12.0296 1.17999C13.1696 1.17999 14.1696 1.85999 14.5796 2.91999C14.6796 3.18999 14.6296 3.48999 14.4396 3.69999C14.2896 3.85999 14.0796 3.93999 13.8796 3.93999Z" fill="#292D32" />
    <path d="M12.0195 22.81C11.0295 22.81 10.0695 22.41 9.36953 21.71C8.66953 21.01 8.26953 20.05 8.26953 19.06H9.76953C9.76953 19.65 10.0095 20.23 10.4295 20.65C10.8495 21.07 11.4295 21.31 12.0195 21.31C13.2595 21.31 14.2695 20.3 14.2695 19.06H15.7695C15.7695 21.13 14.0895 22.81 12.0195 22.81Z" fill="#292D32" />
  </svg>
);

const HomeIcon = () => (
  <svg className="mk-menu-icon" width="24" height="24" viewBox="0 0 24 24" fill="none">
    <path d="M17.79 22.75H6.21C3.47 22.75 1.25 20.52 1.25 17.78V10.37C1.25 9.01 2.09 7.3 3.17 6.46L8.56 2.26C10.18 1 12.77 0.94 14.45 2.12L20.63 6.45C21.82 7.28 22.75 9.06 22.75 10.51V17.79C22.75 20.52 20.53 22.75 17.79 22.75ZM9.48 3.44L4.09 7.64C3.38 8.2 2.75 9.47 2.75 10.37V17.78C2.75 19.69 4.3 21.25 6.21 21.25H17.79C19.7 21.25 21.25 19.7 21.25 17.79V10.51C21.25 9.55 20.56 8.22 19.77 7.68L13.59 3.35C12.45 2.55 10.57 2.59 9.48 3.44Z" fill="#292D32" />
    <path d="M12 18.75C11.59 18.75 11.25 18.41 11.25 18V15C11.25 14.59 11.59 14.25 12 14.25C12.41 14.25 12.75 14.59 12.75 15V18C12.75 18.41 12.41 18.75 12 18.75Z" fill="#292D32" />
  </svg>
);

const PostsIcon = () => (
  <svg className="mk-menu-icon" width="24" height="24" viewBox="0 0 24 24" fill="none">
    <path d="M3.5 18.75C3.09 18.75 2.75 18.41 2.75 18V7C2.75 2.59 4.09 1.25 8.5 1.25H15.5C19.91 1.25 21.25 2.59 21.25 7V17C21.25 17.16 21.25 17.31 21.24 17.47C21.21 17.88 20.84 18.2 20.44 18.17C20.03 18.14 19.71 17.78 19.74 17.37C19.75 17.25 19.75 17.12 19.75 17V7C19.75 3.43 19.08 2.75 15.5 2.75H8.5C4.92 2.75 4.25 3.43 4.25 7V18C4.25 18.41 3.91 18.75 3.5 18.75Z" fill="#292D32" />
    <path d="M17 22.75H7C4.66 22.75 2.75 20.84 2.75 18.5V17.85C2.75 15.86 4.37 14.25 6.35 14.25H20.5C20.91 14.25 21.25 14.59 21.25 15V18.5C21.25 20.84 19.34 22.75 17 22.75ZM6.35 15.75C5.19 15.75 4.25 16.69 4.25 17.85V18.5C4.25 20.02 5.48 21.25 7 21.25H17C18.52 21.25 19.75 20.02 19.75 18.5V15.75H6.35Z" fill="#292D32" />
    <path d="M16 7.75H8C7.59 7.75 7.25 7.41 7.25 7C7.25 6.59 7.59 6.25 8 6.25H16C16.41 6.25 16.75 6.59 16.75 7C16.75 7.41 16.41 7.75 16 7.75Z" fill="#292D32" />
    <path d="M13 11.25H8C7.59 11.25 7.25 10.91 7.25 10.5C7.25 10.09 7.59 9.75 8 9.75H13C13.41 9.75 13.75 10.09 13.75 10.5C13.75 10.91 13.41 11.25 13 11.25Z" fill="#292D32" />
  </svg>
);

/* fallback avatar */
const DEFAULT_AVATAR =
  "https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg";

/* ========== COMPONENT ========== */
export default function Header() {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const user = useSelector(selectUser);
  const isAuth = useSelector(selectIsAuthenticated);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(e.target)) setOpen(false);
    };
    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const handleLogout = () => {
    dispatch(logout());
    setOpen(false);
    navigate("/login");
  };

  const handleGoProfile = () => {
    setOpen(false);
    navigate("/profile");
  };

  const handleGoMyCourses = () => {
    setOpen(false);
    navigate("/dashboard");
  };
  
  // 👇 Đã thêm hàm điều hướng sang trang My Essays
  const handleGoMyEssays = () => {
    setOpen(false);
    navigate("/my-essays");
  };

  // click icon tìm kiếm -> /search
  const handleGoSearch = () => {
    navigate("/search");
  };

  const avatarSrc = user?.avatar || DEFAULT_AVATAR;
  const displayName = user?.name || user?.full_name || "Khách";
  const displayEmail = user?.email || "guest@example.com";

  return (
    <div className="mk-header-wrapper">
      <header className="mk-header">
        <div className="mk-header-left">
          {/* Logo: click sang Dashboard */}
          <Link to="/dashboard" className="mk-header-logo">
            <img src={logo} alt="Mankai Academy" />
          </Link>

          <span className="mk-header-sep" />

          <nav className="mk-header-nav">
            {/* Trang chủ */} 
            <Link to="/" className="mk-header-link">
              <HomeIcon />
              <span>Trang chủ</span>
            </Link>

            {/* Bài viết */}
            <Link to="/posts" className="mk-header-link">
              <PostsIcon />
              <span>Bài viết</span>
            </Link>
          </nav>
        </div>

        <div className="mk-header-right" ref={menuRef}>
          <button
            className="mk-icon-button"
            aria-label="Tìm kiếm"
            onClick={handleGoSearch}
          >
            <SearchIcon />
          </button>

          <button className="mk-icon-button" aria-label="Thông báo">
            <BellIcon />
          </button>

          {isAuth ? (
            <>
              <button
                className="mk-avatar-button"
                onClick={() => setOpen((v) => !v)}
              >
                <img
                  src={avatarSrc}
                  alt={displayName}
                  className="mk-avatar-img"
                />
              </button>

              {open && (
                <div className="mk-user-menu">
                  <div className="mk-user-menu-header">
                    <div className="mk-user-menu-avatar">
                      <img
                        src={avatarSrc}
                        alt={displayName}
                        className="mk-avatar-img"
                      />
                      <span className="mk-user-status-dot" />
                    </div>
                    <div className="mk-user-menu-info">
                      <div className="mk-user-name">{displayName}</div>
                      <div className="mk-user-email">{displayEmail}</div>
                    </div>
                  </div>

                  <button
                    className="mk-user-menu-item"
                    onClick={handleGoProfile}
                  >
                    Hồ sơ của tôi
                  </button>

                  <button
                    className="mk-user-menu-item"
                    onClick={handleGoMyCourses}
                  >
                    Khóa học của tôi
                  </button>
                  
                  {/* 👇 ĐÃ CẬP NHẬT: Gắn sự kiện onClick vào hàm handleGoMyEssays */}
                  <button
                    className="mk-user-menu-item"
                    onClick={handleGoMyEssays}
                  >
                    Quản lí bài essay
                  </button>

                  <button
                    className="mk-user-menu-item mk-user-menu-logout"
                    onClick={handleLogout}
                  >
                    <span className="mk-user-menu-logout-icon">⟵</span>
                    <span>Đăng xuất</span>
                  </button>
                </div>
              )}
            </>
          ) : (
            <Link to="/login" className="mk-login-button">
              Đăng nhập
            </Link>
          )}
        </div>
      </header>
    </div>
  );
}
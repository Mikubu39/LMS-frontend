// src/pages/auth/RequireAuth.jsx
import { useSelector } from "react-redux";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import PropTypes from "prop-types";

import {
  selectIsAuthenticated,
  selectUser,
  // nếu bạn chưa export selectRoles thì bỏ dòng dưới đi
  // hoặc giữ roles từ user.roles cũng được
} from "../../redux/authSlice"; // không dùng alias @ cho chắc

export default function RequireAuth({ allowedRoles = [] }) {
  const location = useLocation();
  const isAuth = useSelector(selectIsAuthenticated);
  const user = useSelector(selectUser);

  // roles từ user, luôn toLowerCase
  const userRoles = (user?.roles || []).map((r) =>
    String(r).toLowerCase()
  );
  const allowed = allowedRoles.map((r) => r.toLowerCase());

  console.log("🔐 [RequireAuth] check:", {
    path: location.pathname,
    isAuth,
    user,
    userRoles,
    allowedRoles: allowed,
  });

  // Nếu chưa đăng nhập -> đá về /login
  if (!isAuth) {
    console.log("🔐 [RequireAuth] Chưa đăng nhập -> chuyển /login");
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Nếu có cấu hình allowedRoles thì check quyền
  if (allowed.length > 0) {
    const hasPermission = userRoles.some((r) => allowed.includes(r));
    console.log("🔐 [RequireAuth] hasPermission:", hasPermission);

    if (!hasPermission) {
      console.log("🔐 [RequireAuth] Không đủ quyền -> về /");
      return <Navigate to="/" replace />;
    }
  }

  // Đã đăng nhập + đủ quyền -> render các route con
  return <Outlet />;
}

RequireAuth.propTypes = {
  allowedRoles: PropTypes.arrayOf(PropTypes.string),
};

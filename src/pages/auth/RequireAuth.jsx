// src/pages/auth/RequireAuth.jsx
import { useSelector } from "react-redux";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { selectIsAuthenticated } from "@/redux/authSlice"; 
// nếu chưa cấu hình alias @ thì dùng: "../../redux/authSlice"

export default function RequireAuth() {
  const location = useLocation();
  const isAuth = useSelector(selectIsAuthenticated);

  // Nếu chưa đăng nhập -> đá về /login
  if (!isAuth) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Đã đăng nhập -> render các route con
  return <Outlet />;
}

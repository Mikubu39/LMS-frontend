// ✅ src/pages/auth/Login.jsx
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { message } from "antd";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, EffectFade } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/effect-fade";

import {
  setUser,
  selectIsAuthenticated,
  selectUser,
} from "@/redux/authSlice";
import { AuthApi } from "@/services/api/authApi";
import "../../css/auth.css";
import logo from "@/assets/logo.png";
import slide1 from "@/assets/IMG.png";
import slide2 from "@/assets/IMG2.jpg";
import slide3 from "@/assets/IMG3.jpg";

/* ── Helper: decode JWT (chỉ nội bộ logic) ───────────── */
function parseJwt(token) {
  if (!token) return null;
  try {
    const base64 = token.split(".")[1];
    const json = atob(base64.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(decodeURIComponent(escape(json)));
  } catch {
    return null;
  }
}

/* ── Helper: chuẩn hóa roles giống authSlice.extractRoles ───────── */
function extractRolesFromPayload(payload) {
  if (!payload) return ["student"];

  const raw =
    payload.roles ??
    payload.role ??
    payload.authorities ??
    payload.permissions;

  let roles = [];

  if (Array.isArray(raw)) {
    roles = raw;
  } else if (typeof raw === "string" && raw.trim() !== "") {
    roles = [raw];
  } else {
    roles = ["student"];
  }

  return roles
    .map((r) => {
      const lower = String(r).trim().toLowerCase();
      if (!lower) return null;

      if (lower.includes("admin")) return "admin"; // ADMIN, ROLE_ADMIN,...
      if (lower.includes("teacher")) return "teacher";
      if (lower.includes("student")) return "student";

      return lower;
    })
    .filter(Boolean);
}

/* ── Helper: điều hướng theo role + from ───────── */
function redirectByRole(navigate, roles, from) {
  // Chỉ dùng "from" nếu nó KHÔNG phải "/" hoặc "/login"
  const safeFrom =
    from && from !== "/" && from !== "/login" ? from : null;

  if (safeFrom) {
    navigate(safeFrom, { replace: true });
    return;
  }

  // Không có from "xịn" -> điều hướng theo role
  if (roles.includes("admin")) {
    navigate("/admin", { replace: true });
  } else if (roles.includes("teacher")) {
    navigate("/teacher/dashboard", { replace: true });
  } else {
    // student
    navigate("/dashboard", { replace: true });
  }
}

export default function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const isAuth = useSelector(selectIsAuthenticated);
  const currentUser = useSelector(selectUser);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  // Lấy "from" nếu trước đó bị đá từ một route protected (vd: /admin)
  const from = location.state?.from?.pathname || null;

  // Nếu đã đăng nhập sẵn mà vào /login → tự redirect theo role
  useEffect(() => {
    if (!isAuth || !currentUser) return;

    const roles = extractRolesFromPayload({ roles: currentUser.roles });

    console.log("⚙️ [Login/useEffect] roles từ currentUser:", roles);

    redirectByRole(navigate, roles, from);
  }, [isAuth, currentUser, from, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr("");

    if (!email || !password) {
      setErr("Vui lòng nhập đầy đủ thông tin");
      return;
    }

    try {
      setLoading(true);

      // 🔹 B1. Gọi API đăng nhập
      const res = await AuthApi.login({ email, password });

      const token =
        res?.access_token ||
        res?.data?.access_token ||
        localStorage.getItem("access_token");

      if (!token) {
        throw new Error("Không nhận được access_token từ server");
      }

      // Đảm bảo token nằm trong localStorage (cho authSlice khởi tạo lại sau F5)
      localStorage.setItem("access_token", token);

      // 🔹 B2. Decode token lấy payload
      const payload = parseJwt(token) || {};

      console.log("🧾 [Login] JWT payload:", payload);

      // Chuẩn hóa roles
      const roles = extractRolesFromPayload(payload);

      console.log("🎭 [Login] roles sau extract:", roles);

      // 🔹 B3. Chuẩn hóa user cho Redux
      const user = {
        id: payload.sub || `u_${Date.now()}`,
        name: payload.name || email.split("@")[0],
        email: payload.email || email,
        avatar: "https://i.pravatar.cc/80?img=47",
        roles,
        isAuthenticated: true,
        online: true,
      };

      // 🔹 B4. Cập nhật Redux store
      dispatch(setUser(user));

      // 🔹 B5. Thông báo
      message.success("Đăng nhập thành công 🎉");

      // 🔹 B6. Điều hướng theo role (ưu tiên from hợp lệ)
      redirectByRole(navigate, roles, from);
    } catch (error) {
      console.error("❌ Lỗi khi đăng nhập:", error);

      const backendMsg = error?.response?.data?.message;
      const normalizedBackendMsg = Array.isArray(backendMsg)
        ? backendMsg.join(", ")
        : backendMsg;

      const msg =
        normalizedBackendMsg ||
        error?.message ||
        "Đăng nhập thất bại";

      setErr(msg);
      message.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-layout">
      {/* === LEFT: FORM === */}
      <div className="auth-form">
        <div className="form-box">
          <div className="logo-wrap">
            <img src={logo} alt="Mankai Academy" />
            <h2>Mankai Academy</h2>
          </div>

          {/* form */}
          <h1>Đăng nhập</h1>
          <p className="subtitle">
            Khám phá kho tàng kiến thức bất tận cùng bộ tài liệu độc quyền của
            Mankai Academy.
          </p>

          {err && <div className="error-box">{err}</div>}

          <form onSubmit={handleSubmit}>
            <label>Email</label>
            <input
              type="email"
              placeholder="you@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />

            <label>Mật khẩu</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />

            <div className="forgot">
              <Link to="/forgot">Quên mật khẩu?</Link>
            </div>

            <button type="submit" disabled={loading}>
              {loading ? "Đang đăng nhập..." : "Đăng nhập"}
            </button>
          </form>
        </div>
      </div>

      {/* === RIGHT: SLIDER === */}
      <div className="auth-hero">
        <Swiper
          modules={[Autoplay, Pagination, EffectFade]}
          effect="fade"
          fadeEffect={{ crossFade: true }}
          autoplay={{ delay: 3500, disableOnInteraction: false }}
          pagination={{ clickable: true }}
          loop
          className="hero-swiper"
        >
          {[slide1, slide2, slide3].map((img, i) => (
            <SwiperSlide key={i}>
              <div className="slide">
                <img src={img} alt={`slide-${i}`} />
                <div className="overlay">
                  <h3>Kho học liệu miễn phí</h3>
                  <p>
                    Miễn phí truy cập kho tài liệu khổng lồ, bao gồm bài giảng,
                    video và tài liệu đọc phù hợp với mọi đối tượng.
                  </p>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
}

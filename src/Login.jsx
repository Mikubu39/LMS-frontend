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

import { setUser, selectIsAuthenticated } from "@/redux/store";
import { AuthApi } from "@/services/api/authApi";

import logo from "@/assets/logo.png";
import slide1 from "@/assets/IMG.png";
import slide2 from "@/assets/IMG2.jpg";
import slide3 from "@/assets/IMG3.jpg";

/* ── Helper: decode JWT (không đổi layout, chỉ nội bộ logic) ───────────── */
function parseJwt(token) {
  if (!token) return null;
  try {
    const base64 = token.split(".")[1];
    const json = atob(base64.replace(/-/g, "+").replace(/_/g, "/"));
    // decodeURIComponent(escape(...)) để xử lý ký tự unicode trong payload
    return JSON.parse(decodeURIComponent(escape(json)));
  } catch {
    return null;
  }
}

export default function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const isAuth = useSelector(selectIsAuthenticated);

  // Nếu đã đăng nhập thì tự chuyển sang Dashboard
  useEffect(() => {
    if (isAuth) navigate("/dashboard", { replace: true });
  }, [isAuth, navigate]);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr("");

    if (!email || !password) {
      setErr("Vui lòng nhập đầy đủ thông tin");
      return;
    }

    try {
      setLoading(true);

      // 🔹 B1. Gọi API đăng nhập — backend trả { access_token }
      const res = await AuthApi.login({ email, password });
      const token = res?.access_token;
      if (!token) throw new Error("Không nhận được access_token từ server");

      // 🔹 B2. Lưu token vào localStorage
      localStorage.setItem("access_token", token);

      // 🔹 B3. Decode token lấy thông tin (id/role/email nếu có)
      const payload = parseJwt(token) || {};
      // role từ payload có thể là string | array | undefined
      const roles = Array.isArray(payload.role)
        ? payload.role
        : payload.role
        ? [payload.role]
        : ["student"];

      // 🔹 B4. Chuẩn hóa user cho Redux (không đổi layout/UI)
      const user = {
        id: payload.sub || `u_${Date.now()}`,
        name: payload.name || email.split("@")[0],
        email: payload.email || email,
        avatar: "https://i.pravatar.cc/80?img=47",
        roles,
        isAuthenticated: true,
        online: true,
      };

      // 🔹 B5. Cập nhật Redux store
      dispatch(setUser(user));

      // 🔹 B6. Hiển thị thông báo và điều hướng
      message.success("Đăng nhập thành công 🎉");
      const from = location.state?.from?.pathname || "/dashboard";
      navigate(from, { replace: true });
    } catch (error) {
      const msg =
        error?.response?.data?.message ||
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

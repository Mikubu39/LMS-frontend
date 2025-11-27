// src/pages/NotFound.jsx
import { useNavigate } from "react-router-dom";
import "../css/notfound.css";
import notFoundImg from "../assets/khongchotua.png";

// Icon mũi tên trên nút "Về trang chủ"
const ArrowRightIcon = () => (
  <svg
    className="nf-btn-icon-svg"
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M4.16699 9.99984H15.8337M15.8337 9.99984L10.0003 4.1665M15.8337 9.99984L10.0003 15.8332"
      stroke="white"
      strokeWidth="1.67"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default function NotFound() {
  const navigate = useNavigate();

  const handleBackHome = () => {
    navigate("/");
  };

  return (
    <div className="nf-page">
      <div className="nf-inner">
        <div className="nf-illustration">
          <img src={notFoundImg} alt="404 Error" />
        </div>

        <h1 className="nf-title">Oops!</h1>
        <p className="nf-subtitle">Trang không thể tìm thấy.</p>

        <button className="nf-btn" onClick={handleBackHome}>
          <span>Về trang chủ</span>
          <ArrowRightIcon />
        </button>
      </div>
    </div>
  );
}

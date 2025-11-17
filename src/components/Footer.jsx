// src/components/Footer.jsx
import footerLogo from "../assets/logo.jpg";
import "../css/footer.css";

const LocationIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <path
      d="M12 2.75C8.83 2.75 6.25 5.33 6.25 8.5C6.25 11.36 10.11 16.34 11.58 18.12C11.79 18.38 12.21 18.38 12.42 18.12C13.89 16.34 17.75 11.36 17.75 8.5C17.75 5.33 15.17 2.75 12 2.75Z"
      stroke="white"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M12 10.25C13.1 10.25 14 9.35 14 8.25C14 7.15 13.1 6.25 12 6.25C10.9 6.25 10 7.15 10 8.25C10 9.35 10.9 10.25 12 10.25Z"
      stroke="white"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const PhoneIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <path
      d="M17.11 14.37L15.02 14.09C14.52 14.02 14.03 14.19 13.67 14.55L12.32 15.9C10.16 14.8 8.43 13.08 7.33 10.92L8.68 9.57C9.04 9.21 9.21 8.72 9.14 8.22L8.86 6.15C8.73 5.26 7.98 4.61 7.08 4.61H5.43C4.44 4.61 3.63 5.42 3.71 6.41C4.1 11.12 7.5 15.01 12.11 15.4C13.1 15.48 13.91 14.67 13.91 13.68V12.03C13.91 11.13 13.26 10.38 12.37 10.25Z"
      stroke="white"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const MailIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <path
      d="M4 5.75H20C21.1 5.75 22 6.65 22 7.75V16.25C22 17.35 21.1 18.25 20 18.25H4C2.9 18.25 2 17.35 2 16.25V7.75C2 6.65 2.9 5.75 4 5.75Z"
      stroke="white"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M4 8L11.29 12.39C11.73 12.66 12.27 12.66 12.71 12.39L20 8"
      stroke="white"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const FacebookIcon = () => (
  <span className="mk-footer-social-icon">f</span>
);

const YoutubeIcon = () => (
  <span className="mk-footer-social-icon">▶</span>
);

export default function Footer() {
  return (
    <footer className="mk-footer">
      <div className="mk-footer-inner">
        {/* Logo + title */}
        <div className="mk-footer-logo-wrap">
          <img src={footerLogo} alt="Mankai Academy" />
        </div>

        <h2 className="mk-footer-title">
          MANKAI ACADEMY - HỌC VIỆN ĐÀO TẠO PHÁT TRIỂN TIẾNG NHẬT THỰC CHIẾN
        </h2>

        <div className="mk-footer-divider" />

        {/* 3 cột nội dung */}
        <div className="mk-footer-content">
          {/* Liên hệ */}
          <div className="mk-footer-col">
            <h3 className="mk-footer-heading">THÔNG TIN LIÊN HỆ</h3>

            <div className="mk-footer-row">
              <div className="mk-footer-icon-circle">
                <LocationIcon />
              </div>
              <div className="mk-footer-row-text">
                <div className="mk-footer-row-label">Địa chỉ:</div>
                <div className="mk-footer-row-value">
                  Tòa Sông Đà, Đường Phạm Hùng, Mỹ Đình, Nam Từ Liêm, Hà Nội
                </div>
              </div>
            </div>

            <div className="mk-footer-row">
              <div className="mk-footer-icon-circle">
                <PhoneIcon />
              </div>
              <div className="mk-footer-row-text">
                <div className="mk-footer-row-label">Hotline:</div>
                <div className="mk-footer-row-value">0835 662 538</div>
              </div>
            </div>

            <div className="mk-footer-row">
              <div className="mk-footer-icon-circle">
                <MailIcon />
              </div>
              <div className="mk-footer-row-text">
                <div className="mk-footer-row-label">Email:</div>
                <div className="mk-footer-row-value">support@mankai.edu.vn</div>
              </div>
            </div>
          </div>

          {/* Social */}
          <div className="mk-footer-col mk-footer-col-social">
            <h3 className="mk-footer-heading">THEO DÕI CHÚNG TÔI TẠI</h3>
            <div className="mk-footer-social-list">
              <FacebookIcon />
              <YoutubeIcon />
            </div>
          </div>

          {/* Quote */}
          <div className="mk-footer-col mk-footer-col-quote">
            <p className="mk-footer-quote">
              &quot;Hạnh phúc là điểm khởi đầu của giáo dục và cũng là đích đến
              cuối cùng. Giang, với hơn 10 năm kinh nghiệm giảng dạy và luyện
              thi JLPT, mong muốn giúp các bạn rút ngắn thời gian, vượt qua khó
              khăn trong việc học tiếng Nhật, và chinh phục các bậc thang JLPT.
              Hãy biến học tập thành hành trình hạnh phúc chứ là mục tiêu phát
              triển bản thân mà còn là hành trình hạnh phúc chứ không phải
              những giấc mơ.&quot;
            </p>
            <p className="mk-footer-sign">
              &quot;Giang Suke Sensei – CEO Mankai Academy&quot;
            </p>
          </div>
        </div>
      </div>

      <div className="mk-footer-bottom">
        <span>
          © 2024 By Rikkei Academy – Rikkei Education – All rights reserved.
        </span>
      </div>
    </footer>
  );
}

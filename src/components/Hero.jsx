import React, { useState, useEffect } from 'react';
import '../css/Hero.css';
import heroImage from '../assets/hero.png'; 
// Nếu bạn có ảnh khác thì import thêm:
// import heroImage2 from '../assets/hero2.png';
// import heroImage3 from '../assets/hero3.png';

const Hero = () => {
  // 1. Dữ liệu cho 3 Slider
  const slides = [
    {
      id: 1,
      name: "Giang Sensei",
      image: heroImage, // Ảnh gốc
      description: (
        <>
          Hạnh phúc là điểm khởi đầu của giáo dục và cũng là đích đến cuối cùng. Giang, với <strong>hơn 10 năm kinh nghiệm</strong> giảng dạy và luyện thi JLPT, mong muốn giúp các bạn rút ngắn thời gian, vượt qua khó khăn trong việc học tiếng Nhật, và <strong>chinh phục tấm bằng JLPT</strong>.
        </>
      ),
      stats: [
        { text: "180/180 N1", iconPath: "M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" },
        { text: "Hơn 10 năm kinh nghiệm luyện thi JLPT", iconPath: "M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" },
        { text: "72% học viên thi đỗ chỉ với 1 lần thi", iconPath: "M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" }
      ]
    },
    {
      id: 2,
      name: "Thực Chiến",
      image: heroImage, // Tạm dùng ảnh cũ, hãy thay ảnh khác nếu có
      description: (
        <>
          Đừng để ngữ pháp nằm trên giấy. Tại lớp <strong>Kaiwa Chuyên Sâu</strong>, chúng tôi giúp bạn phá bỏ rào cản tâm lý, rèn luyện phản xạ và <strong>nói tiếng Nhật tự nhiên</strong> như người bản xứ. Tự tin phỏng vấn, làm việc và giao tiếp hàng ngày chỉ sau 3 tháng.
        </>
      ),
      stats: [
        { text: "1000+ giờ thực hành giao tiếp", iconPath: "M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM9 11H7V9h2v2zm4 0h-2V9h2v2zm4 0h-2V9h2v2z" }, // Icon chat
        { text: "Phương pháp Shadowing độc quyền", iconPath: "M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" },
        { text: "Cam kết tự tin phỏng vấn xin việc", iconPath: "M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" } // Icon check
      ]
    },
    {
      id: 3,
      name: "Học Cấp Tốc",
      image: heroImage, // Tạm dùng ảnh cũ
      description: (
        <>
          Chinh phục đỉnh cao tiếng Nhật với lộ trình <strong>tinh gọn và hiệu quả</strong>. Chúng tôi tập trung vào kiến thức cốt lõi, kỹ năng làm bài thực chiến giúp bạn tối ưu điểm số. <strong>Không học lan man</strong>, bám sát đề thi thật và cam kết đầu ra bằng văn bản.
        </>
      ),
      stats: [
        { text: "Tài liệu độc quyền sát đề thi thật", iconPath: "M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" }, // Icon document
        { text: "Hỗ trợ giải đáp 24/7", iconPath: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z" }, // Icon help
        { text: "Hoàn học phí nếu không đỗ", iconPath: "M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z" } // Icon money
      ]
    }
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  // 2. Tự động chuyển slide sau 5 giây
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex === slides.length - 1 ? 0 : prevIndex + 1));
    }, 5000); // 5000ms = 5 giây

    return () => clearInterval(interval);
  }, [slides.length]);

  // Lấy dữ liệu slide hiện tại
  const activeSlide = slides[currentIndex];

  return (
    <section className="hero-section">
      <div className="hero-container fade-in" key={activeSlide.id}> 
        {/* key={activeSlide.id} giúp React trigger lại animation khi đổi slide */}
        
        {/* --- Cột nội dung bên trái --- */}
        <div className="hero-content-left">
          <svg className="quote-mark quote-open" width="39" height="39" viewBox="0 0 39 39" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M30.6425 18.5646C29.6525 18.4659 27.4743 18.4659 27.4743 17.0796C27.4743 15.199 30.2462 12.724 34.7012 10.0509C36.0868 9.15964 38.9587 7.77402 38.9587 5.89277C38.9587 4.40777 37.8693 3.31902 35.5925 3.61589C33.4143 3.91277 30.0481 5.39777 25.5937 9.15964C20.9406 13.0209 16.585 19.4559 16.585 25.7915C16.585 32.2265 20.9406 38.6615 27.97 38.6615C33.6125 38.6615 38.4637 34.4046 38.4637 28.5634C38.4631 24.1084 35.3943 18.9609 30.6425 18.5646Z" fill="#FEF6E8"/>
            <path d="M16.7256 15.7809C15.9125 15.3559 15.0206 15.0777 14.0581 14.9977C13.0681 14.899 10.89 14.899 10.89 13.5127C10.89 11.6321 13.6619 9.15712 18.1169 6.484C19.5031 5.59275 22.3738 4.20712 22.3738 2.32587C22.3738 0.840872 21.2844 -0.247878 19.0075 0.0489969C16.8294 0.345872 13.4631 1.83087 9.00875 5.59275C4.35625 9.454 0 15.889 0 22.2252C0 28.6602 4.35563 35.0952 11.385 35.0952C13.0375 35.0952 14.6213 34.7277 16.0356 34.0646C14.6487 31.5571 13.9094 28.6559 13.9094 25.7921C13.91 22.2559 15.0487 18.8265 16.7256 15.7809Z" fill="#FEF6E8"/>
          </svg>

          {/* Render mô tả từ dữ liệu */}
          <p className="hero-text">
            {activeSlide.description}
          </p>

          <svg className="quote-mark quote-close" width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g opacity="0.8" clipPath="url(#clip0_quote)">
              <path d="M8.83703 19.1896C9.82703 19.0909 12.0052 19.0909 12.0052 17.7046C12.0052 15.824 9.23328 13.349 4.77828 10.6759C3.39266 9.78464 0.520781 8.39902 0.520781 6.51777C0.520781 5.03277 1.61016 3.94402 3.88703 4.24089C6.06516 4.53777 9.43141 6.02277 13.8858 9.78464C18.5389 13.6459 22.8945 20.0809 22.8945 26.4165C22.8945 32.8515 18.5389 39.2865 11.5095 39.2865C5.86703 39.2865 1.01578 35.0296 1.01578 29.1884C1.01641 24.7334 4.08516 19.5859 8.83703 19.1896Z" fill="#FEF6E8"/>
              <path d="M22.7539 16.4059C23.567 15.9809 24.4589 15.7027 25.4214 15.6227C26.4114 15.524 28.5895 15.524 28.5895 14.1377C28.5895 12.2571 25.8176 9.78212 21.3626 7.109C19.9764 6.21775 17.1057 4.83212 17.1057 2.95087C17.1057 1.46587 18.1951 0.377122 20.472 0.673997C22.6501 0.970872 26.0164 2.45587 30.4707 6.21775C35.1232 10.079 39.4795 16.514 39.4795 22.8502C39.4795 29.2852 35.1239 35.7202 28.0945 35.7202C26.442 35.7202 24.8582 35.3527 23.4439 34.6896C24.8307 32.1821 25.5701 29.2809 25.5701 26.4171C25.5695 22.8809 24.4307 19.4515 22.7539 16.4059Z" fill="#FEF6E8"/>
            </g>
            <defs>
              <clipPath id="clip0_quote">
                <rect width="40" height="40" fill="white" transform="matrix(-1 0 0 1 40 0)"/>
              </clipPath>
            </defs>
          </svg>
        </div>

        {/* --- Cột hình ảnh bên phải --- */}
        <div className="hero-image-right">
          <div className="yellow-curve-bg"></div>

          <div className="image-wrapper">
            {/* Tag tên động theo slide */}
            <div className="name-tag">{activeSlide.name}</div>
            
            <img className="hero-portrait" src={activeSlide.image} alt={activeSlide.name} />

            {/* Hộp thống kê động */}
            <div className="stats-box">
              <ul className="stats-list">
                {activeSlide.stats.map((stat, index) => (
                    <li key={index}>
                      <svg className="stats-icon" viewBox="0 0 24 24" fill="#F16B37" xmlns="http://www.w3.org/2000/svg">
                        <path d={stat.iconPath}/>
                      </svg>
                      {stat.text}
                    </li>
                ))}
              </ul>
            </div>

            {/* Decorations */}
            <svg className="decoration deco-star" width="27" height="27" viewBox="0 0 27 27" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M13.4875 0L17.1303 9.84463L26.975 13.4875L17.1303 17.1303L13.4875 26.975L9.84463 17.1303L0 13.4875L9.84463 9.84463L13.4875 0Z" fill="white"/>
            </svg>
            <svg className="decoration deco-circle" width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="7.22543" cy="7.22543" r="7.22543" fill="white"/>
            </svg>
            <svg className="decoration deco-spiral" width="53" height="56" viewBox="0 0 53 56" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1.19235 0.963408C-0.236424 9.48565 5.24336 17.6801 11.635 23.5003C14.6481 26.2444 18.1108 28.7826 22.1324 29.4339C26.1582 30.0811 30.8185 28.3035 32.3229 24.513C33.8231 20.7184 30.5117 15.5832 26.5028 16.3228C23.0317 16.9615 21.3591 20.9873 20.9978 24.5004C20.1615 32.5814 23.1913 40.9902 28.9989 46.6801C34.8065 52.37 43.2699 55.2276 51.3383 54.219" stroke="#F7C268" strokeWidth="1.92678" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="7.53 7.53"/>
            </svg>
            <svg className="decoration deco-line" width="7" height="68" viewBox="0 0 7 68" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3.59131 1.4126C1.59243 12.7629 -0.832756 41.5119 5.45748 65.7058" stroke="#FEF1EC" strokeWidth="2.82486" strokeLinecap="round"/>
            </svg>

          </div>
        </div>
      </div>

      {/* Pagination Dots có thể click được */}
      <div className="pagination-dots">
        {slides.map((slide, index) => (
            <div 
                key={slide.id} 
                className={`dot ${index === currentIndex ? 'active' : ''}`}
                onClick={() => setCurrentIndex(index)}
            ></div>
        ))}
      </div>
    </section>
  );
};

export default Hero;
// src/pages/PostDetail.jsx
import "../css/post-detail.css";
import postImg1 from "../assets/post1.png";
import postImg2 from "../assets/post2.png";
import postImg3 from "../assets/post3.png";

/* ===== ICONS 20x20 ===== */
const TimeIcon = () => (
  <svg
    className="pd-icon"
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M10.0003 1.6665C5.40866 1.6665 1.66699 5.40817 1.66699 9.99984C1.66699 14.5915 5.40866 18.3332 10.0003 18.3332C14.592 18.3332 18.3337 14.5915 18.3337 9.99984C18.3337 5.40817 14.592 1.6665 10.0003 1.6665ZM13.6253 12.9748C13.5087 13.1748 13.3003 13.2832 13.0837 13.2832C12.9753 13.2832 12.867 13.2582 12.767 13.1915L10.1837 11.6498C9.54199 11.2665 9.06699 10.4248 9.06699 9.68317V6.2665C9.06699 5.92484 9.35033 5.6415 9.69199 5.6415C10.0337 5.6415 10.317 5.92484 10.317 6.2665V9.68317C10.317 9.98317 10.567 10.4248 10.8253 10.5748L13.4087 12.1165C13.7087 12.2915 13.8087 12.6748 13.6253 12.9748Z"
      fill="#676767"
    />
  </svg>
);

const BookIcon = () => (
  <svg
    className="pd-icon"
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M18.3333 4.04173V13.9501C18.3333 14.7584 17.675 15.5001 16.8667 15.6001L16.6083 15.6334C15.2417 15.8167 13.3167 16.3834 11.7667 17.0334C11.225 17.2584 10.625 16.8501 10.625 16.2584V4.66673C10.625 4.3584 10.8 4.07507 11.075 3.92507C12.6 3.10007 14.9083 2.36673 16.475 2.2334H16.525C17.525 2.2334 18.3333 3.04173 18.3333 4.04173Z"
      fill="#676767"
    />
    <path
      d="M8.92487 3.92507C7.39987 3.10007 5.09154 2.36673 3.52487 2.2334H3.46654C2.46654 2.2334 1.6582 3.04173 1.6582 4.04173V13.9501C1.6582 14.7584 2.31654 15.5001 3.12487 15.6001L3.3832 15.6334C4.74987 15.8167 6.67487 16.3834 8.22487 17.0334C8.76654 17.2584 9.36654 16.8501 9.36654 16.2584V4.66673C9.36654 4.35006 9.19987 4.07507 8.92487 3.92507ZM4.16654 6.45006H6.04154C6.3832 6.45006 6.66654 6.7334 6.66654 7.07506C6.66654 7.42506 6.3832 7.70006 6.04154 7.70006H4.16654C3.82487 7.70006 3.54154 7.42506 3.54154 7.07506C3.54154 6.7334 3.82487 6.45006 4.16654 6.45006ZM6.66654 10.2001H4.16654C3.82487 10.2001 3.54154 9.92506 3.54154 9.57506C3.54154 9.2334 3.82487 8.95006 4.16654 8.95006H6.66654C7.0082 8.95006 7.29154 9.2334 7.29154 9.57506C7.29154 9.92506 7.0082 10.2001 6.66654 10.2001Z"
      fill="#676767"
    />
  </svg>
);

/* ===== DỮ LIỆU MOCK ===== */
const relatedPosts = [
  { id: 1, title: "Authentication & Authorization trong ReactJS", img: postImg1 },
  { id: 2, title: "Authentication & Authorization trong ReactJS", img: postImg2 },
  { id: 3, title: "Authentication & Authorization trong ReactJS", img: postImg3 },
];

export default function PostDetail() {
  return (
    <div className="pd-page">
      <div className="pd-container">
        {/* BREADCRUMB */}
        <div className="pd-breadcrumb">
          <span>Trang chủ</span>
          <span className="pd-breadcrumb-sep">/</span>
          <span>Bài viết</span>
          <span className="pd-breadcrumb-sep">/</span>
          <span className="pd-breadcrumb-current">Chi tiết bài viết</span>
        </div>

        {/* TIÊU ĐỀ + META */}
        <header className="pd-header">
          <h1 className="pd-title">
            Authentication & Authorization trong ReactJS
          </h1>

          <div className="pd-meta-row">
            <span className="pd-tag">Front-End</span>

            <span className="pd-meta-item">
              <TimeIcon />
              <span>8 tháng trước</span>
            </span>

            <span className="pd-meta-item">
              <BookIcon />
              <span>10–15 phút đọc</span>
            </span>
          </div>
        </header>

        {/* LAYOUT 2 CỘT */}
        <div className="pd-layout">
          {/* CỘT TRÁI: BÀI CHÍNH */}
          <article className="pd-article">
            <section className="pd-section">
              <h2 className="pd-section-title">
                Ornare eu elementum felis porttitor nunc
              </h2>

              <div className="pd-image-block">
                <img src={postImg1} alt="Authentication & Authorization" />
              </div>

              <p>
                Ornare eu elementum felis porttitor nunc tortor. Ornare neque
                accumsan metus nulla ultricies maecenas rhoncus ultrices cras.
                Vestibulum varius adipiscing…
              </p>
            </section>

            <section className="pd-section">
              <h3 className="pd-section-subtitle">
                Lorem ipsum dolor sit amet consectetur
              </h3>
              <p>
                Lorem ipsum dolor sit amet consectetur. Ornare neque accumsan
                metus nulla ultricies massa ultrices rhoncus ultrices eros…
              </p>

              <ul className="pd-list">
                <li>Tellus molestie leo gravida feugiat.</li>
                <li>
                  Sit porttitor viverra ut cursus. Vestibulum non et ullamcorper
                  fermentum fringilla est.
                </li>
                <li>
                  A nullam diam rhoncus pellentesque eleifend risus ut libero…
                </li>
              </ul>
            </section>

            <section className="pd-section">
              <div className="pd-image-block">
                <img src={postImg2} alt="React workshop" />
              </div>
              <p>
                Vestibulum varius adipiscing pellentesque augue eget donec orci
                amet…
              </p>
            </section>

            <section className="pd-section">
              <div className="pd-image-block">
                <img src={postImg3} alt="Developer learning React" />
              </div>
              <p>
                Lorem ipsum dolor sit amet consectetur. Ornare eu elementum
                felis porttitor nunc tortor…
              </p>
            </section>
          </article>

          {/* CỘT PHẢI: BÀI VIẾT CÙNG CHỦ ĐỀ */}
          <aside className="pd-sidebar">
            <h3 className="pd-sidebar-title">Bài viết cùng chủ đề</h3>

            <div className="pd-sidebar-list">
              {relatedPosts.map((p) => (
                <article key={p.id} className="pd-sidebar-card">
                  <div className="pd-sidebar-thumb">
                    <img src={p.img} alt={p.title} />
                  </div>

                  <div className="pd-sidebar-content">
                    <span className="pd-sidebar-tag">Front-End</span>

                    <h4 className="pd-sidebar-card-title">{p.title}</h4>

                    <p className="pd-sidebar-card-excerpt">
                      Chào bạn! Nếu bạn đã là học viên khóa Pro của Rikkei
                      Academy, chắc hẳn bạn đã biết tới Dev Mode – giúp thúc
                      đẩy…
                    </p>

                    <div className="pd-sidebar-meta">
                      <span className="pd-meta-item">
                        <TimeIcon />
                        <span>8 tháng trước</span>
                      </span>

                      <span>•</span>

                      <span className="pd-meta-item">
                        <BookIcon />
                        <span>10–15 phút đọc</span>
                      </span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

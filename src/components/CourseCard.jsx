// src/components/CourseCard.jsx
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";

import Badge from "./Badge";
import "../css/course-card.css"; // 👈 CSS cho card

// ===== Icons 20x20 theo SVG bạn gửi =====
const ClockIcon = () => (
  <svg
    className="course-card-icon"
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M9.99951 2.16669C14.3149 2.16669 17.8333 5.68432 17.8335 9.99969C17.8335 14.3152 14.315 17.8337 9.99951 17.8337C5.68414 17.8335 2.1665 14.3151 2.1665 9.99969C2.16668 5.68443 5.68424 2.16686 9.99951 2.16669ZM9.69189 5.1413C9.07422 5.1413 8.56711 5.64866 8.56689 6.2663V9.68329C8.56689 10.6003 9.13348 11.6049 9.92627 12.0788L9.92725 12.0798L12.5103 13.6208V13.6198C12.7009 13.7407 12.9019 13.7829 13.0835 13.7829C13.4668 13.7828 13.8445 13.5891 14.0562 13.2263C14.3787 12.6876 14.1976 12.0013 13.6636 11.6872H13.6646L11.0815 10.1452L11.0757 10.1423C11.0517 10.1281 10.9797 10.0629 10.9087 9.93817C10.8377 9.81343 10.8169 9.71493 10.8169 9.68329V6.2663C10.8167 5.64879 10.3094 5.14151 9.69189 5.1413Z"
      fill="#DD673C"
      stroke="#DD673C"
    />
  </svg>
);

const UserIcon = () => (
  <svg
    className="course-card-icon"
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M9.99951 2.16669C11.847 2.16669 13.3607 3.62222 13.4536 5.44696L13.4585 5.62469C13.4504 7.49848 11.9865 9.00939 10.1235 9.07489H10.0835C10.0242 9.07031 9.965 9.06993 9.90869 9.07391C7.99526 9.00394 6.5415 7.49067 6.5415 5.62469C6.54168 3.71776 8.09258 2.16686 9.99951 2.16669Z"
      fill="#DD673C"
      stroke="#DD673C"
    />
    <path
      d="M14.2333 11.7917C11.9083 10.2417 8.11663 10.2417 5.77497 11.7917C4.71663 12.5 4.1333 13.4583 4.1333 14.4833C4.1333 15.5083 4.71663 16.4583 5.76663 17.1583C6.9333 17.9417 8.46663 18.3333 9.99997 18.3333C11.5333 18.3333 13.0666 17.9417 14.2333 17.1583C15.2833 16.45 15.8666 15.5 15.8666 14.4667C15.8583 13.4417 15.2833 12.4917 14.2333 11.7917Z"
      fill="#DD673C"
    />
  </svg>
);

const BookIcon = () => (
  <svg
    className="course-card-icon"
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M16.5254 2.73334C17.2491 2.73355 17.833 3.3182 17.833 4.04193V13.9501C17.8329 14.5036 17.3655 15.034 16.8057 15.1035L16.8027 15.1044L16.5439 15.1376H16.542C15.1213 15.3282 13.1538 15.9094 11.5752 16.5712C11.372 16.6556 11.1253 16.5035 11.125 16.2587V4.66693C11.125 4.55079 11.1912 4.43009 11.3135 4.36322C12.7809 3.56962 15.0106 2.86425 16.499 2.73334H16.5254Z"
      fill="#DD673C"
      stroke="#DD673C"
    />
    <path
      d="M8.92487 3.925C7.39987 3.1 5.09154 2.36667 3.52487 2.23334H3.46654C2.46654 2.23334 1.6582 3.04167 1.6582 4.04167V13.95C1.6582 14.7583 2.31654 15.5 3.12487 15.6L3.3832 15.6333C4.74987 15.8167 6.67487 16.3833 8.22487 17.0333C8.76654 17.2583 9.36654 16.85 9.36654 16.2583V4.66667C9.36654 4.35 9.19987 4.075 8.92487 3.925ZM4.16654 6.45H6.04154C6.3832 6.45 6.66654 6.73334 6.66654 7.075C6.66654 7.425 6.3832 7.7 6.04154 7.7H4.16654C3.82487 7.7 3.54154 7.425 3.54154 7.075C3.54154 6.73334 3.82487 6.45 4.16654 6.45ZM6.66654 10.2H4.16654C3.82487 10.2 3.54154 9.925 3.54154 9.575C3.54154 9.23334 3.82487 8.95 4.16654 8.95H6.66654C7.0082 8.95 7.29154 9.23334 7.29154 9.575C7.29154 9.925 7.0082 10.2 6.66654 10.2Z"
      fill="#DD673C"
    />
  </svg>
);

export default function CourseCard({ c }) {
  const navigate = useNavigate();

  const goToLesson = () => {
    // Điều hướng tới LessonPage, truyền id khoá học
    navigate(`/lesson/${c.id}`, { state: { course: c } });
  };

  const durationText =
    c.duration || c.time || (c.minutes || c.hours ? `${c.minutes || c.hours} phút` : "—");
  const chapterText = `${c.modules || c.chapters || 0} Chương`;
  const teacherName = c.teacher || "Giảng viên";
  const imageSrc = c.image || "/src/assets/course card.jpg";

  return (
    <article className="card course-card">
      {/* Phần ảnh trên cùng */}
      <div className="course-card-thumb">
        <img className="course-card-img" src={imageSrc} alt={c.title} />
      </div>

      {/* Phần thân trắng phía dưới */}
      <div className="course-card-body">
        {/* Level */}
        <div className="course-card-level">
          <Badge>{c.level || "Beginner"}</Badge>
        </div>

        {/* Meta: thời lượng – chương – giảng viên */}
        <div className="course-card-meta-row">
          <div className="course-card-meta-item">
            <ClockIcon />
            <span>{durationText}</span>
          </div>
          <div className="course-card-meta-item">
            <BookIcon />
            <span>{chapterText}</span>
          </div>
          <div className="course-card-meta-item">
            <UserIcon />
            <span>{teacherName}</span>
          </div>
        </div>

        {/* Tiêu đề khoá học */}
        <h3 className="course-card-title">{c.title}</h3>

        {/* Nút HỌC NGAY */}
        <button className="course-card-cta" onClick={goToLesson}>
          <span>HỌC NGAY</span>
          <span className="course-card-cta-arrow">↗</span>
        </button>
      </div>
    </article>
  );
}

CourseCard.propTypes = {
  c: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
    title: PropTypes.string.isRequired,
    image: PropTypes.string,
    level: PropTypes.string,
    duration: PropTypes.string,
    time: PropTypes.string,
    minutes: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    hours: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    modules: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    chapters: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    teacher: PropTypes.string,
  }).isRequired,
};

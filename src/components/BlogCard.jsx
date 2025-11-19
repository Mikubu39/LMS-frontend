// src/components/BlogCard.jsx
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import "../css/blog-card.css";
import blogThumb from "../assets/blog.png";

// Icon thời gian 16x16
const Clock16 = () => (
  <svg
    className="blog-icon"
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M8.00016 1.33331C4.32683 1.33331 1.3335 4.32665 1.3335 7.99998C1.3335 11.6733 4.32683 14.6666 8.00016 14.6666C11.6735 14.6666 14.6668 11.6733 14.6668 7.99998C14.6668 4.32665 11.6735 1.33331 8.00016 1.33331ZM10.9002 10.38C10.8068 10.54 10.6402 10.6266 10.4668 10.6266C10.3802 10.6266 10.2935 10.6066 10.2135 10.5533L8.14683 9.31998C7.6335 9.01331 7.2535 8.33998 7.2535 7.74665V5.01331C7.2535 4.73998 7.48016 4.51331 7.7535 4.51331C8.02683 4.51331 8.2535 4.73998 8.2535 5.01331V7.74665C8.2535 7.98665 8.4535 8.33998 8.66016 8.45998L10.7268 9.69331C10.9668 9.83331 11.0468 10.14 10.9002 10.38Z"
      fill="#676767"
    />
  </svg>
);

// Icon sách 16x16
const Book16 = () => (
  <svg
    className="blog-icon"
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M14.6667 3.23335V11.16C14.6667 11.8067 14.14 12.4 13.4933 12.48L13.2867 12.5067C12.1933 12.6533 10.6533 13.1067 9.41333 13.6267C8.98 13.8067 8.5 13.48 8.5 13.0067V3.73335C8.5 3.48668 8.64 3.26002 8.86 3.14002C10.08 2.48002 11.9267 1.89335 13.18 1.78668H13.22C14.02 1.78668 14.6667 2.43335 14.6667 3.23335Z"
      fill="#676767"
    />
    <path
      d="M7.13999 3.14002C5.91999 2.48002 4.07333 1.89335 2.81999 1.78668H2.77333C1.97333 1.78668 1.32666 2.43335 1.32666 3.23335V11.16C1.32666 11.8067 1.85333 12.4 2.49999 12.48L2.70666 12.5067C3.79999 12.6533 5.33999 13.1067 6.57999 13.6267C7.01333 13.8067 7.49333 13.48 7.49333 13.0067V3.73335C7.49333 3.48002 7.35999 3.26002 7.13999 3.14002ZM3.33333 5.16002H4.83333C5.10666 5.16002 5.33333 5.38668 5.33333 5.66002C5.33333 5.94002 5.10666 6.16002 4.83333 6.16002H3.33333C3.05999 6.16002 2.83333 5.94002 2.83333 5.66002C2.83333 5.38668 3.05999 5.16002 3.33333 5.16002ZM5.33333 8.16002H3.33333C3.05999 8.16002 2.83333 7.94002 2.83333 7.66002C2.83333 7.38668 3.05999 7.16002 3.33333 7.16002H5.33333C5.60666 7.16002 5.83333 7.38668 5.83333 7.66002C5.83333 7.94002 5.60666 8.16002 5.33333 8.16002Z"
      fill="#676767"
    />
  </svg>
);

export default function BlogCard({ post }) {
  const navigate = useNavigate();

  const handleClick = () => {
    // điều hướng sang trang chi tiết, truyền id + state nếu cần
    navigate(`/posts/${post.id}`, { state: { post } });
  };

  return (
    <article className="blog-card" onClick={handleClick}>
      <div className="blog-card-thumb">
        <img src={post.image || blogThumb} alt={post.title} />
      </div>

      <div className="blog-card-body">
        <span className="blog-card-tag">{post.tag || "Post mới"}</span>

        <h3 className="blog-card-title">{post.title}</h3>

        <p className="blog-card-excerpt">{post.excerpt}</p>

        <div className="blog-card-meta">
          <div className="blog-card-meta-item">
            <Clock16 />
            <span>{post.readTime || "6 phút đọc"}</span>
          </div>

          <span className="blog-card-dot" />

          <div className="blog-card-meta-item">
            <Book16 />
            <span>{post.category || "Web Frontend"}</span>
          </div>
        </div>
      </div>
    </article>
  );
}

BlogCard.propTypes = {
  post: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
    title: PropTypes.string.isRequired,
    image: PropTypes.string,
    tag: PropTypes.string,
    excerpt: PropTypes.string,
    readTime: PropTypes.string,
    category: PropTypes.string,
  }).isRequired,
};

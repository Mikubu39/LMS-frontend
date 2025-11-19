// src/components/Badge.jsx
import PropTypes from "prop-types";

export default function Badge({ children }) {
  return (
    <span className="inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-orange-600">
      {children}
    </span>
  );
}

Badge.propTypes = {
  children: PropTypes.node.isRequired,
};

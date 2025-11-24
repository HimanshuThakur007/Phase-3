import React from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store"; // Adjust path as needed
import "./LoadingDots.css";

interface LoadingDotsProps {
  size?: "small" | "medium" | "large"; // Optional size prop for different contexts
}

const LoadingDots: React.FC<LoadingDotsProps> = ({ size = "medium" }) => {
  const theme = useSelector((state: RootState) => state.root.theme);

  return (
    <div
      className={`loading-dots loading-dots-${size}`}
      aria-label="Loading value"
    >
      <span
        className={`dot ${theme === "dark" ? "dark-theme" : "light-theme"}`}
      ></span>
      <span
        className={`dot ${theme === "dark" ? "dark-theme" : "light-theme"}`}
      ></span>
      <span
        className={`dot ${theme === "dark" ? "dark-theme" : "light-theme"}`}
      ></span>
    </div>
  );
};

export default LoadingDots;

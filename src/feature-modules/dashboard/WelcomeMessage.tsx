// WelcomeMessage.tsx
import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";

interface WelcomeMessageProps {
  hasRights: boolean;
}

const WelcomeMessage: React.FC<WelcomeMessageProps> = ({ hasRights }) => {
  if (hasRights) {
    return (
      <div className="d-flex align-items-center justify-content-center min-vh-100 bg-light">
        <h1 className="text-center text-dark fw-bold fs-3">You have access!</h1>
      </div>
    );
  }

  return (
    <div
      className="d-flex align-items-center justify-content-center  bg-primary bg-gradient"
      style={{ minHeight: "85vh" }}
    >
      <div
        className="text-center p-0 p-sm-5 rounded-3 bg-white bg-opacity-75 shadow-lg animate__animated animate__fadeIn"
        style={{ maxWidth: "600px" }}
      >
        <h1
          className="display-4 fw-bold mb-3"
          style={{
            // background: "linear-gradient(90deg, #007bff, #ff0066)",
            background: "linear-gradient(90deg, #ff0066, #007bff)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Welcome to BowBi
        </h1>
        <p className="fs-5 text-muted">
          Sorry, you don’t have the right permissions to access this content.
        </p>
      </div>
    </div>
  );
};

export default WelcomeMessage;

import React from "react";
import Lottie from "lottie-react";
import loaderAnimation from "./loader.json";
// import loaderAnimation from "./bowbi.json";
// import loaderImg from "../../../public/small-logo.ico";
import "./centerLoader.css";

const CenteredLoader: React.FC = () => {
  return (
    <div
      className="loader-box"
      style={{
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Lottie
        animationData={loaderAnimation}
        loop={true}
        style={{ width: 70, height: 70 }}
      />
      {/* <img src={loaderImg} alt="Loading..." style={{ width: 50, height: 50 }} /> */}
    </div>
  );
};

export default CenteredLoader;

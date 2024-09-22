import React from "react";
import "./Loading.css"; // We'll create the CSS in the next step

const Loading = () => {
  return (
    <div className="loading-container">
      <div className="loading-dot"></div>
      <div className="loading-dot"></div>
      <div className="loading-dot"></div>
      <div className="loading-dot"></div>
      <div className="loading-dot"></div>
    </div>
  );
};

export default Loading;

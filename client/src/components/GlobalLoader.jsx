// components/GlobalLoader.jsx
import React from "react";
import { useSelector } from "react-redux"; // Or use context if you're not using Redux

const GlobalLoader = () => {
  const { isLoading } = useSelector((state) => state.loader); // Centralized loading state

  return (
    isLoading && (
      <div className="fixed z-50 inset-0 flex items-center justify-center bg-black bg-opacity-60">
        <div className="loader"></div>
      </div>
    )
  );
};

export default GlobalLoader;

import React from "react";
import { Outlet } from "react-router-dom";
import { useTheme } from "../../hook/useTheme";

const AIManager = () => {
  const { isDarkMode } = useTheme();
  return (
    <div className="w-full font-nunito">
      <div
        style={{ minHeight: "calc(100vh - 95px)" }}
        className={`w-full flex  rounded-lg overflow-hidden ${
          isDarkMode ? "bg-light-50 text-dark-50" : "bg-dark-200 text-light-50"
        }`}
      >
        <Outlet />
      </div>
    </div>
  );
};

export default AIManager;

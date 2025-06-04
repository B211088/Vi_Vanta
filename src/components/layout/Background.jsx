import React from "react";
import { useTheme } from "../../hook/useTheme";

const Background = ({ children }) => {
  const { isDarkMode } = useTheme();
  return (
    <div
      style={{ minHeight: "100vh" }}
      className={`w-full flex justify-center transition-all duration-200 ${
        isDarkMode ? "bg-[#00000017] text-dark-50" : "bg-dark-200 text-light-50"
      } font-nunito`}
    >
      {children}
    </div>
  );
};

export default Background;

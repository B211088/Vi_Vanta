import React from "react";
import { useTheme } from "../../hook/useTheme";

const ButtonToggleTheme = () => {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <div
      className={`fixed bottom-[20px] right-[20px] w-[42px] h-[42px] flex rounded-full items-center justify-center border-2 ${
        isDarkMode
          ? "bg-light-300   border-dark-200 text-light-100 "
          : "bg-light-50 border-light-200 text-dark-100"
      }`}
      onClick={toggleTheme}
    >
      {isDarkMode ? (
        <i className="fa-solid fa-moon text-violet-800"></i>
      ) : (
        <i className="fa-solid fa-sun text-amber-300"></i>
      )}
    </div>
  );
};

export default ButtonToggleTheme;

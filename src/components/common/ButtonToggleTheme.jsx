import React from "react";
import { useTheme } from "../../hook/useTheme";

const ButtonToggleTheme = () => {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <div
      className={`fixed bottom-[20px] right-[20px] w-[42px] h-[42px] flex rounded-full items-center justify-center border-2 ${
        isDarkMode
          ? "bg-light-50 border-light-200 text-dark-100"
          : "bg-light-500   border-dark-200 text-light-100 "
      }`}
      onClick={toggleTheme}
    >
      {isDarkMode ? (
        <i class="fa-solid fa-sun"></i>
      ) : (
        <i class="fa-solid fa-moon"></i>
      )}
    </div>
  );
};

export default ButtonToggleTheme;

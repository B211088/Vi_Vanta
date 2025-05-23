import React from "react";
import { useTheme } from "../../hook/useTheme";

const Modal = ({ children, closeModal }) => {
  const { isDarkMode } = useTheme();

  return (
    <div
      role="dialog"
      aria-modal="true"
      tabIndex="-1"
      className="fixed inset-0 z-50 flex items-center font-nunito justify-center bg-[#0000000e] cursor-pointer"
      onClick={closeModal}
    >
      <div
        className={`w-full flex justify-center p-5 rounded-lg 
        `}
      >
        {children}
      </div>
    </div>
  );
};

export default Modal;

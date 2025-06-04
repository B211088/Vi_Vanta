import React, { useEffect } from "react";
import { useTheme } from "../../hook/useTheme";

const Modal = ({ children, closeModal }) => {
  const { isDarkMode } = useTheme();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        closeModal();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [closeModal]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      tabIndex="-1"
      className="fixed inset-0 z-50 flex items-center font-nunito justify-center bg-[#0000000e] cursor-pointer"
      onClick={closeModal}
    >
      <div
        className={`w-full flex justify-center  rounded-lg 
        `}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
};

export default Modal;

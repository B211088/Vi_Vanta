import React from "react";

const CancelButton = ({ loading, closeModal }) => {
  return (
    <button
      disabled={loading}
      onClick={closeModal}
      className={`w-full flex justify-center items-center rounded-sm py-[8px] text-sm border-[1px] border-dark-600 font-bold cursor-pointer `}
    >
      <span>Quay lại</span>
    </button>
  );
};

export default CancelButton;

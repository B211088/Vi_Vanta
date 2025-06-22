import React from "react";

const SubmitButton = ({ loading }) => {
  return (
    <button
      type="submit"
      disabled={loading}
      className={`w-full flex justify-center items-center rounded-sm py-[8px] text-sm text-light-50 font-bold 
             ${loading ? "bg-gray-400" : "bg-blue-500 hover:bg-dark-600"} 
             transition-colors cursor-pointer`}
    >
      <span>{loading ? "Đang xử lý..." : "Xác nhận"}</span>
    </button>
  );
};

export default SubmitButton;

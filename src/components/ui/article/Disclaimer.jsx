import React from "react";

const Disclaimer = () => {
  return (
    <div className="w-full flex gap-3 bg-amber-100 p-6 rounded-md my-6 font-nunito">
      <div className="text-xl text-amber-500">
        <i className="fa-solid fa-triangle-exclamation"></i>
      </div>
      <div className="w-full flex flex-col justify-start">
        <h1 className="font-bold">Miễn trừ trách nhiệm</h1>
        <p>
          Các bài viết của Vivanta chỉ có tính chất tham khảo, không thay thế
          cho việc chẩn đoán hoặc điều trị y khoa.
        </p>
      </div>
    </div>
  );
};

export default Disclaimer;

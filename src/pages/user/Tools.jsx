import React from "react";
import { Outlet } from "react-router-dom";

const Tools = () => {
  return (
    <div className="w-full font-nunito">
      <div className="w-full flex flex-col pb-[20px]">
        <h1 className="text-lg font-medium">Tính chỉ số cơ thể</h1>
      </div>
      <div
        style={{ minHeight: "calc(100vh - 150px)" }}
        className="w-full flex  bg-light-50 rounded-lg p-[20px]"
      >
        <Outlet />
      </div>
    </div>
  );
};

export default Tools;

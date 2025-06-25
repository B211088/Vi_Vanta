import React from "react";
import { Outlet } from "react-router-dom";

const AIManager = () => {
  return (
    <div className="w-full font-nunito">
      <div
        style={{ minHeight: "calc(100vh - 95px)" }}
        className="w-full flex  bg-light-50 rounded-lg overflow-hidden"
      >
        <Outlet />
      </div>
    </div>
  );
};

export default AIManager;

import React from "react";

const Background = ({ children }) => {
  return (
    <div
      style={{ minHeight: "100vh" }}
      className="w-full flex justify-center bg-[#95959517] font-nunito"
    >
      {children}
    </div>
  );
};

export default Background;

import React from "react";

const Container = ({ children }) => {
  return (
    <div className="w-full flex justify-center ">
      <div className="w-full "> {children}</div>
    </div>
  );
};

export default Container;

import React from "react";
import { Link, Outlet } from "react-router-dom";

const Account = () => {
  return (
    <div className="w-full    font-nunito">
      <div className="w-full flex flex-col pb-[20px]">
        <h1 className="text-lg font-medium">Cài đặt tài khoản</h1>
      </div>
      <div
        style={{ minHeight: "calc(100vh - 150px)" }}
        className="w-full flex  bg-light-50 rounded-lg p-[20px]"
      >
        <div className="border-r-[1px]  border-[#e5e5e5] pr-[20px]">
          <ul className="flex flex-col gap-[15px] text-[0.92rem] font-semibold text-dark-200 ">
            <Link
              to="/account/profile"
              className="px-[20px]  py-[8px] rounded-md bg-dark-800"
            >
              Hồ sơ của tôi
            </Link>
            <Link className="px-[20px]  py-[8px] rounded-md ">
              Liên hệ khẩn cấp
            </Link>
            <Link className="px-[20px]  py-[8px] rounded-md ">
              Thông tin xã hội
            </Link>
            <Link className="px-[20px]  py-[8px] rounded-md ">Địa chỉ</Link>
          </ul>
        </div>
        <Outlet />
      </div>
    </div>
  );
};

export default Account;

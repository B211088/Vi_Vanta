import React from "react";
import { Link, Outlet, useLocation } from "react-router-dom";

const Account = () => {
  const location = useLocation();
  console.log({ location });
  return (
    <div className="w-full    font-nunito">
      <div className="w-full flex flex-col pb-[20px]">
        <h1 className="text-lg font-medium">Cài đặt tài khoản</h1>
      </div>
      <div
        style={{ minHeight: "calc(100vh - 150px)" }}
        className="w-full flex  bg-light-50 rounded-lg p-[20px]"
      >
        <div className="border-r-[1px] min-w-[200px]  border-[#e5e5e5] pr-[20px]">
          <ul className=" flex flex-col gap-[15px] text-[0.92rem] font-semibold text-dark-200 ">
            {nav.map((item) => (
              <Link
                key={item.id}
                to={item.path}
                className={`px-[20px]  py-[8px] rounded-md ${
                  item.path === location.pathname
                    ? "bg-dark-900 font-bold text-green-400"
                    : "font-medium text-sm"
                }`}
              >
                {item.name}
              </Link>
            ))}
          </ul>
        </div>
        <Outlet />
      </div>
    </div>
  );
};

export default Account;

const nav = [
  {
    id: 1,
    path: "/account/profile",
    name: "Hồ sơ của tôi",
  },
  {
    id: 2,
    path: "/account/social_info",
    name: "Thông tin xã hội",
  },
];

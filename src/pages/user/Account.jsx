import React from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import Header from "../../components/layout/Header";

const Account = () => {
  const location = useLocation();

  return (
    <div className="w-full flex flex-col items-center">
      <Header />

      <div className="w-[80%]   flex justify-center font-nunito p-3">
        <div
          style={{ minHeight: "calc(100vh - 60px)" }}
          className="w-full flex justify-center  bg-light-50 rounded-lg "
        >
          <div className="w-3/12 border-r-[1px] min-w-[200px]  border-[#e5e5e5] pr-4 py-4">
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
          <div className="pr-4 py-4 w-full">
            <Outlet />
          </div>
        </div>
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
    path: "/account/health_info",
    name: "Thông tin sức khỏe",
  },
  {
    id: 3,
    path: "/account/appointment",
    name: "Đặt khám",
  },
];

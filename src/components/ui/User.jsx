import { useDispatch, useSelector } from "react-redux";
import { logoutUser } from "../../services/auth.service";
import { useTheme } from "../../hook/useTheme";
import { useState } from "react";
import { Link } from "react-router-dom";

const User = () => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const { isDarkMode } = useTheme();
  const [openMenus, setOpenMenus] = useState({
    account: true,
    social: true, // thêm các menu khác nếu cần
  });

  const toggleMenu = (menuName) => {
    setOpenMenus((prev) => ({
      ...prev,
      [menuName]: !prev[menuName],
    }));
  };

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser());
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="flex items-center gap-[15px]">
      <div className="flex items-center gap-[5px]">
        <div
          className={`w-[38px] h-[38px] flex items-center justify-center ${
            isDarkMode ? "bg-dark-800" : "bg-dark-400"
          } rounded-full relative cursor-pointer`}
        >
          <i className="fa-regular fa-bell text-xl"></i>
          <div className="w-[16px] h-[16px] absolute top-[2px] right-[2px] text-[0.5rem] bg-red-500 text-light-50 rounded-full flex items-center justify-center">
            {0}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-[5px]">
        <div
          className={`w-[38px] h-[38px] flex items-center justify-center ${
            isDarkMode ? "bg-dark-800" : "bg-dark-400"
          } rounded-full relative cursor-pointer`}
        >
          <i className="fa-regular fa-comment-dots text-xl"></i>
          <div className="w-[16px] h-[16px] absolute top-[2px] right-[2px] text-[0.5rem] bg-red-500 text-light-50 rounded-full flex items-center justify-center">
            {0}
          </div>
        </div>
      </div>
      <div className=" flex items-center gap-[5px]  group relative">
        <p className="truncate text-sm font-semibold">{user.fullName}</p>
        <div className="w-[38px] h-[38px]  flex items-center justify-center bg-dark-800 rounded-full  overflow-hidden relative cursor-pointer">
          <img
            className="w-full h-full object-cover "
            src={user.avatar.url}
            alt=""
          />
          <div
            className={`w-[16px] h-[16px] absolute bottom-[2px] right-[2px] text-[0.5rem] ${
              isDarkMode ? "bg-dark-700" : "bg-dark-500"
            } rounded-full flex items-center justify-center`}
          >
            <i className="fa-solid fa-angle-down"></i>
          </div>
        </div>
        <div
          className={` absolute  hidden group-hover:flex group-hover:flex-col top-[100%] right-[0%]  ${
            isDarkMode ? "bg-light-50" : "bg-dark-400"
          } rounded-sm shadow-md `}
        >
          <div className="w-full flex items-center gap-[20px] px-[20px] py-[10px] border-b-[1px] border-dark-600">
            <div className="w-[52px] h-[52px]  flex items-center justify-center bg-dark-800 rounded-full  overflow-hidden relative cursor-pointer">
              <img
                className="w-full h-full object-cover "
                src={user.avatar.url}
                alt=""
              />
            </div>
            <div className="flex flex-col gap-[5px]">
              <h1 className="font-bold">{user.fullName}</h1>
              <p className="text-sm">ID:{user.ID}</p>
              <p className="text-sm">{user.email}</p>
            </div>
          </div>
          <div className="w-full flex flex-col">
            {menus.map((option) => (
              <div className="w-full flex flex-col">
                <div
                  key={option.id}
                  className="w-full flex items-center justify-between"
                >
                  <div className="flex items-center gap-[5px] px-[10px] py-[10px]">
                    <i className={option.icon}></i>
                    <span className="text-sm font-bold">{option.title}</span>
                  </div>
                  <div
                    className="w-[32px] h-[32px] flex items-center justify-center cursor-pointer"
                    onClick={() => toggleMenu(option.id)}
                  >
                    <i
                      className={`fa-solid fa-angle-down transition-transform duration-500 ${
                        openMenus[option.id] ? "rotate-180" : ""
                      }`}
                    ></i>
                  </div>
                </div>
                <ul
                  className={`w-full flex flex-col text-sm overflow-hidden transition-all duration-500 ${
                    openMenus[option.id]
                      ? "max-h-[500px] opacity-100"
                      : "max-h-0 opacity-0"
                  }`}
                >
                  {option.item.map((item) => (
                    <Link
                      to={item.path}
                      key={item.id}
                      className="pl-[34px] py-[6px] hover:bg-gray-100 cursor-pointer"
                    >
                      {item.name}
                    </Link>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="w-full flex justify-center items-center p-[10px]">
            <button
              className="w-full px-[10px] py-[8px] bg-dark-600 rounded-md text-sm text-light-50 font-bold cursor-pointer"
              onClick={handleLogout}
            >
              Đăng xuất
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default User;

const menus = [
  {
    id: "account",
    title: "Thông tin tài khoản",
    icon: "fa-solid fa-address-card",
    item: [
      {
        id: 1,
        name: "Hồ sơ",
        path: "/account",
      },
      {
        id: 2,
        name: "Địa chỉ",
      },
    ],
  },
  {
    id: "social",
    title: "Thông tin xã hội",
    icon: "fa-solid fa-users",
    item: [
      {
        id: 1,
        name: "Bạn bè",
      },
      {
        id: 2,
        name: "Nhóm",
      },
    ],
  },
];

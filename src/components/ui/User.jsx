import { useDispatch, useSelector } from "react-redux";
import { logoutUser } from "../../services/auth.service";
import { useTheme } from "../../hook/useTheme";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useEffect } from "react";
import { getNotifycationsByUser } from "../../services/notifycation.service";
import { Bell } from "lucide-react";

const User = () => {
  const { user } = useSelector((state) => state.auth);
  const { notifycations, pagination } = useSelector(
    (state) => state.notifycation
  );
  const dispatch = useDispatch();
  const { isDarkMode } = useTheme();
  const [openMenus, setOpenMenus] = useState({
    account: true,
    doctor: true,
  });
  useEffect(() => {
    dispatch(getNotifycationsByUser({ page: 1, limit: 10 }));
  }, []);

  console.log(notifycations, pagination);
  // Kiểm tra xem user có role doctor hay không
  const hasRole = (roleName) => {
    return user?.roles?.some(
      (role) => role === roleName || role.name === roleName
    );
  };

  // Lọc menu dựa trên role của user
  const getVisibleMenus = () => {
    return menus.filter((menu) => {
      if (menu.id === "doctor") {
        return hasRole("doctor");
      }
      return true; // Hiển thị các menu khác
    });
  };

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

  const visibleMenus = getVisibleMenus();

  return (
    <div className="flex items-center gap-[15px] font-nunito">
      <div className="flex items-center gap-[5px]">
        <div
          className={`w-10 h-10 flex items-center justify-center group relative border-1 border-dark-500  rounded-full  cursor-pointer`}
        >
          <Bell className="h-5 w-5" />
          <div className="w-[16px] h-[16px] absolute top-[2px] right-[2px] text-[0.5rem] bg-red-500 text-light-50 rounded-full flex items-center justify-center">
            {pagination?.total}
          </div>
          <div
            className={` absolute  hidden group-hover:flex group-hover:flex-col top-[100%] right-[0%]  z-50  ${
              isDarkMode ? "bg-light-50" : "bg-dark-400"
            } rounded-sm shadow-md `}
          >
            <div className="w-100 flex flex-col ">
              <div class="border-b-1 border-dark-600 p-2 font-bold">
                Thông báo
              </div>
              <div className="w-full  flex flex-col gap-2 p-2 overflow-y-auto sidebar-scroll-none max-h-80">
                {notifycations.length > 0 ? (
                  notifycations.length > 0 &&
                  notifycations.map((notify) => (
                    <div
                      key={notify._id}
                      className="w-full flex flex-col  p-2 rounded-md border-1 border-dark-800"
                    >
                      <h1 className="text-sm font-bold">{notify.title}</h1>
                      <p className="text-sm  text-dark-400 ">
                        {notify.message}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="w-full flex items-center justify-center text-dark-400  p-2 rounded-md border-1 border-dark-800">
                    <span>Bạn không có thông báo nào!</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className=" flex items-center gap-[5px]  group relative">
        <div className="w-[38px] h-[38px]  flex items-center justify-center bg-dark-800 rounded-full  overflow-hidden relative cursor-pointer">
          <img
            className="w-full h-full object-cover aspect-square rounded-full"
            src={user?.avatar?.url}
            alt=""
          />
          <div
            className={`w-[16px] h-[16px] absolute bottom-[2px] right-[2px] text-[0.5rem] z-2 ${
              isDarkMode ? "bg-dark-700" : "bg-dark-600"
            } rounded-full flex items-center justify-center`}
          >
            <i className="fa-solid fa-angle-down"></i>
          </div>
        </div>
        <div
          className={` absolute  hidden group-hover:flex group-hover:flex-col top-[100%] right-[0%]  z-50 ${
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
            {visibleMenus.map((option) => (
              <div
                key={option.id}
                className="w-full flex flex-col text-teal-500"
              >
                <div className="w-full flex items-center justify-between">
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
                  className={`w-full  flex flex-col text-xs font-semibold text-dark-500 overflow-hidden transition-all duration-500 ${
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
              className="w-full px-[10px] py-[8px] bg-teal-500 hover:bg-dark-600 rounded-md text-sm text-light-50 font-bold cursor-pointer"
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
        path: "/account/profile",
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
    ],
  },
  {
    id: "doctor",
    title: "Thông tin bác sĩ",
    icon: "fa-solid fa-users",
    item: [
      {
        id: 2,
        name: "Đặt khám",
        path: "/doctor/booking",
      },
      {
        id: 3,
        name: "Lịch khám",
        path: "/doctor/services/working-hour",
      },
    ],
  },
];

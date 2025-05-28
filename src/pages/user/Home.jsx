import { useState } from "react";
import Header from "../../components/layout/Header";
import Background from "../../components/layout/Background";
import ButtonToggleTheme from "../../components/common/ButtonToggleTheme";
import { Link, Outlet, useLocation } from "react-router-dom";
import { useTheme } from "../../hook/useTheme";

const Home = () => {
  const { isDarkMode } = useTheme();
  const location = useLocation();
  const [openDropdowns, setOpenDropdowns] = useState({});

  const toggleDropdown = (navId) => {
    setOpenDropdowns((prev) => {
      const isCurrentlyOpen = prev[navId];
      // Nếu dropdown hiện tại đang đóng, mở nó và đóng tất cả các dropdown khác
      if (!isCurrentlyOpen) {
        return { [navId]: true };
      }
      // Nếu dropdown hiện tại đang mở, đóng nó
      return { [navId]: false };
    });
  };

  return (
    <div
      className={`w-full flex flex-col font-nunito ${
        isDarkMode ? "bg-light-50 text-dark-50" : "bg-dark-200 text-light-50"
      }`}
    >
      <ButtonToggleTheme />
      <Header />
      <div className="w-full flex ">
        <div className="min-w-[250px] w-2/12 max-w-[280px] pl-[20px] mt-[10px] ">
          <div className="w-full flex flex-col gap-[10px] pr-[15px] pl-[5px]">
            <div
              className={`w-full flex items-center justify-between transition-all duration-300 ease-in-out transform hover:scale-[1.01] hover:shadow-md  ${
                location.pathname == ""
                  ? "bg-dark-800 font-bold text-dark-50"
                  : "text-gray-600"
              } cursor-pointer border-[1px] border-dark-700 font-bold shadow-sm rounded-sm px-[10px] py-[12px]`}
            >
              <Link className="flex-1 flex items-center gap-[5px]">
                <i className="fa-solid fa-hexagon-nodes text-blue-500"></i>
                <span className="text-sm">Vivanta AI</span>
              </Link>
            </div>

            {nav.map((option) => (
              <div key={option.id} className="w-full flex flex-col gap-[10px]">
                {/* Main navigation item */}
                <div className="w-full flex flex-col ">
                  <div
                    onClick={() =>
                      option.items.length > 0 && toggleDropdown(option.id)
                    }
                    className={`w-full flex items-center justify-between  ${
                      location.pathname.includes(option.path)
                        ? "bg-dark-800 font-bold text-dark-50"
                        : "text-gray-600 font-semibold "
                    } cursor-pointer hover:bg-dark-800 hover:font-bold hover:text-dark-50 rounded-sm px-[10px] py-[12px]`}
                  >
                    <Link
                      to={`${option.path}`}
                      className="flex-1 flex items-center gap-[5px]"
                      onClick={(e) =>
                        option.items.length > 0 && e.preventDefault()
                      }
                    >
                      <i className={option.icon}></i>
                      <span className="text-sm ">{option.name}</span>
                    </Link>
                    {option.items.length > 0 && (
                      <i
                        className={`fa-solid fa-chevron-down text-[0.8rem] transition-transform duration-200 ${
                          openDropdowns[option.id] ? "rotate-180" : ""
                        }`}
                      ></i>
                    )}
                  </div>

                  {option.items.length > 0 && (
                    <div
                      className={`overflow-hidden transition-all duration-300 ease-in-out ${
                        openDropdowns[option.id] ? "max-h-96 " : "max-h-0 "
                      }`}
                    >
                      <div className="w-full flex flex-col  pl-[15px] pt-[10px]">
                        {option.items.map((item) => (
                          <div
                            key={item.id}
                            className="w-full border-l-[1px] border-dark-500 pl-[4px] "
                          >
                            <Link
                              to={`${option.path}/${item.path}`}
                              className={`w-full flex items-center gap-[5px] mt-[5px] py-[10px] text-[0.8rem] ${
                                location.pathname.includes(item.path)
                                  ? "bg-dark-800 font-bold text-dark-50"
                                  : "text-gray-600 font-semibold "
                              } hover:bg-dark-800 hover:font-bold hover:text-dark-50 px-[5px] rounded-sm cursor-pointer `}
                            >
                              <i className={item.icon}></i>
                              <span className="">{item.name}</span>
                            </Link>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div
          style={{ height: "calc(100vh - 58px)" }}
          className="flex-1 p-[20px] flex justify-center bg-dark-900 shadow-sm overflow-y-auto  rounded-tl-lg"
        >
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default Home;

const nav = [
  {
    id: "home",
    path: "/dashboard",
    name: "Bảng điều khiển",
    icon: "fa-solid fa-border-all",
    items: [],
  },
  {
    id: "tools",
    path: "/tools",
    name: "Công cụ",
    icon: "fa-solid fa-compass",
    items: [
      {
        id: "body-index",
        path: "body-index",
        name: "Tính chỉ số cơ thể",
        icon: "fa-solid fa-calculator",
      },
      {
        id: "workout-schedule",
        path: "workout-schedule",
        name: "Lập lịch tập luyện",
        icon: "fa-solid fa-calendar-week",
      },
      {
        id: "dining-menu",
        path: "dining-menu",
        name: "Lập thực đơn ăn uống",
        icon: "fa-solid fa-receipt",
      },
    ],
  },
  {
    id: "personal-care",
    path: "/personal-care",
    name: "Chăm sóc cá nhân",
    icon: "fa-solid fa-person-walking-arrow-loop-left",
    items: [
      {
        id: "reminder-medicine",
        path: "reminder-medicine",
        name: "Nhắc nhở uống thuốc",
        icon: "fa-solid fa-pills",
      },
      {
        id: "weight-tracking",
        path: "weight-tracking",
        name: "Theo dõi cân nặng",
        icon: "fa-solid fa-weight-scale",
      },
      {
        id: "contraception-tracking",
        path: "contraception-tracking",
        name: "Theo dõi tránh thai",
        icon: "fa-solid fa-calendar-days",
      },
    ],
  },
  {
    id: "pregnancy-care",
    path: "/pregnancy-care",
    name: "Chăm sóc thai kỳ",
    icon: "fa-solid fa-person-pregnant",
    items: [],
  },
  {
    id: "children-care",
    path: "/children-care",
    name: "Chăm sóc bé",
    icon: "fa-solid fa-children",
    items: [],
  },
  {
    id: "library",
    path: "/library",
    name: "Thư viện",
    icon: "fa-solid fa-book",
    items: [
      {
        id: "diseases",
        path: "diseases",
        name: "Thư viện bệnh",
        icon: "fa-solid fa-disease",
      },
      {
        id: "medication",
        path: "medication",
        name: "Thư viện thuốc",
        icon: "fa-solid fa-pills",
      },

      {
        id: "foods",
        path: "foods",
        name: "Thư viện thức ăn",
        icon: "fa-solid fa-utensils",
      },
      {
        id: "workouts",
        path: "workouts",
        name: "Thư viện tập luyện",
        icon: "fa-solid fa-dumbbell",
      },
    ],
  },
  {
    id: "examination-schedule",
    path: "/examination-schedule",
    name: "Lịch khám",
    icon: "fa-solid fa-stethoscope",
    items: [],
  },
];

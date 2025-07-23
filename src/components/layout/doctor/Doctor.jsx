import React from "react";
import Header from "../Header";
import { useTheme } from "../../../hook/useTheme";
import { useState } from "react";
import { useLocation, Link, Outlet } from "react-router-dom";
import { CalendarArrowUp, ClipboardPlus, Clock } from "lucide-react";

const Doctor = () => {
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
    <div className="min-h-screen bg-gray-50 font-nunito">
      <Header />
      <div
        style={{ height: "calc(100vh - 63px)" }}
        className="w-full  flex gap-3 "
      >
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
                      !location.pathname.includes(option.path)
                        ? " font-bold text-dark-50 hover:bg-dark-800 hover:font-bold hover:text-dark-50"
                        : " font-semibold text-teal-500 bg-dark-900"
                    } cursor-pointer  rounded-sm px-[10px] py-[12px]`}
                  >
                    <Link
                      to={`${option.path}`}
                      className="flex-1 flex  gap-[5px]"
                      onClick={(e) =>
                        option.items.length > 0 && e.preventDefault()
                      }
                    >
                      <option.icon className="h-4 w-4 " />
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
                                  ? "bg-teal-50 font-bold text-dark-300 "
                                  : "text-gray-600 font-semibold hover:bg-dark-800 hover:font-bold hover:text-dark-50"
                              }  px-[5px] rounded-sm cursor-pointer `}
                            >
                              <item.icon className="h-4 w-4 " />
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
        <div className="flex-1 max-h-full p-[20px] flex justify-center bg-dark-900 shadow-sm overflow-y-auto  rounded-tl-lg">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default Doctor;
const nav = [
  {
    id: "booking",
    path: "/doctor/booking",
    name: "Đặt khám",
    icon: CalendarArrowUp,
    items: [],
  },
  {
    id: "services",
    path: "/doctor/services",
    name: "Quản lý dịch vụ",
    icon: ClipboardPlus,
    items: [
      {
        id: "working-hour",
        path: "working-hour",
        name: "Lịch làm việc",
        icon: Clock,
      },
    ],
  },
];

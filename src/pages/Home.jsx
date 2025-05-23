import Header from "../components/layout/Header";
import Background from "../components/layout/Background";
import ButtonToggleTheme from "../components/common/ButtonToggleTheme";
import { Outlet } from "react-router-dom";
import { useTheme } from "../hook/useTheme";

const Home = () => {
  const { isDarkMode } = useTheme();
  return (
    <div
      className={`w-full flex flex-col font-nunito ${
        isDarkMode ? "bg-light-50 text-dark-50" : "bg-dark-200 text-light-50"
      }`}
    >
      <ButtonToggleTheme />
      <Header />
      <div className="w-full flex ">
        <div className="min-w-[220px] w-2/12 max-w-[250px] pl-[20px]">
          <div className="w-full flex flex-col  px-[5px]">
            <h1 className="text-sm text-dark-400 uppercase">Menu</h1>
            <div className="w-full flex items-center gap-[5px] py-[10px] hover:bg-dark-800 px-[10px] rounded-sm cursor-pointer ">
              <i className="fa-solid fa-house"></i>
              <span className="text-sm ">Trang chủ</span>
            </div>
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

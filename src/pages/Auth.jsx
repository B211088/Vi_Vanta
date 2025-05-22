import { Link, Outlet, useLocation } from "react-router-dom";
import logoGoogle from "../assets/images/logo_google.png";
import banner from "../assets/images/bannerAuth.png";
import Background from "../components/layout/Background";
import ButtonToggleTheme from "../components/common/ButtonToggleTheme";

const Auth = () => {
  const location = useLocation();
  const isLoginPage = location.pathname.includes("login");

  return (
    <Background>
      <ButtonToggleTheme />
      <div className="w-full flex p-[30px] justify-center items-center ">
        <div
          style={{ maxHeight: "calc(100vh - 60px)" }}
          className="w-10/12 h-full flex items-center justify-center bg-white  rounded-xl overflow-hidden "
        >
          <div className="w-5/12 h-full flex flex-col justify-center  px-[30px] py-[20px] ">
            <div className="w-full flex flex-col h-full items-center justify-between ">
              <div className="w-full flex flex-col items-center">
                <div className="w-full flex gap-[5px] bg-dark-800 px-[5px] py-[6px] rounded-sm my-[20px] relative">
                  <div
                    className={`absolute w-6/12 h-[calc(100%-10px)] top-[5px]  bg-light-50 rounded-sm transition-all duration-300 ease-in-out ${
                      isLoginPage ? "left-[5px]" : "left-[calc(50%+-5px)]"
                    }`}
                  />
                  <Link
                    to="login"
                    className={`w-6/12 flex items-center justify-center px-[10px] py-[5px] rounded-sm text-sm  cursor-pointer relative z-10 transition-colors duration-300 ${
                      isLoginPage
                        ? "text-dark-50 font-bold"
                        : "text-dark-200 font-normal"
                    }`}
                  >
                    <span>Đăng nhập</span>
                  </Link>
                  <Link
                    to="register"
                    className={`w-6/12 flex items-center justify-center px-[10px] py-[5px] rounded-sm text-sm  cursor-pointer relative z-10 transition-colors duration-300 ${
                      !isLoginPage
                        ? "text-dark-50 font-bold"
                        : "text-dark-200 font-normal"
                    }`}
                  >
                    <span>Đăng ký</span>
                  </Link>
                </div>
              </div>
              <Outlet />
              <div className="w-full flex flex-col ">
                <div className="w-full flex items-center gap-[5px] font-light text-sm py-[10px]">
                  <div className="w-6/12 border-[0.2px] border-dark-800"></div>
                  <span>Hoặc</span>
                  <div className="w-6/12 border-[0.2px] border-dark-800"></div>
                </div>
                <div className="w-full flex flex-col gap-[10px] pb-[10px]">
                  <div className="flex  justify-center items-center gap-[5px] border-1 border-dark-700 p-[5px] rounded-sm cursor-pointer">
                    <img className="w-[26px]" src={logoGoogle} alt="" />
                    <p className="text-[0.92rem] font-medium">
                      Đăng nhập với google
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="w-7/12 h-full flex ">
            <div className="w-full h-full p-[10px] relative">
              <img
                src={banner}
                className="object-cover w-full max-h-full rounded-[10px]"
                alt=""
              />
            </div>
          </div>
        </div>
      </div>
    </Background>
  );
};

export default Auth;

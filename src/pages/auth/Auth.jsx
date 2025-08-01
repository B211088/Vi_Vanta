import { Link, Outlet, useLocation } from "react-router-dom";
import logoGoogle from "../../assets/images/logo_google.png";
import banner from "../../assets/images/bannerAuth.png";
import Background from "../../components/layout/Background";
import ButtonToggleTheme from "../../components/common/ButtonToggleTheme";
import { useTheme } from "../../hook/useTheme";

const Auth = () => {
  const location = useLocation();
  const isLoginPage = location.pathname.includes("login");
  const { isDarkMode } = useTheme();
  return (
    <div className="min-h-screen flex justify-center bg-light-50 p-20">
      {" "}
      <div className="w-full flex p-[30px] justify-center ">
        <div
          style={{ maxHeight: "calc(100vh - 60px)" }}
          className={`w-9/12 h-full flex items-center justify-center border-1 border-dark-800 r ${
            isDarkMode ? "bg-light-50" : "bg-dark-300"
          }  rounded-xl overflow-hidden `}
        >
          <div className="w-4/12 h-full flex ">
            <div className="w-full h-full relative">
              <img
                src={banner}
                className="object-cover w-full min-h-full   border-dark-700"
                alt=""
              />
            </div>
          </div>{" "}
          <div className="w-8/12 h-full flex flex-col items-center justify-center  px-[30px] py-[20px] ">
            <div className="w-8/12 flex flex-col h-full items-center justify-center">
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
                <div className="w-full flex  mt-5 text-sm">
                  {isLoginPage ? (
                    <div className="w-full flex justify-center gap-1">
                      <span>Bạn chưa có tài khoản? </span>
                      <Link to="register" className="font-bold text-teal-500">
                        Đăng ký
                      </Link>
                    </div>
                  ) : (
                    <div className="w-full flex gap-1 justify-center">
                      <span>Bạn chưa có tài khoản? </span>
                      <Link to="login" className="font-bold text-teal-500">
                        Đăng nhập
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;

import { useRouteError } from "react-router-dom";
import { useTheme } from "../hook/useTheme";

const ErrorPage = () => {
  const error = useRouteError();
  const { isDarkMode } = useTheme();

  return (
    <div
      className={`  w-full h-[100vh] flex items-center justify-center ${
        isDarkMode ? "bg-white text-dark-100" : "bg-dark-200 text-white"
      }`}
    >
      <div className="flex flex-col items-center">
        <div className="text-[3rem] text-red-600">
          <i className="fa-solid fa-face-dizzy"></i>
        </div>
        <h1 className="font-nunito font-bold text-[1.3rem] py-[5px]">
          Sorry! hình như có gì đó sai sai
        </h1>

        <p>
          Lỗi: <i>{error.statusText || error.message}</i>
        </p>
      </div>
    </div>
  );
};

export default ErrorPage;

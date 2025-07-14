import { Link } from "react-router-dom";
import Container from "./Container";
import { Heart } from "lucide-react";
import User from "../ui/User";
import { useTheme } from "../../hook/useTheme";
import { useSelector } from "react-redux";

const Header = () => {
  const { user } = useSelector((state) => state.auth);

  const { isDarkMode } = useTheme();

  return (
    <Container>
      <div className="w-full flex justify-between items-center  py-3 px-5 font-nunito border-b-1 border-dashed border-dark-700">
        <div className="w-7/12 flex items-center gap-6">
          <Link to="/" className="flex items-center space-x-1">
            <div className="w-7 h-7 bg-gradient-to-br  from-teal-500 to-emerald-500 rounded-sm flex items-center justify-center">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-teal-600 to-emerald-600 bg-clip-text text-transparent">
              VIVANTA
            </h1>
          </Link>
        </div>
        <div className="w-7/12 flex items-center justify-end gap-4">
          <ul className="w-8/12 flex items-center justify-end gap-4 text-sm font-bold">
            <Link
              to="/topics"
              className="flex  gap-1 items-center cursor-pointer hover:text-vivanta-emerald-500 transition-all duration-300 ease-in-out "
            >
              <span>Chuyên mục</span>
            </Link>
            <Link
              to="/book-examination"
              className="flex  gap-1 items-center cursor-pointer hover:text-vivanta-emerald-500 transition-all duration-300 ease-in-out "
            >
              <span>Đặt lịch khám</span>
            </Link>
            <Link
              to="/tools/all"
              className="flex  gap-1 items-center cursor-pointer hover:text-vivanta-emerald-500 transition-all duration-300 ease-in-out "
            >
              <span>Công cụ sức khỏe</span>
            </Link>
          </ul>
          <div
            className={`flex items-center justify-center transition-all duration-300 ease-in-out transform hover:scale-[1.01] hover:shadow-md  ${
              location.pathname == ""
                ? "bg-dark-800 font-bold text-dark-50"
                : "text-gray-600"
            } cursor-pointer border-[1px] border-dark-700 font-bold shadow-sm rounded-full px-10 py-2`}
          >
            <Link
              to="/vivanta-ai"
              className=" flex items-center gap-[5px] truncate "
            >
              <i className="fa-solid fa-hexagon-nodes text-vivanta-500"></i>
              <span className="text-sm">Vivanta AI</span>
            </Link>
          </div>
          {user ? (
            <User />
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/auth/login"
                className="flex items-center gap-2 border-1 border-dark-700 rounded-md truncate text-sm py-2 px-3 text-dark-400 font-bold"
              >
                <i className="fa-solid fa-right-to-bracket"></i>
                <span>Đăng nhập</span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </Container>
  );
};

export default Header;

import { Link } from "react-router-dom";
import Container from "./Container";
import Wrapper from "./Wrapper";
import logo from "../../assets/images/logo.png";
import User from "../ui/User";
import { useTheme } from "../../hook/useTheme";

const Header = () => {
  const { isDarkMode } = useTheme();
  return (
    <Container>
      <div className="w-full flex justify-between items-center  py-[8px] px-[20px]">
        <Link className="w-2/12 flex" to="/">
          <div className="w-[42px] flex items-center gap-[5px] pl-[5px]">
            <i className="fa-solid fa-hexagon-nodes text-blue-500 text-3xl"></i>
            <h1 className="text-lg font-black uppercase text-blue-500">
              Vivanta
            </h1>
          </div>
        </Link>
        <User />
      </div>
    </Container>
  );
};

export default Header;

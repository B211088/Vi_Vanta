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
          <div className="w-[42px] flex items-center">
            <img className="w-full" src={logo} alt="" />
            <h1 className="text-lg font-black uppercase text-[#f42d2d]">
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

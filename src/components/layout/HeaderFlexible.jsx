import { Link } from "react-router-dom";
import Container from "./Container";
import Wrapper from "./Wrapper";
import logo from "../../assets/images/logo.png";

const HeaderFlexible = () => {
  return (
    <Container>
      <Wrapper bgDark={"dark-500"} bgLight={"light-50"}>
        <div className="w-full flex justify-between items-center  py-[8px]">
          <Link className="w-2/12 flex" to="/">
            <div className="w-[42px] flex items-center">
              <img className="w-full" src={logo} alt="" />
              <h1 className="text-lg font-black uppercase text-[#f42d2d]">
                Vivanta
              </h1>
            </div>
          </Link>
        </div>
      </Wrapper>
    </Container>
  );
};

export default HeaderFlexible;

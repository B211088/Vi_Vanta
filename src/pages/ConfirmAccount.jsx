import Background from "../components/layout/Background";
import { Outlet, useNavigate } from "react-router-dom";

const ConfirmAccount = () => {
  const navigate = useNavigate();
  return (
    <Background>
      <div className="w-full flex p-[30px] justify-center items-center ">
        <div
          style={{ maxHeight: "calc(100vh - 60px)" }}
          className="w-10/12 h-full flex flex-col  items-center p-[20px] bg-white  rounded-xl overflow-hidden "
        >
          <div className="w-full flex items-center gap-[5px] ">
            <div
              className="w-[32px] h-[32px] flex items-center justify-center rounded-full border-1 cursor-pointer"
              onClick={() => navigate(-1)}
            >
              <i className="fa-solid fa-arrow-left"></i>
            </div>
            <span className="font-bold">Quay lại</span>
          </div>

          <Outlet />
        </div>
      </div>
    </Background>
  );
};

export default ConfirmAccount;

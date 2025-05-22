import { useLocation, useNavigate } from "react-router-dom";
import banner from "../../assets/images/bannerAuth.png";

import { useDispatch, useSelector } from "react-redux";
import { sendCodeVerifyMail } from "../../services/auth.service";
import { useEffect, useState } from "react";
import { useNotify } from "../../hook/useNotify";
import { loadingEnd } from "../../store/slices/authSlice";
import { useTheme } from "../../hook/useTheme";

const SendCodeForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { isDarkMode } = useTheme();
  const data = location.state;
  console.log({ data });
  const { loading, error } = useSelector((state) => state.auth);
  const { notifySuccess, notifyWarning, notifyError } = useNotify();
  const [email, setEmail] = useState("");

  useEffect(() => {
    setEmail(data.email);
  }, []);

  console.log({ email });

  const handleSubmit = async () => {
    try {
      const result = await dispatch(sendCodeVerifyMail(data.email));
      if (result.success) {
        notifySuccess(result.message);
        navigate("/confirm_account/confirm_code", {
          state: {
            email,
          },
        });
      }
    } catch (err) {
      console.error(err);
      notifyError(err.response?.data?.message || "Gửi mã thất bại");
    }
  };
  // Thêm useEffect để cleanup
  useEffect(() => {
    return () => {
      dispatch(loadingEnd());
    };
  }, [dispatch]);

  return (
    <div className="h-full flex flex-col items-center justify-center">
      <div className="w-full flex flex-col items-center justify-center gap-[5px]">
        <h1 className="font-black text-2xl">Xác nhận email của bạn</h1>
        <p
          className={`text-sm  ${
            isDarkMode ? " text-dark-300" : "text-light-200"
          }`}
        >
          Mã xác nhận sẽ gửi về mail của bạn truy cập mail để lấy mã xác nhận
        </p>
      </div>
      <div
        className={`min-w-[500px] flex flex-col items-center justify-center gap-[5px] px-[12px] my-[20px] py-[20px] rounded-md border-[1px] ${
          isDarkMode ? "border-dark-800" : "border-transparent bg-dark-200"
        } shadow-sm`}
      >
        <div className="w-[88px] h-[88px]  flex items-center justify-center mb-[20px] bg-dark-800 rounded-full  overflow-hidden relative cursor-pointer">
          <img
            className="w-full h-full object-cover aspect-square "
            src={banner}
            alt=""
          />
        </div>
        <div className="w-full flex flex-col">
          <span className="text-sm font-bold pb-[5px]">
            Mã sẽ được gửi đến Email
          </span>
          <div
            className={`w-full flex items-center border-[1px] ${
              isDarkMode
                ? " border-dark-600 "
                : "bg-dark-400 border-transparent"
            }  rounded-sm`}
          >
            <input
              className="flex-1  text-sm px-[5px] py-[8px] outline-none"
              placeholder="Nhập email của bạn"
              type="email"
              required
              name="email"
              value={data.email}
              onChange={(e) => setEmail({ email: e.target.value })}
            />
          </div>
        </div>
        <button
          type="submit"
          disabled={loading}
          className={`w-full flex justify-center items-center mt-[5px] rounded-sm py-[8px] text-sm text-light-50 font-bold 
                  ${loading ? "bg-gray-400" : "bg-dark-50 hover:bg-dark-600"} 
                  transition-colors cursor-pointer`}
          onClick={handleSubmit}
        >
          <span>{loading ? "Đang xử lý..." : "Gửi mã"}</span>
        </button>
      </div>
    </div>
  );
};

export default SendCodeForm;

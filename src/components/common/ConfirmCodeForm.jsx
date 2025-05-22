import { useState, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNotify } from "../../hook/useNotify";
import { useLocation, useNavigate } from "react-router-dom";
import { confirmCode } from "../../services/auth.service";
import { useTheme } from "../../hook/useTheme";

const ConfirmCodeForm = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
  const { isDarkMode } = useTheme();
  const data = location.state;
  const { loading, error } = useSelector((state) => state.auth);
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const inputRefs = useRef([]);
  const { notifyError, notifySuccess, notifyWarning } = useNotify();

  // Initialize refs for each input
  useEffect(() => {
    inputRefs.current = inputRefs.current.slice(0, 6);
    inputRefs.current[0]?.focus();
  }, []);

  const handleChange = (index, value) => {
    // Only allow numbers
    if (!/^\d*$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Move to next input if value is entered
    if (value && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (index, e) => {
    // Move to previous input on backspace if current input is empty
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, 6);

    if (!/^\d+$/.test(pastedData)) {
      notifyWarning("Chỉ được phép dán số");
      return;
    }

    const newCode = [...code];
    pastedData.split("").forEach((char, index) => {
      if (index < 6) newCode[index] = char;
    });
    setCode(newCode);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const confirmationCode = code.join("");

    if (confirmationCode.length !== 6) {
      notifyWarning("Vui lòng nhập đủ 6 số");
      return;
    }

    try {
      await dispatch(confirmCode(data.email, confirmationCode));
      notifySuccess("Xác nhận thành công!");
      navigate("/");
    } catch (error) {
      notifyError(error.message || "Xác nhận thất bại");
    }
  };

  return (
    <div className="h-full flex flex-col items-center justify-center">
      <div className="w-full flex flex-col items-center justify-center gap-[5px]">
        <h1 className="font-black text-2xl">Nhập mã xác nhận</h1>
        <p
          className={`text-sm  ${
            isDarkMode ? " text-dark-300" : "text-light-200"
          }`}
        >
          Chúng tôi đã gửi mã xác nhận đến email của bạn
        </p>
      </div>
      <div
        className={`min-w-[500px] flex flex-col items-center justify-center gap-[5px] px-[12px] my-[20px] pt-[30px] pb-[20px] rounded-md border-[1px] ${
          isDarkMode ? "border-dark-800" : "border-transparent bg-dark-200"
        } shadow-sm`}
      >
        <h1 className="py-[10px] text-sm">Mã mã gửi đến email: {data.email}</h1>
        <form
          onSubmit={handleSubmit}
          className="w-full flex flex-col gap-[20px]"
        >
          <div className="flex justify-center gap-[10px]">
            {code.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                type="text"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={handlePaste}
                className={`w-[40px] h-[40px] text-center text-lg font-bold 
              ${
                isDarkMode ? "border-2 border-dark-300" : "bg-dark-100"
              } rounded-md focus:border-primary-500 
              focus:outline-none transition-colors`}
              />
            ))}
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full flex justify-center items-center mt-[5px] rounded-sm py-[8px] text-sm text-light-50 font-bold 
                  ${loading ? "bg-gray-400" : "bg-dark-50 hover:bg-dark-600"} 
                  transition-colors cursor-pointer`}
          >
            <span>{loading ? "Đang xử lý..." : "Gửi mã"}</span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default ConfirmCodeForm;

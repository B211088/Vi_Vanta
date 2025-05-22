import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { registerUser } from "../../services/auth.service";
import { clearError } from "../../store/slices/authSlice";
import { useNotify } from "../../hook/useNotify";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../hook/useTheme";

const RegisterForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const { loading, error } = useSelector((state) => state.auth);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    acceptTerms: false,
  });

  const { notifySuccess, notifyWarning, notifyError } = useNotify();

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check required fields
    if (!formData.email || !formData.password || !formData.confirmPassword) {
      notifyWarning("Vui lòng điền đầy đủ thông tin");
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      notifyWarning("Email không hợp lệ");
      return;
    }

    // Validate password requirements
    if (!validatePassword(formData.password)) {
      notifyWarning("Mật khẩu không đáp ứng yêu cầu");
      return;
    }

    // Check password confirmation
    if (formData.password !== formData.confirmPassword) {
      notifyWarning("Mật khẩu xác nhận không khớp");
      return;
    }

    // Check terms acceptance
    if (!formData.acceptTerms) {
      notifyWarning("Vui lòng đồng ý với điều khoản dịch vụ");
      return;
    }

    try {
      const { confirmPassword, acceptTerms, ...registerData } = formData;
      const response = await dispatch(registerUser(registerData));
      console.log(response);
      navigate("/confirm_account/send_code", {
        state: {
          email: registerData.email,
        },
      });
      notifySuccess("Đăng ký thành công! Vui lòng kiểm tra email để xác nhận");
    } catch (err) {
      console.error(err);
      notifyError(err.response.data.message);
    }
  };

  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  const [passwordChecks, setPasswordChecks] = useState({
    minLength: false,
    hasUpperCase: false,
    hasLowerCase: false,
    hasNumber: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfimpassword, setShowConfirmpassword] = useState(false);

  const handleToggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleToggleShowConfirmpassword = () => {
    setShowConfirmpassword(!showConfimpassword);
  };

  const validatePassword = (password) => {
    const checks = {
      minLength: password.length >= 12,
      hasUpperCase: /[A-Z]/.test(password),
      hasLowerCase: /[a-z]/.test(password),
      hasNumber: /\d/.test(password),
      hasSpecialChar: /[@#$!&]/.test(password),
    };

    setPasswordChecks(checks);

    return Object.values(checks).every(Boolean);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (name === "password") {
      validatePassword(value);
    }
  };
  return (
    <form onSubmit={handleSubmit} className="w-full flex flex-col gap-[16px]">
      <div className="w-full flex flex-col">
        <span className="text-sm font-bold pb-[5px]">Email*</span>
        <div
          className={`w-full flex items-center border-[1px] ${
            isDarkMode ? " border-dark-600 " : "bg-dark-400 border-transparent"
          }  rounded-sm`}
        >
          <input
            className="flex-1  text-sm px-[5px] py-[8px] outline-none"
            placeholder="Nhập email của bạn"
            type="email"
            required
            name="email"
            value={formData.email}
            onChange={handleChange}
          />
        </div>
      </div>
      <div className="w-full flex flex-col">
        <span className="text-sm font-bold pb-[5px]">Password*</span>
        <div
          className={`w-full flex items-center border-[1px] ${
            isDarkMode ? " border-dark-600 " : "bg-dark-400 border-transparent"
          }  rounded-sm`}
        >
          <input
            className="flex-1  text-sm px-[5px] py-[8px] outline-none"
            placeholder="Nhập mật khẩu của bạn"
            type={showPassword ? "text" : "password"}
            name="password"
            required
            value={formData.password}
            onChange={handleChange}
          />
          <div
            className="px-[8px] flex justify-center items-center cursor-pointer"
            onClick={handleToggleShowPassword}
          >
            {showPassword ? (
              <i className="fa-regular fa-eye-slash"></i>
            ) : (
              <i className="fa-regular fa-eye"></i>
            )}
          </div>
        </div>
        <div className="mt-2 text-[0.7rem]">
          <div className="space-y-1">
            <div
              className={`flex items-center gap-2 ${
                passwordChecks.minLength ? "text-green-500" : ""
              }`}
            >
              <i
                className={`fas ${
                  passwordChecks.minLength ? "fa-check" : "fa-times"
                }`}
              ></i>
              <span>Tối thiểu 12 ký tự</span>
            </div>
            <div
              className={`flex items-center gap-2 ${
                passwordChecks.hasUpperCase ? "text-green-500" : ""
              }`}
            >
              <i
                className={`fas ${
                  passwordChecks.hasUpperCase ? "fa-check" : "fa-times"
                }`}
              ></i>
              <span>Ít nhất 1 chữ cái in hoa (A–Z)</span>
            </div>
            <div
              className={`flex items-center gap-2 ${
                passwordChecks.hasLowerCase ? "text-green-500" : ""
              }`}
            >
              <i
                className={`fas ${
                  passwordChecks.hasLowerCase ? "fa-check" : "fa-times"
                }`}
              ></i>
              <span>Ít nhất 1 chữ cái thường (a–z)</span>
            </div>
            <div
              className={`flex items-center gap-2 ${
                passwordChecks.hasNumber ? "text-green-500" : ""
              }`}
            >
              <i
                className={`fas ${
                  passwordChecks.hasNumber ? "fa-check" : "fa-times"
                }`}
              ></i>
              <span>Ít nhất 1 chữ số (0–9)</span>
            </div>
            <div
              className={`flex items-center gap-2 ${
                passwordChecks.hasSpecialChar ? "text-green-500" : ""
              }`}
            >
              <i
                className={`fas ${
                  passwordChecks.hasSpecialChar ? "fa-check" : "fa-times"
                }`}
              ></i>
              <span>Ít nhất 1 ký tự đặc biệt: @, #, $, !, &</span>
            </div>
          </div>
        </div>
      </div>
      <div className="w-full flex flex-col">
        <span className="text-sm font-bold pb-[5px]">Confirm Password*</span>
        <div
          className={`w-full flex items-center border-[1px] ${
            isDarkMode ? " border-dark-600 " : "bg-dark-400 border-transparent"
          }  rounded-sm`}
        >
          <input
            className="flex-1  text-sm px-[5px] py-[8px] outline-none"
            placeholder="Nhập lại mật khẩu của bạn"
            type={showConfimpassword ? "text" : "password"}
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
          />
          <div
            className="px-[8px] flex justify-center items-center cursor-pointer"
            onClick={handleToggleShowConfirmpassword}
          >
            {showConfimpassword ? (
              <i className="fa-regular fa-eye-slash"></i>
            ) : (
              <i className="fa-regular fa-eye"></i>
            )}
          </div>
        </div>
      </div>
      <div className="w-full flex items-center gap-[5px] rounded-sm">
        <input
          type="checkbox"
          name="acceptTerms"
          checked={formData.acceptTerms}
          onChange={handleChange}
          className="cursor-pointer"
        />
        <p className="text-[0.8rem]">
          Bạn có đồng ý với quy định và điều khoản dịch vụ của chúng tôi
        </p>
      </div>
      <button
        type="submit"
        disabled={loading}
        className={`w-full flex justify-center items-center rounded-sm py-[8px] text-sm text-light-50 font-bold 
          ${loading ? "bg-gray-400" : "bg-dark-50 hover:bg-dark-600"} 
          transition-colors cursor-pointer`}
      >
        <span>{loading ? "Đang xử lý..." : "Đăng ký"}</span>
      </button>
    </form>
  );
};

export default RegisterForm;

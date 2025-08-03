import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../../hook/useTheme";
import { useNotify } from "../../../hook/useNotify";
import { loginUser } from "../../../services/auth.service";
import { KeySquare, Mail } from "lucide-react";

const LoginForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const { notifySuccess, notifyWarning, notifyError } = useNotify();
  const { loading, error } = useSelector((state) => state.auth);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(() => {
    return localStorage.getItem("rememberEmail") ? true : false;
  });

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleToggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleRememberMe = (e) => {
    setRememberMe(e.target.checked);
  };

  useEffect(() => {
    const emailRemember = localStorage.getItem("rememberEmail");
    if (emailRemember) {
      setFormData({ ...formData, email: emailRemember });
    } else {
      return;
    }
  }, []);

  const [passwordChecks, setPasswordChecks] = useState({
    minLength: false,
    hasUpperCase: false,
    hasLowerCase: false,
    hasNumber: false,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      notifyWarning("Vui lòng điền đầy đủ thông tin");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      notifyWarning("Email không hợp lệ");
      return;
    }

    // if (!validatePassword(formData.password)) {
    //   notifyWarning("Mật khẩu không đáp ứng yêu cầu");
    //   return;
    // }

    if (rememberMe) {
      localStorage.setItem("rememberEmail", formData.email);
    } else {
      localStorage.removeItem("rememberEmail");
    }

    try {
      const response = await dispatch(loginUser(formData));
      console.log({ response });

      if (response.haveHealthInfo === false) {
        navigate("/health_setup", {
          state: { email: formData.email },
        });
      }
      notifySuccess(response.message);
    } catch (err) {
      notifyError(err?.response?.data.message);
      if (err?.response?.data.active === false) {
        navigate("/confirm_account/send_code", {
          state: { email: formData.email },
        });
      }
    }
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
    <form
      onSubmit={handleSubmit}
      className="w-full flex flex-col gap-5 font-nunito"
    >
      <div className="w-full flex flex-col ">
        <div className="w-full flex flex-col items-center mb-5">
          <h1 className="font-bold text-2xl">
            Chào mừng bạn trở lại với vivanta
          </h1>
          <p className="text-sm text-dark-300 py-2">
            Hãy đăng nhập tài khoản để tiếp tục
          </p>
        </div>
        <div
          className={`w-full flex items-center border-[1px] ${
            isDarkMode ? " border-dark-600 " : "bg-dark-400 border-transparent"
          }  rounded-sm`}
        >
          <div className="p-2">
            <Mail className="w-4 h-4 text-dark-400" />
          </div>
          <input
            className="flex-1  text-sm px-[5px] py-[8px] outline-none text-dark-200"
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
        <div
          className={`w-full flex items-center border-[1px] ${
            isDarkMode ? " border-dark-600 " : "bg-dark-400 border-transparent"
          }  rounded-sm`}
        >
          <div className="p-2">
            <KeySquare className="w-4 h-4 text-dark-400" />
          </div>
          <input
            className="flex-1  text-sm px-[5px] py-[8px] outline-none focus:boder-1 bo "
            placeholder="Nhập mật khẩu của bạn"
            type={showPassword ? "text" : "password"}
            name="password"
            required
            value={formData.password}
            onChange={handleChange}
          />
          <div
            className="px-2 text-sm flex justify-center items-center cursor-pointer text-dark-400"
            onClick={handleToggleShowPassword}
          >
            {showPassword ? (
              <i className="fa-regular fa-eye-slash"></i>
            ) : (
              <i className="fa-regular fa-eye"></i>
            )}
          </div>
        </div>
      </div>{" "}
      <div className="w-full flex items-center gap-[5px]  rounded-sm ">
        <input
          className="cursor-pointer"
          type="checkbox"
          checked={rememberMe}
          onChange={handleRememberMe}
        />
        <p className="text-[0.8rem]">Ghi nhớ tôi</p>
      </div>
      <button
        type="submit"
        disabled={loading}
        className={`w-full flex justify-center items-center rounded-sm py-[8px] text-sm text-light-50 font-bold 
          ${loading ? "bg-gray-400" : "bg-green-500 hover:bg-dark-600"} 
          transition-colors cursor-pointer`}
      >
        <span>{loading ? "Đang xử lý..." : "Đăng nhập"}</span>
      </button>
    </form>
  );
};

export default LoginForm;

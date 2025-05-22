import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../../services/auth.service";
import { useNotify } from "../../hook/useNotify";

const LoginForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
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

    if (!validatePassword(formData.password)) {
      notifyWarning("Mật khẩu không đáp ứng yêu cầu");
      return;
    }

    if (rememberMe) {
      localStorage.setItem("rememberEmail", formData.email);
    } else {
      localStorage.removeItem("rememberEmail");
    }

    try {
      await dispatch(loginUser(formData));
      navigate("/");
    } catch (err) {
      console.error(err.response.data);
      notifyError(err.response.data.message);
      if (!err.response.data.active) {
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
    <form onSubmit={handleSubmit} className="w-full flex flex-col gap-[16px]">
      <div className="w-full flex flex-col">
        <span className="text-sm font-bold pb-[5px]">Email*</span>
        <div className="w-full flex items-center border-[1px] border-dark-600  rounded-sm ">
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
        <div className="w-full flex items-center border-[1px] border-dark-600  rounded-sm ">
          <input
            className="flex-1  text-sm px-[5px] py-[8px] outline-none "
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
      </div>{" "}
      <div className="mt-2 text-[0.7rem]">
        <div className="space-y-1">
          <div
            className={`flex items-center gap-2 ${
              passwordChecks.minLength ? "text-green-500" : "text-dark-50"
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
              passwordChecks.hasUpperCase ? "text-green-500" : "text-dark-50"
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
              passwordChecks.hasLowerCase ? "text-green-500" : "text-dark-50"
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
              passwordChecks.hasNumber ? "text-green-500" : "text-dark-50"
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
              passwordChecks.hasSpecialChar ? "text-green-500" : "text-dark-50"
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
          ${loading ? "bg-gray-400" : "bg-dark-50 hover:bg-dark-600"} 
          transition-colors cursor-pointer`}
      >
        <span>{loading ? "Đang xử lý..." : "Đăng nhập"}</span>
      </button>
    </form>
  );
};

export default LoginForm;

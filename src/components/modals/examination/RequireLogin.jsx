import React from "react";
import Modal from "../../layout/Modal";
import { ArrowRight, Lock, User } from "lucide-react";
import { useNavigate } from "react-router-dom";

const RequireLogin = ({ closeModal }) => {
  const navigate = useNavigate();
  return (
    <Modal closeModal={closeModal}>
      <div className="bg-white w-full max-w-md mx-auto rounded-2xl shadow-2xl overflow-hidden ">
        {/* Header với gradient */}
        <div className="bg-gradient-to-r from-teal-500 to-emerald-500 px-8 py-6">
          <div className="flex items-center justify-center mb-2">
            <div className="bg-white/20 p-3 rounded-full">
              <Lock className="w-6 h-6 text-white" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-white text-center">
            Yêu cầu đăng nhập
          </h2>
          <p className="text-teal-100 text-center text-sm mt-2">
            Vui lòng đăng nhập để tiếp tục sử dụng dịch vụ
          </p>
        </div>

        {/* Body */}
        <div className="px-8 py-8">
          <div className="flex items-center justify-center mb-6">
            <div className="bg-gray-100 p-4 rounded-full">
              <User className="w-8 h-8 text-gray-600" />
            </div>
          </div>

          <p className="text-gray-600 text-center mb-8 leading-relaxed">
            Bạn cần đăng nhập để truy cập vào tính năng này. Điều này giúp bảo
            vệ thông tin cá nhân của bạn.
          </p>

          {/* Buttons */}
          <div className="space-y-3">
            <button
              className="w-full bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl flex items-center justify-center gap-3 group"
              onClick={() => navigate("/auth/login")}
            >
              <span>Đăng nhập ngay</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
            </button>

            <button className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-6 rounded-xl transition-all duration-200">
              Tạo tài khoản mới
            </button>
          </div>

          {/* Footer text */}
          <p className="text-xs text-gray-500 text-center mt-6">
            Bằng cách tiếp tục, bạn đồng ý với{" "}
            <span className="text-teal-600 hover:underline cursor-pointer">
              Điều khoản dịch vụ
            </span>{" "}
            của chúng tôi
          </p>
        </div>
      </div>
    </Modal>
  );
};

export default RequireLogin;

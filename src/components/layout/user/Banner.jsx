import React from "react";
import {
  Heart,
  Shield,
  Star,
  ChevronRight,
  Phone,
  Calendar,
  ChevronDown,
} from "lucide-react";
import { useSelector } from "react-redux";

const Banner = () => {
  return (
    <div className="w-full relative overflow-hidden">
      {/* Main Banner Container */}
      <div className="relative bg-gradient-to-br py-6 from-emerald-50 via-teal-50 to-cyan-50 min-h-[500px] flex items-center">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-10 left-10 w-32 h-32 bg-teal-400 rounded-full blur-3xl"></div>
          <div className="absolute top-32 right-20 w-40 h-40 bg-emerald-400 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 left-1/3 w-36 h-36 bg-cyan-400 rounded-full blur-3xl"></div>
        </div>

        {/* Medical Icons Background */}
        <div className="absolute inset-0 opacity-10">
          <Heart className="absolute top-20 right-1/4 w-16 h-16 text-teal-500 animate-pulse" />
          <Shield className="absolute bottom-32 left-1/4 w-12 h-12 text-emerald-500 animate-pulse" />
          <Star className="absolute top-40 left-1/3 w-10 h-10 text-cyan-500 animate-pulse" />
        </div>

        <div className="container mx-auto px-6 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-8">
              {/* Brand Logo */}
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br  from-teal-500 to-emerald-500 rounded-xl flex items-center justify-center">
                  <Heart className="w-7 h-7 text-white" />
                </div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-teal-600 to-emerald-600 bg-clip-text text-transparent">
                  VIVANTA
                </h1>
              </div>

              {/* Main Heading */}
              <div className="space-y-4">
                <h2 className="text-3xl font-bold text-gray-800 leading-tight">
                  Chăm Sóc
                  <span className="block bg-gradient-to-r from-teal-500 to-emerald-500 bg-clip-text text-transparent">
                    Sức Khỏe
                  </span>
                  <span className="block text-3xl">Toàn Diện</span>
                </h2>

                <p className="text-md text-gray-600 leading-relaxed max-w-lg">
                  Đồng hành cùng bạn trên hành trình chăm sóc sức khỏe với dịch
                  vụ chuyên nghiệp, tận tâm và công nghệ hiện đại nhất.
                </p>
              </div>

              {/* Features */}
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center space-x-2 bg-white/70 backdrop-blur-sm rounded-full px-4 py-2 shadow-sm">
                  <Shield className="w-5 h-5 text-teal-500" />
                  <span className="text-sm font-medium text-gray-700">
                    Uy tín 10+ năm
                  </span>
                </div>
                <div className="flex items-center space-x-2 bg-white/70 backdrop-blur-sm rounded-full px-4 py-2 shadow-sm">
                  <Star className="w-5 h-5 text-emerald-500" />
                  <span className="text-sm font-medium text-gray-700">
                    Đội ngũ chuyên gia
                  </span>
                </div>
                <div className="flex items-center space-x-2 bg-white/70 backdrop-blur-sm rounded-full px-4 py-2 shadow-sm">
                  <Heart className="w-5 h-5 text-teal-500" />
                  <span className="text-sm font-medium text-gray-700">
                    Chăm sóc 24/7
                  </span>
                </div>
              </div>

              {/* Call to Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <button className="group bg-gradient-to-r from-teal-500 to-emerald-500 text-white px-8 py-2 cursor-pointer rounded-xl font-semibold hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center space-x-2">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm">Đặt Lịch Khám</span>
                  <ChevronDown className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>

                <button className="group bg-white/80 backdrop-blur-sm text-teal-600 px-8 py-2 cursor-pointer  rounded-xl font-semibold border-2 border-teal-200 hover:bg-teal-50 hover:border-teal-300 transition-all duration-300 flex items-center justify-center space-x-2">
                  <Phone className="w-4 h-4" />
                  <span className="text-sm">Hotline: 1900 1234</span>
                </button>
              </div>

              {/* Trust Indicators */}
              <div className="flex items-center space-x-8 pt-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-teal-600">10K+</div>
                  <div className="text-sm text-gray-600">
                    Bài viết về chăm sóc sức khỏe
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-emerald-600">99%</div>
                  <div className="text-sm text-gray-600">Hài lòng</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-teal-600">24/7</div>
                  <div className="text-sm text-gray-600">Hỗ trợ</div>
                </div>
              </div>
            </div>

            {/* Right Content - Visual Element */}
            <div className="relative">
              <div className="relative z-10">
                {/* Main Circle */}
                <div className="w-80 h-80 mx-auto bg-gradient-to-br from-teal-400 to-emerald-400 rounded-full flex items-center justify-center shadow-2xl">
                  <div className="w-64 h-64 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                    <div className="w-48 h-48 bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center">
                      <Heart className="w-20 h-20 text-white animate-pulse" />
                    </div>
                  </div>
                </div>

                {/* Floating Elements */}
                <div className="absolute -top-4 -right-4 w-16 h-16 bg-white rounded-full shadow-lg flex items-center justify-center animate-bounce">
                  <Shield className="w-8 h-8 text-teal-500" />
                </div>
                <div
                  className="absolute -bottom-4 -left-4 w-16 h-16 bg-white rounded-full shadow-lg flex items-center justify-center animate-bounce"
                  style={{ animationDelay: "0.5s" }}
                >
                  <Star className="w-8 h-8 text-emerald-500" />
                </div>
                <div
                  className="absolute top-1/2 -left-8 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center animate-bounce"
                  style={{ animationDelay: "1s" }}
                >
                  <div className="w-3 h-3 bg-teal-500 rounded-full"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Wave */}
        <div className="absolute bottom-0 inset-x-0">
          <svg
            viewBox="0 0 1200 120"
            className="w-full h-20 text-white block"
            preserveAspectRatio="none"
          >
            <path
              d="M0,60 C300,120 900,0 1200,60 L1200,120 L0,120 Z"
              fill="currentColor"
            />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default Banner;

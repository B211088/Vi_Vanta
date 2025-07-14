import React from "react";
import {
  Calendar,
  UserCheck,
  Stethoscope,
  ChevronRight,
  Search,
} from "lucide-react";

const BookingBanner = () => {
  return (
    <div className="w-full relative overflow-hidden">
      <div className="relative bg-gradient-to-br py-6 from-cyan-50 via-emerald-50 to-teal-50 min-h-[500px] flex items-center">
        {/* Background Effects */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-16 left-12 w-28 h-28 bg-teal-400 rounded-full blur-3xl"></div>
          <div className="absolute bottom-24 right-20 w-36 h-36 bg-emerald-400 rounded-full blur-3xl"></div>
        </div>

        <div className="container mx-auto px-6 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Section */}
            <div className="space-y-8">
              {/* Title */}
              <div className="space-y-4">
                <h2 className="text-4xl font-bold text-gray-800 leading-tight">
                  Đặt Lịch Khám
                  <span className="block bg-gradient-to-r from-teal-600 to-emerald-600 bg-clip-text text-transparent">
                    Chọn Bác Sĩ Phù Hợp
                  </span>
                </h2>
                <p className="text-md text-gray-600 leading-relaxed max-w-lg">
                  Dễ dàng tìm kiếm bác sĩ theo chuyên khoa, kinh nghiệm và đánh
                  giá thực tế. Hẹn khám chỉ trong vài bước đơn giản.
                </p>
              </div>

              {/* Features */}
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center space-x-2 bg-white/70 backdrop-blur-sm rounded-full px-4 py-2 shadow-sm">
                  <Stethoscope className="w-5 h-5 text-teal-500" />
                  <span className="text-sm font-medium text-gray-700">
                    Đa dạng chuyên khoa
                  </span>
                </div>
                <div className="flex items-center space-x-2 bg-white/70 backdrop-blur-sm rounded-full px-4 py-2 shadow-sm">
                  <UserCheck className="w-5 h-5 text-emerald-500" />
                  <span className="text-sm font-medium text-gray-700">
                    Hồ sơ bác sĩ rõ ràng
                  </span>
                </div>
                <div className="flex items-center space-x-2 bg-white/70 backdrop-blur-sm rounded-full px-4 py-2 shadow-sm">
                  <Calendar className="w-5 h-5 text-cyan-500" />
                  <span className="text-sm font-medium text-gray-700">
                    Lịch khám linh hoạt
                  </span>
                </div>
              </div>

              {/* Call to Action */}
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <button className="group bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-8 py-2 cursor-pointer rounded-xl font-semibold hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center space-x-2">
                  <Search className="w-4 h-4" />
                  <span className="text-sm">Tìm Bác Sĩ</span>
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>

                <button className="group bg-white/80 backdrop-blur-sm text-emerald-600 px-8 py-2 cursor-pointer rounded-xl font-semibold border-2 border-emerald-200 hover:bg-emerald-50 hover:border-emerald-300 transition-all duration-300 flex items-center justify-center space-x-2">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm">Đặt Lịch Ngay</span>
                </button>
              </div>

              {/* Metrics */}
              <div className="flex items-center space-x-8 pt-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-teal-600">1.5K+</div>
                  <div className="text-sm text-gray-600">
                    Bác sĩ đang hoạt động
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-emerald-600">
                    200+
                  </div>
                  <div className="text-sm text-gray-600">
                    Chuyên khoa hỗ trợ
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-cyan-600">98%</div>
                  <div className="text-sm text-gray-600">
                    Hài lòng người dùng
                  </div>
                </div>
              </div>
            </div>

            {/* Right Section - Decorative Circle */}
            <div className="relative">
              <div className="w-80 h-80 mx-auto bg-gradient-to-br from-emerald-400 to-teal-400 rounded-full flex items-center justify-center shadow-2xl">
                <div className="w-64 h-64 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                  <UserCheck className="w-24 h-24 text-white animate-pulse" />
                </div>
              </div>

              <div className="absolute -top-4 -right-4 w-14 h-14 bg-white rounded-full shadow-lg flex items-center justify-center animate-bounce">
                <Stethoscope className="w-7 h-7 text-teal-500" />
              </div>
              <div
                className="absolute bottom-0 -left-4 w-14 h-14 bg-white rounded-full shadow-lg flex items-center justify-center animate-bounce"
                style={{ animationDelay: "0.5s" }}
              >
                <Calendar className="w-7 h-7 text-emerald-500" />
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

export default BookingBanner;

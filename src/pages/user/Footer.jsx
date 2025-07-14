import React from "react";
import {
  Heart,
  Phone,
  Mail,
  MapPin,
  Clock,
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  Shield,
  Award,
  Users,
  ChevronRight,
  ArrowUp,
} from "lucide-react";

const Footer = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white overflow-hidden">
      {/* Top Wave */}
      <div className="absolute top-0 inset-x-0 transform rotate-180">
        <svg
          viewBox="0 0 1200 120"
          className="w-full h-20 text-slate-900 block"
          preserveAspectRatio="none"
        >
          <path
            d="M0,60 C300,120 900,0 1200,60 L1200,120 L0,120 Z"
            fill="currentColor"
          />
        </svg>
      </div>

      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-20 w-40 h-40 bg-teal-400 rounded-full blur-3xl"></div>
        <div className="absolute bottom-32 right-32 w-32 h-32 bg-emerald-400 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-cyan-400 rounded-full blur-3xl"></div>
      </div>

      {/* Medical Icons Background */}
      <div className="absolute inset-0 opacity-10">
        <Heart className="absolute top-40 right-1/4 w-12 h-12 text-teal-400 animate-pulse" />
        <Shield className="absolute bottom-40 left-1/4 w-10 h-10 text-emerald-400 animate-pulse" />
        <Award className="absolute top-60 left-1/3 w-8 h-8 text-cyan-400 animate-pulse" />
      </div>

      <div className="relative z-10 pt-24 pb-8">
        <div className="container mx-auto px-6">
          {/* Main Footer Content */}
          <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-8 mb-12">
            {/* Company Info */}
            <div className="lg:col-span-1">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-emerald-500 rounded-xl flex items-center justify-center">
                  <Heart className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold bg-gradient-to-r from-teal-400 to-emerald-400 bg-clip-text text-transparent">
                  VIVANTA
                </h3>
              </div>
              <p className="text-gray-300 mb-6 leading-relaxed text-sm">
                Đồng hành cùng bạn trên hành trình chăm sóc sức khỏe với dịch vụ
                chuyên nghiệp, tận tâm và công nghệ hiện đại nhất.
              </p>

              {/* Trust Badges */}
              <div className="flex items-center space-x-4 mb-6">
                <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-lg px-3 py-2">
                  <Shield className="w-4 h-4 text-teal-400" />
                  <span className="text-sm text-gray-300">Uy tín</span>
                </div>
                <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-lg px-3 py-2">
                  <Award className="w-4 h-4 text-emerald-400" />
                  <span className="text-sm text-gray-300">Chuyên nghiệp</span>
                </div>
              </div>

              {/* Social Media */}
              <div className="flex space-x-4">
                <a
                  href="#"
                  className="w-10 h-10 bg-white/10 backdrop-blur-sm rounded-lg flex items-center justify-center hover:bg-teal-500 transition-colors duration-300 group"
                >
                  <Facebook className="w-5 h-5 text-gray-300 group-hover:text-white" />
                </a>
                <a
                  href="#"
                  className="w-10 h-10 bg-white/10 backdrop-blur-sm rounded-lg flex items-center justify-center hover:bg-teal-500 transition-colors duration-300 group"
                >
                  <Instagram className="w-5 h-5 text-gray-300 group-hover:text-white" />
                </a>
                <a
                  href="#"
                  className="w-10 h-10 bg-white/10 backdrop-blur-sm rounded-lg flex items-center justify-center hover:bg-teal-500 transition-colors duration-300 group"
                >
                  <Youtube className="w-5 h-5 text-gray-300 group-hover:text-white" />
                </a>
                <a
                  href="#"
                  className="w-10 h-10 bg-white/10 backdrop-blur-sm rounded-lg flex items-center justify-center hover:bg-teal-500 transition-colors duration-300 group"
                >
                  <Twitter className="w-5 h-5 text-gray-300 group-hover:text-white" />
                </a>
              </div>
            </div>

            {/* Services */}
            <div>
              <h4 className="text-base font-semibold mb-6 flex items-center">
                <Heart className="w-4 h-4 text-teal-400 mr-2" />
                Dịch Vụ
              </h4>
              <ul className="space-y-3">
                {[
                  "Khám Tổng Quát",
                  "Chuyên Khoa Tim Mạch",
                  "Chuyên Khoa Nhi",
                  "Chẩn Đoán Hình Ảnh",
                  "Xét Nghiệm",
                  "Phẫu Thuật",
                ].map((service) => (
                  <li key={service}>
                    <a
                      href="#"
                      className="text-gray-300 hover:text-teal-400 transition-colors duration-300 flex items-center group text-sm"
                    >
                      <ChevronRight className="w-3 h-3 mr-2 group-hover:translate-x-1 transition-transform" />
                      {service}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-base font-semibold mb-6 flex items-center">
                <Users className="w-4 h-4 text-emerald-400 mr-2" />
                Liên Kết
              </h4>
              <ul className="space-y-3">
                {[
                  "Về Chúng Tôi",
                  "Đội Ngũ Bác Sĩ",
                  "Tin Tức",
                  "Góc Sức Khỏe",
                  "Tuyển Dụng",
                  "Liên Hệ",
                ].map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-gray-300 hover:text-emerald-400 transition-colors duration-300 flex items-center group text-sm"
                    >
                      <ChevronRight className="w-3 h-3 mr-2 group-hover:translate-x-1 transition-transform" />
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact Info */}
            <div>
              <h4 className="text-base font-semibold mb-6 flex items-center">
                <Phone className="w-4 h-4 text-cyan-400 mr-2" />
                Liên Hệ
              </h4>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Phone className="w-4 h-4 text-teal-400 mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-white font-medium text-sm">Hotline</p>
                    <p className="text-gray-300 text-sm">1900 1234</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Mail className="w-4 h-4 text-emerald-400 mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-white font-medium text-sm">Email</p>
                    <p className="text-gray-300 text-sm">info@vivanta.vn</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <MapPin className="w-4 h-4 text-cyan-400 mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-white font-medium text-sm">Địa chỉ</p>
                    <p className="text-gray-300 text-sm">
                      123 Đường Sức Khỏe, Quận 1, TP.HCM
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <div className="text-center p-6 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
              <div className="text-2xl font-bold text-teal-400 mb-2">50K+</div>
              <div className="text-xs text-gray-300">Khách hàng tin tưởng</div>
            </div>
            <div className="text-center p-6 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
              <div className="text-2xl font-bold text-emerald-400 mb-2">
                99%
              </div>
              <div className="text-xs text-gray-300">Hài lòng</div>
            </div>
            <div className="text-center p-6 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
              <div className="text-2xl font-bold text-cyan-400 mb-2">24/7</div>
              <div className="text-xs text-gray-300">Hỗ trợ</div>
            </div>
            <div className="text-center p-6 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
              <div className="text-2xl font-bold text-teal-400 mb-2">15+</div>
              <div className="text-xs text-gray-300">Năm kinh nghiệm</div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-white/20 pt-8 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-center md:text-left">
              <p className="text-gray-300 text-sm">
                © 2024 Vivanta Healthcare. Bản quyền thuộc về Vivanta.
              </p>
              <p className="text-gray-400 text-xs mt-1">
                Giấy phép hoạt động số: 123456789 - Cấp bởi Sở Y tế TP.HCM
              </p>
            </div>

            <div className="flex items-center space-x-6">
              <a
                href="#"
                className="text-gray-400 hover:text-teal-400 text-sm transition-colors duration-300"
              >
                Chính sách bảo mật
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-teal-400 text-sm transition-colors duration-300"
              >
                Điều khoản sử dụng
              </a>
              <button
                onClick={scrollToTop}
                className="w-10 h-10 bg-gradient-to-r from-teal-500 to-emerald-500 rounded-full flex items-center justify-center hover:shadow-lg transition-all duration-300 transform hover:scale-105"
              >
                <ArrowUp className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

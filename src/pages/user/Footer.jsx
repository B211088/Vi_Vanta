import React from "react";
import {
  Heart,
  Phone,
  Mail,
  MapPin,
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
      {/* Background Highlights */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-20 w-40 h-40 bg-teal-400 rounded-full blur-3xl"></div>
        <div className="absolute bottom-32 right-32 w-32 h-32 bg-emerald-400 rounded-full blur-3xl"></div>
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
                Nền tảng chăm sóc sức khỏe toàn diện — theo dõi sức khỏe, đặt
                lịch khám, và tư vấn y tế thông minh với trợ lý AI. Chúng tôi
                luôn đồng hành vì một cộng đồng khỏe mạnh.
              </p>

              {/* Trust Badges */}
              <div className="flex items-center space-x-4 mb-6">
                <div className="flex items-center space-x-2 bg-white/10 rounded-lg px-3 py-2">
                  <Shield className="w-4 h-4 text-teal-400" />
                  <span className="text-sm text-gray-300">Bảo mật</span>
                </div>
                <div className="flex items-center space-x-2 bg-white/10 rounded-lg px-3 py-2">
                  <Award className="w-4 h-4 text-emerald-400" />
                  <span className="text-sm text-gray-300">Chất lượng</span>
                </div>
              </div>

              {/* Social Media */}
              <div className="flex space-x-4">
                <a
                  href="#"
                  className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center hover:bg-teal-500 transition-colors"
                >
                  <Facebook className="w-5 h-5 text-gray-300 hover:text-white" />
                </a>
                <a
                  href="#"
                  className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center hover:bg-teal-500 transition-colors"
                >
                  <Instagram className="w-5 h-5 text-gray-300 hover:text-white" />
                </a>
                <a
                  href="#"
                  className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center hover:bg-teal-500 transition-colors"
                >
                  <Youtube className="w-5 h-5 text-gray-300 hover:text-white" />
                </a>
                <a
                  href="#"
                  className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center hover:bg-teal-500 transition-colors"
                >
                  <Twitter className="w-5 h-5 text-gray-300 hover:text-white" />
                </a>
              </div>
            </div>

            {/* Services */}
            <div>
              <h4 className="text-base font-semibold mb-6 flex items-center">
                <Heart className="w-4 h-4 text-teal-400 mr-2" />
                Công Cụ & Dịch Vụ
              </h4>
              <ul className="space-y-3">
                {[
                  "Theo Dõi Sức Khỏe",
                  "Đặt Lịch Khám Bác Sĩ",
                  "Tư Vấn Sức Khỏe AI",
                  "Nhắc Uống Thuốc",
                  "Theo Dõi Thai Kỳ",
                  "Quản Lý Hồ Sơ Y Tế",
                ].map((service) => (
                  <li key={service}>
                    <a
                      href="#"
                      className="text-gray-300 hover:text-teal-400 transition-colors flex items-center text-sm"
                    >
                      <ChevronRight className="w-3 h-3 mr-2" />
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
                Liên Kết Nhanh
              </h4>
              <ul className="space-y-3">
                {[
                  "Về Chúng Tôi",
                  "Đội Ngũ Chuyên Gia",
                  "Tin Tức Y Tế",
                  "Cẩm Nang Sức Khỏe",
                  "Hỗ Trợ & Liên Hệ",
                ].map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-gray-300 hover:text-emerald-400 transition-colors flex items-center text-sm"
                    >
                      <ChevronRight className="w-3 h-3 mr-2" />
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
                  <Phone className="w-4 h-4 text-teal-400 mt-1" />
                  <div>
                    <p className="text-white font-medium text-sm">Hotline</p>
                    <p className="text-gray-300 text-sm">1900 6868</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Mail className="w-4 h-4 text-emerald-400 mt-1" />
                  <div>
                    <p className="text-white font-medium text-sm">Email</p>
                    <p className="text-gray-300 text-sm">support@vivanta.vn</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <MapPin className="w-4 h-4 text-cyan-400 mt-1" />
                  <div>
                    <p className="text-white font-medium text-sm">Địa chỉ</p>
                    <p className="text-gray-300 text-sm">
                      123 Sức Khỏe Street, Quận 1, TP.HCM
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <div className="text-center p-6 bg-white/5 rounded-xl">
              <div className="text-2xl font-bold text-teal-400 mb-2">100K+</div>
              <div className="text-xs text-gray-300">Người dùng hài lòng</div>
            </div>
            <div className="text-center p-6 bg-white/5 rounded-xl">
              <div className="text-2xl font-bold text-emerald-400 mb-2">
                98%
              </div>
              <div className="text-xs text-gray-300">Đánh giá tích cực</div>
            </div>
            <div className="text-center p-6 bg-white/5 rounded-xl">
              <div className="text-2xl font-bold text-cyan-400 mb-2">24/7</div>
              <div className="text-xs text-gray-300">Tư vấn & hỗ trợ</div>
            </div>
            <div className="text-center p-6 bg-white/5 rounded-xl">
              <div className="text-2xl font-bold text-teal-400 mb-2">20+</div>
              <div className="text-xs text-gray-300">Chuyên khoa</div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-white/20 pt-8 flex flex-col md:flex-row justify-between items-center">
            <div className="text-center md:text-left">
              <p className="text-gray-300 text-sm">
                © 2024 Vivanta Health. Tất cả quyền được bảo lưu.
              </p>
              <p className="text-gray-400 text-xs mt-1">
                Giấy phép hoạt động số: 123456789 - Cấp bởi Bộ Y Tế
              </p>
            </div>
            <div className="flex items-center space-x-6">
              <a href="#" className="text-gray-400 hover:text-teal-400 text-sm">
                Chính sách bảo mật
              </a>
              <a href="#" className="text-gray-400 hover:text-teal-400 text-sm">
                Điều khoản sử dụng
              </a>
              <button
                onClick={scrollToTop}
                className="w-10 h-10 bg-gradient-to-r from-teal-500 to-emerald-500 rounded-full flex items-center justify-center hover:shadow-lg"
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

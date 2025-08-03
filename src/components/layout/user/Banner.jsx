import React, { useState, useEffect } from "react";
import {
  Heart,
  Shield,
  Star,
  ChevronRight,
  Phone,
  Calendar,
  ChevronDown,
  Activity,
  Stethoscope,
  CheckCircle,
  Users,
  Clock,
  Award,
  Zap,
  Target,
  TrendingUp,
  Brain,
  Clipboard,
  Search,
  ChevronLeft,
} from "lucide-react";
import { Link } from "react-router-dom";
const slides = [
  {
    id: 1,
    title: "Chăm Sóc Sức Khỏe",
    subtitle: "Toàn Diện",
    description:
      "Đồng hành cùng bạn trên hành trình chăm sóc sức khỏe với dịch vụ chuyên nghiệp, tận tâm và công nghệ hiện đại nhất.",

    theme: "teal",
    mainIcon: Heart,
    floatingIcons: [Shield, Star, Activity],
    stats: [
      { number: "10K+", label: "Bệnh nhân tin tưởng" },
      { number: "99%", label: "Hài lòng" },
      { number: "24/7", label: "Hỗ trợ" },
    ],
  },
  {
    id: 2,
    title: "Đặt Lịch Khám",
    subtitle: "Online Nhanh Chóng",
    description:
      "Đặt lịch khám bệnh trực tuyến dễ dàng với các bác sĩ chuyên khoa hàng đầu. Tiết kiệm thời gian, tối ưu trải nghiệm.",
    primaryButton: "Đặt Lịch Ngay",

    theme: "blue",
    mainIcon: Calendar,
    primaryPath: "book-examination",

    floatingIcons: [Stethoscope, Clock, CheckCircle],
    stats: [
      { number: "500+", label: "Bác sĩ chuyên khoa" },
      { number: "98%", label: "Đúng giờ" },
      { number: "15p", label: "Trung bình chờ" },
    ],
  },
  {
    id: 3,
    title: "Công Cụ Kiểm Tra",
    subtitle: "Sức Khỏe Thông Minh",
    description:
      "Sử dụng AI và công nghệ tiên tiến để đánh giá sức khỏe ban đầu, tư vấn và định hướng chăm sóc phù hợp.",
    primaryButton: "Kiểm Tra Ngay",
    primaryPath: "tools/all",
    theme: "purple",
    mainIcon: Brain,
    floatingIcons: [Search, Target, TrendingUp],
    stats: [
      { number: "20+", label: "Công cụ kiểm tra" },
      { number: "95%", label: "Chính xác" },
      { number: "5p", label: "Có kết quả" },
    ],
  },
  {
    id: 4,
    title: "Trở thành bác sĩ trên nền tảng",
    subtitle: "Hợp tác khám chữa bệnh cùng chúng tôi",
    description:
      "Đăng ký để trở thành bác sĩ, tiếp cận hàng nghìn bệnh nhân và xây dựng hồ sơ chuyên nghiệp trên hệ thống chăm sóc sức khỏe hiện đại.",
    primaryButton: "Đăng ký ngay",

    theme: "teal",
    mainIcon: Users,
    floatingIcons: [Award, Stethoscope, Zap],
    primaryPath: "register-doctor",
  },
];

const getThemeColors = (theme) => {
  const themes = {
    teal: {
      gradient: "from-teal-50 via-cyan-50 to-emerald-50",
      primary: "from-teal-500 to-emerald-500",
      text: "text-teal-600",
      secondary: "text-emerald-600",
      accent: "teal-500",
      blur1: "bg-teal-400",
      blur2: "bg-emerald-400",
      blur3: "bg-cyan-400",
    },
    blue: {
      gradient: "from-blue-50 via-indigo-50 to-cyan-50",
      primary: "from-blue-500 to-indigo-500",
      text: "text-blue-600",
      secondary: "text-indigo-600",
      accent: "blue-500",
      blur1: "bg-blue-400",
      blur2: "bg-indigo-400",
      blur3: "bg-cyan-400",
    },
    purple: {
      gradient: "from-purple-50 via-pink-50 to-indigo-50",
      primary: "from-purple-500 to-pink-500",
      text: "text-purple-600",
      secondary: "text-pink-600",
      accent: "purple-500",
      blur1: "bg-purple-400",
      blur2: "bg-pink-400",
      blur3: "bg-indigo-400",
    },
    emerald: {
      gradient: "from-emerald-50 via-green-50 to-teal-50",
      primary: "from-emerald-500 to-green-500",
      text: "text-emerald-600",
      secondary: "text-green-600",
      accent: "emerald-500",
      blur1: "bg-emerald-400",
      blur2: "bg-green-400",
      blur3: "bg-teal-400",
    },
  };
  return themes[theme];
};

const Banner = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentSlide((prev) => (prev + 1) % slides.length);
        setIsAnimating(false);
      }, 300);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const goToSlide = (index) => {
    if (index !== currentSlide && !isAnimating) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentSlide(index);
        setIsAnimating(false);
      }, 300);
    }
  };

  const nextSlide = () => {
    if (!isAnimating) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentSlide((prev) => (prev + 1) % slides.length);
        setIsAnimating(false);
      }, 300);
    }
  };

  const prevSlide = () => {
    if (!isAnimating) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
        setIsAnimating(false);
      }, 300);
    }
  };

  const slide = slides[currentSlide];
  const theme = getThemeColors(slide.theme);
  const MainIcon = slide.mainIcon;

  return (
    <div className="w-full relative overflow-hidden">
      {/* Main Banner Container */}
      <div
        className={`relative bg-gradient-to-br py-8 ${theme.gradient} min-h-[600px] flex items-center transition-all duration-700`}
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div
            className={`absolute top-10 left-10 w-32 h-32 ${theme.blur1} rounded-full blur-3xl animate-pulse`}
          ></div>
          <div
            className={`absolute top-32 right-20 w-40 h-40 ${theme.blur2} rounded-full blur-3xl animate-pulse`}
            style={{ animationDelay: "1s" }}
          ></div>
          <div
            className={`absolute bottom-20 left-1/3 w-36 h-36 ${theme.blur3} rounded-full blur-3xl animate-pulse`}
            style={{ animationDelay: "2s" }}
          ></div>
        </div>

        {/* Medical Icons Background */}
        <div className="absolute inset-0 opacity-10">
          {slide.floatingIcons.map((Icon, index) => (
            <Icon
              key={index}
              className={`absolute w-12 h-12 ${theme.text} animate-pulse`}
              style={{
                top: `${20 + index * 15}%`,
                right: `${20 + index * 10}%`,
                animationDelay: `${index * 0.5}s`,
              }}
            />
          ))}
        </div>

        {/* Navigation Arrows */}
        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 transform -translate-y-1/2 z-20 bg-white/80 backdrop-blur-sm p-3 rounded-full shadow-lg hover:bg-white hover:scale-110 transition-all duration-300 cursor-pointer "
        >
          <ChevronLeft className="w-6 h-6 text-gray-700" />
        </button>

        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 z-20 bg-white/80 backdrop-blur-sm p-3 rounded-full shadow-lg hover:bg-white hover:scale-110 transition-all duration-300 cursor-pointer "
        >
          <ChevronRight className="w-6 h-6 text-gray-700" />
        </button>

        <div className="container mx-auto px-6 relative z-10">
          <div
            className={`grid lg:grid-cols-2 gap-12 items-center transition-all duration-500 ${
              isAnimating
                ? "opacity-0 transform translate-y-4"
                : "opacity-100 transform translate-y-0"
            }`}
          >
            {/* Left Content */}
            <div className="space-y-8">
              {/* Brand Logo */}
              <div className="flex items-center space-x-3 animate-fadeInLeft">
                <div
                  className={`w-14 h-14 bg-gradient-to-br ${theme.primary} rounded-xl flex items-center justify-center shadow-lg`}
                >
                  <Heart className="w-8 h-8 text-white animate-pulse" />
                </div>
                <h1
                  className={`text-5xl font-bold bg-gradient-to-r ${theme.primary} bg-clip-text text-transparent`}
                >
                  VIVANTA
                </h1>
              </div>

              {/* Main Heading */}
              <div
                className="space-y-4 animate-fadeInLeft"
                style={{ animationDelay: "0.2s" }}
              >
                <h2 className="text-4xl font-bold text-gray-800 leading-tight">
                  {slide.title}
                  <span
                    className={`block bg-gradient-to-r ${theme.primary} bg-clip-text text-transparent text-5xl font-extrabold animate-pulse`}
                  >
                    {slide.subtitle}
                  </span>
                </h2>

                <p className="text-lg text-gray-600 leading-relaxed max-w-lg">
                  {slide.description}
                </p>
              </div>

              {/* Features */}
              <div
                className="flex flex-wrap gap-4 animate-fadeInLeft"
                style={{ animationDelay: "0.4s" }}
              >
                {slide.floatingIcons.map((Icon, index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-2 bg-white/70 backdrop-blur-sm rounded-full px-5 py-3 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
                  >
                    <Icon className={`w-5 h-5 text-${slide.theme}-500`} />
                    <span className="text-sm font-medium text-gray-700">
                      {index === 0
                        ? "Chất lượng cao"
                        : index === 1
                        ? "Nhanh chóng"
                        : "Tin cậy"}
                    </span>
                  </div>
                ))}
              </div>

              {/* Call to Action Buttons */}
              <div
                className="flex flex-col sm:flex-row gap-4 pt-6 animate-fadeInLeft"
                style={{ animationDelay: "0.6s" }}
              >
                {slide.primaryButton && (
                  <Link
                    to={`/${slide.primaryPath || "#"}`}
                    className={`group bg-gradient-to-r ${theme.primary} text-white px-10 py-4 cursor-pointer rounded-2xl font-bold hover:shadow-2xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 flex items-center justify-center space-x-3`}
                  >
                    <Calendar className="w-5 h-5" />
                    <span className="text-base">{slide.primaryButton}</span>
                    <ChevronRight className="w-5 h-5 group-hover:translate-x-2 transition-transform duration-300" />
                  </Link>
                )}

                {slide.secondaryButton && (
                  <Link
                    to={`/${slide.secondaryButton || "#"}`}
                    className={`group bg-white/90 backdrop-blur-sm ${theme.text} px-10 py-4 cursor-pointer rounded-2xl font-bold border-2 border-${slide.theme}-200 hover:bg-${slide.theme}-50 hover:border-${slide.theme}-300 hover:shadow-xl transition-all duration-300 hover:scale-105 flex items-center justify-center space-x-3`}
                  >
                    <Phone className="w-5 h-5" />
                    <span className="text-base">{slide.secondaryButton}</span>
                  </Link>
                )}
              </div>
            </div>

            {/* Right Content - Visual Element */}
            <div className="relative animate-fadeInRight">
              <div className="relative z-10">
                {/* Main Circle */}
                <div
                  className={`w-96 h-96 mx-auto bg-gradient-to-br ${theme.primary} rounded-full flex items-center justify-center shadow-2xl animate-pulse hover:scale-105 transition-transform duration-700`}
                >
                  <div className="w-80 h-80 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center ">
                    <div className="w-64 h-64 bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center">
                      <MainIcon className="w-24 h-24 text-white animate-bounce" />
                    </div>
                  </div>
                </div>

                {/* Floating Elements */}
                {slide.floatingIcons.map((Icon, index) => (
                  <div
                    key={index}
                    className={`absolute w-20 h-20 bg-white rounded-full shadow-xl flex items-center justify-center animate-bounce hover:scale-110 transition-transform duration-300`}
                    style={{
                      top: index === 0 ? "-1rem" : index === 1 ? "auto" : "50%",
                      bottom: index === 1 ? "-1rem" : "auto",
                      left: index === 2 ? "-2rem" : "auto",
                      right: index === 0 ? "-1rem" : "auto",
                      animationDelay: `${index * 0.5}s`,
                    }}
                  >
                    <Icon className={`w-10 h-10 text-${slide.theme}-500`} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Slide Indicators */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-4 z-20">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-20 h-2 rounded-full transition-all duration-300   ${
                index === currentSlide
                  ? `bg-${slide.theme}-500 scale-125 shadow-lg`
                  : "bg-dark-700 hover:bg-dark-600 hover:scale-110"
              }`}
            />
          ))}
        </div>

        {/* Progress Bar */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
          <div
            className={`h-full bg-gradient-to-r ${theme.primary} transition-all duration-75`}
            style={{
              width: `${((currentSlide + 1) / slides.length) * 100}%`,
            }}
          />
        </div>

        {/* Bottom Wave */}
        <div className="absolute bottom-0 inset-x-0">
          <svg
            viewBox="0 0 1200 120"
            className="w-full h-24 text-white block"
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

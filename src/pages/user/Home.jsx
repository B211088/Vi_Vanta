import { useState } from "react";
import Header from "../../components/layout/Header";
import Background from "../../components/layout/Background";
import ButtonToggleTheme from "../../components/common/ButtonToggleTheme";
import { Link, Outlet, useLocation } from "react-router-dom";
import { useTheme } from "../../hook/useTheme";
import Banner from "../../components/layout/user/Banner";
import Footer from "./Footer";
import ArticlesSection from "../../components/ui/article/ArticlesSection";
import TopicFavorite from "../../components/ui/topic/TopicFavorite";
import { MessageCircle } from "lucide-react";
import AiDoctorImage from "../../assets/images/bannerAuth.png"; // giả sử bạn có ảnh AI tại đây
const Home = () => {
  const { isDarkMode } = useTheme();
  const location = useLocation();
  const [openDropdowns, setOpenDropdowns] = useState({});

  const toggleDropdown = (navId) => {
    setOpenDropdowns((prev) => {
      const isCurrentlyOpen = prev[navId];
      // Nếu dropdown hiện tại đang đóng, mở nó và đóng tất cả các dropdown khác
      if (!isCurrentlyOpen) {
        return { [navId]: true };
      }
      // Nếu dropdown hiện tại đang mở, đóng nó
      return { [navId]: false };
    });
  };

  return (
    <div
      className={`w-full flex flex-col font-nunito ${
        isDarkMode ? "bg-light-50 text-dark-50" : "bg-dark-200 text-light-50"
      }`}
    >
      <ButtonToggleTheme />
      <Header />
      <TopicFavorite />
      <Banner />
      <ArticlesSection />
      <div className="container flex flex-col gap-10 mx-auto py-10 px-6">
        <div className="bg-gradient-to-r from-teal-500 to-emerald-500 rounded-2xl p-8 text-white text-center">
          <h3 className="text-2xl font-bold mb-4">
            Đăng Ký Trở thành thành viên
          </h3>
          <p className="text-teal-100 mb-6">
            Trở thành thành viên của chúng tôi để sử dụng nhiều dịch vụ hơn
          </p>
          <div className="w-full flex justify-center">
            <div className="w-7/12 flex flex-col sm:flex-row gap-4 ">
              <div className="w-full flex items-center gap-2 px-2 bg-light-50 rounded-md">
                <i className="fa-regular fa-envelope text-dark-400"></i>
                <input
                  type="email"
                  placeholder="Địa chỉ email của bạn"
                  className="flex-1  py-3 rounded-xl text-gray-800 outline-none focus:ring-white text-sm"
                />
              </div>
              <button className="w-fit bg-white text-teal-600 px-10 py-1 text-nowrap rounded-md cursor-pointer font-semibold hover:bg-gray-100 transition-colors">
                Đăng Ký
              </button>
            </div>
          </div>
        </div>

        <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-600 rounded-3xl p-8 sm:p-12 text-white">
          {/* Background lights */}
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
          <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>

          <div className="relative z-10 flex flex-col-reverse lg:flex-row items-center gap-8">
            {/* Left: Text & Input */}
            <div className="flex-1 text-center lg:text-left space-y-5">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mx-auto lg:mx-0">
                <MessageCircle className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-3xl sm:text-4xl font-bold leading-tight">
                Tư Vấn Sức Khỏe AI
              </h3>
              <p className="text-white/90 text-sm sm:text-base max-w-lg">
                Nhận lời khuyên sức khỏe cá nhân hóa từ AI thông minh 24/7. Hỏi
                bất kỳ điều gì về sức khỏe và nhận phản hồi ngay lập tức.
              </p>

              {/* Input & Button */}
              <div className="flex flex-col sm:flex-row gap-3 mt-4 max-w-xl">
                <Link
                  to="/vivanta-ai"
                  className="flex items-center gap-3 bg-white text-blue-600 px-10 py-3 rounded-xl font-semibold hover:bg-gray-100 transition"
                >
                  <MessageCircle className="w-5 h-5 " /> <span> Hỏi AI</span>
                </Link>
              </div>
            </div>

            {/* Right: AI Doctor Image */}
            <div className="flex-1 max-w-sm">
              <img
                src={AiDoctorImage}
                alt="AI Doctor"
                className="w-full h-auto object-contain drop-shadow-2xl animate-fade-in"
              />
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Home;

const nav = [
  {
    id: "home",
    path: "/dashboard",
    name: "Bảng điều khiển",
    icon: "fa-solid fa-border-all",
    items: [],
  },
  {
    id: "tools",
    path: "/tools",
    name: "Công cụ",
    icon: "fa-solid fa-compass",
    items: [
      {
        id: "body-index",
        path: "body-index",
        name: "Tính chỉ số cơ thể",
        icon: "fa-solid fa-calculator",
      },
      {
        id: "workout-schedule",
        path: "workout-schedule",
        name: "Lập lịch tập luyện",
        icon: "fa-solid fa-calendar-week",
      },
      {
        id: "dining-menu",
        path: "dining-menu",
        name: "Lập thực đơn ăn uống",
        icon: "fa-solid fa-receipt",
      },
    ],
  },
  {
    id: "personal-care",
    path: "/personal-care",
    name: "Chăm sóc cá nhân",
    icon: "fa-solid fa-person-walking-arrow-loop-left",
    items: [
      {
        id: "reminder-medicine",
        path: "reminder-medicine",
        name: "Nhắc nhở uống thuốc",
        icon: "fa-solid fa-pills",
      },
      {
        id: "weight-tracking",
        path: "weight-tracking",
        name: "Theo dõi cân nặng",
        icon: "fa-solid fa-weight-scale",
      },
      {
        id: "contraception-tracking",
        path: "contraception-tracking",
        name: "Theo dõi tránh thai",
        icon: "fa-solid fa-calendar-days",
      },
    ],
  },
  {
    id: "pregnancy-care",
    path: "/pregnancy-care",
    name: "Chăm sóc thai kỳ",
    icon: "fa-solid fa-person-pregnant",
    items: [],
  },
  {
    id: "children-care",
    path: "/children-care",
    name: "Chăm sóc bé",
    icon: "fa-solid fa-children",
    items: [],
  },
  {
    id: "library",
    path: "/library",
    name: "Thư viện",
    icon: "fa-solid fa-book",
    items: [
      {
        id: "diseases",
        path: "diseases",
        name: "Thư viện bệnh",
        icon: "fa-solid fa-disease",
      },
      {
        id: "medication",
        path: "medication",
        name: "Thư viện thuốc",
        icon: "fa-solid fa-pills",
      },

      {
        id: "foods",
        path: "foods",
        name: "Thư viện thức ăn",
        icon: "fa-solid fa-utensils",
      },
      {
        id: "workouts",
        path: "workouts",
        name: "Thư viện tập luyện",
        icon: "fa-solid fa-dumbbell",
      },
    ],
  },
  {
    id: "examination-schedule",
    path: "/examination-schedule",
    name: "Lịch khám",
    icon: "fa-solid fa-stethoscope",
    items: [],
  },
];

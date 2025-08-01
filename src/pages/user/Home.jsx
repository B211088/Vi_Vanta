import React, { useEffect, useState } from "react";
import {
  Scale,
  Heart,
  Edit3,
  Calculator,
  Flower2,
  Clock,
  Droplets,
  Moon,
  TrendingUp,
  Star,
  ChevronDown,
  ChevronUp,
  MessageCircle,
  Users,
  Shield,
  Award,
  CheckCircle,
  Calendar,
  Stethoscope,
  Activity,
  HeartHandshake,
  BookOpen,
  ChevronRight,
  Syringe,
  Baby,
  Timer,
  Brain,
  BarChart3,
  Droplet,
  MoonStar,
  HeartPulse,
} from "lucide-react";
import ButtonToggleTheme from "../../components/common/ButtonToggleTheme";
import Header from "../../components/layout/Header";
import TopicFavorite from "../../components/ui/topic/TopicFavorite";
import Banner from "../../components/layout/user/Banner";
import ArticlesSection from "../../components/ui/article/ArticlesSection";
import Footer from "./Footer";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchUserHealthInfo } from "../../services/health.service";
import VoiceChatbot from "../../components/ui/chatbot/VoiceChatbot";
import ArticlesSectionTopic from "../../components/ui/article/ArticlesSectionTopic";

const Home = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { healthInfo } = useSelector((state) => state.health);
  const [openFAQ, setOpenFAQ] = useState({});
  const [email, setEmail] = useState("");

  const toggleFAQ = (index) => {
    setOpenFAQ((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  useEffect(() => {
    if (user) {
      dispatch(fetchUserHealthInfo());
    }
  }, []);

  const healthTools = [
    {
      id: "tools/bmi",
      name: "Đánh giá Sức khỏe & BMI",
      description:
        "Tính chỉ số khối cơ thể để đánh giá tình trạng cân nặng và kế hoạch sức khỏe",
      icon: Scale,
      color: "bg-teal-500",
      category: "Cân nặng",
    },
    {
      id: "tools/heart-rate",
      name: "Nhịp tim",
      description: "Theo dõi và đánh giá nhịp tim của bạn",
      icon: Heart,
      color: "bg-red-500",
      category: "Tim mạch",
    },
    {
      id: "tools/vaccine",
      name: "Gợi ý tiêm vắc xin cho bé",
      description: "Lên lịch và theo dõi các mũi tiêm quan trọng cho trẻ",
      icon: Syringe,
      color: "bg-indigo-500",
      category: "Trẻ em",
    },
    {
      id: "tools/body-fat",
      name: "Tỷ lệ mỡ cơ thể",
      description: "Tính toán tỷ lệ mỡ cơ thể dựa trên các thông số",
      icon: Calculator,
      color: "bg-yellow-500",
      category: "Cân nặng",
    },
    {
      id: "tools/due-date",
      name: "Tính ngày dự sinh",
      description:
        "Dự đoán ngày sinh dựa trên chu kỳ kinh nguyệt hoặc ngày siêu âm",
      icon: Baby,
      color: "bg-pink-400",
      category: "Mang thai",
    },
    {
      id: "tools/water-intake",
      name: "Lượng nước cần uống",
      description: "Tính toán lượng nước cần uống mỗi ngày",
      icon: Droplets,
      color: "bg-cyan-500",
      category: "Dinh dưỡng",
    },
    {
      id: "tools/sleep-caculator",
      name: "Tính toán giấc ngủ",
      description: "Tính toán thời gian ngủ lý tưởng",
      icon: Timer,
      color: "bg-purple-500",
      category: "Giấc ngủ",
    },
    {
      id: "tools/stress",
      name: "Đánh giá căng thẳng",
      description: "Kiểm tra mức độ căng thẳng và stress",
      icon: Brain,
      color: "bg-pink-500",
      category: "Tâm lý",
    },
  ];

  const stats = [
    { icon: Users, number: "50K+", label: "Người dùng tin tưởng" },
    { icon: Stethoscope, number: "200+", label: "Bác sĩ chuyên khoa" },
    { icon: Activity, number: "1M+", label: "Lượt tư vấn" },
    { icon: Award, number: "98%", label: "Độ hài lòng" },
  ];

  const features = [
    {
      icon: HeartHandshake,
      title: "Tư vấn 24/7",
      description:
        "Đội ngũ bác sĩ và AI hỗ trợ tư vấn sức khỏe mọi lúc mọi nơi",
      color: "from-teal-400 to-emerald-500",
    },
    {
      icon: Calendar,
      title: "Đặt lịch khám",
      description: "Đặt lịch khám với các chuyên khoa theo nhu cầu của bạn",
      color: "from-emerald-400 to-teal-500",
    },
    {
      icon: BookOpen,
      title: "Kiến thức sức khỏe",
      description:
        "Thư viện bài viết y khoa được cập nhật liên tục từ chuyên gia",
      color: "from-teal-500 to-cyan-500",
    },
    {
      icon: Shield,
      title: "Bảo mật tuyệt đối",
      description: "Thông tin sức khỏe được bảo mật theo tiêu chuẩn quốc tế",
      color: "from-emerald-500 to-teal-600",
    },
    {
      icon: Activity,
      title: "Theo dõi sức khỏe",
      description: "Ghi nhận và phân tích các chỉ số sức khỏe theo thời gian",
      color: "from-cyan-400 to-teal-500",
    },
    {
      icon: MessageCircle,
      title: "AI Thông minh",
      description: "Trợ lý AI hỗ trợ sơ bộ và đưa ra lời khuyên phù hợp",
      color: "from-teal-600 to-emerald-600",
    },
  ];

  const benefits = [
    {
      icon: CheckCircle,
      title: "Chính xác cao",
      description:
        "Công nghệ AI tiên tiến kết hợp với kiến thức y khoa chuyên sâu",
    },
    {
      icon: Clock,
      title: "Tiết kiệm thời gian",
      description: "Tư vấn nhanh chóng, không cần chờ đợi tại bệnh viện",
    },
    {
      icon: Heart,
      title: "Chăm sóc toàn diện",
      description: "Từ phòng bệnh đến điều trị, phù hợp với mọi độ tuổi",
    },
  ];

  const testimonials = [
    {
      name: "Chị Hoa",
      role: "Mẹ của 2 con",
      avatar: "👩‍⚕️",
      rating: 5,
      content:
        "Vivanta giúp tôi theo dõi lịch tiêm chủng cho con rất tiện lợi. Các bác sĩ tư vấn rất tận tình và chuyên nghiệp.",
    },
    {
      name: "Anh Minh",
      role: "Nhân viên văn phòng",
      avatar: "👨‍💼",
      rating: 5,
      content:
        "Tính năng đánh giá căng thẳng và lời khuyên về giấc ngủ rất hữu ích cho công việc bận rộn của tôi.",
    },
    {
      name: "Cô Lan",
      role: "Người cao tuổi",
      avatar: "👵",
      rating: 5,
      content:
        "Ứng dụng dễ sử dụng, các công cụ đo lường sức khỏe rất chính xác. Tôi có thể tự chăm sóc sức khỏe tại nhà.",
    },
  ];

  const faqs = [
    {
      question: "Vivanta có miễn phí không?",
      answer:
        "Vivanta cung cấp nhiều công cụ miễn phí cơ bản. Các tính năng nâng cao và tư vấn trực tiếp với bác sĩ sẽ có phí dịch vụ hợp lý.",
    },
    {
      question: "Thông tin sức khỏe của tôi có được bảo mật không?",
      answer:
        "Chúng tôi cam kết bảo mật thông tin theo tiêu chuẩn quốc tế. Mọi dữ liệu được mã hóa và chỉ bạn mới có quyền truy cập.",
    },
    {
      question: "Tôi có thể đặt lịch khám với bác sĩ không?",
      answer:
        "Có, bạn có thể đặt lịch khám với các bác sĩ chuyên khoa trong mạng lưới đối tác của chúng tôi qua ứng dụng.",
    },
    {
      question: "AI có thể thay thế bác sĩ không?",
      answer:
        "AI chỉ hỗ trợ tư vấn sơ bộ và đưa ra lời khuyên chung. Với các vấn đề nghiêm trọng, bạn vẫn cần thăm khám trực tiếp với bác sĩ.",
    },
  ];

  return (
    <div className="min-h-screen  font-nunito">
      <Header />
      <TopicFavorite />
      <Banner />
      <ArticlesSection />
      <VoiceChatbot />
      {/* Hero Section */}
      <ArticlesSectionTopic />
      {/* Health Tools Section */}
      <section id="tools" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Công cụ kiểm tra sức khỏe thông minh
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Bộ công cụ đo lường và đánh giá sức khỏe chính xác, dễ sử dụng
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {healthTools.map((tool) => {
              const IconComponent = tool.icon;
              return (
                <Link
                  to={`/${tool.id}`}
                  key={tool.id}
                  className="bg-white h-full  rounded-lg shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer transform hover:scale-105"
                >
                  <div className="p-6 h-full flex flex-col justify-between">
                    <div className="flex flex-col">
                      <div
                        className={`w-12 h-12 ${tool.color} rounded-lg flex items-center justify-center mb-4`}
                      >
                        <IconComponent className="h-6 w-6 text-white" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">
                        {tool.name}
                      </h3>
                      <p className="text-gray-600 text-sm mb-4">
                        {tool.description}
                      </p>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                        {tool.category}
                      </span>
                      <ChevronRight className="h-4 w-4 text-gray-400" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>
      {/* Features Section */}
      <section id="features" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Tính năng nổi bật
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Khám phá các tính năng mạnh mẽ giúp bạn quản lý sức khỏe một cách
              toàn diện và hiệu quả
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="group">
                <div className="bg-white rounded-lg p-8 shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 hover:border-teal-200">
                  <div
                    className={`inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r ${feature.color} rounded-lg mb-6`}
                  >
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      {/* Benefits Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Tại sao chọn Vivanta?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Những lợi ích vượt trội mà bạn sẽ nhận được khi sử dụng nền tảng
              của chúng tôi
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <div key={index} className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-lg mb-6">
                  <benefit.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {benefit.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
      {/* Testimonials Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Người dùng nói gì về Vivanta
            </h2>
            <p className="text-xl text-gray-600">
              Những phản hồi tích cực từ cộng đồng người dùng
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="bg-white rounded-lg p-8 shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100"
              >
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center text-2xl mr-4">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      {testimonial.name}
                    </h4>
                    <p className="text-gray-600 text-sm">{testimonial.role}</p>
                  </div>
                </div>
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-4 h-4 text-yellow-500 fill-current"
                    />
                  ))}
                </div>
                <p className="text-gray-700 italic leading-relaxed">
                  "{testimonial.content}"
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>{" "}
      {/* Stats Section */}
      <section className="py-16 bg-teal-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Được tin tưởng bởi hàng ngàn người dùng
            </h2>
            <p className="text-xl text-gray-600">
              Những con số ấn tượng về hiệu quả của dịch vụ
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center group">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-lg mb-4 group-hover:scale-110 transition-transform duration-300">
                  <stat.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-3xl font-bold text-gray-900 mb-2">
                  {stat.number}
                </h3>
                <p className="text-gray-600">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      {/* FAQ Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Câu hỏi thường gặp
            </h2>
            <p className="text-xl text-gray-600">
              Giải đáp những thắc mắc phổ biến của người dùng
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="bg-white rounded-lg shadow-sm border border-gray-100"
              >
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full flex items-center justify-between p-6 text-left hover:bg-gray-50 transition-colors rounded-lg"
                >
                  <h3 className="text-lg font-semibold text-gray-900 pr-4">
                    {faq.question}
                  </h3>
                  {openFAQ[index] ? (
                    <ChevronUp className="w-5 h-5 text-gray-500 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-500 flex-shrink-0" />
                  )}
                </button>
                {openFAQ[index] && (
                  <div className="px-6 pb-6">
                    <p className="text-gray-700 leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
      {/* CTA Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          {/* Newsletter Signup */}
          <div className="bg-gradient-to-r from-teal-500 to-emerald-500 rounded-lg p-8 text-white text-center mb-12">
            <h3 className="text-2xl font-bold mb-4">
              Đăng ký để trở thành thành viên của vivanta
            </h3>
            <p className="text-teal-100 mb-6">
              Sử dụng được nhiều hơn các chức năng của vivata & lưu trữ hồ sơ
              sức khỏe của bạn
            </p>
            <div className="max-w-md mx-auto flex flex-col sm:flex-row gap-4 bg-light-50 rounded-md p-1">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Địa chỉ email của bạn"
                className="flex-1 px-4 py-1 rounded-lg text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-white"
              />
              <Link
                to="/auth/register"
                className="bg-teal-300 text-light-50 px-6 py-1 rounded-sm font-semibold hover:bg-blue-500 transition-colors cursor-pointer"
              >
                Đăng ký
              </Link>
            </div>
          </div>
        </div>
      </section>
      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Home;

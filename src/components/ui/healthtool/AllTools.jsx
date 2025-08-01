import {
  Calculator,
  Heart,
  Activity,
  Scale,
  Thermometer,
  Eye,
  Stethoscope,
  Brain,
  Droplets,
  Timer,
  ChevronRight,
  ArrowLeft,
  Shield,
  Baby,
  CalendarHeart,
  Syringe,
  BarChart3,
  Droplet,
  MoonStar,
  HeartPulse,
  Lock,
  LogIn,
} from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
const AllTools = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Tất cả");
  const { user } = useSelector((state) => state.auth);
  const categories = [
    "Tất cả",
    "Cân nặng",
    "Trẻ em",
    "Mang thai",
    "Tim mạch",
    "Dinh dưỡng",
    "Giấc ngủ",
    "Tâm lý",
  ];

  const filteredTools = healthTools.filter((tool) => {
    const matchesSearch =
      tool.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tool.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "Tất cả" || tool.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });
  return (
    <div className="container max-w-8xl min-h-screen mx-auto px-4 py-8">
      {/* Search and Filter */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Tìm kiếm công cụ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors cursor-pointer ${
                  selectedCategory === category
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-700 hover:bg-gray-100"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tools Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredTools.map((tool) => {
          const IconComponent = tool.icon;
          return (
            <Link
              to={`/${tool.id}`}
              key={tool.id}
              className={` ${
                tool.loginRequire ? "" : "bg-white"
              }rounded-lg shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer transform hover:scale-105 relative overflow-hidden`}
            >
              <div className="p-6">
                <div
                  className={`w-12 h-12 ${tool.color} rounded-lg flex items-center justify-center mb-4`}
                >
                  <IconComponent className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  {tool.name}
                </h3>
                <p className="text-gray-600 text-sm mb-4">{tool.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                    {tool.category}
                  </span>
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                </div>
              </div>
              {!user && tool.loginRequire && (
                <div className="absolute inset-0 z-20 bg-[#4242422d] flex items-center justify-center">
                  <div className="flex items-center gap-2 text-xs bg-light-50 text-dark-200 rounded-full p-2 font-bold">
                    <span>Cần đăng nhập</span> <LogIn className="w-4 h-4" />
                  </div>
                </div>
              )}
            </Link>
          );
        })}
      </div>

      {filteredTools.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">
            Không tìm thấy công cụ nào phù hợp.
          </p>
        </div>
      )}
    </div>
  );
};

export default AllTools;
const healthTools = [
  {
    id: "tools/bmi",
    name: "Đánh giá Sức khỏe & BMI",
    description:
      "Tính chỉ số khối cơ thể để đánh giá tình trạng cân nặng và kế hoạch sức khỏe",
    icon: Scale,
    color: "bg-teal-500",
    category: "Cân nặng",
    loginRequire: true,
  },
  {
    id: "tools/heart-rate",
    name: "Nhịp tim",
    description: "Theo dõi và đánh giá nhịp tim của bạn",
    icon: Heart,
    color: "bg-red-500",
    category: "Tim mạch",
    loginRequire: false,
  },
  {
    id: "tools/vaccine",
    name: "Gợi ý tiêm vắc xin cho bé",
    description: "Lên lịch và theo dõi các mũi tiêm quan trọng cho trẻ",
    icon: Syringe,
    color: "bg-indigo-500",
    category: "Trẻ em",
    loginRequire: true,
  },
  {
    id: "tools/body-fat",
    name: "Tỷ lệ mỡ cơ thể",
    description: "Tính toán tỷ lệ mỡ cơ thể dựa trên các thông số",
    icon: Calculator,
    color: "bg-yellow-500",
    category: "Cân nặng",
    loginRequire: false,
  },
  {
    id: "tools/due-date",
    name: "Tính ngày dự sinh",
    description:
      "Dự đoán ngày sinh dựa trên chu kỳ kinh nguyệt hoặc ngày siêu âm",
    icon: Baby,
    color: "bg-pink-400",
    category: "Mang thai",
    loginRequire: false,
  },
  {
    id: "tools/water-intake",
    name: "Lượng nước cần uống",
    description: "Tính toán lượng nước cần uống mỗi ngày",
    icon: Droplets,
    color: "bg-cyan-500",
    category: "Dinh dưỡng",
    loginRequire: false,
  },
  {
    id: "tools/sleep-caculator",
    name: "Tính toán giấc ngủ",
    description: "Tính toán thời gian ngủ lý tưởng",
    icon: Timer,
    color: "bg-purple-500",
    category: "Giấc ngủ",
    loginRequire: false,
  },
  {
    id: "tools/stress",
    name: "Đánh giá căng thẳng",
    description: "Kiểm tra mức độ căng thẳng và stress",
    icon: Brain,
    color: "bg-pink-500",
    category: "Tâm lý",
    loginRequire: false,
  },
  {
    id: "tools/diabetes-risk",
    name: "Kiểm tra nguy cơ tiểu đường",
    description: "Đánh giá nguy cơ mắc tiểu đường dựa trên các chỉ số cá nhân",
    icon: BarChart3,
    color: "bg-amber-600",
    category: "Chẩn đoán",
    loginRequire: false,
  },
  {
    id: "tools/anemia-check",
    name: "Đánh giá thiếu máu (thiếu sắt)",
    description:
      "Dựa vào triệu chứng và dinh dưỡng để kiểm tra nguy cơ thiếu máu",
    icon: Droplet,
    color: "bg-red-400",
    category: "Dinh dưỡng",
    loginRequire: false,
  },
  {
    id: "tools/sleep-quality",
    name: "Đánh giá chất lượng giấc ngủ",
    description:
      "Phân tích thời gian và chất lượng giấc ngủ để đưa ra khuyến nghị",
    icon: MoonStar,
    color: "bg-indigo-400",
    category: "Giấc ngủ",
    loginRequire: false,
  },
  {
    id: "tools/cardiac-risk",
    name: "Đánh giá nguy cơ tim mạch",
    description:
      "Phân tích các yếu tố như tuổi, nhịp tim, huyết áp để đánh giá nguy cơ",
    icon: HeartPulse,
    color: "bg-rose-600",
    category: "Tim mạch",
    loginRequire: false,
  },
];

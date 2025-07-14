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
} from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
const AllTools = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Tất cả");

  const categories = [
    "Tất cả",
    "Cân nặng",
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
    <div className="container mx-auto px-4 py-8">
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
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
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
              className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer transform hover:scale-105"
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

      {/* Health Tips */}
      <div className="mt-12 bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">
          Lời khuyên sức khỏe
        </h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <h4 className="font-semibold text-blue-800 mb-2">
              Duy trì cân nặng lý tưởng
            </h4>
            <p className="text-blue-700 text-sm">
              Thường xuyên kiểm tra BMI và duy trì chế độ ăn uống cân bằng.
            </p>
          </div>
          <div className="p-4 bg-green-50 rounded-lg">
            <h4 className="font-semibold text-green-800 mb-2">
              Tập thể dục đều đặn
            </h4>
            <p className="text-green-700 text-sm">
              Ít nhất 150 phút hoạt động vừa phải mỗi tuần.
            </p>
          </div>
          <div className="p-4 bg-purple-50 rounded-lg">
            <h4 className="font-semibold text-purple-800 mb-2">Ngủ đủ giấc</h4>
            <p className="text-purple-700 text-sm">
              Người lớn nên ngủ 7-9 tiếng mỗi đêm.
            </p>
          </div>
        </div>
      </div>
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
    color: "bg-blue-500",
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
    id: "tools/blood-pressure",
    name: "Huyết áp",
    description: "Theo dõi chỉ số huyết áp và đánh giá tình trạng",
    icon: Activity,
    color: "bg-green-500",
    category: "Tim mạch",
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
    id: "tools/calories",
    name: "Tính calo cần thiết",
    description: "Tính toán lượng calo cần thiết hàng ngày",
    icon: Thermometer,
    color: "bg-orange-500",
    category: "Dinh dưỡng",
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

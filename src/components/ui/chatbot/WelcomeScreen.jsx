import React, { memo, useState } from "react";
import {
  BotMessageSquare,
  Heart,
  Brain,
  Activity,
  Baby,
  Pill,
  Shield,
  Eye,
  ArrowRight,
  Stethoscope,
  Thermometer,
  Zap,
} from "lucide-react";

const WelcomeScreen = memo(({ userName, onTopicSelect }) => {
  const [hoveredTopic, setHoveredTopic] = useState(null);

  const medicalTopics = [
    {
      id: 1,
      title: "Tim mạch",
      description: "Bệnh lý tim, huyết áp, cholesterol",
      icon: Heart,
      color: "text-red-500",
      bgColor: "bg-red-50 hover:bg-red-100",
      borderColor: "border-red-200 hover:border-red-300",
      examples: ["Cao huyết áp", "Đau ngực", "Nhịp tim bất thường"],
    },
    {
      id: 2,
      title: "Thần kinh",
      description: "Đau đầu, stress, rối loạn giấc ngủ",
      icon: Brain,
      color: "text-purple-500",
      bgColor: "bg-purple-50 hover:bg-purple-100",
      borderColor: "border-purple-200 hover:border-purple-300",
      examples: ["Đau đầu migraine", "Mất ngủ", "Căng thẳng"],
    },
    {
      id: 3,
      title: "Hô hấp",
      description: "Ho, khó thở, viêm phổi",
      icon: Activity,
      color: "text-blue-500",
      bgColor: "bg-blue-50 hover:bg-blue-100",
      borderColor: "border-blue-200 hover:border-blue-300",
      examples: ["Ho khan", "Khó thở", "Viêm họng"],
    },
    {
      id: 4,
      title: "Nhi khoa",
      description: "Chăm sóc trẻ em, vaccine",
      icon: Baby,
      color: "text-pink-500",
      bgColor: "bg-pink-50 hover:bg-pink-100",
      borderColor: "border-pink-200 hover:border-pink-300",
      examples: ["Sốt ở trẻ", "Tiêm chủng", "Dinh dưỡng"],
    },
    {
      id: 5,
      title: "Dược phẩm",
      description: "Thuốc, tương tác, liều dùng",
      icon: Pill,
      color: "text-green-500",
      bgColor: "bg-green-50 hover:bg-green-100",
      borderColor: "border-green-200 hover:border-green-300",
      examples: ["Cách dùng thuốc", "Tác dụng phụ", "Tương tác thuốc"],
    },
    {
      id: 6,
      title: "Phòng ngừa",
      description: "Vaccine, kiểm tra sức khỏe định kỳ",
      icon: Shield,
      color: "text-emerald-500",
      bgColor: "bg-emerald-50 hover:bg-emerald-100",
      borderColor: "border-emerald-200 hover:border-emerald-300",
      examples: ["Tiêm vaccine", "Khám tổng quát", "Sàng lọc bệnh"],
    },
  ];

  const handleTopicClick = (topic) => {
    if (onTopicSelect) {
      onTopicSelect(topic);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col items-center text-center mb-8">
        <div className="flex items-center mb-4">
          <BotMessageSquare className="w-12 h-12 text-vivanta-500 mr-3" />
          <span className="font-bold text-vivanta-500 text-3xl">
            VIVANTA AI
          </span>
        </div>
        <h1 className="text-2xl font-bold py-2 text-gray-800">
          Xin chào, {userName || "Bạn"}!
        </h1>
        <p className="text-md text-gray-600 mb-2">
          Chúng tôi có thể giúp gì cho bạn về sức khỏe hôm nay!
        </p>
      </div>

      {/* Medical Topics Grid */}
      <div className="mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {medicalTopics.map((topic) => {
            const IconComponent = topic.icon;
            return (
              <div
                key={topic.id}
                className={`
                  relative p-4 rounded-lg border-1 cursor-pointer transition-all duration-200 
                    ${topic.borderColor} bg-light-50 
                  transform 
                `}
                onClick={() => handleTopicClick(topic)}
                onMouseEnter={() => setHoveredTopic(topic.id)}
                onMouseLeave={() => setHoveredTopic(null)}
              >
                <div className="flex  space-x-3">
                  <div className={`p-2 rounded-lg bg-white `}>
                    <IconComponent className={`w-6 h-6  ${topic.color}`} />
                  </div>
                  <div className="flex-1 flex flex-col text-left min-w-0">
                    <h3 className="font-semibold text-gray-800 ">
                      {topic.title}
                    </h3>
                    <p className="text-xs text-gray-600 ">
                      {topic.description}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
});

WelcomeScreen.displayName = "WelcomeScreen";

export default WelcomeScreen;

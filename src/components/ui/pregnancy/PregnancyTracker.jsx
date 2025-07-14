import React, { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const PregnancyTracker = () => {
  const [selectedWeek, setSelectedWeek] = useState(33);

  const weeks = [
    { week: 29, icon: "🥝", color: "bg-green-200" },
    { week: 30, icon: "🥒", color: "bg-green-300" },
    { week: 31, icon: "🥥", color: "bg-orange-200" },
    { week: 32, icon: "🥬", color: "bg-green-400" },
    { week: 33, icon: "🥭", color: "bg-green-500" },
    { week: 34, icon: "🥒", color: "bg-green-600" },
    { week: 35, icon: "🍯", color: "bg-yellow-400" },
    { week: 36, icon: "🍍", color: "bg-yellow-500" },
    { week: 37, icon: "🥬", color: "bg-green-300" },
  ];

  const weekData = {
    29: {
      height: "38,6 cm",
      weight: "1,153 - 1,459 kg",
      description:
        "Thai nhi đang phát triển các cơ quan quan trọng và tăng cân đều đặn.",
    },
    30: {
      height: "39,9 cm",
      weight: "1,319 - 1,636 kg",
      description:
        "Hệ thần kinh của bé đang hoàn thiện và não bộ phát triển mạnh.",
    },
    31: {
      height: "41,1 cm",
      weight: "1,502 - 1,835 kg",
      description: "Bé có thể mở mắt và phản ứng với ánh sáng từ bên ngoài.",
    },
    32: {
      height: "42,4 cm",
      weight: "1,702 - 2,162 kg",
      description: "Xương của bé đang cứng dần và tích trữ canxi quan trọng.",
    },
    33: {
      height: "43,7 cm",
      weight: "1,807 - 2,419 kg",
      description:
        "Thai nhi hoạt động ngày càng giống em bé, mặt nhăn lại trong khi ngủ và mở khi thức. Thành tử cung ngày càng mỏng hơn, ánh sáng xuyên qua tử cung giúp bé phân biệt giữa ngày và đêm. Mẹ lưu ý về tình trạng giãn tĩnh mạch khi mang thai.",
    },
    34: {
      height: "45,0 cm",
      weight: "2,146 - 2,622 kg",
      description:
        "Bé đang tích trữ chất béo dưới da để chuẩn bị cho cuộc sống bên ngoài.",
    },
    35: {
      height: "46,2 cm",
      weight: "2,383 - 2,859 kg",
      description:
        "Phổi của bé gần như hoàn thiện và có thể thở được nếu sinh sớm.",
    },
    36: {
      height: "47,4 cm",
      weight: "2,622 - 3,100 kg",
      description: "Bé đang ở vị trí đầu xuống chuẩn bị cho quá trình sinh nở.",
    },
    37: {
      height: "48,6 cm",
      weight: "2,859 - 3,401 kg",
      description:
        "Thai nhi được coi là đủ tháng từ tuần này và sẵn sàng chào đời.",
    },
  };

  const currentWeekData = weekData[selectedWeek];

  return (
    <div className="w-full p-6 bg-gradient-to-br from-pink-50 to-rose-50 min-h-screen">
      {/* Header with pink gradient */}
      <div className="bg-gradient-to-r from-pink-400 to-rose-400 h-4 w-full rounded-t-lg mb-8"></div>

      {/* Week selector */}
      <div className="flex items-center justify-between mb-8">
        <button className="p-2 rounded-full hover:bg-pink-100 transition-colors">
          <ChevronLeft className="w-6 h-6 text-gray-600" />
        </button>

        <div className="flex items-center space-x-4 overflow-x-auto">
          {weeks.map((item) => (
            <div
              key={item.week}
              className={`flex flex-col items-center cursor-pointer transition-all duration-300 ${
                selectedWeek === item.week ? "scale-110" : "hover:scale-105"
              }`}
              onClick={() => setSelectedWeek(item.week)}
            >
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${
                  selectedWeek === item.week
                    ? "bg-pink-200 ring-4 ring-pink-300"
                    : item.color
                } transition-all duration-300`}
              >
                {item.icon}
              </div>
              <span
                className={`text-sm mt-2 ${
                  selectedWeek === item.week
                    ? "text-pink-600 font-semibold"
                    : "text-gray-600"
                }`}
              >
                Tuần {item.week}
              </span>
            </div>
          ))}
        </div>

        <button className="p-2 rounded-full hover:bg-pink-100 transition-colors">
          <ChevronRight className="w-6 h-6 text-gray-600" />
        </button>
      </div>

      {/* Main content */}
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          {/* Fetus illustration */}
          <div className="flex justify-center">
            <div className="relative">
              <div className="w-64 h-64 bg-gradient-to-br from-orange-200 to-orange-300 rounded-full flex items-center justify-center shadow-lg">
                <div className="w-32 h-32 bg-gradient-to-br from-orange-400 to-orange-500 rounded-full flex items-center justify-center transform rotate-12">
                  <div className="w-16 h-20 bg-gradient-to-br from-orange-600 to-orange-700 rounded-full"></div>
                </div>
              </div>
              <div className="absolute top-4 right-4 w-8 h-8 bg-pink-300 rounded-full animate-pulse"></div>
              <div className="absolute bottom-8 left-8 w-6 h-6 bg-pink-200 rounded-full animate-pulse delay-1000"></div>
            </div>
          </div>

          {/* Information */}
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-gray-800">
              Tuần {selectedWeek}
            </h2>

            <div className="space-y-4">
              <p className="text-gray-700 leading-relaxed">
                {currentWeekData.description}
              </p>

              <div className="bg-pink-50 p-4 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Chiều cao</p>
                    <p className="text-lg font-semibold text-pink-600">
                      {currentWeekData.height}
                    </p>
                  </div>
                  <div className="w-px h-8 bg-pink-200"></div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Cân nặng</p>
                    <p className="text-lg font-semibold text-pink-600">
                      {currentWeekData.weight}
                    </p>
                  </div>
                </div>
              </div>

              <button className="w-full bg-gradient-to-r from-pink-400 to-rose-400 text-white py-3 px-6 rounded-lg font-medium hover:from-pink-500 hover:to-rose-500 transition-all duration-300 shadow-md hover:shadow-lg">
                Đọc toàn bộ bài viết
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PregnancyTracker;

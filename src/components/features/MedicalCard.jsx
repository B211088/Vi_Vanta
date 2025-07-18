import React, { useState } from "react";
import {
  TrendingUp,
  Activity,
  Dumbbell,
  Target,
  HelpCircle,
  X,
} from "lucide-react";

const MedicalCard = ({
  title,
  value,
  unit,
  subtitle,
  icon: Icon,
  color = "teal",
  onInfoClick,
}) => (
  <div
    className={`bg-white px-6 py-4 rounded-lg shadow-sm border border-${color}-100 hover:shadow-md transition-all duration-200`}
  >
    <div className="flex items-center justify-between ">
      <div className="flex flex-1 items-center gap-3">
        <div className={`p-3 rounded-xl bg-${color}-50`}>
          <Icon className={`h-6 w-6 text-${color}-600`} />
        </div>
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-gray-800 mb-1">{title}</h3>
            <button
              onClick={onInfoClick}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <HelpCircle className="h-4 w-4" />
            </button>
          </div>
          <p className="text-sm text-gray-600">{subtitle}</p>
        </div>
      </div>
      <div className="text-right">
        <p className="text-2xl font-bold text-gray-800">{value}</p>
        <p className={`text-sm text-${color}-600 font-medium`}>{unit}</p>
      </div>
    </div>
  </div>
);

const InfoModal = ({ isOpen, onClose, title, content }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        <div className="p-6">{content}</div>
      </div>
    </div>
  );
};

const MedicalMetricsDemo = () => {
  const [activeModal, setActiveModal] = useState(null);

  const sampleResult = {
    bmi: "23.5",
    bmr: "1,680",
    tdee: "2,310",
    targetCalories: "1,810",
    category: "Bình thường",
  };

  const explanations = {
    bmi: {
      title: "BMI (Body Mass Index) - Chỉ số khối cơ thể",
      content: (
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold text-gray-700 mb-2">Định nghĩa:</h4>
            <p className="text-gray-600">
              BMI là một chỉ số đánh giá mức độ cân nặng của cơ thể dựa trên
              chiều cao và cân nặng. Đây là công cụ sàng lọc đơn giản để xác
              định xem bạn có thừa cân, thiếu cân hay ở mức bình thường.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-gray-700 mb-2">Công thức:</h4>
            <div className="bg-gray-50 p-3 rounded-lg font-mono text-sm">
              BMI = Cân nặng (kg) / (Chiều cao (m))²
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-gray-700 mb-2">Phân loại:</h4>
            <div className="space-y-2">
              <div className="flex justify-between bg-red-50 p-2 rounded">
                <span>Thiếu cân:</span> <span>&lt; 18.5</span>
              </div>
              <div className="flex justify-between bg-green-50 p-2 rounded">
                <span>Bình thường:</span> <span>18.5 - 24.9</span>
              </div>
              <div className="flex justify-between bg-yellow-50 p-2 rounded">
                <span>Thừa cân:</span> <span>25 - 29.9</span>
              </div>
              <div className="flex justify-between bg-red-50 p-2 rounded">
                <span>Béo phì:</span> <span>≥ 30</span>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    bmr: {
      title: "BMR (Basal Metabolic Rate) - Tỷ lệ trao đổi chất cơ bản",
      content: (
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold text-gray-700 mb-2">Định nghĩa:</h4>
            <p className="text-gray-600">
              BMR là lượng năng lượng (calories) mà cơ thể cần để duy trì các
              chức năng sinh lý cơ bản như hô hấp, tuần hoàn máu, và hoạt động
              tế bào khi bạn hoàn toàn nghỉ ngơi.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-gray-700 mb-2">
              Công thức Mifflin-St Jeor:
            </h4>
            <div className="bg-gray-50 p-3 rounded-lg font-mono text-sm space-y-2">
              <div>
                Nam: BMR = 10 × cân nặng + 6.25 × chiều cao - 5 × tuổi + 5
              </div>
              <div>
                Nữ: BMR = 10 × cân nặng + 6.25 × chiều cao - 5 × tuổi - 161
              </div>
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-gray-700 mb-2">Lưu ý:</h4>
            <ul className="text-gray-600 space-y-1">
              <li>• BMR giảm dần theo tuổi tác</li>
              <li>• Nam giới thường có BMR cao hơn nữ giới</li>
              <li>• Tăng cơ bắp giúp tăng BMR</li>
              <li>• Không nên ăn ít hơn BMR trong thời gian dài</li>
            </ul>
          </div>
        </div>
      ),
    },
    tdee: {
      title:
        "TDEE (Total Daily Energy Expenditure) - Tổng năng lượng tiêu hao hàng ngày",
      content: (
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold text-gray-700 mb-2">Định nghĩa:</h4>
            <p className="text-gray-600">
              TDEE là tổng lượng calories mà cơ thể bạn đốt cháy trong một ngày,
              bao gồm BMR cộng với năng lượng tiêu hao qua hoạt động thể chất và
              tiêu hóa thức ăn.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-gray-700 mb-2">Công thức:</h4>
            <div className="bg-gray-50 p-3 rounded-lg font-mono text-sm">
              TDEE = BMR × Hệ số hoạt động
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-gray-700 mb-2">
              Hệ số hoạt động:
            </h4>
            <div className="space-y-2">
              <div className="flex justify-between bg-gray-50 p-2 rounded">
                <span>Ít vận động (văn phòng):</span> <span>1.2</span>
              </div>
              <div className="flex justify-between bg-gray-50 p-2 rounded">
                <span>Vận động nhẹ (1-3 ngày/tuần):</span> <span>1.375</span>
              </div>
              <div className="flex justify-between bg-gray-50 p-2 rounded">
                <span>Vận động vừa (3-5 ngày/tuần):</span> <span>1.55</span>
              </div>
              <div className="flex justify-between bg-gray-50 p-2 rounded">
                <span>Vận động nhiều (6-7 ngày/tuần):</span> <span>1.725</span>
              </div>
              <div className="flex justify-between bg-gray-50 p-2 rounded">
                <span>Vận động rất nhiều (2 lần/ngày):</span> <span>1.9</span>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    target: {
      title: "Calories mục tiêu - Lượng calories cần thiết cho mục tiêu",
      content: (
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold text-gray-700 mb-2">Định nghĩa:</h4>
            <p className="text-gray-600">
              Đây là lượng calories bạn nên tiêu thụ hàng ngày để đạt được mục
              tiêu cụ thể (giảm cân, tăng cân, hoặc duy trì cân nặng) một cách
              an toàn và hiệu quả.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-gray-700 mb-2">
              Phân loại theo mục tiêu:
            </h4>
            <div className="space-y-2">
              <div className="flex justify-between bg-red-50 p-2 rounded">
                <span>Giảm cân:</span> <span>TDEE - 300 đến 500 cal</span>
              </div>
              <div className="flex justify-between bg-green-50 p-2 rounded">
                <span>Duy trì cân nặng:</span> <span>TDEE</span>
              </div>
              <div className="flex justify-between bg-blue-50 p-2 rounded">
                <span>Tăng cân:</span> <span>TDEE + 300 đến 500 cal</span>
              </div>
              <div className="flex justify-between bg-purple-50 p-2 rounded">
                <span>Tăng cơ bắp:</span> <span>TDEE + 200 đến 300 cal</span>
              </div>
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-gray-700 mb-2">
              Lưu ý quan trọng:
            </h4>
            <ul className="text-gray-600 space-y-1">
              <li>• Giảm cân an toàn: 0.5-1kg/tuần</li>
              <li>• Không nên giảm quá 1000 calories/ngày</li>
              <li>• Chất lượng thức ăn quan trọng hơn số lượng calories</li>
              <li>• Nên kết hợp với chế độ tập luyện phù hợp</li>
            </ul>
          </div>
        </div>
      ),
    },
  };

  const handleInfoClick = (type) => {
    setActiveModal(type);
  };

  const closeModal = () => {
    setActiveModal(null);
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MedicalCard
          title="BMI"
          value={sampleResult.bmi}
          unit="kg/m²"
          subtitle={sampleResult.category}
          icon={TrendingUp}
          color="teal"
          onInfoClick={() => handleInfoClick("bmi")}
        />
        <MedicalCard
          title="BMR"
          value={sampleResult.bmr}
          unit="cal/ngày"
          subtitle="Tỷ lệ trao đổi chất cơ bản"
          icon={Activity}
          color="teal"
          onInfoClick={() => handleInfoClick("bmr")}
        />
        <MedicalCard
          title="TDEE"
          value={sampleResult.tdee}
          unit="cal/ngày"
          subtitle="Tổng năng lượng tiêu hao"
          icon={Dumbbell}
          color="cyan"
          onInfoClick={() => handleInfoClick("tdee")}
        />
        <MedicalCard
          title="Mục tiêu"
          value={sampleResult.targetCalories}
          unit="cal/ngày"
          subtitle="Calories cho mục tiêu"
          icon={Target}
          color="orange"
          onInfoClick={() => handleInfoClick("target")}
        />
      </div>

      <InfoModal
        isOpen={!!activeModal}
        onClose={closeModal}
        title={activeModal && explanations[activeModal].title}
        content={activeModal && explanations[activeModal].content}
      />
    </div>
  );
};

export default MedicalMetricsDemo;

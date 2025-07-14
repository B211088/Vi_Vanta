import { ArrowLeft } from "lucide-react";
import { useState } from "react";

const HeartRateMonitor = ({ onBack }) => {
  const [heartRate, setHeartRate] = useState("");
  const [age, setAge] = useState("");
  const [result, setResult] = useState(null);

  const analyzeHeartRate = () => {
    if (heartRate && age) {
      const hr = parseInt(heartRate);
      const userAge = parseInt(age);

      let category = "";
      let advice = "";
      let color = "";

      const maxHR = 220 - userAge;
      const restingHRRange = { min: 60, max: 100 };

      if (hr < 60) {
        category = "Nhịp tim chậm (Bradycardia)";
        advice =
          "Nhịp tim của bạn thấp hơn bình thường. Nên tham khảo ý kiến bác sĩ.";
        color = "text-blue-600";
      } else if (hr >= 60 && hr <= 100) {
        category = "Nhịp tim bình thường";
        advice = "Nhịp tim của bạn trong khoảng bình thường khi nghỉ ngơi.";
        color = "text-green-600";
      } else if (hr > 100) {
        category = "Nhịp tim nhanh (Tachycardia)";
        advice =
          "Nhịp tim của bạn cao hơn bình thường. Nên kiểm tra với bác sĩ.";
        color = "text-red-600";
      }

      setResult({ hr, category, advice, color, maxHR });
    }
  };

  return (
    <div className="w-full  mx-auto bg-white rounded-lg shadow-lg p-6">
      <div className="w-full flex items-center mb-6">
        <button
          onClick={onBack}
          className="flex items-center text-blue-600 hover:text-blue-800 mr-4"
        >
          <ArrowLeft className="h-5 w-5 mr-1" />
          Quay lại
        </button>
        <h2 className="text-2xl font-bold text-gray-800">Theo dõi nhịp tim</h2>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nhịp tim (lần/phút)
            </label>
            <input
              type="number"
              value={heartRate}
              onChange={(e) => setHeartRate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder="Nhập nhịp tim"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tuổi
            </label>
            <input
              type="number"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder="Nhập tuổi"
            />
          </div>

          <button
            onClick={analyzeHeartRate}
            className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors"
          >
            Phân tích nhịp tim
          </button>
        </div>

        {result && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-3">Kết quả</h3>
            <div className="space-y-2">
              <p className="text-2xl font-bold text-red-600">
                {result.hr} lần/phút
              </p>
              <p className={`text-lg font-semibold ${result.color}`}>
                {result.category}
              </p>
              <p className="text-gray-600 text-sm">{result.advice}</p>
              <p className="text-gray-600 text-sm">
                Nhịp tim tối đa: {result.maxHR} lần/phút
              </p>
            </div>

            <div className="mt-4 p-3 bg-red-50 rounded-md">
              <h4 className="font-semibold text-red-800 mb-2">
                Thang đo nhịp tim nghỉ:
              </h4>
              <ul className="text-sm text-red-700 space-y-1">
                <li>• Dưới 60: Chậm (Bradycardia)</li>
                <li>• 60-100: Bình thường</li>
                <li>• Trên 100: Nhanh (Tachycardia)</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HeartRateMonitor;

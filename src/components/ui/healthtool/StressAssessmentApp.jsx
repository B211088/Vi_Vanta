import React, { useState } from "react";
import {
  Heart,
  Brain,
  AlertCircle,
  CheckCircle,
  BarChart3,
  Lightbulb,
  Shield,
  Info,
  Users,
  Award,
} from "lucide-react";
import HeaderTool from "./HeaderTool";

const StressAssessmentApp = () => {
  const [currentStep, setCurrentStep] = useState("assessment");
  const [responses, setResponses] = useState({});
  const [result, setResult] = useState(null);

  const questions = [
    {
      id: 1,
      category: "physical",
      question:
        "Trong tuần qua, bạn có thường xuyên cảm thấy đau đầu hoặc căng cơ không?",
      options: [
        { value: 0, label: "Không bao giờ" },
        { value: 1, label: "Thỉnh thoảng" },
        { value: 2, label: "Thường xuyên" },
        { value: 3, label: "Rất thường xuyên" },
      ],
    },
    {
      id: 2,
      category: "emotional",
      question: "Bạn có cảm thấy lo lắng hoặc bồn chồn không?",
      options: [
        { value: 0, label: "Không" },
        { value: 1, label: "Một chút" },
        { value: 2, label: "Khá nhiều" },
        { value: 3, label: "Rất nhiều" },
      ],
    },
    {
      id: 3,
      category: "sleep",
      question: "Chất lượng giấc ngủ của bạn trong tuần qua như thế nào?",
      options: [
        { value: 0, label: "Rất tốt" },
        { value: 1, label: "Tốt" },
        { value: 2, label: "Kém" },
        { value: 3, label: "Rất kém" },
      ],
    },
    {
      id: 4,
      category: "concentration",
      question: "Bạn có gặp khó khăn trong việc tập trung không?",
      options: [
        { value: 0, label: "Không" },
        { value: 1, label: "Thỉnh thoảng" },
        { value: 2, label: "Thường xuyên" },
        { value: 3, label: "Rất thường xuyên" },
      ],
    },
    {
      id: 5,
      category: "social",
      question: "Bạn có cảm thấy áp lực trong các mối quan hệ xã hội không?",
      options: [
        { value: 0, label: "Không" },
        { value: 1, label: "Một chút" },
        { value: 2, label: "Khá nhiều" },
        { value: 3, label: "Rất nhiều" },
      ],
    },
    {
      id: 6,
      category: "work",
      question: "Mức độ áp lực công việc/học tập của bạn như thế nào?",
      options: [
        { value: 0, label: "Rất thấp" },
        { value: 1, label: "Thấp" },
        { value: 2, label: "Cao" },
        { value: 3, label: "Rất cao" },
      ],
    },
    {
      id: 7,
      category: "mood",
      question: "Bạn có cảm thấy buồn chán hoặc mất hứng thú không?",
      options: [
        { value: 0, label: "Không" },
        { value: 1, label: "Thỉnh thoảng" },
        { value: 2, label: "Thường xuyên" },
        { value: 3, label: "Rất thường xuyên" },
      ],
    },
    {
      id: 8,
      category: "appetite",
      question: "Thói quen ăn uống của bạn có thay đổi không?",
      options: [
        { value: 0, label: "Không thay đổi" },
        { value: 1, label: "Thay đổi nhẹ" },
        { value: 2, label: "Thay đổi nhiều" },
        { value: 3, label: "Thay đổi rất nhiều" },
      ],
    },
  ];

  const handleResponse = (questionId, value) => {
    setResponses((prev) => ({
      ...prev,
      [questionId]: value,
    }));
  };

  const calculateResult = () => {
    const totalScore = Object.values(responses).reduce(
      (sum, score) => sum + score,
      0
    );
    const maxScore = questions.length * 3;
    const percentage = (totalScore / maxScore) * 100;

    let level, color, icon, description, recommendations;

    if (percentage <= 25) {
      level = "Thấp";
      color = "text-green-600";
      icon = <CheckCircle className="w-8 h-8 text-green-600" />;
      description =
        "Mức độ căng thẳng của bạn ở mức thấp. Bạn đang quản lý tốt các áp lực trong cuộc sống.";
      recommendations = [
        "Duy trì lối sống lành mạnh hiện tại",
        "Tiếp tục các hoạt động thể chất đều đặn",
        "Dành thời gian cho sở thích cá nhân",
      ];
    } else if (percentage <= 50) {
      level = "Trung bình";
      color = "text-yellow-600";
      icon = <AlertCircle className="w-8 h-8 text-yellow-600" />;
      description =
        "Mức độ căng thẳng của bạn ở mức trung bình. Cần chú ý và có biện pháp điều chỉnh.";
      recommendations = [
        "Thực hành các kỹ thuật thư giãn như thiền hoặc yoga",
        "Cải thiện chất lượng giấc ngủ",
        "Tìm kiếm sự hỗ trợ từ bạn bè và gia đình",
      ];
    } else if (percentage <= 75) {
      level = "Cao";
      color = "text-orange-600";
      icon = <AlertCircle className="w-8 h-8 text-orange-600" />;
      description =
        "Mức độ căng thẳng của bạn ở mức cao. Cần có những thay đổi tích cực trong lối sống.";
      recommendations = [
        "Học các kỹ thuật quản lý căng thẳng",
        "Giảm tải công việc nếu có thể",
        "Tham gia các hoạt động thể chất thường xuyên",
        "Cân nhắc tìm kiếm sự hỗ trợ chuyên nghiệp",
      ];
    } else {
      level = "Rất cao";
      color = "text-red-600";
      icon = <AlertCircle className="w-8 h-8 text-red-600" />;
      description =
        "Mức độ căng thẳng của bạn ở mức rất cao. Khuyến khích tìm kiếm sự hỗ trợ chuyên nghiệp.";
      recommendations = [
        "Tham khảo ý kiến bác sĩ hoặc chuyên gia tâm lý",
        "Thực hiện các biện pháp giảm căng thẳng ngay lập tức",
        "Cân nhắc điều chỉnh môi trường làm việc/học tập",
        "Tìm kiếm sự hỗ trợ từ người thân",
      ];
    }

    setResult({
      score: totalScore,
      maxScore,
      percentage: Math.round(percentage),
      level,
      color,
      icon,
      description,
      recommendations,
    });
    setCurrentStep("result");
  };

  const isComplete = Object.keys(responses).length === questions.length;

  if (currentStep === "result") {
    return (
      <div className="w-full mx-auto   min-h-screen">
        <div className="p-8">
          <HeaderTool
            title="Đánh giá mức độ căng thẳng"
            subtitle="Trả lời các câu hỏi dưới đây để đánh giá mức độ căng thẳng của bạn"
            icon={Brain}
            color="pink"
          />
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              {result.icon}
            </div>
            <h2 className="text-3xl font-bold text-gray-800 mb-2">
              Kết quả đánh giá
            </h2>
            <div className={`text-2xl font-semibold ${result.color}`}>
              Mức độ căng thẳng: {result.level}
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="text-xl font-semibold mb-4 flex items-center">
                <BarChart3 className="w-5 h-5 mr-2" />
                Thống kê
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>Điểm số:</span>
                  <span className="font-bold">
                    {result.score}/{result.maxScore}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full transition-all duration-1000 ${
                      result.percentage <= 25
                        ? "bg-green-500"
                        : result.percentage <= 50
                        ? "bg-yellow-500"
                        : result.percentage <= 75
                        ? "bg-orange-500"
                        : "bg-red-500"
                    }`}
                    style={{ width: `${result.percentage}%` }}
                  ></div>
                </div>
                <div className="text-center text-sm text-gray-600">
                  {result.percentage}% mức độ căng thẳng
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="text-xl font-semibold mb-4 flex items-center">
                <Brain className="w-5 h-5 mr-2" />
                Nhận xét
              </h3>
              <p className="text-gray-700 leading-relaxed">
                {result.description}
              </p>
            </div>
          </div>
          <div className="mt-8 bg-pink-50 rounded-xl p-6">
            <h3 className="text-xl font-semibold mb-4 flex items-center">
              <Lightbulb className="w-5 h-5 mr-2" />
              Khuyến nghị
            </h3>
            <ul className="space-y-2">
              {result.recommendations.map((rec, index) => (
                <li key={index} className="flex items-start">
                  <div className="w-2 h-2 bg-pink-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <span className="text-gray-700">{rec}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="mt-8 text-center">
            <button
              onClick={() => {
                setCurrentStep("assessment");
                setResponses({});
                setResult(null);
              }}
              className="bg-pink-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-pink-700 transition-colors duration-200"
            >
              Làm lại bài đánh giá
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full mx-auto p-6  min-h-screen">
      <div className=" p-8">
        <HeaderTool
          title="Đánh giá mức độ căng thẳng"
          subtitle="Trả lời các câu hỏi dưới đây để đánh giá mức độ căng thẳng của bạn"
          icon={Brain}
          color="pink"
        />

        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">
              Tiến độ: {Object.keys(responses).length}/{questions.length}
            </span>
            <span className="text-sm text-gray-500">
              {Math.round(
                (Object.keys(responses).length / questions.length) * 100
              )}
              %
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-pink-600 h-2 rounded-full transition-all duration-300"
              style={{
                width: `${
                  (Object.keys(responses).length / questions.length) * 100
                }%`,
              }}
            ></div>
          </div>
        </div>

        <div className="space-y-6">
          {questions.map((question) => (
            <div key={question.id} className="bg-gray-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-800">
                {question.id}. {question.question}
              </h3>
              <div className="grid gap-3">
                {question.options.map((option) => (
                  <label
                    key={option.value}
                    className={`flex items-center p-3 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                      responses[question.id] === option.value
                        ? "border-pink-500 bg-pink-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <input
                      type="radio"
                      name={`question-${question.id}`}
                      value={option.value}
                      checked={responses[question.id] === option.value}
                      onChange={(e) =>
                        handleResponse(question.id, parseInt(e.target.value))
                      }
                      className="sr-only"
                    />
                    <div
                      className={`w-4 h-4 rounded-full border-2 mr-3 flex items-center justify-center ${
                        responses[question.id] === option.value
                          ? "border-pink-500 bg-pink-500"
                          : "border-gray-300"
                      }`}
                    >
                      {responses[question.id] === option.value && (
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      )}
                    </div>
                    <span className="text-gray-700">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 text-center">
          <button
            onClick={calculateResult}
            disabled={!isComplete}
            className={`px-8 py-3 rounded-xl font-semibold transition-all duration-200 ${
              isComplete
                ? "bg-pink-600 text-white hover:bg-pink-700 shadow-lg hover:shadow-xl"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            {isComplete
              ? "Xem kết quả"
              : `Hoàn thành ${
                  questions.length - Object.keys(responses).length
                } câu hỏi còn lại`}
          </button>
        </div>
        <div className="bg-white rounded-lg p-6 mb-4 shadow-sm border border-pink-100 mt-20">
          <div className="flex items-center space-x-4 mb-4">
            <Shield className="h-6 w-6 text-pink-600" />
            <h3 className="text-lg font-semibold text-gray-800">
              Thông tin y tế quan trọng
            </h3>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-3 p-3 bg-pink-50 rounded-xl">
              <Info className="h-5 w-5 text-pink-600" />
              <div>
                <p className="font-medium text-pink-800">Độ chính xác cao</p>
                <p className="text-sm text-pink-600">Dựa trên chuẩn y khoa</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-pink-50 rounded-xl">
              <Users className="h-5 w-5 text-pink-600" />
              <div>
                <p className="font-medium text-pink-800">Nhiều phương pháp</p>
                <p className="text-sm text-pink-600">Phù hợp mọi trường hợp</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-pink-50 rounded-xl">
              <Award className="h-5 w-5 text-pink-600" />
              <div>
                <p className="font-medium text-pink-800">Tư vấn chuyên sâu</p>
                <p className="text-sm text-pink-600">Theo dõi toàn diện</p>
              </div>
            </div>
          </div>
          <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
            <p className="text-sm text-yellow-800">
              <strong>Lưu ý:</strong> Đây chỉ là công cụ tham khảo. Hãy luôn
              tham khảo ý kiến bác sĩ để có lời khuyên chính xác nhất cho sức
              khỏe của bạn.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StressAssessmentApp;

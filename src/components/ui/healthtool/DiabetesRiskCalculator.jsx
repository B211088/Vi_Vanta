import React, { useState } from "react";
import {
  Activity,
  Heart,
  Scale,
  Ruler,
  Clock,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Info,
  Shield,
  Users,
  Award,
  Calculator,
  Target,
  Stethoscope,
  BarChart3,
  Calendar,
} from "lucide-react";
import HeaderTool from "./HeaderTool";
import TabButton from "../../features/TabButton";

const DiabetesRiskCalculator = () => {
  const [activeTab, setActiveTab] = useState("calculator");
  const [showGuide, setShowGuide] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  // Form data
  const [formData, setFormData] = useState({
    age: 30,
    gender: "male",
    height: 170,
    weight: 70,
    waistCircumference: 80,
    physicalActivity: "moderate",
    familyHistory: "none",
    highBloodPressure: "no",
    highGlucose: "no",
    smokingHistory: "never",
    alcoholConsumption: "moderate",
    dietQuality: "good",
    stressLevel: "moderate",
    sleepQuality: "good",
  });

  const MedicalCard = ({
    title,
    value,
    unit,
    subtitle,
    icon: Icon,
    color,
    description,
  }) => (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 bg-${color}-100 rounded-lg`}>
          <Icon className={`h-6 w-6 text-${color}-600`} />
        </div>
      </div>
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
        <div className="flex items-baseline space-x-1">
          <span className="text-2xl font-bold text-gray-900">{value}</span>
          {unit && <span className="text-sm text-gray-600">{unit}</span>}
        </div>
        <p className="text-sm text-gray-600">{subtitle}</p>
        {description && (
          <p className="text-xs text-gray-500 mt-2">{description}</p>
        )}
      </div>
    </div>
  );

  const ValueSlider = ({
    label,
    value,
    onChange,
    min,
    max,
    step,
    unit = "",
  }) => (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <label className="text-sm font-medium text-gray-700">{label}</label>
        <span className="text-sm text-amber-600 font-semibold">
          {value}
          {unit}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider-amber"
      />
      <div className="flex justify-between text-xs text-gray-500">
        <span>
          {min}
          {unit}
        </span>
        <span>
          {max}
          {unit}
        </span>
      </div>
    </div>
  );

  const calculateBMI = (weight, height) => {
    const heightInM = height / 100;
    return (weight / (heightInM * heightInM)).toFixed(1);
  };

  const getRiskLevel = (score) => {
    if (score <= 7)
      return { level: "Thấp", color: "green", percentage: "< 1%" };
    if (score <= 11)
      return { level: "Hơi cao", color: "yellow", percentage: "1-4%" };
    if (score <= 14)
      return { level: "Trung bình", color: "orange", percentage: "5-17%" };
    if (score <= 20)
      return { level: "Cao", color: "red", percentage: "18-33%" };
    return { level: "Rất cao", color: "red", percentage: "> 33%" };
  };

  const calculateRisk = () => {
    setLoading(true);

    setTimeout(() => {
      let score = 0;

      // Age scoring
      if (formData.age >= 65) score += 4;
      else if (formData.age >= 55) score += 3;
      else if (formData.age >= 45) score += 2;
      else if (formData.age >= 35) score += 1;

      // BMI scoring
      const bmi = parseFloat(calculateBMI(formData.weight, formData.height));
      if (bmi >= 35) score += 4;
      else if (bmi >= 30) score += 3;
      else if (bmi >= 25) score += 2;
      else if (bmi >= 23) score += 1;

      // Waist circumference
      const waistLimit = formData.gender === "male" ? 102 : 88;
      if (formData.waistCircumference >= waistLimit) score += 2;
      else if (formData.waistCircumference >= waistLimit - 10) score += 1;

      // Family history
      if (formData.familyHistory === "both") score += 3;
      else if (formData.familyHistory === "one") score += 2;

      // Health conditions
      if (formData.highBloodPressure === "yes") score += 2;
      if (formData.highGlucose === "yes") score += 3;

      // Lifestyle factors
      if (formData.physicalActivity === "low") score += 2;
      else if (formData.physicalActivity === "moderate") score += 1;

      if (formData.smokingHistory === "current") score += 2;
      else if (formData.smokingHistory === "former") score += 1;

      if (formData.dietQuality === "poor") score += 2;
      else if (formData.dietQuality === "fair") score += 1;

      if (formData.stressLevel === "high") score += 1;
      if (formData.sleepQuality === "poor") score += 1;

      const risk = getRiskLevel(score);
      const bmiValue = calculateBMI(formData.weight, formData.height);

      setResult({
        totalScore: score,
        riskLevel: risk.level,
        riskColor: risk.color,
        riskPercentage: risk.percentage,
        bmi: bmiValue,
        bmiCategory: getBMICategory(bmiValue),
        recommendations: getRecommendations(score, formData),
        riskFactors: identifyRiskFactors(formData, bmi),
      });

      setActiveTab("results");
      setLoading(false);
    }, 1500);
  };

  const getBMICategory = (bmi) => {
    if (bmi < 18.5) return "Thiếu cân";
    if (bmi < 23) return "Bình thường";
    if (bmi < 25) return "Thừa cân nhẹ";
    if (bmi < 30) return "Thừa cân";
    return "Béo phì";
  };

  const getRecommendations = (score, data) => {
    const recommendations = [];

    if (data.physicalActivity === "low") {
      recommendations.push({
        category: "Vận động",
        advice: "Tăng cường hoạt động thể chất ít nhất 150 phút/tuần",
        priority: "high",
      });
    }

    if (data.dietQuality !== "good") {
      recommendations.push({
        category: "Dinh dưỡng",
        advice: "Cải thiện chế độ ăn uống, giảm đường, tăng rau xanh",
        priority: "high",
      });
    }

    if (parseFloat(calculateBMI(data.weight, data.height)) >= 25) {
      recommendations.push({
        category: "Cân nặng",
        advice: "Giảm cân 5-10% để giảm nguy cơ tiểu đường",
        priority: "medium",
      });
    }

    if (data.smokingHistory === "current") {
      recommendations.push({
        category: "Hút thuốc",
        advice: "Bỏ hút thuốc lá để cải thiện sức khỏe tổng thể",
        priority: "high",
      });
    }

    if (data.stressLevel === "high") {
      recommendations.push({
        category: "Stress",
        advice: "Học cách quản lý stress qua yoga, thiền hoặc thể thao",
        priority: "medium",
      });
    }

    return recommendations;
  };

  const identifyRiskFactors = (data, bmi) => {
    const factors = [];

    if (data.age >= 45) factors.push("Tuổi cao");
    if (bmi >= 25) factors.push("Thừa cân/béo phì");
    if (data.familyHistory !== "none") factors.push("Tiền sử gia đình");
    if (data.highBloodPressure === "yes") factors.push("Tăng huyết áp");
    if (data.physicalActivity === "low") factors.push("Ít vận động");
    if (data.smokingHistory !== "never") factors.push("Hút thuốc");

    return factors;
  };

  return (
    <div className="min-h-screen font-nunito ">
      <div className="w-full mx-auto px-4 py-8">
        {/* Header */}
        <HeaderTool
          title="Kiểm tra Nguy cơ Tiểu đường"
          subtitle="Đánh giá nguy cơ mắc bệnh tiểu đường type 2"
          icon={Activity}
          color="amber"
        />

        {/* Tab Navigation */}
        <div className="flex space-x-3 mb-6 overflow-x-auto pb-2">
          <TabButton
            id="calculator"
            color="amber-600"
            icon={Calculator}
            label="Đánh giá"
            isActive={activeTab === "calculator"}
            onClick={setActiveTab}
          />
          {result && (
            <>
              <TabButton
                id="results"
                color="amber-600"
                icon={TrendingUp}
                label="Kết quả Chi tiết"
                isActive={activeTab === "results"}
                onClick={setActiveTab}
              />
              <TabButton
                id="recommendations"
                icon={Target}
                label="Khuyến nghị"
                color="amber-600"
                isActive={activeTab === "recommendations"}
                onClick={setActiveTab}
              />
            </>
          )}
        </div>

        {/* Guide Section */}
        <div className="mb-6 p-4 bg-amber-50 rounded-lg border border-amber-200">
          <div
            onClick={() => setShowGuide(!showGuide)}
            className="flex items-center justify-between cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <h3 className="text-md font-semibold text-amber-800">
                Hướng dẫn đánh giá nguy cơ tiểu đường
              </h3>
              <p className="text-xs text-amber-800">
                {"(Nhấp vào đây để xem chi tiết)"}
              </p>
            </div>
            <button className="text-amber-600 hover:text-amber-800">
              <Info className="h-5 w-5" />
            </button>
          </div>

          {showGuide && (
            <div className="text-sm text-amber-700 space-y-3 mt-3">
              <p>
                <strong>1. Các yếu tố nguy cơ chính:</strong>
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>
                  <strong>Tuổi tác:</strong> Nguy cơ tăng theo tuổi, đặc biệt
                  sau 45 tuổi
                </li>
                <li>
                  <strong>Cân nặng:</strong> Thừa cân, béo phì tăng nguy cơ đáng
                  kể
                </li>
                <li>
                  <strong>Tiền sử gia đình:</strong> Có người thân mắc tiểu
                  đường
                </li>
                <li>
                  <strong>Lối sống:</strong> Ít vận động, ăn uống không lành
                  mạnh
                </li>
              </ul>

              <p>
                <strong>2. Mức độ nguy cơ:</strong>
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Thấp:{"<"} 1% khả năng mắc trong 10 năm tới</li>
                <li>Trung bình: 5-17% khả năng mắc trong 10 năm tới</li>
                <li>Cao: {">"} 33% khả năng mắc trong 10 năm tới</li>
              </ul>

              <p>
                <strong>3. Lưu ý:</strong> Đây là công cụ sàng lọc ban đầu. Cần
                xét nghiệm máu để chẩn đoán chính xác.
              </p>
            </div>
          )}
        </div>

        {/* Calculator Tab */}
        {activeTab === "calculator" && (
          <div className="grid lg:grid-cols-2 gap-8">
            <div className="bg-white rounded-lg p-8 shadow-sm border border-gray-200">
              <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center">
                <Activity className="h-5 w-5 mr-3 text-amber-600" />
                Thông tin cá nhân
              </h2>

              <div className="space-y-6">
                {/* Age and Gender */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <ValueSlider
                      label="Tuổi"
                      value={formData.age}
                      onChange={(value) =>
                        setFormData({ ...formData, age: value })
                      }
                      min={18}
                      max={80}
                      step={1}
                      unit=" tuổi"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Giới tính
                    </label>
                    <select
                      value={formData.gender}
                      onChange={(e) =>
                        setFormData({ ...formData, gender: e.target.value })
                      }
                      className="w-full p-2 border border-gray-300 rounded-md"
                    >
                      <option value="male">Nam</option>
                      <option value="female">Nữ</option>
                    </select>
                  </div>
                </div>

                {/* Height and Weight */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <ValueSlider
                      label="Chiều cao"
                      value={formData.height}
                      onChange={(value) =>
                        setFormData({ ...formData, height: value })
                      }
                      min={140}
                      max={200}
                      step={1}
                      unit=" cm"
                    />
                  </div>
                  <div>
                    <ValueSlider
                      label="Cân nặng"
                      value={formData.weight}
                      onChange={(value) =>
                        setFormData({ ...formData, weight: value })
                      }
                      min={40}
                      max={150}
                      step={1}
                      unit=" kg"
                    />
                  </div>
                </div>

                {/* Waist Circumference */}
                <div>
                  <ValueSlider
                    label="Vòng eo"
                    value={formData.waistCircumference}
                    onChange={(value) =>
                      setFormData({ ...formData, waistCircumference: value })
                    }
                    min={60}
                    max={130}
                    step={1}
                    unit=" cm"
                  />
                </div>

                {/* Family History */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Tiền sử tiểu đường trong gia đình
                  </label>
                  <select
                    value={formData.familyHistory}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        familyHistory: e.target.value,
                      })
                    }
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    <option value="none">Không có</option>
                    <option value="one">Một người thân</option>
                    <option value="both">Nhiều người thân</option>
                  </select>
                </div>

                {/* Health Conditions */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Tăng huyết áp
                    </label>
                    <select
                      value={formData.highBloodPressure}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          highBloodPressure: e.target.value,
                        })
                      }
                      className="w-full p-2 border border-gray-300 rounded-md"
                    >
                      <option value="no">Không</option>
                      <option value="yes">Có</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Tiền sử đường huyết cao
                    </label>
                    <select
                      value={formData.highGlucose}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          highGlucose: e.target.value,
                        })
                      }
                      className="w-full p-2 border border-gray-300 rounded-md"
                    >
                      <option value="no">Không</option>
                      <option value="yes">Có</option>
                    </select>
                  </div>
                </div>

                {/* Lifestyle Factors */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Mức độ vận động
                  </label>
                  <select
                    value={formData.physicalActivity}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        physicalActivity: e.target.value,
                      })
                    }
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    <option value="high">Cao ({">"}5 lần/tuần)</option>
                    <option value="moderate">Trung bình (3-4 lần/tuần)</option>
                    <option value="low">Thấp ({"<"}3 lần/tuần)</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Tình trạng hút thuốc
                    </label>
                    <select
                      value={formData.smokingHistory}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          smokingHistory: e.target.value,
                        })
                      }
                      className="w-full p-2 border border-gray-300 rounded-md"
                    >
                      <option value="never">Không bao giờ</option>
                      <option value="former">Đã bỏ</option>
                      <option value="current">Hiện tại</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Chất lượng chế độ ăn
                    </label>
                    <select
                      value={formData.dietQuality}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          dietQuality: e.target.value,
                        })
                      }
                      className="w-full p-2 border border-gray-300 rounded-md"
                    >
                      <option value="good">Tốt</option>
                      <option value="fair">Trung bình</option>
                      <option value="poor">Kém</option>
                    </select>
                  </div>
                </div>

                <button
                  disabled={loading}
                  onClick={calculateRisk}
                  className="w-full bg-gradient-to-r from-amber-500 to-amber-600 text-white py-3 px-6 rounded-lg hover:from-amber-600 hover:to-amber-700 transition-all font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  <Activity className="h-5 w-5 mr-2 inline" />
                  <span>
                    {loading ? "Đang đánh giá..." : "Đánh giá Nguy cơ"}
                  </span>
                </button>
              </div>
            </div>

            {result && (
              <div className="flex flex-col gap-4">
                <MedicalCard
                  title="Nguy cơ tiểu đường"
                  value={result.riskLevel}
                  unit=""
                  subtitle={`Xác suất: ${result.riskPercentage}`}
                  icon={AlertTriangle}
                  color={result.riskColor}
                />
                <MedicalCard
                  title="Điểm nguy cơ"
                  value={result.totalScore}
                  unit="/20"
                  subtitle="Tổng điểm đánh giá"
                  icon={BarChart3}
                  color="amber"
                />
                <MedicalCard
                  title="BMI"
                  value={result.bmi}
                  unit=""
                  subtitle={result.bmiCategory}
                  icon={Scale}
                  color="amber"
                />
                <MedicalCard
                  title="Yếu tố nguy cơ"
                  value={result.riskFactors.length}
                  unit="yếu tố"
                  subtitle="Cần quan tâm"
                  icon={Target}
                  color="orange"
                />
              </div>
            )}
          </div>
        )}

        {/* Results Tab */}
        {activeTab === "results" && result && (
          <div className="space-y-8">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <MedicalCard
                title="Mức độ nguy cơ"
                value={result.riskLevel}
                unit=""
                subtitle={`Xác suất: ${result.riskPercentage}`}
                icon={AlertTriangle}
                color={result.riskColor}
                description="Nguy cơ mắc tiểu đường type 2 trong 10 năm tới"
              />
              <MedicalCard
                title="Điểm tổng"
                value={result.totalScore}
                unit="/20"
                subtitle="Điểm đánh giá nguy cơ"
                icon={BarChart3}
                color="amber"
                description="Điểm được tính dựa trên các yếu tố nguy cơ"
              />
              <MedicalCard
                title="Chỉ số BMI"
                value={result.bmi}
                unit=""
                subtitle={result.bmiCategory}
                icon={Scale}
                color="amber"
                description="Chỉ số khối cơ thể hiện tại"
              />
            </div>

            {/* Risk Factors */}
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2 text-orange-600" />
                Các yếu tố nguy cơ đã xác định
              </h3>
              {result.riskFactors.length > 0 ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {result.riskFactors.map((factor, index) => (
                    <div
                      key={index}
                      className="flex items-center space-x-2 p-3 bg-orange-50 rounded-lg"
                    >
                      <AlertTriangle className="h-4 w-4 text-orange-600" />
                      <span className="text-sm text-orange-800">{factor}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center space-x-2 p-3 bg-green-50 rounded-lg">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-green-800">
                    Không có yếu tố nguy cơ đáng kể
                  </span>
                </div>
              )}
            </div>

            {/* Risk Level Explanation */}
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Giải thích mức độ nguy cơ
              </h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">
                    Mức độ nguy cơ của bạn:
                  </h4>
                  <div
                    className={`p-4 bg-${result.riskColor}-50 rounded-lg border border-${result.riskColor}-200`}
                  >
                    <p className={`text-${result.riskColor}-800 font-medium`}>
                      {result.riskLevel} - {result.riskPercentage}
                    </p>
                    <p className={`text-sm text-${result.riskColor}-700 mt-1`}>
                      {result.riskLevel === "Thấp" &&
                        "Nguy cơ rất thấp, duy trì lối sống lành mạnh"}
                      {result.riskLevel === "Hơi cao" &&
                        "Cần chú ý cải thiện lối sống"}
                      {result.riskLevel === "Trung bình" &&
                        "Nên thay đổi lối sống và theo dõi sức khỏe"}
                      {result.riskLevel === "Cao" &&
                        "Cần can thiệp tích cực và tham khảo bác sĩ"}
                      {result.riskLevel === "Rất cao" &&
                        "Cần gặp bác sĩ ngay để được tư vấn chuyên sâu"}
                    </p>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">
                    Các mức nguy cơ:
                  </h4>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-sm">Thấp: {"<"} 1%</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      <span className="text-sm">Hơi cao: 1-4%</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                      <span className="text-sm">Trung bình: 5-17%</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <span className="text-sm">Cao: 18-33%</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-red-700 rounded-full"></div>
                      <span className="text-sm">Rất cao: {">"} 33%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Recommendations Tab */}
        {activeTab === "recommendations" && result && (
          <div className="space-y-8">
            {/* Priority Recommendations */}
            <div className="bg-white rounded-lg p-8 shadow-sm border border-gray-200">
              <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <Target className="h-6 w-6 mr-3 text-amber-600" />
                Khuyến nghị cá nhân hóa
              </h3>

              <div className="space-y-4">
                {result.recommendations.map((rec, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border-l-4 ${
                      rec.priority === "high"
                        ? "bg-red-50 border-red-400"
                        : "bg-yellow-50 border-yellow-400"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <h4
                        className={`font-semibold ${
                          rec.priority === "high"
                            ? "text-red-800"
                            : "text-yellow-800"
                        }`}
                      >
                        {rec.category}
                      </h4>
                      <span
                        className={`text-xs px-2 py-1 rounded ${
                          rec.priority === "high"
                            ? "bg-red-200 text-red-800"
                            : "bg-yellow-200 text-yellow-800"
                        }`}
                      >
                        {rec.priority === "high"
                          ? "Ưu tiên cao"
                          : "Ưu tiên trung bình"}
                      </span>
                    </div>
                    <p
                      className={`text-sm mt-1 ${
                        rec.priority === "high"
                          ? "text-red-700"
                          : "text-yellow-700"
                      }`}
                    >
                      {rec.advice}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* General Prevention Guidelines */}
            <div className="bg-white rounded-lg p-8 shadow-sm border border-gray-200">
              <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <Shield className="h-6 w-6 mr-3 text-green-600" />
                Nguyên tắc phòng ngừa tiểu đường
              </h3>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="bg-amber-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-amber-800 mb-2 flex items-center">
                      <Activity className="h-5 w-5 mr-2" />
                      Vận động thể chất
                    </h4>
                    <ul className="text-sm text-amber-700 space-y-1">
                      <li>• Ít nhất 150 phút/tuần cường độ vừa</li>
                      <li>• Bài tập sức bền 2-3 lần/tuần</li>
                      <li>• Đi bộ sau bữa ăn</li>
                      <li>• Tránh ngồi quá 30 phút liên tục</li>
                    </ul>
                  </div>

                  <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-green-800 mb-2 flex items-center">
                      <Heart className="h-5 w-5 mr-2" />
                      Dinh dưỡng
                    </h4>
                    <ul className="text-sm text-green-700 space-y-1">
                      <li>• Giảm đường tinh luyện và thực phẩm chế biến</li>
                      <li>• Tăng rau xanh, trái cây, ngũ cốc nguyên hạt</li>
                      <li>• Chọn protein nạc</li>
                      <li>• Kiểm soát khẩu phần ăn</li>
                    </ul>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-purple-800 mb-2 flex items-center">
                      <Scale className="h-5 w-5 mr-2" />
                      Quản lý cân nặng
                    </h4>
                    <ul className="text-sm text-purple-700 space-y-1">
                      <li>• Giảm 5-10% cân nặng ban đầu</li>
                      <li>• Giảm cân từ từ (0.5-1kg/tuần)</li>
                      <li>• Duy trì cân nặng ổn định</li>
                      <li>• Theo dõi BMI và vòng eo</li>
                    </ul>
                  </div>

                  <div className="bg-orange-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-orange-800 mb-2 flex items-center">
                      <Clock className="h-5 w-5 mr-2" />
                      Lối sống
                    </h4>
                    <ul className="text-sm text-orange-700 space-y-1">
                      <li>• Ngủ đủ 7-9 tiếng/đêm</li>
                      <li>• Quản lý stress hiệu quả</li>
                      <li>• Bỏ hút thuốc lá</li>
                      <li>• Hạn chế rượu bia</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Follow-up Schedule */}
            <div className="bg-white rounded-lg p-8 shadow-sm border border-gray-200">
              <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <Calendar className="h-6 w-6 mr-3 text-amber-600" />
                Lịch theo dõi đề xuất
              </h3>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {result.riskLevel === "Thấp" && (
                  <>
                    <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                      <h4 className="font-semibold text-green-800">
                        Kiểm tra định kỳ
                      </h4>
                      <p className="text-sm text-green-700 mt-1">
                        Mỗi 3 năm một lần
                      </p>
                    </div>
                    <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                      <h4 className="font-semibold text-amber-800">
                        Đánh giá lại
                      </h4>
                      <p className="text-sm text-amber-700 mt-1">
                        Khi có thay đổi sức khỏe
                      </p>
                    </div>
                  </>
                )}

                {(result.riskLevel === "Hơi cao" ||
                  result.riskLevel === "Trung bình") && (
                  <>
                    <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                      <h4 className="font-semibold text-yellow-800">
                        Xét nghiệm đường huyết
                      </h4>
                      <p className="text-sm text-yellow-700 mt-1">
                        Mỗi 1-2 năm
                      </p>
                    </div>
                    <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                      <h4 className="font-semibold text-amber-800">
                        Kiểm tra sức khỏe
                      </h4>
                      <p className="text-sm text-amber-700 mt-1">Mỗi 6 tháng</p>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                      <h4 className="font-semibold text-purple-800">
                        Tư vấn dinh dưỡng
                      </h4>
                      <p className="text-sm text-purple-700 mt-1">
                        Nếu cần thiết
                      </p>
                    </div>
                  </>
                )}

                {(result.riskLevel === "Cao" ||
                  result.riskLevel === "Rất cao") && (
                  <>
                    <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                      <h4 className="font-semibold text-red-800">
                        Gặp bác sĩ ngay
                      </h4>
                      <p className="text-sm text-red-700 mt-1">
                        Trong 1-2 tuần
                      </p>
                    </div>
                    <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                      <h4 className="font-semibold text-orange-800">
                        Xét nghiệm định kỳ
                      </h4>
                      <p className="text-sm text-orange-700 mt-1">
                        Mỗi 3-6 tháng
                      </p>
                    </div>
                    <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                      <h4 className="font-semibold text-amber-800">
                        Chương trình can thiệp
                      </h4>
                      <p className="text-sm text-amber-700 mt-1">
                        Theo hướng dẫn bác sĩ
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Warning Signs */}
            <div className="bg-white rounded-lg p-8 shadow-sm border border-gray-200">
              <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <AlertTriangle className="h-6 w-6 mr-3 text-red-600" />
                Dấu hiệu cảnh báo cần gặp bác sĩ ngay
              </h3>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-red-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-red-800 mb-3">
                    Triệu chứng tiểu đường
                  </h4>
                  <ul className="text-sm text-red-700 space-y-1">
                    <li>• Khát nước nhiều, tiểu nhiều</li>
                    <li>• Đói nhiều nhưng sụt cân</li>
                    <li>• Mệt mỏi thường xuyên</li>
                    <li>• Nhìn mờ</li>
                    <li>• Vết thương lành chậm</li>
                    <li>• Nhiễm trùng tái phát</li>
                  </ul>
                </div>

                <div className="bg-orange-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-orange-800 mb-3">
                    Biến chứng sớm
                  </h4>
                  <ul className="text-sm text-orange-700 space-y-1">
                    <li>• Tê bì chân tay</li>
                    <li>• Đau ngực, khó thở</li>
                    <li>• Đau đầu thường xuyên</li>
                    <li>• Huyết áp cao đột ngột</li>
                    <li>• Nhiễm trùng đường tiết niệu</li>
                    <li>• Rối loạn kinh nguyệt (nữ)</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Medical Info Banner */}
        <div className="bg-white rounded-lg p-6 mt-6 mb-4 shadow-sm border border-amber-100">
          <div className="flex items-center space-x-4 mb-4">
            <Shield className="h-6 w-6 text-amber-600" />
            <h3 className="text-lg font-semibold text-gray-800">
              Thông tin y tế quan trọng
            </h3>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-3 p-3 bg-amber-50 rounded-xl">
              <Info className="h-5 w-5 text-amber-600" />
              <div>
                <p className="font-medium text-amber-800">Đánh giá khoa học</p>
                <p className="text-sm text-amber-600">
                  Dựa trên nghiên cứu y học
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-amber-50 rounded-xl">
              <Users className="h-5 w-5 text-amber-600" />
              <div>
                <p className="font-medium text-amber-800">Sàng lọc sớm</p>
                <p className="text-sm text-amber-600">
                  Phát hiện nguy cơ kịp thời
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-xl">
              <Award className="h-5 w-5 text-green-600" />
              <div>
                <p className="font-medium text-green-800">
                  Phòng ngừa hiệu quả
                </p>
                <p className="text-sm text-green-600">Giảm nguy cơ đáng kể</p>
              </div>
            </div>
          </div>
          <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
            <p className="text-sm text-yellow-800">
              <strong>Lưu ý:</strong> Đây là công cụ sàng lọc ban đầu. Để chẩn
              đoán chính xác, cần xét nghiệm đường huyết và tham khảo ý kiến bác
              sĩ chuyên khoa nội tiết.
            </p>
          </div>
        </div>
      </div>

      <style jsx>{`
        .slider-amber::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
        }

        .slider-amber::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          border: none;
        }
      `}</style>
    </div>
  );
};

export default DiabetesRiskCalculator;

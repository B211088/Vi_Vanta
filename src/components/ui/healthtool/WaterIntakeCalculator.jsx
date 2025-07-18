import React, { useEffect, useState } from "react";
import {
  ArrowLeft,
  User,
  Scale,
  Ruler,
  Activity,
  Calculator,
  Info,
  Droplets,
  Target,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Bed,
  Coffee,
  PersonStanding,
  Bike,
  Zap,
  Thermometer,
  Sun,
  Cloud,
  Snowflake,
  Baby,
  Heart,
  Shield,
  Users,
  Award,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const WaterIntakeCalculator = () => {
  const navigate = useNavigate();
  const [showGuide, setShowGuide] = useState(false);
  const [gender, setGender] = useState("");
  const [age, setAge] = useState("");
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [activityLevel, setActivityLevel] = useState("sedentary");
  const [climate, setClimate] = useState("temperate");
  const [healthCondition, setHealthCondition] = useState("normal");
  const [pregnancyStatus, setPregnancyStatus] = useState("none");
  const [result, setResult] = useState(null);

  const calculateWaterIntake = () => {
    if (!gender || !age || !weight || !height) {
      alert("Vui lòng nhập đầy đủ thông tin!");
      return;
    }

    const ageNum = parseFloat(age);
    const weightNum = parseFloat(weight);
    const heightNum = parseFloat(height);

    // PHƯƠNG PHÁP 1: Theo chuẩn EFSA (European Food Safety Authority)
    let baseWaterEFSA;
    if (gender === "male") {
      baseWaterEFSA = 2500; // 2.5L cho nam
    } else {
      baseWaterEFSA = 2000; // 2.0L cho nữ
    }

    // PHƯƠNG PHÁP 2: Theo cân nặng (30-35ml/kg - chuẩn khoa học)
    let baseWaterWeight;
    if (ageNum < 18) {
      baseWaterWeight = weightNum * 40; // Trẻ em cần nhiều hơn
    } else if (ageNum > 65) {
      baseWaterWeight = weightNum * 30; // Người cao tuổi cần ít hơn
    } else {
      baseWaterWeight = weightNum * 35; // Người trưởng thành
    }

    // PHƯƠNG PHÁP 3: Theo năng lượng tiêu thụ (1ml/kcal)
    // Tính BMR (Basal Metabolic Rate) theo công thức Mifflin-St Jeor
    let bmr;
    if (gender === "male") {
      bmr = 10 * weightNum + 6.25 * heightNum - 5 * ageNum + 5;
    } else {
      bmr = 10 * weightNum + 6.25 * heightNum - 5 * ageNum - 161;
    }

    // Tính TDEE (Total Daily Energy Expenditure)
    const activityMultipliers = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      active: 1.725,
      very_active: 1.9,
    };

    const tdee = bmr * activityMultipliers[activityLevel];
    const baseWaterEnergy = tdee; // 1ml/kcal

    // Kết hợp 3 phương pháp với trọng số
    let baseWater =
      baseWaterEFSA * 0.3 + baseWaterWeight * 0.4 + baseWaterEnergy * 0.3;

    // Điều chỉnh theo hoạt động (theo American College of Sports Medicine)
    // +355ml mỗi 30 phút tập luyện
    const activityWaterAdd = {
      sedentary: 0,
      light: 355, // ~30 phút tập/ngày
      moderate: 710, // ~60 phút tập/ngày
      active: 1065, // ~90 phút tập/ngày
      very_active: 1420, // ~120 phút tập/ngày
    };

    baseWater += activityWaterAdd[activityLevel];

    // Điều chỉnh theo khí hậu
    const climateMultiplier = climates[climate].multiplier;
    baseWater *= climateMultiplier;

    // Điều chỉnh theo tình trạng sức khỏe
    const healthMultiplier = healthConditions[healthCondition].multiplier;
    baseWater *= healthMultiplier;

    // Điều chỉnh theo tình trạng thai kỳ/cho con bú
    const pregnancyMultiplier = pregnancyStatuses[pregnancyStatus].multiplier;
    baseWater *= pregnancyMultiplier;

    // Tính BMI để đánh giá thêm
    const bmi = weightNum / (heightNum / 100) ** 2;

    // Điều chỉnh theo BMI (nghiên cứu mới)
    if (bmi < 18.5) {
      baseWater *= 0.95; // Người gầy cần ít nước hơn
    } else if (bmi > 25) {
      baseWater *= 1.1; // Người thừa cân cần nhiều nước hơn
    }

    // Đảm bảo giới hạn an toàn
    if (baseWater < 1200) baseWater = 1200; // Tối thiểu 1.2L
    if (baseWater > 4000) baseWater = 4000; // Tối đa 4L để tránh ngộ độc nước

    // Phân chia lượng nước theo thời gian trong ngày (cải thiện)
    const waterSchedule = [
      {
        time: "6:00 - 8:00",
        amount: Math.round(baseWater * 0.18), // Tăng lượng nước buổi sáng
        activity: "Thức dậy (bù nước sau giấc ngủ)",
      },
      {
        time: "8:00 - 10:00",
        amount: Math.round(baseWater * 0.12),
        activity: "Sau bữa sáng",
      },
      {
        time: "10:00 - 12:00",
        amount: Math.round(baseWater * 0.15),
        activity: "Giữa buổi sáng",
      },
      {
        time: "12:00 - 14:00",
        amount: Math.round(baseWater * 0.12),
        activity: "Sau bữa trưa",
      },
      {
        time: "14:00 - 16:00",
        amount: Math.round(baseWater * 0.15),
        activity: "Giữa buổi chiều",
      },
      {
        time: "16:00 - 18:00",
        amount: Math.round(baseWater * 0.13),
        activity: "Trước bữa tối",
      },
      {
        time: "18:00 - 20:00",
        amount: Math.round(baseWater * 0.12),
        activity: "Sau bữa tối",
      },
      {
        time: "20:00 - 22:00",
        amount: Math.round(baseWater * 0.08), // Giảm nước trước khi ngủ
        activity: "Trước khi ngủ (ít để không thức đêm)",
      },
    ];

    // Đánh giá mức độ hydration cải thiện
    const getHydrationStatus = (waterAmount) => {
      if (waterAmount < 1500) {
        return {
          status: "Thiếu nước nghiêm trọng",
          color: "text-red-600",
          icon: "danger",
        };
      } else if (waterAmount < 2000) {
        return {
          status: "Dưới mức khuyến nghị",
          color: "text-orange-600",
          icon: "warning",
        };
      } else if (waterAmount <= 3000) {
        return { status: "Tối ưu", color: "text-blue-600", icon: "excellent" };
      } else if (waterAmount <= 3500) {
        return {
          status: "Hơi nhiều",
          color: "text-yellow-600",
          icon: "warning",
        };
      } else {
        return {
          status: "Quá nhiều - cần giảm",
          color: "text-red-600",
          icon: "danger",
        };
      }
    };

    const hydrationStatus = getHydrationStatus(baseWater);

    // Lợi ích của việc uống đủ nước (cập nhật)
    const benefits = [
      "Cải thiện chức năng não bộ và tập trung",
      "Hỗ trợ quá trình trao đổi chất và giảm cân",
      "Duy trì độ ẩm cho da và chống lão hóa",
      "Giúp tiêu hóa và bài tiết tốt hơn",
      "Điều hòa nhiệt độ cơ thể",
      "Vận chuyển chất dinh dưỡng và oxy",
      "Tăng cường hệ miễn dịch",
      "Giảm nguy cơ sỏi thận",
    ];

    // Dấu hiệu thiếu nước (cập nhật)
    const dehydrationSigns = [
      "Khát nước và khô miệng",
      "Mệt mỏi và uể oải",
      "Đau đầu và chóng mặt",
      "Nước tiểu màu vàng đậm, ít",
      "Da khô và mất độ đàn hồi",
      "Táo bón",
      "Tim đập nhanh",
      "Khó tập trung",
    ];

    setResult({
      dailyWater: Math.round(baseWater),
      waterSchedule,
      hydrationStatus,
      bmi: bmi.toFixed(1),
      benefits,
      dehydrationSigns,
      recommendations: getRecommendations(
        baseWater,
        gender,
        ageNum,
        activityLevel,
        climate,
        bmi
      ),
      glassesNeeded: Math.round(baseWater / 250), // Tính theo ly 250ml
      bottlesNeeded: Math.round(baseWater / 500), // Tính theo chai 500ml
      // Thêm thông tin chi tiết về phương pháp tính
      calculationDetails: {
        efsa: Math.round(baseWaterEFSA),
        weight: Math.round(baseWaterWeight),
        energy: Math.round(baseWaterEnergy),
        bmr: Math.round(bmr),
        tdee: Math.round(tdee),
        activityBonus: activityWaterAdd[activityLevel],
      },
    });
  };

  const getRecommendations = (
    waterAmount,
    gender,
    age,
    activity,
    climate,
    bmi
  ) => {
    const recommendations = [];

    // Đánh giá theo lượng nước
    if (waterAmount < 1500) {
      recommendations.push({
        type: "danger",
        text: "🚨 Lượng nước quá ít! Cần tăng ngay để tránh mất nước nghiêm trọng. Bắt đầu uống từ từ trong 2-3 giờ tới.",
      });
    } else if (waterAmount > 3500) {
      recommendations.push({
        type: "warning",
        text: "⚠️ Lượng nước có thể quá nhiều. Chia nhỏ trong ngày và tham khảo bác sĩ nếu có vấn đề về thận hoặc tim.",
      });
    }

    // Khuyến nghị theo hoạt động
    if (activity === "very_active") {
      recommendations.push({
        type: "info",
        text: "🏃‍♂️ Mức vận động cao: Uống 150-250ml nước 15-20 phút trước tập, 200-300ml mỗi 15-20 phút trong tập.",
      });
    } else if (activity === "sedentary") {
      recommendations.push({
        type: "info",
        text: "💺 Ít vận động: Đặt nhắc nhở uống nước mỗi 1-2 giờ. Đứng dậy và uống nước để tăng tuần hoàn.",
      });
    }

    // Khuyến nghị theo khí hậu
    if (climate === "hot") {
      recommendations.push({
        type: "warning",
        text: "🌡️ Thời tiết nóng: Uống nước trước khi cảm thấy khát. Tránh đồ uống có caffeine và alcohol.",
      });
    } else if (climate === "cold") {
      recommendations.push({
        type: "info",
        text: "❄️ Thời tiết lạnh: Dù không thấy khát nhưng vẫn cần uống đủ nước. Có thể uống nước ấm.",
      });
    }

    // Khuyến nghị theo tuổi
    if (age < 18) {
      recommendations.push({
        type: "info",
        text: "👶 Lưu ý cho trẻ em: Chia nhỏ lượng nước trong ngày. Theo dõi màu nước tiểu để đánh giá.",
      });
    } else if (age > 65) {
      recommendations.push({
        type: "info",
        text: "👴 Người cao tuổi: Uống nước đều đặn dù không khát. Cẩn thận với thuốc lợi tiểu.",
      });
    }

    // Khuyến nghị theo BMI
    if (bmi < 18.5) {
      recommendations.push({
        type: "info",
        text: "⚖️ BMI thấp: Uống nước vừa phải, không cần quá nhiều. Chú ý bổ sung chất dinh dưỡng.",
      });
    } else if (bmi > 25) {
      recommendations.push({
        type: "info",
        text: "⚖️ BMI cao: Uống nhiều nước hỗ trợ trao đổi chất. Nước có thể giúp giảm cảm giác đói.",
      });
    }

    // Khuyến nghị theo giới tính
    if (gender === "female") {
      recommendations.push({
        type: "info",
        text: "👩 Phụ nữ: Tăng lượng nước trong kỳ kinh nguyệt. Uống nhiều nước giúp da đẹp hơn.",
      });
    }

    // Khuyến nghị chung
    recommendations.push({
      type: "info",
      text: "💡 Mẹo hay: Uống 1-2 ly nước ngay khi thức dậy để khởi động cơ thể.",
    });

    recommendations.push({
      type: "info",
      text: "🔍 Theo dõi: Nước tiểu màu vàng nhạt = đủ nước. Màu vàng đậm = thiếu nước.",
    });

    recommendations.push({
      type: "info",
      text: "⏰ Thời gian: Uống nước 30 phút trước bữa ăn, tránh uống quá nhiều trong bữa ăn.",
    });

    return recommendations;
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "excellent":
        return <CheckCircle className="h-6 w-6 text-blue-600" />;
      case "warning":
        return <AlertTriangle className="h-6 w-6 text-orange-600" />;
      case "danger":
        return <AlertTriangle className="h-6 w-6 text-red-600" />;
      default:
        return <Droplets className="h-6 w-6 text-gray-600" />;
    }
  };

  return (
    <div className="w-full min-h-screen px-6 py-8 ">
      <div className="w-full flex flex-col mb-6">
        <div
          onClick={() => navigate(-1)}
          className="flex items-center text-blue-600 hover:text-blue-800 mr-4 cursor-pointer"
        >
          <ArrowLeft className="h-5 w-5 mr-1" />
          Quay lại
        </div>
        <div className="flex items-center space-x-4 mt-2">
          <div className="p-3 bg-white rounded-xl shadow-sm">
            <Droplets className="h-7 w-7 text-blue-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              Tính toàn lượng nước cần uống
            </h2>
            <p className="text-gray-600 mt-1">
              Công cụ chuyên nghiệp tính toán lượng nước cần thiết cho cơ thể
            </p>
          </div>
        </div>
      </div>
      {/* Hướng dẫn */}
      <div className="mb-6 p-4 bg-blue-100 rounded-lg border border-blue-200">
        <div
          onClick={() => setShowGuide(!showGuide)}
          className="flex items-center justify-between cursor-pointer"
        >
          <h3 className="text-md font-semibold text-blue-800">
            Hướng dẫn sử dụng và uống nước
          </h3>
          <button className="text-blue-600 hover:text-blue-800">
            <Info className="h-5 w-5" />
          </button>
        </div>
        {showGuide && (
          <div className="text-sm text-blue-700 space-y-2 mt-3">
            <p>
              <strong>Thời điểm uống nước tốt nhất:</strong>
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Ngay khi thức dậy để bù nước mất trong đêm</li>
              <li>Trước bữa ăn 30 phút để hỗ trợ tiêu hóa</li>
              <li>Trong và sau khi tập thể dục</li>
              <li>Khi cảm thấy khát hoặc mệt mỏi</li>
            </ul>
            <p>
              <strong>Dấu hiệu cơ thể cần nước:</strong>
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Nước tiểu có màu vàng đậm</li>
              <li>Cảm thấy khát, khô miệng</li>
              <li>Mệt mỏi, chóng mặt</li>
              <li>Da mất độ đàn hồi</li>
            </ul>
            <p>
              <strong>Lưu ý:</strong> Không uống quá nhiều nước một lúc, chia
              đều trong ngày.
            </p>
          </div>
        )}
      </div>
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Form nhập thông tin */}
        <div className="space-y-4 sticky top-10 bg-white h-fit rounded-lg p-8 shadow-sm border border-gray-200">
          <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center">
            <User className="h-5 w-5 mr-3 text-blue-600" />
            Thông tin cá nhân
          </h2>

          {/* Giới tính và tuổi */}
          <div className="flex items-center gap-2">
            <div className="w-6/12 flex flex-col">
              <label className="text-xs pb-1">Giới tính</label>
              <div className="w-full flex items-center gap-2 py-2 px-3 text-sm border border-gray-300 rounded-md hover:border-blue-500 cursor-pointer">
                <User className="text-blue-500 h-5 w-5" />
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full outline-none cursor-pointer"
                >
                  <option value="">Chọn giới tính</option>
                  <option value="male">Nam</option>
                  <option value="female">Nữ</option>
                </select>
              </div>
            </div>
            <div className="w-6/12 flex flex-col">
              <label className="text-xs pb-1">Tuổi</label>
              <div className="w-full flex items-center gap-2 py-2 px-3 text-sm border border-gray-300 rounded-md hover:border-blue-500 cursor-pointer">
                <TrendingUp className="text-blue-600 h-5 w-5" />
                <input
                  type="number"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  min="1"
                  max="120"
                  placeholder="Nhập tuổi"
                  className="flex-1 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Cân nặng và chiều cao */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col">
              <label className="text-xs pb-1">Cân nặng (kg)</label>
              <div className="w-full flex items-center gap-2 py-2 px-3 text-sm border border-gray-300 rounded-md hover:border-blue-500">
                <Scale className="text-blue-600 h-5 w-5" />
                <input
                  type="number"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  min="1"
                  max="300"
                  step="0.1"
                  placeholder="Nhập cân nặng"
                  className="flex-1 outline-none"
                />
              </div>
            </div>
            <div className="flex flex-col">
              <label className="text-xs pb-1">Chiều cao (cm)</label>
              <div className="w-full flex items-center gap-2 py-2 px-3 text-sm border border-gray-300 rounded-md hover:border-blue-500">
                <Ruler className="text-blue-600 h-5 w-5" />
                <input
                  type="number"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  min="100"
                  max="250"
                  placeholder="Nhập chiều cao"
                  className="flex-1 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Mức độ hoạt động */}
          <div className="flex flex-col">
            <label className="text-xs pb-1">Mức độ hoạt động</label>
            <div className="w-full flex items-center gap-2 py-2 px-3 text-sm border border-gray-300 rounded-md hover:border-blue-500">
              <Activity className="text-blue-600 h-5 w-5" />
              <select
                value={activityLevel}
                onChange={(e) => setActivityLevel(e.target.value)}
                className="w-full outline-none cursor-pointer"
              >
                {Object.entries(activityLevels).map(([key, level]) => (
                  <option key={key} value={key}>
                    {level.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Khí hậu */}
          <div className="flex flex-col">
            <label className="text-xs pb-1">Khí hậu/Môi trường</label>
            <div className="w-full flex items-center gap-2 py-2 px-3 text-sm border border-gray-300 rounded-md hover:border-blue-500">
              <Thermometer className="text-blue-600 h-5 w-5" />
              <select
                value={climate}
                onChange={(e) => setClimate(e.target.value)}
                className="w-full outline-none cursor-pointer"
              >
                {Object.entries(climates).map(([key, climate]) => (
                  <option key={key} value={key}>
                    {climate.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Tình trạng sức khỏe */}
          <div className="flex flex-col">
            <label className="text-xs pb-1">Tình trạng sức khỏe</label>
            <div className="w-full flex items-center gap-2 py-2 px-3 text-sm border border-gray-300 rounded-md hover:border-blue-500">
              <Heart className="text-blue-600 h-5 w-5" />
              <select
                value={healthCondition}
                onChange={(e) => setHealthCondition(e.target.value)}
                className="w-full outline-none cursor-pointer"
              >
                {Object.entries(healthConditions).map(([key, condition]) => (
                  <option key={key} value={key}>
                    {condition.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Tình trạng thai kỳ (chỉ cho nữ) */}
          {gender === "female" && (
            <div className="flex flex-col">
              <label className="text-xs pb-1">Tình trạng thai kỳ</label>
              <div className="w-full flex items-center gap-2 py-2 px-3 text-sm border border-gray-300 rounded-md hover:border-blue-500">
                <Baby className="text-blue-600 h-5 w-5" />
                <select
                  value={pregnancyStatus}
                  onChange={(e) => setPregnancyStatus(e.target.value)}
                  className="w-full outline-none cursor-pointer"
                >
                  {Object.entries(pregnancyStatuses).map(([key, status]) => (
                    <option key={key} value={key}>
                      {status.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          <button
            onClick={calculateWaterIntake}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 transition-colors font-medium"
          >
            <Calculator className="h-5 w-5 inline mr-2" />
            Tính lượng nước cần uống
          </button>
        </div>
        {/* Kết quả */}
        {result && (
          <div className="space-y-4">
            {/* Kết quả chính */}
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <div className="flex items-center mb-3">
                {getStatusIcon(result.hydrationStatus.icon)}
                <h3 className="text-lg font-semibold ml-2">
                  Kết quả tính toán
                </h3>
              </div>
              <div className="space-y-3">
                <div className="text-center">
                  <p className="text-3xl font-bold text-blue-600 mb-1">
                    {result.dailyWater}ml
                  </p>
                  <p
                    className={`text-lg font-semibold ${result.hydrationStatus.color}`}
                  >
                    {result.hydrationStatus.status}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="text-center p-2 bg-white rounded">
                    <p className="font-semibold">{result.glassesNeeded}</p>
                    <p className="text-gray-600">ly (250ml)</p>
                  </div>
                  <div className="text-center p-2 bg-white rounded">
                    <p className="font-semibold">{result.bottlesNeeded}</p>
                    <p className="text-gray-600">chai (500ml)</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Lịch uống nước */}
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                <Target className="h-5 w-5 mr-2 text-blue-600" />
                Lịch uống nước trong ngày
              </h4>
              <div className="space-y-2">
                {result.waterSchedule.map((schedule, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 bg-blue-50 rounded"
                  >
                    <div>
                      <p className="font-medium text-sm">{schedule.time}</p>
                      <p className="text-xs text-gray-600">
                        {schedule.activity}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-blue-600">
                        {schedule.amount}ml
                      </p>
                      <p className="text-xs text-gray-600">
                        {Math.round(schedule.amount / 250)} ly
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Biểu đồ nước trong cơ thể */}
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <h4 className="font-semibold text-gray-800 mb-3">
                Tỷ lệ nước trong cơ thể
              </h4>
              <div className="space-y-3">
                <div className="text-center">
                  <p className="text-lg font-semibold text-blue-600">~60%</p>
                  <p className="text-sm text-gray-600">Tỷ lệ nước trung bình</p>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-6">
                  <div
                    className="bg-blue-500 h-6 rounded-full flex items-center justify-center text-white text-sm font-medium"
                    style={{ width: "60%" }}
                  >
                    60%
                  </div>
                </div>
                <p className="text-xs text-gray-500 text-center">
                  Duy trì độ ẩm cơ thể ở mức tối ưu
                </p>
              </div>
            </div>

            {/* Lợi ích của việc uống đủ nước */}
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <h4 className="font-semibold text-green-800 mb-3 flex items-center">
                <Shield className="h-5 w-5 mr-2" />
                Lợi ích của việc uống đủ nước
              </h4>
              <div className="grid grid-cols-1 gap-2">
                {result.benefits.map((benefit, index) => (
                  <div
                    key={index}
                    className="flex items-center text-sm text-green-700"
                  >
                    <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                    {benefit}
                  </div>
                ))}
              </div>
            </div>

            {/* Dấu hiệu thiếu nước */}
            <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
              <h4 className="font-semibold text-orange-800 mb-3 flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2" />
                Dấu hiệu thiếu nước
              </h4>
              <div className="grid grid-cols-2 gap-2">
                {result.dehydrationSigns.map((sign, index) => (
                  <div
                    key={index}
                    className="flex items-center text-sm text-orange-700"
                  >
                    <AlertTriangle className="h-4 w-4 mr-2 text-orange-600" />
                    {sign}
                  </div>
                ))}
              </div>
            </div>

            {/* Khuyến nghị */}
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h4 className="font-semibold text-blue-800 mb-3">
                Khuyến nghị cải thiện
              </h4>
              <div className="space-y-2">
                {result.recommendations.map((rec, index) => (
                  <div
                    key={index}
                    className={`p-2 rounded text-sm ${
                      rec.type === "warning"
                        ? "bg-orange-100 text-orange-800"
                        : rec.type === "danger"
                        ? "bg-red-100 text-red-800"
                        : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    <p>{rec.text}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Lưu ý */}
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h4 className="font-semibold text-blue-800 mb-2">
                Lưu ý quan trọng
              </h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Uống nước đều đặn trong ngày, không chờ đến khi khát</li>
                <li>• Tăng lượng nước khi tập thể dục hoặc thời tiết nóng</li>
                <li>
                  • Theo dõi màu nước tiểu để đánh giá tình trạng hydration
                </li>
                <li>• Không uống quá nhiều nước một lúc</li>
                <li>• Tham khảo bác sĩ nếu có vấn đề về tim mạch hoặc thận</li>
              </ul>
            </div>
          </div>
        )}
      </div>{" "}
      <div className="bg-white rounded-lg p-6 mt-6 mb-4 shadow-sm border border-blue-100">
        <div className="flex items-center space-x-4 mb-4">
          <Shield className="h-6 w-6 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-800">
            Thông tin y tế quan trọng
          </h3>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-xl">
            <Info className="h-5 w-5 text-blue-600" />
            <div>
              <p className="font-medium text-blue-800">Độ chính xác cao</p>
              <p className="text-sm text-blue-600">Dựa trên chuẩn y khoa</p>
            </div>
          </div>
          <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-xl">
            <Users className="h-5 w-5 text-blue-600" />
            <div>
              <p className="font-medium text-blue-800">Nhiều phương pháp</p>
              <p className="text-sm text-blue-600">Phù hợp mọi trường hợp</p>
            </div>
          </div>
          <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-xl">
            <Award className="h-5 w-5 text-blue-600" />
            <div>
              <p className="font-medium text-blue-800">Tư vấn chuyên sâu</p>
              <p className="text-sm text-blue-600">Theo dõi toàn diện</p>
            </div>
          </div>
        </div>
        <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
          <p className="text-sm text-yellow-800">
            <strong>Lưu ý:</strong> Đây chỉ là công cụ tham khảo. Hãy luôn tham
            khảo ý kiến bác sĩ để có lời khuyên chính xác nhất cho sức khỏe của
            bạn.
          </p>
        </div>
      </div>
    </div>
  );
};

export default WaterIntakeCalculator;

// Cấu hình các mức độ hoạt động
const activityLevels = {
  sedentary: {
    label: "Ít vận động",
    waterMultiplier: 1.0,
    icon: Bed,
    color: "text-gray-500",
    description: "Công việc văn phòng, ít hoạt động thể chất",
  },
  light: {
    label: "Vận động nhẹ",
    waterMultiplier: 1.1,
    icon: Coffee,
    color: "text-blue-500",
    description: "Tập thể dục 1-3 ngày/tuần",
  },
  moderate: {
    label: "Vận động vừa",
    waterMultiplier: 1.2,
    icon: PersonStanding,
    color: "text-green-500",
    description: "Tập thể dục 3-5 ngày/tuần",
  },
  active: {
    label: "Vận động nhiều",
    waterMultiplier: 1.3,
    icon: Bike,
    color: "text-orange-500",
    description: "Tập thể dục 6-7 ngày/tuần",
  },
  very_active: {
    label: "Rất năng động",
    waterMultiplier: 1.5,
    icon: Zap,
    color: "text-red-500",
    description: "Tập thể dục 2 lần/ngày hoặc công việc nặng",
  },
};

// Cấu hình khí hậu
const climates = {
  cold: {
    label: "Lạnh (< 15°C)",
    multiplier: 0.9,
    icon: Snowflake,
    color: "text-blue-400",
  },
  temperate: {
    label: "Ôn hòa (15-25°C)",
    multiplier: 1.0,
    icon: Cloud,
    color: "text-gray-500",
  },
  hot: {
    label: "Nóng (> 25°C)",
    multiplier: 1.2,
    icon: Sun,
    color: "text-orange-500",
  },
  humid: {
    label: "Ẩm ướt",
    multiplier: 1.15,
    icon: Cloud,
    color: "text-blue-600",
  },
};

// Cấu hình tình trạng sức khỏe
const healthConditions = {
  normal: {
    label: "Bình thường",
    multiplier: 1.0,
    description: "Không có vấn đề sức khỏe đặc biệt",
  },
  fever: {
    label: "Sốt",
    multiplier: 1.3,
    description: "Cơ thể mất nước nhiều do sốt",
  },
  diarrhea: {
    label: "Tiêu chảy",
    multiplier: 1.4,
    description: "Cần bù nước do mất nước qua đường tiêu hóa",
  },
  kidney_stones: {
    label: "Sỏi thận",
    multiplier: 1.5,
    description: "Cần nhiều nước để ngăn ngừa sỏi thận",
  },
  diabetes: {
    label: "Tiểu đường",
    multiplier: 1.2,
    description: "Người tiểu đường cần uống nhiều nước hơn",
  },
  heart_disease: {
    label: "Bệnh tim",
    multiplier: 0.9,
    description: "Cần hạn chế nước theo chỉ định bác sĩ",
  },
  kidney_disease: {
    label: "Bệnh thận",
    multiplier: 0.8,
    description: "Cần hạn chế nước theo chỉ định bác sĩ",
  },
};

// Cấu hình tình trạng thai kỳ
const pregnancyStatuses = {
  none: {
    label: "Không",
    multiplier: 1.0,
    description: "Không có thai hoặc cho con bú",
  },
  first_trimester: {
    label: "Thai kỳ 3 tháng đầu",
    multiplier: 1.1,
    description: "Cần thêm nước cho sự phát triển của thai nhi",
  },
  second_trimester: {
    label: "Thai kỳ 3 tháng giữa",
    multiplier: 1.2,
    description: "Cần nhiều nước hơn cho sự phát triển thai nhi",
  },
  third_trimester: {
    label: "Thai kỳ 3 tháng cuối",
    multiplier: 1.3,
    description: "Cần nhiều nước nhất trong thai kỳ",
  },
  breastfeeding: {
    label: "Đang cho con bú",
    multiplier: 1.4,
    description: "Cần nhiều nước để sản xuất sữa mẹ",
  },
};

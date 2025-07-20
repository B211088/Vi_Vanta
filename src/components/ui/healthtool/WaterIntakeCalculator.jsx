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

    // PHƯƠNG PHÁP CHÍNH XÁC THEO CHUẨN Y TẾ QUỐC TẾ

    // 1. Lượng nước cơ bản theo WHO và Institute of Medicine (IOM)
    let baseWater;

    if (ageNum < 0.5) {
      // 0-6 tháng: toàn bộ qua sữa mẹ
      baseWater = 700;
    } else if (ageNum < 1) {
      // 7-12 tháng
      baseWater = 900;
    } else if (ageNum < 4) {
      baseWater = 1300;
    } else if (ageNum < 9) {
      baseWater = 1700;
    } else if (ageNum < 14) {
      if (gender === "male") {
        baseWater = 2400;
      } else {
        baseWater = 2100;
      }
    } else if (ageNum < 19) {
      if (gender === "male") {
        baseWater = 3300;
      } else {
        baseWater = 2300;
      }
    } else if (ageNum <= 70) {
      if (gender === "male") {
        baseWater = 3700;
      } else {
        baseWater = 2700;
      }
    } else {
      if (gender === "male") {
        baseWater = 3200;
      } else {
        baseWater = 2200;
      }
    }

    // 2. Điều chỉnh theo cân nặng (chỉ cho người trưởng thành bất thường)
    if (ageNum >= 18) {
      const bmi = weightNum / (heightNum / 100) ** 2;

      // Điều chỉnh nhẹ cho BMI bất thường
      if (bmi < 16) {
        baseWater *= 0.85; // Người gầy nghiêm trọng
      } else if (bmi < 18.5) {
        baseWater *= 0.9; // Người gầy
      } else if (bmi > 35) {
        baseWater *= 1.15; // Béo phì độ 2
      } else if (bmi > 30) {
        baseWater *= 1.1; // Béo phì độ 1
      } else if (bmi > 25) {
        baseWater *= 1.05; // Thừa cân nhẹ
      }
    }

    // 3. Điều chỉnh theo hoạt động thể chất (theo ACSM - American College of Sports Medicine)
    const activityWaterAdd = {
      sedentary: 0,
      light: 300, // 30 phút tập nhẹ
      moderate: 500, // 60 phút tập vừa
      active: 700, // 90 phút tập mạnh
      very_active: 1000, // >120 phút tập rất mạnh
    };

    baseWater += activityWaterAdd[activityLevel];

    // 4. Điều chỉnh theo khí hậu (theo WHO)
    const climateAdjustment = {
      cold: -200, // Giảm trong môi trường lạnh
      temperate: 0,
      hot: 500, // Tăng 500ml trong môi trường nóng
      humid: 300, // Tăng trong môi trường ẩm
    };

    baseWater += climateAdjustment[climate];

    // 5. Điều chỉnh theo tình trạng sức khỏe
    const healthAdjustment = {
      normal: 0,
      fever: 500, // +500ml khi sốt
      diarrhea: 1000, // +1L khi tiêu chảy
      kidney_stones: 1000, // +1L để ngăn sỏi thận
      diabetes: 300, // +300ml cho người tiểu đường
      heart_disease: -500, // Giảm cho bệnh tim (theo chỉ định BS)
      kidney_disease: -800, // Giảm cho bệnh thận (theo chỉ định BS)
    };

    baseWater += healthAdjustment[healthCondition];

    // 6. Điều chỉnh theo thai kỳ/cho con bú (theo IOM)
    const pregnancyAdjustment = {
      none: 0,
      first_trimester: 300, // +300ml
      second_trimester: 300, // +300ml
      third_trimester: 300, // +300ml (tổng 3L)
      breastfeeding: 700, // +700ml (tổng 3.4L)
    };

    baseWater += pregnancyAdjustment[pregnancyStatus];

    // 7. Giới hạn an toàn theo khuyến cáo y tế
    if (baseWater < 1000) baseWater = 1000; // Tối thiểu 1L
    if (baseWater > 4500) baseWater = 4500; // Tối đa 4.5L để tránh ngộ độc nước

    // Tính BMI
    const bmi = weightNum / (heightNum / 100) ** 2;

    // Phân chia lượng nước trong ngày (theo khuyến cáo y tế)
    const waterSchedule = [
      {
        time: "6:00 - 8:00",
        amount: Math.round(baseWater * 0.2), // Bù nước sau ngủ
        activity: "Thức dậy - bù nước mất qua đêm",
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
        amount: Math.round(baseWater * 0.1),
        activity: "Sau bữa tối",
      },
      {
        time: "20:00 - 22:00",
        amount: Math.round(baseWater * 0.03), // Rất ít trước ngủ
        activity: "Trước ngủ (ít để không thức đêm)",
      },
    ];

    // Đánh giá mức độ hydration theo chuẩn y tế
    const getHydrationStatus = (waterAmount) => {
      const recommendedMin = gender === "male" ? 2500 : 2000;
      const recommendedMax = gender === "male" ? 3700 : 2700;

      if (waterAmount < recommendedMin * 0.6) {
        return {
          status: "Thiếu nước nghiêm trọng",
          color: "text-red-600",
          icon: "danger",
        };
      } else if (waterAmount < recommendedMin * 0.8) {
        return {
          status: "Thiếu nước",
          color: "text-orange-600",
          icon: "warning",
        };
      } else if (
        waterAmount >= recommendedMin &&
        waterAmount <= recommendedMax
      ) {
        return {
          status: "Tối ưu",
          color: "text-green-600",
          icon: "excellent",
        };
      } else if (waterAmount <= recommendedMax * 1.2) {
        return {
          status: "Hơi nhiều",
          color: "text-yellow-600",
          icon: "warning",
        };
      } else {
        return {
          status: "Quá nhiều - có thể nguy hiểm",
          color: "text-red-600",
          icon: "danger",
        };
      }
    };

    const hydrationStatus = getHydrationStatus(baseWater);

    // Lợi ích khoa học của việc uống đủ nước
    const benefits = [
      "Duy trì cân bằng điện giải trong cơ thể",
      "Hỗ trợ chức năng thận và bài tiết độc tố",
      "Điều hòa nhiệt độ cơ thể qua mồ hôi",
      "Bôi trơn khớp và bảo vệ mô",
      "Vận chuyển chất dinh dưỡng đến tế bào",
      "Duy trì áp suất máu ổn định",
      "Hỗ trợ tiêu hóa và hấp thụ thức ăn",
      "Tăng cường miễn dịch và chống nhiễm trùng",
    ];

    // Dấu hiệu thiếu nước theo y khoa
    const dehydrationSigns = [
      "Khát nước và niêm mạc khô",
      "Nước tiểu màu vàng đậm, ít",
      "Mệt mỏi và chóng mặt",
      "Đau đầu và khó tập trung",
      "Da mất độ đàn hồi (test kéo da)",
      "Táo bón",
      "Nhịp tim nhanh",
      "Huyết áp thấp khi đứng lên",
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
        bmi,
        healthCondition
      ),
      glassesNeeded: Math.round(baseWater / 250),
      bottlesNeeded: Math.round(baseWater / 500),
      // Thông tin chi tiết tính toán
      calculationDetails: {
        baseRecommendation: gender === "male" ? 3700 : 2700,
        ageAdjustment: ageNum > 70 ? "Giảm do tuổi cao" : "Theo chuẩn IOM",
        activityBonus: activityWaterAdd[activityLevel],
        climateAdjustment: climateAdjustment[climate],
        healthAdjustment: healthAdjustment[healthCondition],
        pregnancyAdjustment: pregnancyAdjustment[pregnancyStatus],
      },
    });
  };

  const getRecommendations = (
    waterAmount,
    gender,
    age,
    activity,
    climate,
    bmi,
    health
  ) => {
    const recommendations = [];

    // Cảnh báo an toàn theo y khoa
    if (waterAmount < 1500) {
      recommendations.push({
        type: "danger",
        text: "🚨 NGUY HIỂM: Lượng nước quá thấp có thể gây mất nước nghiêm trọng. Cần uống ngay và tham khảo bác sĩ!",
      });
    } else if (waterAmount > 4000) {
      recommendations.push({
        type: "danger",
        text: "⚠️ CẢNH BÁO: Lượng nước quá cao có thể gây ngộ độc nước (hyponatremia). Hãy tham khảo bác sĩ!",
      });
    }

    // Khuyến nghị đặc biệt cho bệnh lý
    if (health === "heart_disease" || health === "kidney_disease") {
      recommendations.push({
        type: "warning",
        text: "🏥 QUAN TRỌNG: Với bệnh tim/thận, cần tuân thủ nghiêm ngặt chỉ định của bác sĩ về lượng nước.",
      });
    }

    if (health === "diabetes") {
      recommendations.push({
        type: "info",
        text: "🩺 Tiểu đường: Uống nước đều đặn giúp kiểm soát đường huyết và ngăn ngừa biến chứng.",
      });
    }

    // Khuyến nghị theo hoạt động
    if (activity === "very_active") {
      recommendations.push({
        type: "info",
        text: "🏃‍♂️ Vận động mạnh: Uống 150-250ml mỗi 15-20 phút khi tập. Bổ sung điện giải nếu tập >1 giờ.",
      });
    }

    // Khuyến nghị theo khí hậu
    if (climate === "hot") {
      recommendations.push({
        type: "warning",
        text: "🌡️ Thời tiết nóng: Uống nước trước khi khát. Tránh alcohol và caffeine vì có tác dụng lợi tiểu.",
      });
    }

    // Khuyến nghị theo tuổi
    if (age < 18) {
      recommendations.push({
        type: "info",
        text: "👶 Trẻ em/thanh thiếu niên: Cha mẹ cần theo dõi việc uống nước. Đưa bình nước đến trường.",
      });
    } else if (age > 65) {
      recommendations.push({
        type: "info",
        text: "👴 Người cao tuổi: Cảm giác khát giảm theo tuổi. Cần uống nước đều đặn dù không khát.",
      });
    }

    // Khuyến nghị chung từ WHO
    recommendations.push({
      type: "info",
      text: "💡 WHO khuyến cáo: Uống nước sạch, tránh đồ uống có đường. Nước trái cây, trà không đường cũng tính.",
    });

    recommendations.push({
      type: "info",
      text: "🔍 Kiểm tra: Nước tiểu màu vàng nhạt = đủ nước. Màu vàng đậm hoặc không màu = cần điều chỉnh.",
    });

    return recommendations;
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "excellent":
        return <CheckCircle className="h-6 w-6 text-green-600" />;
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
              Tính toán lượng nước theo chuẩn y tế
            </h2>
            <p className="text-gray-600 mt-1">
              Dựa trên khuyến cáo WHO, IOM và các tổ chức y tế uy tín
            </p>
          </div>
        </div>
      </div>

      {/* Hướng dẫn y tế */}
      <div className="mb-6 p-4 bg-blue-100 rounded-lg border border-blue-200">
        <div
          onClick={() => setShowGuide(!showGuide)}
          className="flex items-center justify-between cursor-pointer"
        >
          <h3 className="text-md font-semibold text-blue-800">
            Hướng dẫn y tế về uống nước
          </h3>
          <button className="text-blue-600 hover:text-blue-800">
            <Info className="h-5 w-5" />
          </button>
        </div>
        {showGuide && (
          <div className="text-sm text-blue-700 space-y-2 mt-3">
            <p>
              <strong>Chuẩn WHO & Institute of Medicine (IOM):</strong>
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Nam trưởng thành: 3.7L/ngày (bao gồm nước từ thức ăn)</li>
              <li>Nữ trưởng thành: 2.7L/ngày (bao gồm nước từ thức ăn)</li>
              <li>Khoảng 80% từ đồ uống, 20% từ thức ăn</li>
              <li>Tăng khi tập thể dục, thời tiết nóng, ốm</li>
            </ul>
            <p>
              <strong>Dấu hiệu cần uống nước:</strong>
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Nước tiểu màu vàng đậm</li>
              <li>Khô miệng, khát nước</li>
              <li>Mệt mỏi, chóng mặt</li>
              <li>Đau đầu</li>
            </ul>
            <p>
              <strong>Cảnh báo:</strong> Uống quá nhiều nước ({">"}4.5L/ngày) có
              thể nguy hiểm!
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
            Tính theo chuẩn y tế
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
                  Kết quả theo chuẩn y tế
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

            {/* Chi tiết tính toán theo chuẩn y tế */}
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                <Info className="h-5 w-5 mr-2 text-blue-600" />
                Phương pháp tính toán
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Chuẩn IOM/WHO:</span>
                  <span className="font-medium">
                    {result.calculationDetails.baseRecommendation}ml
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Điều chỉnh tuổi:</span>
                  <span className="font-medium">
                    {result.calculationDetails.ageAdjustment}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Hoạt động thể chất:</span>
                  <span className="font-medium">
                    +{result.calculationDetails.activityBonus}ml
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Khí hậu:</span>
                  <span className="font-medium">
                    {result.calculationDetails.climateAdjustment >= 0
                      ? "+"
                      : ""}
                    {result.calculationDetails.climateAdjustment}ml
                  </span>
                </div>
                {result.calculationDetails.healthAdjustment !== 0 && (
                  <div className="flex justify-between">
                    <span>Tình trạng sức khỏe:</span>
                    <span className="font-medium">
                      {result.calculationDetails.healthAdjustment >= 0
                        ? "+"
                        : ""}
                      {result.calculationDetails.healthAdjustment}ml
                    </span>
                  </div>
                )}
                {result.calculationDetails.pregnancyAdjustment !== 0 && (
                  <div className="flex justify-between">
                    <span>Thai kỳ/cho con bú:</span>
                    <span className="font-medium">
                      +{result.calculationDetails.pregnancyAdjustment}ml
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Lịch uống nước */}
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                <Target className="h-5 w-5 mr-2 text-blue-600" />
                Lịch uống nước khuyến nghị
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

            {/* Lợi ích khoa học */}
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <h4 className="font-semibold text-green-800 mb-3 flex items-center">
                <Shield className="h-5 w-5 mr-2" />
                Lợi ích khoa học đã chứng minh
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
                Dấu hiệu thiếu nước (theo y khoa)
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

            {/* Khuyến nghị y tế */}
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h4 className="font-semibold text-blue-800 mb-3">
                Khuyến nghị y tế chuyên môn
              </h4>
              <div className="space-y-2">
                {result.recommendations.map((rec, index) => (
                  <div
                    key={index}
                    className={`p-2 rounded text-sm ${
                      rec.type === "warning"
                        ? "bg-orange-100 text-orange-800 border border-orange-200"
                        : rec.type === "danger"
                        ? "bg-red-100 text-red-800 border border-red-200"
                        : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    <p>{rec.text}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Cảnh báo y tế quan trọng */}
            <div className="bg-red-50 p-4 rounded-lg border border-red-200">
              <h4 className="font-semibold text-red-800 mb-2 flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2" />
                Cảnh báo y tế quan trọng
              </h4>
              <ul className="text-sm text-red-700 space-y-1">
                <li>
                  • <strong>Ngộ độc nước:</strong> Uống {">"}4.5L/ngày có thể
                  gây hyponatremia (thiếu natri), nguy hiểm tính mạng
                </li>
                <li>
                  • <strong>Bệnh tim/thận:</strong> Cần tuân thủ nghiêm ngặt chỉ
                  định bác sĩ về lượng nước
                </li>
                <li>
                  • <strong>Trẻ em:</strong> Cần giám sát người lớn, không uống
                  quá nhiều nước một lúc
                </li>
                <li>
                  • <strong>Người cao tuổi:</strong> Nguy cơ cao mất nước do cảm
                  giác khát kém
                </li>
                <li>
                  • <strong>Thuốc:</strong> Một số thuốc (lợi tiểu, lithium) ảnh
                  hưởng đến cân bằng nước
                </li>
              </ul>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg p-6 mt-6 mb-4 shadow-sm border border-blue-100">
        <div className="flex items-center space-x-4 mb-4">
          <Shield className="h-6 w-6 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-800">
            Cơ sở khoa học đáng tin cậy
          </h3>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-xl">
            <Info className="h-5 w-5 text-blue-600" />
            <div>
              <p className="font-medium text-blue-800">WHO/IOM Standards</p>
              <p className="text-sm text-blue-600">Chuẩn quốc tế chính thức</p>
            </div>
          </div>
          <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-xl">
            <Users className="h-5 w-5 text-blue-600" />
            <div>
              <p className="font-medium text-blue-800">ACSM Guidelines</p>
              <p className="text-sm text-blue-600">Chuẩn thể thao y học</p>
            </div>
          </div>
          <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-xl">
            <Award className="h-5 w-5 text-blue-600" />
            <div>
              <p className="font-medium text-blue-800">An toàn tuyệt đối</p>
              <p className="text-sm text-blue-600">
                Giới hạn khoa học chặt chẽ
              </p>
            </div>
          </div>
        </div>
        <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
          <p className="text-sm text-yellow-800">
            <strong>Tuyên bố miễn trừ trách nhiệm:</strong> Đây là công cụ tham
            khảo dựa trên các chuẩn y tế quốc tế. Kết quả chỉ mang tính chất
            tham khảo. Luôn tham khảo bác sĩ chuyên khoa để được tư vấn phù hợp
            với tình trạng sức khỏe cá nhân, đặc biệt nếu bạn có bệnh lý tim
            mạch, thận hoặc đang dùng thuốc.
          </p>
        </div>
      </div>
    </div>
  );
};

export default WaterIntakeCalculator;

// Cấu hình các mức độ hoạt động theo ACSM
const activityLevels = {
  sedentary: {
    label: "Ít vận động (Ngồi nhiều)",
    description: "Công việc văn phòng, ít hoạt động thể chất",
  },
  light: {
    label: "Vận động nhẹ (1-3 ngày/tuần)",
    description: "Đi bộ, yoga, tập thể dục nhẹ",
  },
  moderate: {
    label: "Vận động vừa (3-5 ngày/tuần)",
    description: "Chạy bộ, bơi lội, gym",
  },
  active: {
    label: "Vận động nhiều (6-7 ngày/tuần)",
    description: "Tập thể dục đều đặn mỗi ngày",
  },
  very_active: {
    label: "Rất năng động (2 lần/ngày)",
    description: "Vận động viên, công việc thể lực nặng",
  },
};

// Cấu hình khí hậu theo WHO
const climates = {
  cold: {
    label: "Lạnh (< 15°C)",
    description: "Môi trường lạnh, cơ thể ít đổ mồ hôi",
  },
  temperate: {
    label: "Ôn hòa (15-25°C)",
    description: "Thời tiết bình thường",
  },
  hot: {
    label: "Nóng (> 25°C)",
    description: "Thời tiết nóng, đổ mồ hôi nhiều",
  },
  humid: {
    label: "Ẩm ướt",
    description: "Độ ẩm cao, khó thoát mồ hôi",
  },
};

// Cấu hình tình trạng sức khỏe
const healthConditions = {
  normal: {
    label: "Bình thường",
    description: "Không có vấn đề sức khỏe đặc biệt",
  },
  fever: {
    label: "Sốt",
    description: "Cần bù nước do mất qua mồ hôi và hô hấp",
  },
  diarrhea: {
    label: "Tiêu chảy/Nôn",
    description: "Mất nước qua đường tiêu hóa",
  },
  kidney_stones: {
    label: "Tiền sử sỏi thận",
    description: "Cần nhiều nước để ngăn ngừa sỏi thận",
  },
  diabetes: {
    label: "Tiểu đường",
    description: "Đường huyết cao gây mất nước",
  },
  heart_disease: {
    label: "Bệnh tim mạch",
    description: "Cần hạn chế nước theo chỉ định bác sĩ",
  },
  kidney_disease: {
    label: "Bệnh thận",
    description: "Cần hạn chế nước theo chỉ định bác sĩ",
  },
};

// Cấu hình tình trạng thai kỳ theo IOM
const pregnancyStatuses = {
  none: {
    label: "Không có thai",
    description: "Không có thai hoặc cho con bú",
  },
  first_trimester: {
    label: "Thai kỳ 3 tháng đầu",
    description: "Cần thêm 300ml so với bình thường",
  },
  second_trimester: {
    label: "Thai kỳ 3 tháng giữa",
    description: "Cần thêm 300ml so với bình thường",
  },
  third_trimester: {
    label: "Thai kỳ 3 tháng cuối",
    description: "Cần thêm 300ml so với bình thường",
  },
  breastfeeding: {
    label: "Đang cho con bú",
    description: "Cần thêm 700ml để sản xuất sữa mẹ",
  },
};

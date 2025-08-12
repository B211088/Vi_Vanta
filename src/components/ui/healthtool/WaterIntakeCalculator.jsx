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
import HeaderTool from "./HeaderTool";

// Cấu hình các mức độ hoạt động
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

// Cấu hình khí hậu
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

// Cấu hình tình trạng thai kỳ
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
    description: "Cần thêm 600ml để sản xuất sữa mẹ",
  },
};

const WaterIntakeCalculator = () => {
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

    // CÔNG THỨC CHÍNH XÁC THEO CHUẨN Y TẾ

    // 1. Lượng nước uống cơ bản (ml) - CHỈ NƯỚC UỐNG, không bao gồm thức ăn
    let baseWaterDrinking;

    if (ageNum < 0.5) {
      // 0-6 tháng: chỉ sữa mẹ
      baseWaterDrinking = 0;
    } else if (ageNum < 1) {
      // 7-12 tháng
      baseWaterDrinking = 600;
    } else if (ageNum < 4) {
      baseWaterDrinking = 1000;
    } else if (ageNum < 9) {
      baseWaterDrinking = 1200;
    } else if (ageNum < 14) {
      if (gender === "male") {
        baseWaterDrinking = 1800;
      } else {
        baseWaterDrinking = 1600;
      }
    } else if (ageNum < 19) {
      if (gender === "male") {
        baseWaterDrinking = 2600;
      } else {
        baseWaterDrinking = 1800;
      }
    } else if (ageNum <= 70) {
      // NGƯỜI TRƯỞNG THÀNH: áp dụng công thức khoa học
      // Công thức cơ bản: 35ml/kg cân nặng (cho hoạt động bình thường)
      baseWaterDrinking = weightNum * 35;

      // Điều chỉnh theo giới tính
      if (gender === "male") {
        baseWaterDrinking = Math.max(baseWaterDrinking, 2000); // Tối thiểu 2L
        baseWaterDrinking = Math.min(baseWaterDrinking, 3000); // Tối đa 3L cơ bản
      } else {
        baseWaterDrinking = Math.max(baseWaterDrinking, 1800); // Tối thiểu 1.8L
        baseWaterDrinking = Math.min(baseWaterDrinking, 2500); // Tối đa 2.5L cơ bản
      }
    } else {
      // Người cao tuổi: giảm 15-20%
      if (gender === "male") {
        baseWaterDrinking = weightNum * 30;
        baseWaterDrinking = Math.max(baseWaterDrinking, 1800);
        baseWaterDrinking = Math.min(baseWaterDrinking, 2500);
      } else {
        baseWaterDrinking = weightNum * 28;
        baseWaterDrinking = Math.max(baseWaterDrinking, 1600);
        baseWaterDrinking = Math.min(baseWaterDrinking, 2200);
      }
    }

    // 2. Tính BMI và điều chỉnh nhẹ (chỉ cho người trưởng thành)
    if (ageNum >= 18) {
      const bmi = weightNum / (heightNum / 100) ** 2;

      // Điều chỉnh nhẹ theo BMI (±100-200ml, không quá lớn)
      if (bmi < 16) {
        baseWaterDrinking -= 200; // Người gầy nghiêm trọng
      } else if (bmi < 18.5) {
        baseWaterDrinking -= 100; // Người gầy
      } else if (bmi > 35) {
        baseWaterDrinking += 300; // Béo phì độ 2
      } else if (bmi > 30) {
        baseWaterDrinking += 200; // Béo phì độ 1
      } else if (bmi > 25) {
        baseWaterDrinking += 100; // Thừa cân nhẹ
      }
      // BMI bình thường (18.5-25): không điều chỉnh
    }

    // 3. Điều chỉnh theo hoạt động thể chất
    const activityWaterAdd = {
      sedentary: 0,
      light: 200, // Tập nhẹ 30-60 phút
      moderate: 400, // Tập vừa 60-90 phút
      active: 600, // Tập mạnh 90-120 phút
      very_active: 800, // Tập rất mạnh >120 phút
    };

    baseWaterDrinking += activityWaterAdd[activityLevel];

    // 4. Điều chỉnh theo khí hậu
    const climateAdjustment = {
      cold: -100, // Giảm trong môi trường lạnh
      temperate: 0,
      hot: 400, // Tăng trong môi trường nóng
      humid: 200, // Tăng trong môi trường ẩm
    };

    baseWaterDrinking += climateAdjustment[climate];

    // 5. Điều chỉnh theo tình trạng sức khỏe
    const healthAdjustment = {
      normal: 0,
      fever: 500, // +500ml khi sốt
      diarrhea: 800, // +800ml khi tiêu chảy
      kidney_stones: 600, // +600ml để ngăn sỏi thận
      diabetes: 200, // +200ml cho người tiểu đường
      heart_disease: -300, // Giảm cho bệnh tim (cần BS chỉ định)
      kidney_disease: -500, // Giảm cho bệnh thận (cần BS chỉ định)
    };

    baseWaterDrinking += healthAdjustment[healthCondition];

    // 6. Điều chỉnh theo thai kỳ/cho con bú
    const pregnancyAdjustment = {
      none: 0,
      first_trimester: 300,
      second_trimester: 300,
      third_trimester: 300,
      breastfeeding: 600, // +600ml cho việc cho con bú
    };

    baseWaterDrinking += pregnancyAdjustment[pregnancyStatus];

    // 7. Giới hạn an toàn cuối cùng
    if (baseWaterDrinking < 1000) baseWaterDrinking = 1000; // Tối thiểu 1L
    if (baseWaterDrinking > 4000) baseWaterDrinking = 4000; // Tối đa 4L

    // Làm tròn đến 50ml
    baseWaterDrinking = Math.round(baseWaterDrinking / 50) * 50;

    // Tính BMI để hiển thị
    const bmi = weightNum / (heightNum / 100) ** 2;

    // Phân chia lượng nước trong ngày
    const waterSchedule = [
      {
        time: "6:00 - 8:00",
        amount: Math.round(baseWaterDrinking * 0.2),
        activity: "Thức dậy - bù nước sau giấc ngủ",
      },
      {
        time: "8:00 - 10:00",
        amount: Math.round(baseWaterDrinking * 0.12),
        activity: "Sau bữa sáng",
      },
      {
        time: "10:00 - 12:00",
        amount: Math.round(baseWaterDrinking * 0.15),
        activity: "Giữa buổi sáng",
      },
      {
        time: "12:00 - 14:00",
        amount: Math.round(baseWaterDrinking * 0.12),
        activity: "Sau bữa trưa",
      },
      {
        time: "14:00 - 16:00",
        amount: Math.round(baseWaterDrinking * 0.15),
        activity: "Giữa buổi chiều",
      },
      {
        time: "16:00 - 18:00",
        amount: Math.round(baseWaterDrinking * 0.13),
        activity: "Trước bữa tối",
      },
      {
        time: "18:00 - 20:00",
        amount: Math.round(baseWaterDrinking * 0.1),
        activity: "Sau bữa tối",
      },
      {
        time: "20:00 - 22:00",
        amount: Math.round(baseWaterDrinking * 0.03),
        activity: "Trước ngủ (ít để không thức đêm)",
      },
    ];

    // Đánh giá mức độ hydration chính xác hơn
    const getHydrationStatus = (waterAmount) => {
      // Lượng nước lý tưởng theo khoa học
      const idealMin = weightNum * 30; // 30ml/kg tối thiểu
      const idealMax = weightNum * 40; // 40ml/kg tối đa bình thường

      if (waterAmount < idealMin * 0.7) {
        return {
          status: "Thiếu nước nghiêm trọng",
          color: "text-red-600",
          icon: "danger",
        };
      } else if (waterAmount < idealMin) {
        return {
          status: "Thiếu nước",
          color: "text-orange-600",
          icon: "warning",
        };
      } else if (waterAmount >= idealMin && waterAmount <= idealMax) {
        return {
          status: "Lý tưởng",
          color: "text-green-600",
          icon: "excellent",
        };
      } else if (waterAmount <= idealMax * 1.3) {
        return {
          status: "Hơi nhiều nhưng an toàn",
          color: "text-blue-600",
          icon: "info",
        };
      } else {
        return {
          status: "Quá nhiều - cần giảm",
          color: "text-red-600",
          icon: "warning",
        };
      }
    };

    const hydrationStatus = getHydrationStatus(baseWaterDrinking);

    // Lợi ích khoa học
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

    // Dấu hiệu thiếu nước
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
      dailyWater: Math.round(baseWaterDrinking),
      waterSchedule,
      hydrationStatus,
      bmi: bmi.toFixed(1),
      benefits,
      dehydrationSigns,
      recommendations: getRecommendations(
        baseWaterDrinking,
        gender,
        ageNum,
        activityLevel,
        climate,
        bmi,
        healthCondition,
        weightNum
      ),
      glassesNeeded: Math.round(baseWaterDrinking / 250),
      bottlesNeeded: Math.round(baseWaterDrinking / 500),
      // Chi tiết tính toán
      calculationDetails: {
        baseFormula: `${weightNum}kg × 35ml = ${Math.round(weightNum * 35)}ml`,
        finalBase: Math.round(weightNum * 35),
        activityBonus: activityWaterAdd[activityLevel],
        climateAdjustment: climateAdjustment[climate],
        healthAdjustment: healthAdjustment[healthCondition],
        pregnancyAdjustment: pregnancyAdjustment[pregnancyStatus],
        idealRange: `${Math.round(weightNum * 30)} - ${Math.round(
          weightNum * 40
        )}ml`,
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
    health,
    weight
  ) => {
    const recommendations = [];

    // Cảnh báo an toàn
    const idealMin = weight * 30;
    const idealMax = weight * 40;

    if (waterAmount < idealMin * 0.7) {
      recommendations.push({
        type: "danger",
        text: "🚨 NGUY HIỂM: Lượng nước quá thấp có thể gây mất nước nghiêm trọng. Cần uống ngay!",
      });
    } else if (waterAmount > idealMax * 1.5) {
      recommendations.push({
        type: "danger",
        text: "⚠️ CẢNH BÁO: Lượng nước quá cao có thể gây ngộ độc nước. Hãy giảm bớt!",
      });
    }

    // Khuyến nghị cho bệnh lý
    if (health === "heart_disease" || health === "kidney_disease") {
      recommendations.push({
        type: "warning",
        text: "🏥 QUAN TRỌNG: Với bệnh tim/thận, cần tuân thủ chỉ định của bác sĩ về lượng nước.",
      });
    }

    if (health === "diabetes") {
      recommendations.push({
        type: "info",
        text: "🩺 Tiểu đường: Uống nước đều đặn giúp kiểm soát đường huyết.",
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
        text: "🌡️ Thời tiết nóng: Uống nước trước khi khát. Tránh alcohol và caffeine.",
      });
    }

    // Khuyến nghị theo tuổi
    if (age < 18) {
      recommendations.push({
        type: "info",
        text: "👶 Trẻ em: Cha mẹ cần theo dõi việc uống nước. Mang bình nước đến trường.",
      });
    } else if (age > 65) {
      recommendations.push({
        type: "info",
        text: "👴 Người cao tuổi: Cảm giác khát giảm theo tuổi. Cần uống đều đặn dù không khát.",
      });
    }

    // Khuyến nghị chung
    recommendations.push({
      type: "info",
      text: "💡 Mẹo: Uống nước sạch, tránh đồ ngọt. Nước trái cây tự nhiên, trà không đường cũng tốt.",
    });

    recommendations.push({
      type: "info",
      text: "🔍 Kiểm tra: Nước tiểu màu vàng nhạt = đủ nước. Màu đậm = thiếu nước.",
    });

    return recommendations;
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "excellent":
        return <CheckCircle className="h-6 w-6 text-green-600" />;
      case "info":
        return <Info className="h-6 w-6 text-blue-600" />;
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
      <HeaderTool
        title="Tính toán lượng nước cần thiết"
        subtitle="Công thức chính xác: 35ml/kg cân nặng + điều chỉnh cá nhân"
        icon={Droplets}
        color="blue"
      />

      {/* Hướng dẫn y tế */}
      <div className="mb-6 p-4 bg-blue-100 rounded-lg border border-blue-200">
        <div
          onClick={() => setShowGuide(!showGuide)}
          className="flex items-center justify-between cursor-pointer"
        >
          <h3 className="text-md font-semibold text-blue-800">
            Hướng dẫn khoa học về nước uống
          </h3>
          <button className="text-blue-600 hover:text-blue-800">
            <Info className="h-5 w-5" />
          </button>
        </div>
        {showGuide && (
          <div className="text-sm text-blue-700 space-y-2 mt-3">
            <p>
              <strong>Công thức khoa học:</strong>
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Cơ bản: 35ml/kg cân nặng (cho hoạt động bình thường)</li>
              <li>Tối thiểu: 30ml/kg - Tối đa an toàn: 40ml/kg</li>
              <li>VD: Người 70kg = 70×35 = 2450ml ≈ 2.5L/ngày</li>
              <li>Tăng thêm khi tập thể dục, thời tiết nóng, ốm</li>
            </ul>
            <p>
              <strong>Lưu ý quan trọng:</strong>
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Đây chỉ tính nước uống thuần túy (không bao gồm thức ăn)</li>
              <li>Nước tiểu màu vàng nhạt = đủ nước</li>
              <li>Uống đều trong ngày, không uống cùng lúc quá nhiều</li>
            </ul>
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
              <div className="w-full flex items-center gap-2 py-2 px-3 text-sm border border-gray-300 rounded-md hover:border-blue-500">
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
                {Object.entries(climates).map(([key, climateOption]) => (
                  <option key={key} value={key}>
                    {climateOption.label}
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
            Tính theo công thức khoa học
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
                  Lượng nước cơ thể cần
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
                  <p className="text-sm text-gray-600 mt-1">
                    Khoảng lý tưởng: {result.calculationDetails.idealRange}
                  </p>
                </div>
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <div className="text-center p-2 bg-white rounded">
                    <p className="font-semibold">{result.glassesNeeded}</p>
                    <p className="text-gray-600">ly (250ml)</p>
                  </div>
                  <div className="text-center p-2 bg-white rounded">
                    <p className="font-semibold">{result.bottlesNeeded}</p>
                    <p className="text-gray-600">chai (500ml)</p>
                  </div>
                  <div className="text-center p-2 bg-white rounded">
                    <p className="font-semibold">BMI {result.bmi}</p>
                    <p className="text-gray-600">kg/m²</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Chi tiết tính toán */}
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                <Info className="h-5 w-5 mr-2 text-blue-600" />
                Công thức tính toán chi tiết
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Công thức cơ bản:</span>
                  <span className="font-medium">
                    {result.calculationDetails.baseFormula}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Lượng cơ bản:</span>
                  <span className="font-medium">
                    {result.calculationDetails.finalBase}ml
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Hoạt động thể chất:</span>
                  <span className="font-medium">
                    {result.calculationDetails.activityBonus > 0 ? "+" : ""}
                    {result.calculationDetails.activityBonus}ml
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
                <hr className="my-2" />
                <div className="flex justify-between font-semibold">
                  <span>Tổng cộng:</span>
                  <span className="text-blue-600">{result.dailyWater}ml</span>
                </div>
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
                Khuyến nghị cá nhân hóa
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

            {/* Cảnh báo an toàn */}
            <div className="bg-red-50 p-4 rounded-lg border border-red-200">
              <h4 className="font-semibold text-red-800 mb-2 flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2" />
                Lưu ý an toàn quan trọng
              </h4>
              <ul className="text-sm text-red-700 space-y-1">
                <li>
                  • <strong>Không uống quá nhiều cùng lúc:</strong> Tối đa
                  500ml/giờ để tránh ngộ độc nước
                </li>
                <li>
                  • <strong>Bệnh tim/thận:</strong> Cần tuân thủ chỉ định bác
                  sĩ, có thể cần hạn chế nước
                </li>
                <li>
                  • <strong>Trẻ em dưới 1 tuổi:</strong> Chủ yếu từ sữa mẹ,
                  không cần nước thêm
                </li>
                <li>
                  • <strong>Người cao tuổi:</strong> Dễ mất nước nhưng cảm giác
                  khát kém, cần uống đều đặn
                </li>
                <li>
                  • <strong>Khi ốm:</strong> Sốt, tiêu chảy cần uống nhiều hơn,
                  nhưng từ từ
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
              <p className="font-medium text-blue-800">Công thức 35ml/kg</p>
              <p className="text-sm text-blue-600">Chuẩn y học quốc tế</p>
            </div>
          </div>
          <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-xl">
            <Users className="h-5 w-5 text-blue-600" />
            <div>
              <p className="font-medium text-blue-800">Điều chỉnh cá nhân</p>
              <p className="text-sm text-blue-600">Theo hoạt động & sức khỏe</p>
            </div>
          </div>
          <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-xl">
            <Award className="h-5 w-5 text-blue-600" />
            <div>
              <p className="font-medium text-blue-800">An toàn tuyệt đối</p>
              <p className="text-sm text-blue-600">Giới hạn 30-40ml/kg</p>
            </div>
          </div>
        </div>
        <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
          <p className="text-sm text-yellow-800">
            <strong>Tuyên bố miễn trừ trách nhiệm:</strong> Đây là công cụ tham
            khảo dựa trên công thức khoa học 35ml/kg cân nặng. Kết quả chỉ mang
            tính chất tham khảo. Luôn tham khảo bác sĩ chuyên khoa để được tư
            vấn phù hợp với tình trạng sức khỏe cá nhân, đặc biệt nếu bạn có
            bệnh lý tim mạch, thận hoặc đang dùng thuốc.
          </p>
        </div>
      </div>
    </div>
  );
};

export default WaterIntakeCalculator;

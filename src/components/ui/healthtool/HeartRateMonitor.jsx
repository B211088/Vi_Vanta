import {
  ArrowLeft,
  Heart,
  Info,
  AlertCircle,
  CheckCircle,
  Activity,
  Timer,
  Play,
  Pause,
  RotateCcw,
  Plus,
  User,
  Calendar,
  VenusAndMars,
  Mars,
  Venus,
  Clock10Icon,
  Dumbbell,
  Shield,
  Users,
  Award,
} from "lucide-react";
import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import ValueSlider from "../../features/ValueSlider";
import TabButton from "../../features/TabButton";
import HeaderTool from "./HeaderTool";

const HeartRateMonitor = () => {
  const navigate = useNavigate();
  const [heartRate, setHeartRate] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [weight, setWeight] = useState(0);
  const [height, setHeight] = useState(0);
  const [activityLevel, setActivityLevel] = useState("");
  const [measurementTime, setMeasurementTime] = useState("");
  const [fitnessGoal, setFitnessGoal] = useState("");
  const [result, setResult] = useState(null);
  const [showGuide, setShowGuide] = useState(false);
  const [activeTab, setActiveTab] = useState("manual");

  // Timer states
  const [timeLeft, setTimeLeft] = useState(15);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [pulseCount, setPulseCount] = useState(0);
  const [timerResult, setTimerResult] = useState(null);

  const analyzeHeartRate = () => {
    if (heartRate && age) {
      const hr = parseInt(heartRate);
      const userAge = parseInt(age);
      const userWeight = parseFloat(weight);
      const userHeight = parseFloat(height);

      // Tính nhịp tim tối đa
      const maxHR = 220 - userAge;

      // Tính BMI và phân loại
      let bmi = null;
      let bmiCategory = "";
      let bmiAdvice = "";
      let bmiColor = "";
      let bmiHeartImpact = "";

      if (userWeight && userHeight) {
        bmi = (userWeight / Math.pow(userHeight / 100, 2)).toFixed(1);

        // Phân loại BMI
        if (bmi < 18.5) {
          bmiCategory = "Thiếu cân";
          bmiColor = "text-blue-600";
          bmiAdvice =
            "Bạn cần tăng cân một cách lành mạnh thông qua chế độ ăn uống cân bằng và tập luyện phù hợp.";
          bmiHeartImpact =
            "Người thiếu cân có thể có nhịp tim nghỉ thấp hơn bình thường. Tập luyện nhẹ nhàng để tăng cường sức khỏe tim mạch.";
        } else if (bmi >= 18.5 && bmi < 23) {
          bmiCategory = "Bình thường";
          bmiColor = "text-green-600";
          bmiAdvice =
            "Chúc mừng! Bạn đang có cân nặng lý tưởng. Hãy duy trì lối sống lành mạnh.";
          bmiHeartImpact =
            "BMI bình thường thường đi kèm với nhịp tim nghỉ khỏe mạnh (60-100 bpm). Tim hoạt động hiệu quả.";
        } else if (bmi >= 23 && bmi < 25) {
          bmiCategory = "Hơi thừa cân";
          bmiColor = "text-yellow-600";
          bmiAdvice =
            "Bạn nên chú ý kiểm soát cân nặng thông qua chế độ ăn uống và tăng cường vận động.";
          bmiHeartImpact =
            "Thừa cân nhẹ có thể làm tăng nhịp tim nghỉ. Tập cardio nhẹ để cải thiện sức khỏe tim mạch.";
        } else if (bmi >= 25 && bmi < 30) {
          bmiCategory = "Thừa cân";
          bmiColor = "text-orange-600";
          bmiAdvice =
            "Bạn nên giảm cân để cải thiện sức khỏe tổng thể. Tham khảo ý kiến chuyên gia dinh dưỡng.";
          bmiHeartImpact =
            "Thừa cân làm tim phải làm việc nhiều hơn, có thể tăng nhịp tim nghỉ và huyết áp. Cần tập luyện đều đặn.";
        } else {
          bmiCategory = "Béo phì";
          bmiColor = "text-red-600";
          bmiAdvice =
            "Bạn cần giảm cân nghiêm túc để bảo vệ sức khỏe. Nên tham khảo ý kiến bác sĩ và chuyên gia dinh dưỡng.";
          bmiHeartImpact =
            "Béo phì tăng nguy cơ bệnh tim mạch, làm tăng nhịp tim nghỉ và huyết áp. Cần chương trình tập luyện được giám sát.";
        }
      }

      // Xác định vùng nhịp tim
      const zones = {
        zone1: {
          min: Math.round(maxHR * 0.5),
          max: Math.round(maxHR * 0.6),
          name: "Khởi động",
          color: "bg-blue-100 text-blue-800",
        },
        zone2: {
          min: Math.round(maxHR * 0.6),
          max: Math.round(maxHR * 0.7),
          name: "Đốt mỡ",
          color: "bg-green-100 text-green-800",
        },
        zone3: {
          min: Math.round(maxHR * 0.7),
          max: Math.round(maxHR * 0.8),
          name: "Sức bền",
          color: "bg-yellow-100 text-yellow-800",
        },
        zone4: {
          min: Math.round(maxHR * 0.8),
          max: Math.round(maxHR * 0.9),
          name: "Ngưỡng",
          color: "bg-orange-100 text-orange-800",
        },
        zone5: {
          min: Math.round(maxHR * 0.9),
          max: maxHR,
          name: "Cực hạn",
          color: "bg-red-100 text-red-800",
        },
      };

      let category = "";
      let advice = "";
      let color = "";
      let status = "";
      let currentZone = null;

      // Xác định vùng hiện tại
      for (const [key, zone] of Object.entries(zones)) {
        if (hr >= zone.min && hr <= zone.max) {
          currentZone = zone;
          break;
        }
      }

      // Điều chỉnh đánh giá dựa trên BMI
      const adjustAdviceForBMI = (baseAdvice) => {
        if (!bmi) return baseAdvice;

        if (bmi >= 25) {
          return (
            baseAdvice +
            " Do BMI cao, hãy bắt đầu từ từ và tăng cường độ dần dần để tránh quá tải tim."
          );
        } else if (bmi < 18.5) {
          return (
            baseAdvice +
            " Do BMI thấp, hãy kết hợp với chế độ ăn tăng cân lành mạnh."
          );
        }
        return baseAdvice;
      };

      // Đánh giá dựa trên thời điểm đo
      if (measurementTime === "rest") {
        // Điều chỉnh ngưỡng dựa trên BMI
        let restLowThreshold = 60;
        let restHighThreshold = 100;

        if (bmi && bmi >= 25) {
          restHighThreshold = 90; // Người thừa cân/béo phì nên có nhịp tim nghỉ thấp hơn
        } else if (bmi && bmi < 18.5) {
          restLowThreshold = 50; // Người gầy có thể có nhịp tim nghỉ thấp hơn
        }

        if (hr < restLowThreshold) {
          category = "Nhịp tim chậm (Bradycardia)";
          advice =
            "Nhịp tim nghỉ của bạn thấp hơn bình thường. Nếu bạn không phải vận động viên, nên tham khảo ý kiến bác sĩ.";
          color = "text-blue-600";
          status = "warning";
        } else if (hr >= restLowThreshold && hr <= restHighThreshold) {
          category = "Nhịp tim nghỉ bình thường";
          advice =
            "Nhịp tim nghỉ của bạn trong khoảng bình thường. Đây là dấu hiệu tốt cho sức khỏe tim mạch.";
          color = "text-green-600";
          status = "good";
        } else if (hr > restHighThreshold) {
          category = "Nhịp tim nghỉ nhanh (Tachycardia)";
          advice =
            "Nhịp tim nghỉ của bạn cao hơn bình thường. Có thể do stress, caffeine, hoặc vấn đề sức khỏe. Nên kiểm tra với bác sĩ.";
          color = "text-red-600";
          status = "danger";
        }

        advice = adjustAdviceForBMI(advice);
      } else if (measurementTime === "exercise") {
        // Điều chỉnh vùng tập luyện dựa trên BMI
        let exerciseZoneMultiplier = 1;
        if (bmi && bmi >= 30) {
          exerciseZoneMultiplier = 0.9; // Người béo phì nên tập nhẹ hơn
        } else if (bmi && bmi >= 25) {
          exerciseZoneMultiplier = 0.95; // Người thừa cân nên tập vừa phải
        }

        const adjustedMaxHR = maxHR * exerciseZoneMultiplier;

        if (hr < adjustedMaxHR * 0.5) {
          category = "Cường độ tập luyện thấp";
          advice =
            "Bạn có thể tăng cường độ tập luyện để đạt hiệu quả tốt hơn.";
          color = "text-blue-600";
          status = "info";
        } else if (hr >= adjustedMaxHR * 0.5 && hr <= adjustedMaxHR * 0.85) {
          category = "Cường độ tập luyện phù hợp";
          advice =
            "Bạn đang tập luyện ở mức cường độ phù hợp cho mục tiêu của mình.";
          color = "text-green-600";
          status = "good";
        } else if (hr > adjustedMaxHR * 0.85) {
          category = "Cường độ tập luyện cao";
          advice =
            "Bạn đang tập ở cường độ cao. Hãy chú ý lắng nghe cơ thể và nghỉ ngơi khi cần.";
          color = "text-orange-600";
          status = "warning";
        }

        advice = adjustAdviceForBMI(advice);
      }

      // Gợi ý dựa trên mục tiêu và BMI
      let goalAdvice = "";
      if (fitnessGoal === "weight-loss") {
        if (bmi && bmi >= 25) {
          goalAdvice = `Để giảm cân an toàn với BMI ${bmi}, bạn nên duy trì nhịp tim ở vùng 2 (${zones.zone2.min}-${zones.zone2.max} bpm) trong 30-45 phút, 4-5 lần/tuần. Bắt đầu với 20-30 phút và tăng dần.`;
        } else {
          goalAdvice = `Để giảm cân, bạn nên duy trì nhịp tim ở vùng 2 (${zones.zone2.min}-${zones.zone2.max} bpm) trong 30-45 phút.`;
        }
      } else if (fitnessGoal === "endurance") {
        if (bmi && bmi >= 25) {
          goalAdvice = `Để tăng sức bền với BMI ${bmi}, bắt đầu với vùng 2 (${zones.zone2.min}-${zones.zone2.max} bpm) trong 2-3 tuần, sau đó chuyển sang vùng 3 (${zones.zone3.min}-${zones.zone3.max} bpm).`;
        } else {
          goalAdvice = `Để tăng sức bền, bạn nên tập ở vùng 3 (${zones.zone3.min}-${zones.zone3.max} bpm) trong 20-40 phút.`;
        }
      } else if (fitnessGoal === "performance") {
        if (bmi && bmi >= 25) {
          goalAdvice = `Với BMI ${bmi}, hãy tập sức bền cơ bản trước khi chuyển sang hiệu suất cao. Bắt đầu với vùng 2-3 trong 4-6 tuần.`;
        } else {
          goalAdvice = `Để tăng hiệu suất, bạn có thể tập ở vùng 4-5 (${zones.zone4.min}-${zones.zone5.max} bpm) trong thời gian ngắn.`;
        }
      } else if (fitnessGoal === "health") {
        if (bmi && bmi >= 25) {
          goalAdvice = `Để duy trì sức khỏe với BMI ${bmi}, tập vùng 1-2 (${zones.zone1.min}-${zones.zone2.max} bpm) trong 30-45 phút, ít nhất 3 lần/tuần.`;
        } else {
          goalAdvice = `Để duy trì sức khỏe, tập vùng 1-2 (${zones.zone1.min}-${zones.zone2.max} bpm) trong 30 phút, ít nhất 3 lần/tuần.`;
        }
      }

      // Lời khuyên bổ sung về dinh dưỡng dựa trên BMI
      let nutritionAdvice = "";
      if (bmi) {
        if (bmi < 18.5) {
          nutritionAdvice =
            "Tăng cường protein và carbohydrate lành mạnh để tăng cân. Ăn 5-6 bữa nhỏ mỗi ngày.";
        } else if (bmi >= 25 && bmi < 30) {
          nutritionAdvice =
            "Giảm 300-500 calories/ngày, tăng rau xanh, protein nạc. Uống đủ nước trước khi tập.";
        } else if (bmi >= 30) {
          nutritionAdvice =
            "Cần chế độ ăn được giám sát bởi chuyên gia. Ưu tiên protein, hạn chế đường và tinh bột.";
        }
      }

      setResult({
        hr,
        category,
        advice,
        color,
        status,
        maxHR,
        zones,
        currentZone,
        bmi,
        bmiCategory,
        bmiAdvice,
        bmiColor,
        bmiHeartImpact,
        goalAdvice,
        nutritionAdvice,
      });
    }
  };

  const pulseCountRef = useRef(pulseCount);
  pulseCountRef.current = pulseCount;

  // Timer effects
  useEffect(() => {
    let interval = null;
    if (isTimerRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            setIsTimerRunning(false);
            const calculatedHR = pulseCountRef.current * 4;
            setTimerResult(calculatedHR);
            setHeartRate(calculatedHR.toString());
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timeLeft]);

  const startTimer = () => {
    setIsTimerRunning(true);
    setPulseCount(0);
    setTimerResult(null);
    setResult(null);
  };

  const pauseTimer = () => {
    setIsTimerRunning(false);
  };

  const resetTimer = () => {
    setIsTimerRunning(false);
    setTimeLeft(15);
    setPulseCount(0);
    setTimerResult(null);
    setHeartRate("");
    setResult(null);
  };

  const incrementPulse = useCallback(() => {
    if (isTimerRunning) {
      setPulseCount((prevCount) => prevCount + 1);
    }
  }, [isTimerRunning]);

  const getStatusIcon = (status) => {
    switch (status) {
      case "good":
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case "warning":
        return <AlertCircle className="h-5 w-5 text-orange-600" />;
      case "danger":
        return <AlertCircle className="h-5 w-5 text-red-600" />;
      default:
        return <Info className="h-5 w-5 text-blue-600" />;
    }
  };

  const formatTime = (seconds) => {
    return seconds.toString().padStart(2, "0");
  };

  return (
    <div className="w-full min-h-screen  px-6 py-8">
      <HeaderTool
        title="  Theo dõi nhịp tim và đánh giá"
        subtitle=" Công cụ chuyên nghiệp đánh giá và đưa ra giải pháp về một trái tim
              khỏe"
        icon={Heart}
        color="rose"
      />
      {/* Navigation Tabs */}
      <div className="mb-6">
        <div className="flex space-x-3 mb-3 overflow-x-auto pb-2">
          <TabButton
            id="manual"
            icon={Heart}
            label="Nhập thủ công"
            color="rose-500"
            isActive={activeTab === "manual"}
            onClick={() => setActiveTab("manual")}
          />
          <TabButton
            color="rose-500"
            id="timer"
            icon={Timer}
            label="Đếm nhịp tim"
            isActive={activeTab === "timer"}
            onClick={() => setActiveTab("timer")}
          />
        </div>
      </div>
      {/* Hướng dẫn */}
      <div className="mb-6 p-4 bg-rose-50 rounded-lg border border-rose-200">
        <div
          onClick={() => setShowGuide(!showGuide)}
          className="flex items-center justify-between cursor-pointer"
        >
          <h3 className="text-md font-semibold text-rose-800">
            Hướng dẫn đo nhịp tim
          </h3>
          <button className="text-rose-600 hover:text-rose-800">
            <Info className="h-5 w-5 " />
          </button>
        </div>
        {showGuide && (
          <div className="text-sm text-rose-700 space-y-2">
            <p>
              <strong>Cách đo nhịp tim bằng tay:</strong>
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Đặt 2 ngón tay (trỏ và giữa) lên cổ tay, dưới ngón cái</li>
              <li>Hoặc đặt lên cổ, bên cạnh khí quản</li>
              <li>Đếm số lần đập trong 15 giây, nhân với 4</li>
              <li>Đo khi thư giãn, ngồi yên ít nhất 5 phút</li>
            </ul>
            <p>
              <strong>Thời điểm đo tốt nhất:</strong> Buổi sáng sau khi thức
              dậy, trước khi uống cà phê
            </p>
            {activeTab === "timer" && (
              <div className="mt-3 p-3 bg-rose-100 rounded">
                <p>
                  <strong>Hướng dẫn sử dụng bộ đếm thời gian:</strong>
                </p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Nhấn "Bắt đầu" để khởi động bộ đếm 15 giây</li>
                  <li>Mỗi khi cảm thấy nhịp đập, nhấn nút "Đếm nhịp"</li>
                  <li>Sau 15 giây, hệ thống sẽ tự động tính nhịp tim/phút</li>
                  <li>Có thể tạm dừng và tiếp tục hoặc reset để đo lại</li>
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Tab nhập thủ công */}
        {activeTab === "manual" && (
          <div className="space-y-4 bg-white h-fit rounded-lg p-8 shadow-sm border border-gray-200">
            <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center">
              <User className="h-5 w-5 mr-3 text-rose-600" />
              Thông tin cá nhân
            </h2>
            <div className="flex items-center gap-2 ">
              <div className="w-6/12 flex flex-col ">
                <label className="text-xs pb-1" htmlFor="">
                  Nhịp tim
                </label>
                <div className="w-full flex h-fit items-center gap-2 py-2 px-1  text-sm border border-dark-700 rounded-md hover:border-rose-500 cursor-pointer">
                  <Heart className="text-rose-500 h-5 w-5 " />
                  <input
                    type="number"
                    value={heartRate}
                    onChange={(e) => setHeartRate(e.target.value)}
                    min="30"
                    max={220}
                    placeholder="Nhập nhịp tim"
                    className="flex-1 outline-none cursor-pointer"
                  />
                </div>
              </div>
              <div className="w-6/12 flex flex-col ">
                <label className="text-xs pb-1" htmlFor="">
                  Tuổi của bạn
                </label>
                <div className="w-full flex h-fit items-center gap-2 py-2 px-1  text-sm border border-dark-700 rounded-md hover:border-rose-500 cursor-pointer">
                  <Calendar className="text-rose-600 h-5 w-5 " />
                  <input
                    className="flex-1 outline-none cursor-pointer"
                    min="1"
                    max="120"
                    type="number"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    placeholder="Nhập tuổi"
                  />
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-full flex flex-col ">
                <label className="text-xs pb-1" htmlFor="">
                  Giới tính
                </label>
                <div className="w-full flex items-center gap-2 py-2 px-1  text-sm  border border-dark-700 rounded-md hover:border-rose-500  cursor-pointer">
                  {!gender ? (
                    <VenusAndMars className="text-rose-500 h-5 w-5" />
                  ) : gender === "male" ? (
                    <Mars className="text-blue-500 h-5 w-5" />
                  ) : (
                    <Venus className="text-pink-500 h-5 w-5" />
                  )}
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full outline-none cursor-pointer"
                  >
                    {" "}
                    <option value="">Chọn giới tinh</option>
                    <option value="male">Nam</option>
                    <option value="female">Nữ</option>
                  </select>
                </div>
              </div>
              <div className="w-full flex flex-col ">
                <label className="text-xs pb-1" htmlFor="">
                  Thời điểm đo
                </label>
                <div className="w-full flex items-center gap-2 py-2 px-1  text-sm  border border-dark-700 rounded-md hover:border-rose-500  cursor-pointer">
                  <Clock10Icon className="text-rose-600 h-5 w-5" />

                  <select
                    value={measurementTime}
                    onChange={(e) => setMeasurementTime(e.target.value)}
                    className="w-full outline-none cursor-pointer text-dark-300"
                  >
                    <option value="">Chọn thời điểm</option>
                    <option value="rest">Lúc nghỉ ngơi</option>
                    <option value="exercise">Khi tập thể dục</option>
                    <option value="stress">Khi căng thẳng</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="w-full flex flex-col">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <ValueSlider
                    label="cân nặng (kg)"
                    value={weight}
                    onChange={setWeight}
                    min={1}
                    max={300}
                    step={0.1}
                  />
                </div>
                <div>
                  <ValueSlider
                    label="chiều cao (cm)"
                    value={height}
                    onChange={setHeight}
                    min={100}
                    max={300}
                    step={0.5}
                  />
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-full flex flex-col ">
                <label className="text-xs pb-1" htmlFor="">
                  Mục tiêu tập luyện
                </label>
                <div className="w-full flex items-center gap-2 py-2 px-1  text-sm  border border-dark-700 rounded-md hover:border-rose-500  cursor-pointer">
                  <Dumbbell className="text-pink-500 h-5 w-5" />
                  <select
                    value={fitnessGoal}
                    onChange={(e) => setFitnessGoal(e.target.value)}
                    className="w-full outline-none cursor-pointer"
                  >
                    <option value="">Chọn mục tiêu</option>
                    <option value="weight-loss">Giảm cân</option>
                    <option value="endurance">Tăng sức bền</option>
                    <option value="performance">Tăng hiệu suất</option>
                    <option value="health">Duy trì sức khỏe</option>
                  </select>
                </div>
              </div>
            </div>

            <button
              onClick={analyzeHeartRate}
              className="w-full bg-rose-600 text-white py-2 px-4 rounded-md hover:bg-rose-700 transition-colors font-medium cursor-pointer"
            >
              <Activity className="h-5 w-5 inline mr-2" />
              Phân tích nhịp tim
            </button>
          </div>
        )}
        {/* Tab đếm nhịp tim */}
        {activeTab === "timer" && (
          <div className="space-y-6">
            {/* Bộ đếm thời gian */}
            <div className="bg-gradient-to-br from-rose-50 to-pink-50 p-6 rounded-lg border border-rose-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">
                Bộ đếm nhịp tim 15 giây
              </h3>

              {/* Hiển thị thời gian */}
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-32 h-32 bg-white rounded-full shadow-lg mb-4">
                  <span className="text-4xl font-bold text-rose-600">
                    {formatTime(timeLeft)}
                  </span>
                </div>
                <p className="text-gray-600 text-sm">giây còn lại</p>
              </div>

              {/* Số lần đếm */}
              <div className="text-center mb-6">
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <p className="text-sm text-gray-600 mb-1">Số nhịp đã đếm</p>
                  <p className="text-3xl font-bold text-rose-600">
                    {pulseCount}
                  </p>
                </div>
              </div>

              {/* Nút đếm nhịp */}
              <div className="text-center mb-6">
                <button
                  onClick={incrementPulse}
                  disabled={!isTimerRunning}
                  className={`w-24 h-24 rounded-full font-bold text-lg transition-all ${
                    isTimerRunning
                      ? "bg-rose-600 text-white hover:bg-rose-700 active:scale-95 shadow-lg"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  <Plus className="h-8 w-8 mx-auto" />
                  <span className="block text-sm mt-1">Đếm</span>
                </button>
                <p className="text-xs text-gray-500 mt-2">
                  {isTimerRunning
                    ? "Nhấn mỗi khi cảm thấy nhịp đập"
                    : "Bắt đầu đếm thời gian để sử dụng"}
                </p>
              </div>

              {/* Nút điều khiển */}
              <div className="flex justify-center space-x-3">
                {!isTimerRunning && timeLeft === 15 && (
                  <button
                    onClick={startTimer}
                    className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Bắt đầu
                  </button>
                )}

                {isTimerRunning && (
                  <button
                    onClick={pauseTimer}
                    className="flex items-center px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors"
                  >
                    <Pause className="h-4 w-4 mr-2" />
                    Tạm dừng
                  </button>
                )}

                {!isTimerRunning && timeLeft < 15 && (
                  <button
                    onClick={() => setIsTimerRunning(true)}
                    className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Tiếp tục
                  </button>
                )}

                <button
                  onClick={resetTimer}
                  className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reset
                </button>
              </div>

              {/* Kết quả đo */}
              {timerResult && (
                <div className="mt-6 p-4 bg-white rounded-lg shadow-sm">
                  <h4 className="font-semibold text-gray-800 mb-2">
                    Kết quả đo
                  </h4>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-rose-600">
                      {timerResult} bpm
                    </p>
                    <p className="text-sm text-gray-600">
                      ({pulseCount} nhịp × 4)
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Form thông tin bổ sung */}
            <div className="space-y-4 bg-white h-fit rounded-lg p-8 shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800">
                Thông tin để phân tích chi tiết
              </h3>

              <div className="flex items-center gap-2">
                <div className="w-6/12 flex flex-col ">
                  <label className="text-xs pb-1" htmlFor="">
                    Tuổi của bạn
                  </label>
                  <div className="w-full flex h-fit items-center gap-2 py-2 px-1  text-sm border border-dark-700 rounded-md hover:border-rose-500 cursor-pointer">
                    <Calendar className="text-rose-600 h-5 w-5 " />
                    <input
                      className="flex-1 outline-none cursor-pointer"
                      min="1"
                      max="120"
                      type="number"
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                      placeholder="Nhập tuổi"
                    />
                  </div>
                </div>

                <div className="w-6/12 flex flex-col ">
                  <label className="text-xs pb-1" htmlFor="">
                    Thời điểm đo
                  </label>
                  <div className="w-full flex items-center gap-2 py-2 px-1  text-sm  border border-dark-700 rounded-md hover:border-rose-500  cursor-pointer">
                    <Clock10Icon className="text-rose-600 h-5 w-5" />

                    <select
                      value={measurementTime}
                      onChange={(e) => setMeasurementTime(e.target.value)}
                      className="w-full outline-none cursor-pointer text-dark-300"
                    >
                      <option value="">Chọn thời điểm</option>
                      <option value="rest">Lúc nghỉ ngơi</option>
                      <option value="exercise">Khi tập thể dục</option>
                      <option value="stress">Khi căng thẳng</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div>
                  <ValueSlider
                    label="cân nặng (kg)"
                    value={weight}
                    onChange={setWeight}
                    min={1}
                    max={300}
                    step={0.1}
                  />
                </div>
                <div>
                  <ValueSlider
                    label="chiều cao (cm)"
                    value={height}
                    onChange={setHeight}
                    min={1}
                    max={300}
                    step={0.5}
                  />
                </div>
              </div>
              <div className="w-full flex flex-col ">
                <label className="text-xs pb-1" htmlFor="">
                  Mục tiêu tập luyện
                </label>
                <div className="w-full flex items-center gap-2 py-2 px-1  text-sm  border border-dark-700 rounded-md hover:border-rose-500  cursor-pointer">
                  <Dumbbell className="text-pink-500 h-5 w-5" />
                  <select
                    value={fitnessGoal}
                    onChange={(e) => setFitnessGoal(e.target.value)}
                    className="w-full outline-none cursor-pointer"
                  >
                    <option value="">Chọn mục tiêu</option>
                    <option value="weight-loss">Giảm cân</option>
                    <option value="endurance">Tăng sức bền</option>
                    <option value="performance">Tăng hiệu suất</option>
                    <option value="health">Duy trì sức khỏe</option>
                  </select>
                </div>{" "}
              </div>

              <button
                onClick={analyzeHeartRate}
                disabled={!heartRate || !age}
                className={`w-full py-3 px-4 rounded-md font-medium transition-colors ${
                  heartRate && age
                    ? "bg-rose-600 text-white hover:bg-rose-700"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
              >
                <Activity className="h-5 w-5 inline mr-2" />
                Phân tích nhịp tim
              </button>
            </div>
          </div>
        )}
        {/* Kết quả phân tích */}
        {result && (
          <div className="space-y-4">
            {/* Kết quả chính */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center mb-3">
                {getStatusIcon(result.status)}
                <h3 className="text-lg font-semibold ml-2">
                  Kết quả phân tích
                </h3>
              </div>
              <div className="space-y-3">
                <div className="text-center">
                  <p className="text-3xl font-bold text-rose-600 mb-1">
                    {result.hr} bpm
                  </p>
                  <p className={`text-lg font-semibold ${result.color}`}>
                    {result.category}
                  </p>
                </div>
                <div className="p-3 bg-white rounded-md">
                  <p className="text-gray-700 text-sm">{result.advice}</p>
                </div>
                {result.goalAdvice && (
                  <div className="p-3 bg-rose-50 rounded-md">
                    <p className="text-rose-700 text-sm font-medium">
                      Gợi ý cho mục tiêu:
                    </p>
                    <p className="text-rose-700 text-sm">{result.goalAdvice}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Thông tin bổ sung */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-800 mb-3">
                Thông tin bổ sung
              </h4>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-gray-600">Nhịp tim tối đa:</span>
                  <span className="font-semibold ml-2">{result.maxHR} bpm</span>
                </div>
                {result.bmi && (
                  <div>
                    <span className="text-gray-600">BMI:</span>
                    <span className="font-semibold ml-2">{result.bmi}</span>
                  </div>
                )}
                {result.bmiCategory && (
                  <div>
                    <span className="text-gray-600">Phân loại BMI:</span>
                    <span className={`font-semibold ml-2 ${result.bmiColor}`}>
                      {result.bmiCategory}
                    </span>
                  </div>
                )}
                {result.currentZone && (
                  <div className="col-span-2">
                    <span className="text-gray-600">
                      Vùng tập luyện hiện tại:
                    </span>
                    <span
                      className={`ml-2 px-2 py-1 rounded text-xs font-medium ${result.currentZone.color}`}
                    >
                      {result.currentZone.name}
                    </span>
                  </div>
                )}
              </div>

              {/* BMI Analysis Section */}
              {result.bmi && (
                <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h4 className="font-semibold text-blue-800 mb-2 flex items-center">
                    <svg
                      className="w-4 h-4 mr-1"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Sự ảnh hưởng của BMI
                  </h4>
                  <p className="text-xs text-blue-700 mb-2">
                    {result.bmiAdvice}
                  </p>
                  <div className="text-sm text-blue-600">
                    <strong>Ảnh hưởng đến tim:</strong> {result.bmiHeartImpact}
                  </div>
                </div>
              )}

              {/* Enhanced Goal Advice */}
              {result.goalAdvice && (
                <div className="mt-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                  <h4 className="font-semibold text-yellow-800 mb-2 flex items-center">
                    <svg
                      className="w-4 h-4 mr-1"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Lời khuyên cho mục tiêu
                  </h4>
                  <p className="text-sm text-yellow-700">{result.goalAdvice}</p>
                </div>
              )}

              {/* Safety Warnings */}
              {(result.bmi >= 30 ||
                result.hr > 180 ||
                (result.hr > 100 && measurementTime === "rest")) && (
                <div className="mt-4 p-4 bg-red-50 rounded-lg border border-red-200">
                  <h4 className="font-semibold text-red-800 mb-2 flex items-center">
                    <svg
                      className="w-4 h-4 mr-1"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Lưu ý quan trọng
                  </h4>
                  <ul className="text-sm text-red-700 space-y-1">
                    {result.bmi >= 30 && (
                      <li>
                        • Nên tham khảo ý kiến bác sĩ trước khi bắt đầu chương
                        trình tập luyện
                      </li>
                    )}
                    {result.hr > 180 && (
                      <li>
                        • Nhịp tim quá cao, cần nghỉ ngơi và giảm cường độ tập
                        luyện
                      </li>
                    )}
                    {result.hr > 100 && measurementTime === "rest" && (
                      <li>
                        • Nhịp tim nghỉ cao, nên kiểm tra với chuyên gia y tế
                      </li>
                    )}
                    <li>
                      • Luôn lắng nghe cơ thể và dừng lại nếu cảm thấy khó chịu
                    </li>
                  </ul>
                </div>
              )}
            </div>

            {/* Vùng nhịp tim */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-800 mb-3">
                Vùng nhịp tim mục tiêu
              </h4>
              <div className="space-y-2">
                {Object.entries(result.zones).map(([key, zone]) => (
                  <div key={key} className="flex items-center justify-between">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${zone.color}`}
                    >
                      {zone.name}
                    </span>
                    <span className="text-sm text-gray-600">
                      {zone.min} - {zone.max} bpm
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Biểu đồ vùng nhịp tim */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-800 mb-3">
                Biểu đồ vùng nhịp tim
              </h4>
              <div className="space-y-2">
                {Object.entries(result.zones).map(([key, zone]) => {
                  const percentage =
                    ((zone.max - zone.min) / result.maxHR) * 100;
                  const isCurrentZone =
                    result.currentZone && result.currentZone.name === zone.name;

                  return (
                    <div key={key} className="relative">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span
                          className={`font-medium ${
                            isCurrentZone ? "text-rose-600" : "text-gray-600"
                          }`}
                        >
                          {zone.name}
                        </span>
                        <span className="text-gray-500">
                          {zone.min}-{zone.max} bpm
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className={`h-3 rounded-full transition-all duration-500 ${
                            isCurrentZone
                              ? "bg-rose-500"
                              : zone.color.includes("blue")
                              ? "bg-blue-400"
                              : zone.color.includes("green")
                              ? "bg-green-400"
                              : zone.color.includes("yellow")
                              ? "bg-yellow-400"
                              : zone.color.includes("orange")
                              ? "bg-orange-400"
                              : "bg-red-400"
                          }`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      {isCurrentZone && (
                        <div className="absolute right-0 top-0 transform translate-x-full">
                          <div className="bg-rose-600 text-white text-xs px-2 py-1 rounded ml-2">
                            Hiện tại
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Gợi ý tập luyện */}
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h4 className="font-semibold text-blue-800 mb-3">
                Gợi ý tập luyện theo vùng nhịp tim
              </h4>
              <div className="space-y-2 text-sm text-blue-700">
                <div>
                  <strong>Vùng 1-2 (50-70%):</strong> Tập luyện nhẹ nhàng, đi
                  bộ, yoga - phù hợp cho người mới bắt đầu
                </div>
                <div>
                  <strong>Vùng 3 (70-80%):</strong> Tập luyện sức bền, chạy bộ
                  vừa phải - tốt cho tim mạch
                </div>
                <div>
                  <strong>Vùng 4-5 (80-100%):</strong> Tập luyện cường độ cao,
                  HIIT - chỉ cho người có kinh nghiệm
                </div>
              </div>
            </div>

            {/* Lưu ý */}
            <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
              <h4 className="font-semibold text-amber-800 mb-2">
                Lưu ý quan trọng
              </h4>
              <ul className="text-sm text-amber-700 space-y-1">
                <li>• Kết quả chỉ mang tính chất tham khảo</li>
                <li>
                  • Nếu có triệu chứng bất thường, hãy tham khảo ý kiến bác sĩ
                </li>
                <li>• Nhịp tim có thể thay đổi theo nhiều yếu tố khác nhau</li>
                <li>• Đo nhịp tim thường xuyên để theo dõi xu hướng</li>
                <li>
                  • Thuốc men, cafein, stress có thể ảnh hưởng đến nhịp tim
                </li>
              </ul>
            </div>
          </div>
        )}{" "}
      </div>{" "}
      <div className="bg-white rounded-lg p-6 mt-6 mb-4 shadow-sm border border-rose-100">
        <div className="flex items-center space-x-4 mb-4">
          <Shield className="h-6 w-6 text-rose-600" />
          <h3 className="text-lg font-semibold text-gray-800">
            Thông tin y tế quan trọng
          </h3>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="flex items-center space-x-3 p-3 bg-rose-50 rounded-xl">
            <Info className="h-5 w-5 text-rose-600" />
            <div>
              <p className="font-medium text-rose-800">Độ chính xác cao</p>
              <p className="text-sm text-rose-600">Dựa trên chuẩn y khoa</p>
            </div>
          </div>
          <div className="flex items-center space-x-3 p-3 bg-rose-50 rounded-xl">
            <Users className="h-5 w-5 text-rose-600" />
            <div>
              <p className="font-medium text-rose-800">Nhiều phương pháp</p>
              <p className="text-sm text-rose-600">Phù hợp mọi trường hợp</p>
            </div>
          </div>
          <div className="flex items-center space-x-3 p-3 bg-rose-50 rounded-xl">
            <Award className="h-5 w-5 text-rose-600" />
            <div>
              <p className="font-medium text-rose-800">Tư vấn chuyên sâu</p>
              <p className="text-sm text-rose-600">Theo dõi toàn diện</p>
            </div>
          </div>
        </div>
        <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
          <p className="text-sm text-yellow-800">
            <strong>Lưu ý:</strong> Đây chỉ là công cụ tham khảo. Hãy luôn tham
            khảo ý kiến bác sĩ để có lời khuyên chính xác nhất cho tình trạng
            tim mạch của bạn.
          </p>
        </div>
      </div>
    </div>
  );
};

export default HeartRateMonitor;

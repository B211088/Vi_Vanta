import React, { useEffect, useState } from "react";
import {
  ArrowLeft,
  User,
  Scale,
  Ruler,
  Activity,
  Calculator,
  Info,
  Heart,
  Target,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Bed,
  Coffee,
  PersonStanding,
  Bike,
  Zap,
  Shield,
  Users,
  Award,
} from "lucide-react";
import ValueSlider from "../../features/ValueSlider";
import { useNavigate } from "react-router-dom";
import { useNotify } from "../../../hook/useNotify";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchUserHealthInfo,
  getHealthAdviceMetabolism,
  updateHealthInfo,
} from "../../../services/health.service";
import ActivityLevelSelect from "../../features/ActivityLevelSelect";
import GoalSelect from "../../features/GoalSelect";
import HeaderTool from "./HeaderTool";

const BodyFatAnalyzer = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { notifySuccess, notifyWarning, notifyError } = useNotify();
  const { healthInfo, metabolism } = useSelector((state) => state.health);
  const { user } = useSelector((state) => state.auth);
  const [showGuide, setShowGuide] = useState(false);
  const [gender, setGender] = useState("");
  const [age, setAge] = useState("");
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [waist, setWaist] = useState("");
  const [neck, setNeck] = useState("");
  const [hip, setHip] = useState("");
  const [activityLevel, setActivityLevel] = useState("sedentary");
  const [goal, setGoal] = useState("lose");
  const [result, setResult] = useState(null);
  const [isInitialLoaded, setIsInitialLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    dispatch(fetchUserHealthInfo());
    dispatch(getHealthAdviceMetabolism({ type: "metabolism" }));
  }, []);

  function calculateAge(dateString) {
    const birthDate = new Date(dateString);
    const today = new Date();

    let age = today.getFullYear() - birthDate.getFullYear();
    const hasHadBirthdayThisYear =
      today.getMonth() > birthDate.getMonth() ||
      (today.getMonth() === birthDate.getMonth() &&
        today.getDate() >= birthDate.getDate());

    if (!hasHadBirthdayThisYear) {
      age--;
    }

    return age;
  }

  useEffect(() => {
    if (healthInfo && user && metabolism && !isInitialLoaded) {
      setWeight(healthInfo.weight);
      setHeight(healthInfo.height);
      setActivityLevel(healthInfo.activityLevel);
      setGoal(healthInfo.goal);
      setAge(healthInfo?.age);
      setGender(healthInfo?.gender);
      setWaist(healthInfo?.waist);
      setNeck(healthInfo?.neck);
      setHip(healthInfo?.hip);
      setIsInitialLoaded(true);
    }
  }, [healthInfo, user, metabolism, isInitialLoaded]);

  useEffect(() => {
    if (
      isInitialLoaded &&
      weight &&
      height &&
      age &&
      gender &&
      waist &&
      neck &&
      ((gender === "female" && hip) || gender === "male")
    ) {
      calculateBodyFat(false);
    }
  }, [isInitialLoaded]);

  const calculateBodyFat = async (saveToServer = true) => {
    if (
      !gender ||
      !age ||
      !weight ||
      !height ||
      !waist ||
      !neck ||
      (gender === "female" && !hip)
    ) {
      alert("Vui lòng nhập đầy đủ thông tin!");
      return;
    }

    const ageNum = parseFloat(age);
    const weightNum = parseFloat(weight);
    const heightNum = parseFloat(height);
    const waistNum = parseFloat(waist);
    const neckNum = parseFloat(neck);
    const hipNum = gender === "female" ? parseFloat(hip) : 0;

    // Tính BMI
    const bmi = weightNum / (heightNum / 100) ** 2;
    if (saveToServer) {
      setLoading(true);
      try {
        const response = await dispatch(
          updateHealthInfo({
            weight,
            height,
            activityLevel,
            gender,
            goal,
            age,
            waist,
            neck,
            hip,
          })
        );

        if (response.success) {
          notifySuccess(response.data.message);
        }

        console.log({ response });
      } catch (error) {
        console.log(error);
      }
    }
    // Tính tỉ lệ mỡ US Navy Formula
    let bodyFatPercentage;
    if (gender === "male") {
      bodyFatPercentage =
        86.01 * Math.log10(waistNum - neckNum) -
        70.041 * Math.log10(heightNum) +
        36.76;
    } else {
      bodyFatPercentage =
        163.205 * Math.log10(waistNum + hipNum - neckNum) -
        97.684 * Math.log10(heightNum) -
        78.387;
    }

    // Tính tỉ lệ mỡ theo công thức Deurenberg
    const deurenbergBF =
      1.2 * bmi + 0.23 * ageNum - 10.8 * (gender === "male" ? 1 : 0) - 5.4;

    // Tính tỉ lệ mỡ theo công thức Jackson-Pollock (đơn giản hóa)
    const jacksonPollockBF =
      gender === "male"
        ? 1.61 * bmi + 0.13 * ageNum - 12.1
        : 1.48 * bmi + 0.16 * ageNum - 19.5;

    // Trung bình các phương pháp
    const avgBodyFat =
      (bodyFatPercentage + deurenbergBF + jacksonPollockBF) / 3;

    // Phân loại theo tỉ lệ mỡ
    const getBodyFatCategory = (bf, gender) => {
      if (gender === "male") {
        if (bf < 6)
          return {
            category: "Thiếu mỡ",
            color: "text-red-600",
            status: "danger",
          };
        if (bf < 14)
          return {
            category: "Vận động viên",
            color: "text-green-600",
            status: "excellent",
          };
        if (bf < 18)
          return { category: "Tốt", color: "text-green-500", status: "good" };
        if (bf < 25)
          return {
            category: "Trung bình",
            color: "text-yellow-600",
            status: "average",
          };
        return { category: "Thừa mỡ", color: "text-red-600", status: "high" };
      } else {
        if (bf < 16)
          return {
            category: "Thiếu mỡ",
            color: "text-red-600",
            status: "danger",
          };
        if (bf < 21)
          return {
            category: "Vận động viên",
            color: "text-green-600",
            status: "excellent",
          };
        if (bf < 25)
          return { category: "Tốt", color: "text-green-500", status: "good" };
        if (bf < 32)
          return {
            category: "Trung bình",
            color: "text-yellow-600",
            status: "average",
          };
        return { category: "Thừa mỡ", color: "text-red-600", status: "high" };
      }
    };

    const category = getBodyFatCategory(avgBodyFat, gender);

    // Tính các chỉ số khác
    const leanBodyMass = weightNum * (1 - avgBodyFat / 100);
    const fatMass = weightNum - leanBodyMass;
    const metabolicRate =
      gender === "male"
        ? 88.362 + 13.397 * weightNum + 4.799 * heightNum - 5.677 * ageNum
        : 447.593 + 9.247 * weightNum + 3.098 * heightNum - 4.33 * ageNum;

    // Khuyến nghị dựa trên mục tiêu
    const getGoalAdvice = () => {
      switch (goal) {
        case "weight-loss":
          return "Tập trung vào việc giảm mỡ thừa thông qua chế độ ăn và tập luyện cardio.";
        case "muscle-gain":
          return "Tăng cường tập luyện sức mạnh và đảm bảo protein đủ để xây dựng cơ bắp.";
        case "maintain":
          return "Duy trì chế độ ăn cân bằng và tập luyện đều đặn.";
        case "athlete":
          return "Theo dõi chặt chẽ tỉ lệ mỡ để tối ưu hóa hiệu suất thể thao.";
        default:
          return "Duy trì lối sống lành mạnh với chế độ ăn cân bằng và tập luyện đều đặn.";
      }
    };

    setResult({
      bodyFat: avgBodyFat.toFixed(1),
      methods: {
        usNavy: bodyFatPercentage.toFixed(1),
        deurenberg: deurenbergBF.toFixed(1),
        jacksonPollock: jacksonPollockBF.toFixed(1),
      },
      category: category.category,
      color: category.color,
      status: category.status,
      bmi: bmi.toFixed(1),
      leanBodyMass: leanBodyMass.toFixed(1),
      fatMass: fatMass.toFixed(1),
      metabolicRate: metabolicRate.toFixed(0),
      goalAdvice: getGoalAdvice(),
      recommendations: getRecommendations(avgBodyFat, gender, goal),
    });
  };

  const getRecommendations = (bodyFat, gender, goal) => {
    const recommendations = [];

    if (bodyFat < (gender === "male" ? 10 : 18)) {
      recommendations.push({
        type: "warning",
        text: "Tỉ lệ mỡ thấp có thể ảnh hưởng đến sức khỏe. Cần tăng cường dinh dưỡng.",
      });
    }

    if (bodyFat > (gender === "male" ? 25 : 32)) {
      recommendations.push({
        type: "danger",
        text: "Tỉ lệ mỡ cao, cần giảm cân để cải thiện sức khỏe.",
      });
    }

    recommendations.push({
      type: "info",
      text: "Tập luyện sức mạnh giúp tăng khối lượng cơ và giảm tỉ lệ mỡ.",
    });

    recommendations.push({
      type: "info",
      text: "Theo dõi tỉ lệ mỡ thường xuyên để đánh giá tiến trình.",
    });

    return recommendations;
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "excellent":
        return <CheckCircle className="h-6 w-6 text-green-600" />;
      case "good":
        return <CheckCircle className="h-6 w-6 text-green-500" />;
      case "average":
        return <Target className="h-6 w-6 text-yellow-600" />;
      case "high":
        return <AlertTriangle className="h-6 w-6 text-red-600" />;
      case "danger":
        return <AlertTriangle className="h-6 w-6 text-red-600" />;
      default:
        return <Activity className="h-6 w-6 text-gray-600" />;
    }
  };

  return (
    <div className="w-full min-h-screen px-6 py-8">
      <HeaderTool
        title={"Tính tỉ lệ mỡ cơ thể"}
        subtitle={
          "Công cụ chuyên nghiệp đánh giá tỉ lệ mỡ và đưa ra lời khuyên về sức khỏe"
        }
        icon={Calculator}
        color={"yellow"}
      />
      {/* Hướng dẫn */}
      <div className="mb-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
        <div
          onClick={() => setShowGuide(!showGuide)}
          className="flex items-center justify-between cursor-pointer"
        >
          <h3 className="text-md font-semibold text-yellow-800">
            Hướng dẫn đo và tính toán
          </h3>
          <button className="text-yellow-600 hover:text-yellow-800">
            <Info className="h-5 w-5" />
          </button>
        </div>
        {showGuide && (
          <div className="text-sm text-yellow-700 space-y-2 mt-3">
            <p>
              <strong>Cách đo vòng eo:</strong>
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Đo ở vị trí hẹp nhất của eo, thường ở trên rốn</li>
              <li>Thở ra bình thường, không hít sâu hay thở ra hết</li>
              <li>Thước đo vừa khít, không quá chật hay quá lỏng</li>
            </ul>
            <p>
              <strong>Cách đo vòng cổ:</strong>
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Đo ở vị trí thấp nhất của cổ, dưới quả táo Adam</li>
              <li>Đứng thẳng, nhìn về phía trước</li>
            </ul>
            <p>
              <strong>Cách đo vòng mông (nữ):</strong>
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Đo ở vị trí rộng nhất của mông</li>
              <li>Đứng thẳng, chân khép lại</li>
            </ul>
            <p>
              <strong>Lưu ý:</strong> Kết quả chỉ mang tính tham khảo. Nên tham
              khảo chuyên gia để có đánh giá chính xác nhất.
            </p>
          </div>
        )}
      </div>
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Form nhập thông tin */}
        <div className="space-y-4 bg-white h-fit rounded-lg p-8 shadow-sm border border-gray-200">
          <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center">
            <User className="h-5 w-5 mr-3 text-yellow-600" />
            Thông tin cá nhân
          </h2>

          {/* Giới tính và tuổi */}
          <div className="flex items-center gap-2">
            <div className="w-6/12 flex flex-col">
              <label className="text-xs pb-1">Giới tính</label>
              <div className="w-full flex items-center gap-2 py-2 px-3 text-sm border border-gray-300 rounded-md hover:border-yellow-500 cursor-pointer">
                <User className="text-yellow-500 h-5 w-5" />
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
              <div className="w-full flex items-center gap-2 py-2 px-3 text-sm border border-gray-300 rounded-md hover:border-yellow-500 cursor-pointer">
                <TrendingUp className="text-yellow-600 h-5 w-5" />
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
          <div className="grid grid-cols-1 gap-4">
            <ValueSlider
              label="cân nặng (kg)"
              value={weight}
              onChange={setWeight}
              min={1}
              max={200}
              step={0.1}
              unit="kg"
            />
            <ValueSlider
              label="chiều cao (cm)"
              value={height}
              onChange={setHeight}
              min={100}
              max={220}
              step={1}
              unit="cm"
            />
          </div>

          {/* Các số đo cơ thể */}
          <div className="space-y-4">
            <h3 className="text-md font-semibold text-gray-800">
              Số đo cơ thể
            </h3>

            <ValueSlider
              label="vòng eo (cm)"
              value={waist}
              onChange={setWaist}
              min={50}
              max={150}
              step={0.5}
              unit="cm"
            />

            <ValueSlider
              label="vòng cổ (cm)"
              value={neck}
              onChange={setNeck}
              min={25}
              max={60}
              step={0.5}
              unit="cm"
            />

            {gender === "female" && (
              <ValueSlider
                label="vòng mông (cm)"
                value={hip}
                onChange={setHip}
                min={60}
                max={180}
                step={0.5}
                unit="cm"
              />
            )}
          </div>

          {/* Mức độ hoạt động và mục tiêu */}
          <div className="flex flex-col gap-2">
            <ActivityLevelSelect
              value={activityLevel}
              onChange={setActivityLevel}
              activityLevels={activityLevels}
            />
            <GoalSelect value={goal} onChange={setGoal} goals={goals} />
          </div>

          <button
            onClick={calculateBodyFat}
            className="w-full bg-yellow-600 text-white py-3 px-4 rounded-md hover:bg-yellow-700 transition-colors font-medium"
          >
            <Calculator className="h-5 w-5 inline mr-2" />
            Tính tỉ lệ mỡ cơ thể
          </button>
        </div>

        {/* Kết quả */}
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
                  <p className="text-3xl font-bold text-yellow-600 mb-1">
                    {result.bodyFat}%
                  </p>
                  <p className={`text-lg font-semibold ${result.color}`}>
                    {result.category}
                  </p>
                </div>
                <div className="p-3 bg-white rounded-md">
                  <p className="text-gray-700 text-sm">{result.goalAdvice}</p>
                </div>
              </div>
            </div>

            {/* Các phương pháp tính toán */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-800 mb-3">
                Kết quả từ các phương pháp
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">US Navy Formula:</span>
                  <span className="font-semibold">
                    {result.methods.usNavy}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Deurenberg Formula:</span>
                  <span className="font-semibold">
                    {result.methods.deurenberg}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Jackson-Pollock:</span>
                  <span className="font-semibold">
                    {result.methods.jacksonPollock}%
                  </span>
                </div>
                <div className="border-t pt-2 mt-2">
                  <div className="flex justify-between">
                    <span className="text-gray-800 font-medium">
                      Trung bình:
                    </span>
                    <span className="font-bold text-yellow-600">
                      {result.bodyFat}%
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Thông tin bổ sung */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-800 mb-3">
                Thông tin bổ sung
              </h4>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-gray-600">BMI:</span>
                  <span className="font-semibold ml-2">{result.bmi}</span>
                </div>
                <div>
                  <span className="text-gray-600">Khối lượng cơ:</span>
                  <span className="font-semibold ml-2">
                    {result.leanBodyMass}kg
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Khối lượng mỡ:</span>
                  <span className="font-semibold ml-2">{result.fatMass}kg</span>
                </div>
                <div>
                  <span className="text-gray-600">Chuyển hóa cơ bản:</span>
                  <span className="font-semibold ml-2">
                    {result.metabolicRate} kcal
                  </span>
                </div>
              </div>
            </div>

            {/* Biểu đồ tỉ lệ mỡ */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-800 mb-3">
                Biểu đồ tỉ lệ mỡ cơ thể
              </h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span>Khối lượng cơ</span>
                  <span>{result.leanBodyMass}kg</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4">
                  <div
                    className="bg-green-500 h-4 rounded-full"
                    style={{ width: `${100 - parseFloat(result.bodyFat)}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Khối lượng mỡ</span>
                  <span>{result.fatMass}kg</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4">
                  <div
                    className="bg-yellow-500 h-4 rounded-full"
                    style={{ width: `${result.bodyFat}%` }}
                  />
                </div>
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
                        ? "bg-yellow-100 text-yellow-800"
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
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <h4 className="font-semibold text-yellow-800 mb-2">
                Lưu ý quan trọng
              </h4>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>• Kết quả chỉ mang tính chất tham khảo</li>
                <li>• Độ chính xác phụ thuộc vào việc đo đạc cẩn thận</li>
                <li>• Nên đo vào cùng thời điểm trong ngày để theo dõi</li>
                <li>• Tỉ lệ mỡ thay đổi theo tuổi và hoạt động</li>
                <li>• Tham khảo chuyên gia để có kế hoạch phù hợp</li>
              </ul>
            </div>
          </div>
        )}
      </div>{" "}
      <div className="bg-white rounded-lg p-6 mt-6 mb-4 shadow-sm border border-yellow-100">
        <div className="flex items-center space-x-4 mb-4">
          <Shield className="h-6 w-6 text-yellow-600" />
          <h3 className="text-lg font-semibold text-gray-800">
            Thông tin y tế quan trọng
          </h3>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-xl">
            <Info className="h-5 w-5 text-yellow-600" />
            <div>
              <p className="font-medium text-yellow-800">Độ chính xác cao</p>
              <p className="text-sm text-yellow-600">Dựa trên chuẩn y khoa</p>
            </div>
          </div>
          <div className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-xl">
            <Users className="h-5 w-5 text-yellow-600" />
            <div>
              <p className="font-medium text-yellow-800">Nhiều phương pháp</p>
              <p className="text-sm text-yellow-600">Phù hợp mọi trường hợp</p>
            </div>
          </div>
          <div className="flex items-center space-x-3 p-3 bg-rose-50 rounded-xl">
            <Award className="h-5 w-5 text-yellow-600" />
            <div>
              <p className="font-medium text-yellow-800">Tư vấn chuyên sâu</p>
              <p className="text-sm text-yellow-600">Theo dõi toàn diện</p>
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

export default BodyFatAnalyzer;

const activityLevels = {
  sedentary: {
    label: "Ít vận động",
    multiplier: 1.2,
    icon: Bed,
    color: "text-gray-500",
    description: "Công việc văn phòng, ít hoạt động thể chất",
  },
  light: {
    label: "Vận động nhẹ",
    multiplier: 1.375,
    icon: Coffee,
    color: "text-blue-500",
    description: "Tập thể dục 1-3 ngày/tuần",
  },
  moderate: {
    label: "Vận động vừa",
    multiplier: 1.55,
    icon: PersonStanding,
    color: "text-green-500",
    description: "Tập thể dục 3-5 ngày/tuần",
  },
  active: {
    label: "Vận động nhiều",
    multiplier: 1.725,
    icon: Bike,
    color: "text-orange-500",
    description: "Tập thể dục 6-7 ngày/tuần",
  },
  very_active: {
    label: "Rất năng động",
    multiplier: 1.9,
    icon: Zap,
    color: "text-red-500",
    description: "Tập thể dục 2 lần/ngày hoặc công việc nặng",
  },
};
const goals = {
  lose: { label: "Giảm cân", deficit: -500, description: "Giảm 0.5kg/tuần" },
  maintain: {
    label: "Duy trì cân nặng",
    deficit: 0,
    description: "Giữ nguyên cân nặng hiện tại",
  },
  gain: { label: "Tăng cân", deficit: 500, description: "Tăng 0.5kg/tuần" },
};

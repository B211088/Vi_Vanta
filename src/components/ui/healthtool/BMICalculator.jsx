import {
  ArrowLeft,
  User,
  Activity,
  Target,
  Calendar,
  Book,
  Heart,
  Utensils,
  Dumbbell,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Stethoscope,
  Shield,
  Users,
  Clock,
  Info,
  Star,
  Award,
  VenusAndMars,
  Coffee,
  Bed,
  PersonStanding,
  Bike,
  Zap,
  Mars,
  Venus,
  Scale,
  Salad,
  GlassWater,
  HelpCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ValueSlider from "../../features/ValueSlider";

import { useDispatch, useSelector } from "react-redux";
import {
  fetchUserHealthInfo,
  getHealthAdviceMetabolism,
  getSimpleHealthAdvice,
  updateHealthInfo,
} from "../../../services/health.service";
import ActivityLevelSelect from "../../features/ActivityLevelSelect";
import GoalSelect from "../../features/GoalSelect";
import Disclaimer from "../article/Disclaimer";
import { useNotify } from "../../../hook/useNotify";
import { convertMarkdownToJSX } from "../../../utils/convertMarkdownToJSX";
import TabButton from "../../features/TabButton";
import HeaderTool from "./HeaderTool";
const BMICalculator = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { notifySuccess, notifyWarning, notifyError } = useNotify();
  const { healthInfo, metabolism } = useSelector((state) => state.health);
  const { user } = useSelector((state) => state.auth);
  const [weight, setWeight] = useState(healthInfo?.weight || "");
  const [height, setHeight] = useState(healthInfo?.height || "");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("male");
  const [activityLevel, setActivityLevel] = useState("moderate");
  const [goal, setGoal] = useState("maintain");
  const [result, setResult] = useState(null);
  const [activeTab, setActiveTab] = useState("calculator");
  const [advice, setAdvice] = useState("");
  const [showGuide, setShowGuide] = useState(false);
  const [loading, setLoading] = useState(false);

  const [basicRecommendations, setBasicRecommendations] = useState("");
  const [isInitialLoaded, setIsInitialLoaded] = useState(false);

  useEffect(() => {
    dispatch(fetchUserHealthInfo());
    dispatch(getHealthAdviceMetabolism({ type: "metabolism" }));
  }, []);

  console.log({ healthInfo, user, metabolism, advice });

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

  // Effect để load dữ liệu ban đầu từ redux state
  useEffect(() => {
    if (healthInfo && user && metabolism && !isInitialLoaded) {
      setAdvice(metabolism?.value);
      setWeight(healthInfo.weight);
      setHeight(healthInfo.height);
      setActivityLevel(healthInfo.activityLevel);
      setGoal(healthInfo.goal);
      setAge(healthInfo?.age);
      setGender(healthInfo?.gender);
      setIsInitialLoaded(true);
    }
  }, [healthInfo, user, metabolism, isInitialLoaded]);

  // Effect để tính BMI lần đầu khi load xong dữ liệu
  useEffect(() => {
    if (isInitialLoaded && weight && height && age && gender) {
      calculateBMI(false); // false = không lưu lên server
    }
  }, [isInitialLoaded]);

  const calculateBMI = async (saveToServer = true) => {
    if (weight && height && age) {
      const heightInMeters = height / 100;
      const bmi = (weight / (heightInMeters * heightInMeters)).toFixed(1);
      const weightNum = parseFloat(weight);
      const heightNum = parseFloat(height);
      const ageNum = parseFloat(age);

      // Chỉ lưu lên server khi user bấm nút tính hoặc thay đổi thông tin
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
            })
          );
          const adviceResponse = await dispatch(
            getSimpleHealthAdvice({
              weight,
              height,
              activityLevel,
              gender,
              goal,
              age,
            })
          );

          if (response.success) {
            notifySuccess(response.data.message);
          }
          if (adviceResponse.success) {
            setAdvice(adviceResponse.data.advice);
            setLoading(false);
          }
          console.log({ response });
        } catch (error) {
          console.log(error);
        }
      }

      // Tính BMR (Basal Metabolic Rate)
      let bmr;
      if (gender === "male") {
        bmr = 10 * weightNum + 6.25 * heightNum - 5 * ageNum + 5;
      } else {
        bmr = 10 * weightNum + 6.25 * heightNum - 5 * ageNum - 161;
      }

      // Tính TDEE (Total Daily Energy Expenditure)
      const tdee = bmr * activityLevels[activityLevel].multiplier;
      const targetCalories = tdee + goals[goal].deficit;

      // Tính cân nặng lý tưởng
      const idealWeightMin = 18.5 * (heightInMeters * heightInMeters);
      const idealWeightMax = 24.9 * (heightInMeters * heightInMeters);

      let category = "";
      let advice = "";
      let color = "";
      let bgColor = "";
      let healthRisk = "";
      let detailedAdvice = {};
      if (bmi < 18.5) {
        category = "Thiếu cân";
        color = "text-cyan-700";
        bgColor = "bg-cyan-50";
        healthRisk = `Bạn đang ở tình trạng thiếu cân, điều này có thể dẫn đến nhiều nguy cơ sức khỏe như:
                - Suy dinh dưỡng kéo dài khiến cơ thể thiếu hụt vitamin và khoáng chất cần thiết.
                - Suy giảm hệ miễn dịch, dễ nhiễm bệnh, chậm phục hồi khi bị ốm.
                - Nguy cơ loãng xương và gãy xương do mật độ xương thấp.
                - Rối loạn kinh nguyệt (ở nữ), rối loạn nội tiết tố, mệt mỏi kéo dài và giảm năng suất lao động.
                - Thiếu máu, suy giảm trí nhớ, và ảnh hưởng tiêu cực đến sức khỏe tinh thần.`;
      } else if (bmi >= 18.5 && bmi < 25) {
        category = "Bình thường";
        color = "text-teal-700";
        bgColor = "bg-teal-50";
        healthRisk = `Bạn đang có chỉ số BMI ở mức lý tưởng. Điều này đồng nghĩa với nguy cơ mắc các bệnh liên quan đến cân nặng là thấp.
                Tuy nhiên, bạn vẫn nên duy trì thói quen sống lành mạnh để phòng ngừa các bệnh không lây nhiễm như tim mạch, tiểu đường, và rối loạn mỡ máu có thể phát sinh nếu lối sống thay đổi.`;
      } else if (bmi >= 25 && bmi < 30) {
        category = "Thừa cân";
        color = "text-orange-700";
        bgColor = "bg-orange-50";
        healthRisk = `Bạn đang trong tình trạng thừa cân, làm tăng nguy cơ mắc các bệnh lý mạn tính như:
                - Tiểu đường type 2 do tình trạng kháng insulin.
                - Tăng huyết áp và các bệnh tim mạch do mỡ máu cao.
                - Các vấn đề về khớp, đặc biệt là đầu gối và lưng do chịu áp lực từ trọng lượng cơ thể.
                - Nguy cơ gan nhiễm mỡ và hội chứng chuyển hóa.
                - Giảm chất lượng giấc ngủ, mệt mỏi kéo dài và rối loạn tâm trạng.`;
      } else if (bmi >= 30 && bmi < 35) {
        category = "Béo phì độ I";
        color = "text-red-600";
        bgColor = "bg-red-50";
        healthRisk = `Bạn đang ở mức béo phì độ I – đây là giai đoạn đầu của béo phì, tuy nhiên đã làm tăng đáng kể nguy cơ mắc:
                - Tăng huyết áp, tiểu đường type 2, rối loạn mỡ máu.
                - Gan nhiễm mỡ, ngưng thở khi ngủ.
                - Cần bắt đầu can thiệp lối sống ngay để tránh chuyển sang mức nguy hiểm hơn.`;
      } else if (bmi >= 35 && bmi < 40) {
        category = "Béo phì độ II";
        color = "text-red-700";
        bgColor = "bg-red-100";
        healthRisk = `Bạn đang ở mức béo phì độ II – đây là mức nguy hiểm, liên quan đến nhiều rối loạn chuyển hóa và bệnh tim mạch.
                - Nguy cơ mắc bệnh tim mạch, đột quỵ, tiểu đường type 2 là rất cao.
                - Ảnh hưởng đến hô hấp, xương khớp, nội tiết và chất lượng sống.`;
      } else {
        category = "Béo phì độ III (nghiêm trọng)";
        color = "text-red-800";
        bgColor = "bg-red-200";
        healthRisk = `Bạn đang ở mức béo phì độ III – béo phì nghiêm trọng cần được can thiệp y tế ngay lập tức.
                - Tăng cao nguy cơ tử vong do các bệnh lý nặng như tim mạch, đột quỵ, ung thư.
                - Cần gặp bác sĩ để lên kế hoạch điều trị tổng thể: dinh dưỡng, vận động, tâm lý và có thể phẫu thuật giảm cân.`;

        detailedAdvice = {
          lifestyle: [
            "Tham khảo bác sĩ chuyên khoa nội tiết hoặc dinh dưỡng",
            "Lập kế hoạch giảm cân có giám sát",
            "Cân nhắc phẫu thuật giảm béo nếu BMI > 40 và có biến chứng",
            "Tham gia nhóm hỗ trợ tâm lý và thể chất",
          ],
        };
      }

      setResult({
        bmi,
        category,
        advice,
        color,
        bgColor,
        healthRisk,
        detailedAdvice,
        bmr: Math.round(bmr),
        tdee: Math.round(tdee),
        targetCalories: Math.round(targetCalories),
        idealWeightMin: Math.round(idealWeightMin),
        idealWeightMax: Math.round(idealWeightMax),
        weightDifference: Math.round(
          weightNum - (idealWeightMin + idealWeightMax) / 2
        ),
      });
    }
  };
  // Thêm function để tạo plan động dựa trên BMI, activity level và goal
  const generatePersonalizedPlan = (bmi, activityLevel, goal, gender, age) => {
    let bmiCategory = "";
    let nutritionPlan = [];
    let lifestylePlan = [];

    // Xác định BMI category
    if (bmi < 18.5) bmiCategory = "underweight";
    else if (bmi < 25) bmiCategory = "normal";
    else if (bmi < 30) bmiCategory = "overweight";
    else bmiCategory = "obese";

    // Nutrition Plan dựa trên BMI và Goal
    switch (bmiCategory) {
      case "underweight":
        nutritionPlan = [
          "Tăng cường protein: 1.2-1.6g/kg cân nặng",
          "Ăn nhiều bữa nhỏ: 5-6 bữa/ngày",
          "Thêm healthy fats: bơ, hạt, dầu olive",
          "Smoothie tăng cân với whey protein",
          "Carbs phức hợp: yến mạch, khoai lang, gạo lứt",
        ];
        break;
      case "normal":
        nutritionPlan = [
          "Protein: 0.8-1.2g/kg cân nặng",
          "Ăn đủ 3 bữa chính + 2 bữa phụ",
          "Rau xanh và trái cây: 5-7 phần/ngày",
          "Uống đủ nước: 35ml/kg cân nặng",
          "Hạn chế đồ chế biến sẵn",
        ];
        break;
      case "overweight":
        nutritionPlan = [
          "Tạo deficit 300-500 calories/ngày",
          "Protein cao: 1.2-1.6g/kg để giữ cơ bắp",
          "Carbs: 45-65% tổng calories, ưu tiên phức hợp",
          "Ăn chậm, nhai kỹ",
          "Ngừng ăn 3 tiếng trước khi ngủ",
        ];
        break;
      case "obese":
        nutritionPlan = [
          "Deficit 500-750 calories/ngày",
          "Protein rất cao: 1.6-2g/kg cân nặng lý tưởng",
          "Low carb hoặc intermittent fasting",
          "Kiểm soát portion size nghiêm ngặt",
          "Tham khảo chuyên gia dinh dưỡng",
        ];
        break;
    }

    // Exercise Plan dựa trên Activity Level và Goal
    const baseExercise = {
      sedentary: {
        cardio: "Đi bộ 20-30 phút/ngày",
        strength: "Bodyweight exercises 2 lần/tuần",
        flexibility: "Yoga/stretching 15 phút/ngày",
      },
      light: {
        cardio: "Cardio nhẹ 30-45 phút, 3-4 lần/tuần",
        strength: "Tập tạ cơ bản 2-3 lần/tuần",
        flexibility: "Yoga 20-30 phút, 2-3 lần/tuần",
      },
      moderate: {
        cardio: "Cardio 45-60 phút, 4-5 lần/tuần",
        strength: "Tập tạ full body 3-4 lần/tuần",
        flexibility: "Stretching sau mỗi buổi tập",
      },
      active: {
        cardio: "HIIT 30-45 phút, 3-4 lần/tuần",
        strength: "Split training 4-5 lần/tuần",
        flexibility: "Yoga power 30-45 phút, 2 lần/tuần",
      },
      very_active: {
        cardio: "Varied cardio 45-90 phút/ngày",
        strength: "Advanced training 5-6 lần/tuần",
        flexibility: "Daily mobility work 20-30 phút",
      },
    };

    // Lifestyle Plan dựa trên Age, BMI và Goal
    lifestylePlan = [
      `Ngủ ${age > 50 ? "7-8" : "7-9"} tiếng/đêm`,
      "Quản lý stress: meditation 10-15 phút/ngày",
      bmiCategory === "obese"
        ? "Tham khảo bác sĩ định kỳ"
        : "Kiểm tra sức khỏe định kỳ",
      "Theo dõi tiến triển hàng tuần",
      goal === "lose"
        ? "Cân nặng mỗi sáng cùng giờ"
        : "Đo body composition hàng tháng",
    ];

    // Weekly Schedule

    return {
      nutritionPlan,

      lifestylePlan,
    };
  };

  // Sử dụng trong component
  const personalizedPlan = generatePersonalizedPlan(
    parseFloat(result?.bmi),
    activityLevel,
    goal,
    gender,
    parseInt(age)
  );

  const MedicalCard = ({
    title,
    value,
    unit,
    subtitle,
    icon: Icon,
    color = "teal",
    description,
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
              <div className="text-gray-400 hover:text-gray-600 transition-colors relative group cursor-pointer">
                <HelpCircle className="h-4 w-4 mb-1" />
                <div className="absolute hidden group-hover:flex flex-col top-[100%] left-[0%] w-90 text-sm text-justify p-3 rounded-md border border-teal-100 bg-light-50 z-20 ">
                  <h3 className="font-bold">{title} là gì?</h3>
                  <p>{description}</p>
                </div>
              </div>
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

  return (
    <div className="min-h-screen  to-cyan-50 font-['Nunito']">
      <div className="w-full mx-auto overflow-x-auto px-4 py-8">
        {/* Header */}
        <HeaderTool
          title="Đánh giá Sức khỏe & BMI"
          subtitle="Công cụ chuyên nghiệp cho sức khỏe tổng quan"
          icon={Scale}
          color="teal"
        />
        {/* Tab Navigation */}
        <div className="flex space-x-3 mb-3 overflow-x-auto pb-2">
          <TabButton
            id="calculator"
            color="teal-500"
            icon={Activity}
            label="Tính BMI"
            isActive={activeTab === "calculator"}
            onClick={setActiveTab}
          />
          {result && (
            <>
              <TabButton
                id="results"
                color="teal-500"
                icon={TrendingUp}
                label="Kết quả Chi tiết"
                isActive={activeTab === "results"}
                onClick={setActiveTab}
              />

              <TabButton
                id="plan"
                icon={Calendar}
                label="Kế hoạch"
                color="teal-500"
                isActive={activeTab === "plan"}
                onClick={setActiveTab}
              />
            </>
          )}
        </div>
        <div className="mb-6 p-4 bg-teal-50 rounded-lg border border-teal-200">
          <div
            onClick={() => setShowGuide(!showGuide)}
            className="flex items-center justify-between cursor-pointer"
          >
            <h3 className="text-md font-semibold text-teal-800">
              Giải thích chỉ số BMI & đánh giá sức khỏe
            </h3>
            <button className="text-teal-600 hover:text-teal-800">
              <Info className="h-5 w-5" />
            </button>
          </div>

          {showGuide && (
            <div
              onClick={() => setShowGuide(!showGuide)}
              className="text-sm text-teal-700 space-y-2 mt-3"
            >
              <p>
                <strong>1. Chỉ số BMI là gì?</strong>
              </p>
              <p>
                BMI (Body Mass Index) là chỉ số khối cơ thể, được tính dựa trên
                chiều cao và cân nặng. Đây là một công cụ đơn giản để đánh giá
                mức độ gầy – béo của một người và nguy cơ liên quan đến sức
                khỏe.
              </p>

              <p>
                <strong>Công thức tính BMI:</strong>
                <br />
                <code className="bg-white text-teal-600 px-2 py-1 rounded">
                  BMI = Cân nặng (kg) / (Chiều cao (m))²
                </code>
              </p>

              <p>
                <strong>2. Cách đọc kết quả BMI:</strong>
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>
                  <strong>&lt; 18.5:</strong> Thiếu cân – Có thể thiếu dinh
                  dưỡng
                </li>
                <li>
                  <strong>18.5 – 24.9:</strong> Bình thường – Cân nặng lý tưởng
                </li>
                <li>
                  <strong>25 – 29.9:</strong> Thừa cân – Nên điều chỉnh lối sống
                </li>
                <li>
                  <strong>&gt;= 30:</strong> Béo phì – Tăng nguy cơ bệnh tim
                  mạch, tiểu đường
                </li>
              </ul>

              <p>
                <strong>3. Lưu ý:</strong>
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>
                  BMI chỉ là công cụ tham khảo, không phân biệt được mỡ và cơ
                </li>
                <li>
                  Không áp dụng cho vận động viên, phụ nữ mang thai, hoặc trẻ
                  nhỏ
                </li>
                <li>
                  Để đánh giá toàn diện hơn, nên kết hợp với số đo vòng eo,
                  huyết áp, nhịp tim và các chỉ số khác
                </li>
                <li>Mọi thông tin và phân loại điều được tham thảo từ WHO</li>
              </ul>

              {result?.bmi && (
                <div className="mt-3 p-3 bg-teal-100 rounded">
                  <p>
                    <strong>Kết quả hiện tại của bạn:</strong>
                  </p>
                  <p>
                    BMI = <strong>{result.bmi}</strong> →{" "}
                    {result.bmi < 18.5
                      ? "Thiếu cân"
                      : result.bmi < 25
                      ? "Bình thường"
                      : result.bmi < 30
                      ? "Thừa cân"
                      : "Béo phì"}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Calculator Tab */}
        {activeTab === "calculator" && (
          <div className="grid lg:grid-cols-2 gap-8">
            <div className="bg-white h-fit rounded-lg p-8 shadow-sm border border-gray-200">
              <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center">
                <User className="h-5 w-5 mr-3 text-teal-600" />
                Thông tin cá nhân
              </h2>

              <div className="space-y-6">
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

                <div className="w-full flex items-center gap-2">
                  <div className="w-full flex flex-col ">
                    <label className="text-xs pb-1" htmlFor="">
                      Tuổi của bạn
                    </label>
                    <div className="w-full flex items-center gap-2 py-2 px-1  text-sm border border-dark-700 rounded-md hover:border-teal-500 cursor-pointer">
                      <Calendar className="text-teal-600 h-5 w-5 " />
                      <input
                        type="number"
                        min={1}
                        placeholder="Nhập tuổi của bạn"
                        value={age}
                        className="flex-1 outline-none cursor-pointer"
                        onChange={(e) => setAge(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="w-full flex flex-col ">
                    <label className="text-xs pb-1" htmlFor="">
                      Giới tính
                    </label>
                    <div className="w-full flex items-center gap-2 py-2 px-1  text-sm  border border-dark-700 rounded-md hover:border-teal-500  cursor-pointer">
                      {!gender ? (
                        <VenusAndMars className="text-teal-600 h-5 w-5" />
                      ) : gender === "male" ? (
                        <Mars className="text-blue-500 h-5 w-5" />
                      ) : (
                        <Venus className="text-teal-500 h-5 w-5" />
                      )}
                      <select
                        value={gender}
                        onChange={(e) => setGender(e.target.value)}
                        className="w-full outline-none cursor-pointer"
                      >
                        <option value="male">Nam</option>
                        <option value="female">Nữ</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="w-full flex flex-col ">
                    <ActivityLevelSelect
                      value={activityLevel}
                      onChange={setActivityLevel}
                      activityLevels={activityLevels}
                    />
                  </div>
                </div>

                <div>
                  <GoalSelect value={goal} onChange={setGoal} goals={goals} />
                </div>

                <button
                  disabled={loading}
                  onClick={calculateBMI}
                  className="w-full bg-gradient-to-r from-teal-500 to-emerald-500 text-white py-3 px-6 rounded-lg cursor-pointer hover:from-teal-600 hover:to-emerald-600 transition-all font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  <Activity className="h-5 w-5 mr-2 inline" />
                  <span>
                    {loading
                      ? "Đang tiến hành tính toán"
                      : " Tính BMI & Phân tích Sức khỏe"}
                  </span>
                </button>
              </div>
            </div>

            {result && (
              <div className="flex flex-col gap-4">
                <MedicalCard
                  title="Chỉ số BMI"
                  value={result.bmi}
                  unit="kg/m²"
                  subtitle={result.category}
                  icon={TrendingUp}
                  color="teal"
                />
                <MedicalCard
                  title="Calories khuyến nghị"
                  value={result.targetCalories}
                  unit="cal/ngày"
                  subtitle="Phù hợp với mục tiêu"
                  icon={Utensils}
                  color="teal"
                />
                <MedicalCard
                  title="Cân nặng lý tưởng"
                  value={`${result.idealWeightMin}-${result.idealWeightMax}`}
                  unit="kg"
                  subtitle="Khoảng cân nặng tối ưu"
                  icon={Target}
                  color="cyan"
                />
                {advice && !loading ? (
                  <div
                    className={`h-full p-6 ${result.bgColor} rounded-lg border border-transparent`}
                  >
                    <div className="flex items-center space-x-3 mb-3">
                      <Shield className="h-6 w-6 text-teal-600" />
                      <h3 className="text-lg font-semibold text-gray-800">
                        Đánh giá sức khỏe
                      </h3>
                    </div>

                    <div className="text-sm text-gray-700 leading-relaxed mt-4">
                      {convertMarkdownToJSX(result.healthRisk)}
                    </div>
                  </div>
                ) : (
                  <div
                    className={`p-6 ${result.bgColor} rounded-lg border border-transparent flex items-center space-x-4`}
                  >
                    <svg
                      className="animate-spin h-5 w-5 text-teal-600"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                      ></path>
                    </svg>
                    <span className="text-sm text-gray-700 font-medium">
                      Đang tính toán dữ liệu sức khỏe...
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
        {/* Results Tab */}
        {activeTab === "results" && result && (
          <div className="space-y-8">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <MedicalCard
                title="BMI"
                value={result.bmi}
                unit="kg/m²"
                subtitle={result.category}
                icon={TrendingUp}
                color="teal"
                description="BMI là chỉ số đánh giá tình trạng cân nặng theo chiều cao, giúp xác định thiếu cân, thừa cân hoặc béo phì."
              />
              <MedicalCard
                title="BMR"
                value={result.bmr}
                unit="cal/ngày"
                subtitle="Tỷ lệ trao đổi chất cơ bản"
                icon={Activity}
                color="teal"
                description="BMR (Basal Metabolic Rate) là lượng calo tối thiểu cơ thể cần để duy trì các chức năng sống cơ bản như hô hấp, tuần hoàn, điều hòa thân nhiệt khi nghỉ ngơi hoàn toàn."
              />
              <MedicalCard
                title="TDEE"
                value={result.tdee}
                unit="cal/ngày"
                subtitle="Tổng năng lượng tiêu hao"
                icon={Dumbbell}
                color="cyan"
                description="TDEE (Total Daily Energy Expenditure) là tổng lượng calo cơ thể tiêu hao mỗi ngày, bao gồm chuyển hóa cơ bản (BMR), hoạt động thể chất và tiêu hóa thức ăn."
              />

              <MedicalCard
                title="Mục tiêu"
                value={result.targetCalories}
                unit="cal/ngày"
                subtitle="Calories cho mục tiêu"
                icon={Target}
                color="orange"
                description="Lượng calo khuyến nghị mỗi ngày để đạt được mục tiêu như giảm cân, tăng cân hoặc duy trì cân nặng, được tính toán dựa trên TDEE và mục tiêu cá nhân của bạn."
              />
            </div>
            {advice && !loading ? (
              <div
                className={` p-6 ${result.bgColor} rounded-lg border border-transparent`}
              >
                <div className="flex items-center space-x-3 mb-3">
                  <Shield className="h-6 w-6 text-teal-600" />
                  <h3 className="text-lg font-semibold text-gray-800">
                    Đánh giá sức khỏe
                  </h3>
                </div>

                <div className="text-sm text-gray-700 leading-relaxed mt-4">
                  {convertMarkdownToJSX(advice)}
                </div>
              </div>
            ) : (
              <div
                className={`p-6 ${result.bgColor} rounded-lg border border-transparent flex items-center space-x-4`}
              >
                <svg
                  className="animate-spin h-5 w-5 text-teal-600"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                  ></path>
                </svg>
                <span className="text-sm text-gray-700 font-medium">
                  Đang tính toán dữ liệu sức khỏe...
                </span>
              </div>
            )}{" "}
            <div className="bg-white rounded-lg p-8 shadow-sm border border-gray-200">
              <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                <Star className="h-6 w-6 mr-3 text-teal-600" />
                Thang đo BMI theo WHO
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-cyan-50 rounded-xl border border-cyan-100">
                  <p className="font-bold text-cyan-800 text-lg">{"<"}18.5</p>
                  <p className="text-sm text-cyan-700 font-medium">Thiếu cân</p>
                </div>
                <div className="text-center p-4 bg-teal-50 rounded-xl border border-teal-100">
                  <p className="font-bold text-teal-800 text-lg">18.5 - 24.9</p>
                  <p className="text-sm text-teal-700 font-medium">
                    Bình thường
                  </p>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-xl border border-orange-100">
                  <p className="font-bold text-orange-800 text-lg">25 - 29.9</p>
                  <p className="text-sm text-orange-700 font-medium">
                    Thừa cân
                  </p>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-xl border border-red-100">
                  <p className="font-bold text-red-800 text-lg">≥ 30</p>
                  <p className="text-sm text-red-700 font-medium">Béo phì</p>
                </div>
              </div>
            </div>
          </div>
        )}
        {/* Plan Tab */}

        {activeTab === "plan" && result && (
          <div className="space-y-8">
            {/* Nutrition Plan */}
            <div className="bg-white rounded-lg p-8 shadow-sm border border-gray-200">
              <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <Utensils className="h-6 w-6 mr-3 text-green-600" />
                Kế hoạch Dinh dưỡng
              </h3>
              <div className="grid lg:grid-cols-2 gap-4">
                {personalizedPlan.nutritionPlan.map((item, index) => (
                  <div
                    key={index}
                    className="bg-green-50 border border-green-100 p-4 rounded-xl text-gray-700"
                  >
                    <Salad className="h-5 w-5 inline text-green-600 mr-2" />
                    {item}
                  </div>
                ))}
              </div>
            </div>

            {/* Lifestyle Plan */}
            <div className="bg-white rounded-lg p-8 shadow-sm border border-gray-200">
              <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <Heart className="h-6 w-6 mr-3 text-orange-600" />
                Lối sống & Theo dõi
              </h3>
              <div className="grid lg:grid-cols-2 gap-4">
                {personalizedPlan.lifestylePlan.map((item, index) => (
                  <div
                    key={index}
                    className="bg-orange-50 border border-orange-100 p-4 rounded-xl text-gray-700"
                  >
                    <CheckCircle className="h-5 w-5 inline text-orange-600 mr-2" />
                    {item}
                  </div>
                ))}
              </div>
            </div>

            {/* Progress Tracking */}
            <div className="bg-white rounded-lg p-8 shadow-sm border border-gray-200">
              <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <TrendingUp className="h-6 w-6 mr-3 text-teal-600" />
                Theo dõi tiến trình
              </h3>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-teal-50 rounded-xl">
                  <Clock className="h-8 w-8 text-teal-600 mx-auto mb-2" />
                  <h4 className="font-semibold text-teal-800">Hàng ngày</h4>
                  <p className="text-sm text-gray-600">
                    Cân nặng, calories, bước chân
                  </p>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-xl">
                  <Calendar className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <h4 className="font-semibold text-blue-800">Hàng tuần</h4>
                  <p className="text-sm text-gray-600">
                    Đo body, chụp ảnh, đánh giá
                  </p>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-xl">
                  <Award className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                  <h4 className="font-semibold text-purple-800">Hàng tháng</h4>
                  <p className="text-sm text-gray-600">
                    Tái đánh giá, điều chỉnh kế hoạch
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
        {/* Medical Info Banner */}
        <div className="bg-white rounded-lg p-6 mt-6 mb-4 shadow-sm border border-teal-100">
          <div className="flex items-center space-x-4 mb-4">
            <Shield className="h-6 w-6 text-teal-600" />
            <h3 className="text-lg font-semibold text-gray-800">
              Thông tin y tế quan trọng
            </h3>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-3 p-3 bg-teal-50 rounded-xl">
              <Info className="h-5 w-5 text-teal-600" />
              <div>
                <p className="font-medium text-teal-800">Độ chính xác cao</p>
                <p className="text-sm text-teal-600">Dựa trên chuẩn y khoa</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-teal-50 rounded-xl">
              <Users className="h-5 w-5 text-teal-600" />
              <div>
                <p className="font-medium text-teal-800">Nhiều phương pháp</p>
                <p className="text-sm text-teal-600">Phù hợp mọi trường hợp</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-cyan-50 rounded-xl">
              <Award className="h-5 w-5 text-cyan-600" />
              <div>
                <p className="font-medium text-cyan-800">Tư vấn chuyên sâu</p>
                <p className="text-sm text-cyan-600">Theo dõi toàn diện</p>
              </div>
            </div>
          </div>
          <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
            <p className="text-sm text-yellow-800">
              <strong>Lưu ý:</strong> Đây chỉ là công cụ tham khảo. Hãy luôn
              tham khảo ý kiến bác sĩ để có lời khuyên chính xác nhất cho tình
              trạng sức khỏe của bạn.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BMICalculator;

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

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
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ValueSlider from "../../features/ValueSlider";
import AgeInputCard from "../../features/AgeInputCard";
import { useDispatch, useSelector } from "react-redux";
import { fetchUserHealthInfo } from "../../../services/health.service";
import ActivityLevelSelect from "../../features/ActivityLevelSelect";
import GoalSelect from "../../features/GoalSelect";
import Disclaimer from "../article/Disclaimer";
const BMICalculator = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { healthInfo } = useSelector((state) => state.health);
  const { user } = useSelector((state) => state.auth);
  const [weight, setWeight] = useState(healthInfo?.weight || "");
  const [height, setHeight] = useState(healthInfo?.height || "");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("male");
  const [activityLevel, setActivityLevel] = useState("moderate");
  const [goal, setGoal] = useState("maintain");
  const [result, setResult] = useState(null);
  const [activeTab, setActiveTab] = useState("calculator");

  const [isInitialLoaded, setIsInitialLoaded] = useState(false);

  useEffect(() => {
    dispatch(fetchUserHealthInfo());
  }, []);
  console.log({ healthInfo, user, activityLevel, goal });

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
    if (healthInfo && user) {
      setWeight(healthInfo.weight);
      setHeight(healthInfo.height);
      setAge(calculateAge(user?.dateOfBirth));
      setGender(user?.gender);
      setIsInitialLoaded(true); // Đánh dấu đã load xong dữ liệu
    }
  }, [healthInfo, user]);

  useEffect(() => {
    if (isInitialLoaded && weight && height && age && gender) {
      calculateBMI();
      setIsInitialLoaded(false); // Reset lại để không tính lại không cần thiết
    }
  }, [isInitialLoaded, weight, height, age, gender]);

  const calculateBMI = () => {
    if (weight && height && age) {
      const heightInMeters = height / 100;
      const bmi = (weight / (heightInMeters * heightInMeters)).toFixed(1);
      const weightNum = parseFloat(weight);
      const heightNum = parseFloat(height);
      const ageNum = parseFloat(age);

      // Tính BMR (Basal Metabolic Rate)
      let bmr;
      if (gender === "male") {
        bmr = 88.362 + 13.397 * weightNum + 4.799 * heightNum - 5.677 * ageNum;
      } else {
        bmr = 447.593 + 9.247 * weightNum + 3.098 * heightNum - 4.33 * ageNum;
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
        healthRisk = "Nguy cơ: Suy dinh dưỡng, giảm miễn dịch, loãng xương";
        detailedAdvice = {
          nutrition: [
            "Tăng lượng calories tiêu thụ hàng ngày (+300-500 cal)",
            "Ăn 5-6 bữa nhỏ thay vì 3 bữa lớn",
            "Bổ sung protein: thịt nạc, cá, trứng, sữa, đậu",
            "Chọn carbohydrate phức hợp: yến mạch, gạo lứt, khoai lang",
            "Thêm chất béo lành mạnh: bơ, hạt, dầu olive",
          ],
          exercise: [
            "Tập tạ để xây dựng cơ bắp (3-4 lần/tuần)",
            "Cardio nhẹ nhàng: đi bộ, bơi lội (2-3 lần/tuần)",
            "Yoga hoặc pilates để cải thiện tính linh hoạt",
            "Tránh tập luyện quá mức có thể đốt cháy calories",
          ],
          lifestyle: [
            "Ngủ đủ 7-9 tiếng/đêm để phục hồi cơ thể",
            "Quản lý stress hiệu quả",
            "Tham khảo ý kiến bác sĩ dinh dưỡng",
            "Theo dõi tiến triển hàng tuần",
          ],
        };
      } else if (bmi >= 18.5 && bmi < 25) {
        category = "Bình thường";
        color = "text-teal-700";
        bgColor = "bg-teal-50";
        healthRisk = "Nguy cơ thấp: Duy trì lối sống lành mạnh để giữ form";
        detailedAdvice = {
          nutrition: [
            "Duy trì chế độ ăn cân bằng với đủ 3 nhóm chất",
            "Ăn nhiều rau xanh, trái cây (5 phần/ngày)",
            "Protein: 0.8-1g/kg cân nặng",
            "Uống đủ nước: 2-3 lít/ngày",
            "Hạn chế đồ ăn chế biến sẵn, đường, muối",
          ],
          exercise: [
            "Cardio 150 phút/tuần (hoặc 75 phút cường độ cao)",
            "Tập tạ 2-3 lần/tuần để duy trì cơ bắp",
            "Hoạt động thể chất hàng ngày: đi bộ, đi cầu thang",
            "Thể thao giải trí: bóng đá, cầu lông, tennis",
          ],
          lifestyle: [
            "Duy trì thói quen tốt hiện tại",
            "Kiểm tra sức khỏe định kỳ",
            "Cân bằng giữa công việc và nghỉ ngơi",
            "Xây dựng mối quan hệ xã hội tích cực",
          ],
        };
      } else if (bmi >= 25 && bmi < 30) {
        category = "Thừa cân";
        color = "text-orange-700";
        bgColor = "bg-orange-50";
        healthRisk = "Nguy cơ vừa: Tiểu đường type 2, cao huyết áp, bệnh tim";
        detailedAdvice = {
          nutrition: [
            "Tạo deficil calories: -300-500 cal/ngày",
            "Tăng protein lên 1.2-1.6g/kg để giữ cơ bắp",
            "Giảm carbohydrate đơn, tăng chất xơ",
            "Kiểm soát portion size, dùng đĩa nhỏ hơn",
            "Intermittent fasting 16:8 (tùy chọn)",
          ],
          exercise: [
            "Cardio 300 phút/tuần (hoặc 150 phút cường độ cao)",
            "Tập tạ 3-4 lần/tuần để giữ cơ bắp khi giảm cân",
            "HIIT training 2-3 lần/tuần",
            "Tăng hoạt động NEAT: đi bộ, đứng nhiều hơn",
          ],
          lifestyle: [
            "Theo dõi calories và cân nặng hàng ngày",
            "Lập kế hoạch bữa ăn trước",
            "Tìm hỗ trợ từ gia đình, bạn bè",
            "Đặt mục tiêu nhỏ, thực tế (1-2kg/tháng)",
          ],
        };
      } else {
        category = "Béo phì";
        color = "text-red-700";
        bgColor = "bg-red-50";
        healthRisk = "Nguy cơ cao: Tiểu đường, tim mạch, ung thư, sleep apnea";
        detailedAdvice = {
          nutrition: [
            "Deficil calories lớn hơn: -500-750 cal/ngày",
            "Protein cao: 1.6-2.2g/kg để bảo vệ cơ bắp",
            "Low-carb hoặc keto diet (tham khảo BS)",
            "Meal prep và portion control nghiêm ngặt",
            "Tránh hoàn toàn đồ uống có đường",
          ],
          exercise: [
            "Bắt đầu từ đi bộ 30 phút/ngày",
            "Tập tạ nhẹ với trainer chuyên nghiệp",
            "Bơi lội - ít tác động lên khớp",
            "Tăng dần cường độ theo thời gian",
          ],
          lifestyle: [
            "Tham khảo bác sĩ chuyên khoa",
            "Cân nhắc phẫu thuật giảm béo nếu BMI >40",
            "Hỗ trợ tâm lý, nhóm hỗ trợ",
            "Theo dõi y tế định kỳ",
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

  const TabButton = ({ id, icon: Icon, label, isActive, onClick }) => (
    <button
      onClick={() => onClick(id)}
      className={`flex items-center space-x-2 px-4 py-1.5 text-sm rounded-md   transition-all duration-300 font-medium cursor-pointer shadow-sm ${
        isActive
          ? "bg-gradient-to-r from-teal-500 to-emerald-500 text-white shadow-lg transform "
          : "bg-white text-gray-700 hover:bg-teal-50 hover:text-teal-700 border border-gray-200"
      }`}
    >
      <Icon className="h-4 w-4" />
      <span>{label}</span>
    </button>
  );

  const MedicalCard = ({
    title,
    value,
    unit,
    subtitle,
    icon: Icon,
    color = "teal",
  }) => (
    <div
      className={`bg-white p-6 rounded-2xl shadow-sm border border-${color}-100 hover:shadow-md transition-all duration-200`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className={`p-3 rounded-xl bg-${color}-50`}>
          <Icon className={`h-6 w-6 text-${color}-600`} />
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-gray-800">{value}</p>
          <p className={`text-sm text-${color}-600 font-medium`}>{unit}</p>
        </div>
      </div>
      <h3 className="font-semibold text-gray-800 mb-1">{title}</h3>
      <p className="text-sm text-gray-600">{subtitle}</p>
    </div>
  );

  return (
    <div className="min-h-screen  to-cyan-50 font-['Nunito']">
      <div className="w-full mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-teal-600 hover:text-teal-800 mr-6 px-4 py-2 rounded-lg hover:bg-teal-50 transition-colors cursor-pointer"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Quay lại
          </button>
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-white rounded-xl shadow-sm">
              <Stethoscope className="h-8 w-8 text-teal-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">
                Đánh giá Sức khỏe & BMI
              </h1>
              <p className="text-gray-600 mt-1">
                Công cụ chuyên nghiệp cho sức khỏe tổng quan
              </p>
            </div>
          </div>
        </div>
        {/* Tab Navigation */}
        <div className="flex space-x-3 mb-3 overflow-x-auto pb-2">
          <TabButton
            id="calculator"
            icon={Activity}
            label="Tính BMI"
            isActive={activeTab === "calculator"}
            onClick={setActiveTab}
          />
          {result && (
            <>
              <TabButton
                id="results"
                icon={TrendingUp}
                label="Kết quả Chi tiết"
                isActive={activeTab === "results"}
                onClick={setActiveTab}
              />
              <TabButton
                id="nutrition"
                icon={Utensils}
                label="Dinh dưỡng"
                isActive={activeTab === "nutrition"}
                onClick={setActiveTab}
              />
              <TabButton
                id="exercise"
                icon={Dumbbell}
                label="Tập luyện"
                isActive={activeTab === "exercise"}
                onClick={setActiveTab}
              />
              <TabButton
                id="plan"
                icon={Calendar}
                label="Kế hoạch"
                isActive={activeTab === "plan"}
                onClick={setActiveTab}
              />
            </>
          )}
        </div>
        {/* Calculator Tab */}
        {activeTab === "calculator" && (
          <div className="grid lg:grid-cols-2 gap-8">
            <div className="bg-white rounded-lg p-8 shadow-sm border border-gray-200">
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
                      max={500}
                      step={1}
                    />
                  </div>
                  <div>
                    <ValueSlider
                      label="chiều cao (cm)"
                      value={height}
                      onChange={setHeight}
                      min={1}
                      max={300}
                      step={1}
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
                      {gender && !gender ? (
                        <VenusAndMars className="text-teal-600 h-5 w-5" />
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
                  onClick={calculateBMI}
                  className="w-full bg-gradient-to-r from-teal-500 to-emerald-500 text-white py-3 px-6 rounded-lg cursor-pointer hover:from-teal-600 hover:to-emerald-600 transition-all font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  <Activity className="h-5 w-5 mr-2 inline" />
                  Tính BMI & Phân tích Sức khỏe
                </button>
              </div>
            </div>

            {result && (
              <div className="space-y-6">
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
                  color="emerald"
                />

                <MedicalCard
                  title="Cân nặng lý tưởng"
                  value={`${result.idealWeightMin}-${result.idealWeightMax}`}
                  unit="kg"
                  subtitle="Khoảng cân nặng tối ưu"
                  icon={Target}
                  color="cyan"
                />

                <div
                  className={`p-6 ${result.bgColor} rounded-2xl border border-teal-100`}
                >
                  <div className="flex items-center space-x-3 mb-3">
                    <Shield className="h-6 w-6 text-teal-600" />
                    <h3 className="text-lg font-semibold text-gray-800">
                      Đánh giá sức khỏe
                    </h3>
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {result.healthRisk}
                  </p>
                </div>
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
              />
              <MedicalCard
                title="BMR"
                value={result.bmr}
                unit="cal/ngày"
                subtitle="Tỷ lệ trao đổi chất cơ bản"
                icon={Activity}
                color="emerald"
              />
              <MedicalCard
                title="TDEE"
                value={result.tdee}
                unit="cal/ngày"
                subtitle="Tổng năng lượng tiêu hao"
                icon={Dumbbell}
                color="cyan"
              />
              <MedicalCard
                title="Mục tiêu"
                value={result.targetCalories}
                unit="cal/ngày"
                subtitle="Calories cho mục tiêu"
                icon={Target}
                color="orange"
              />
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200">
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

            <div
              className={`p-8 ${result.bgColor} rounded-2xl border border-teal-100`}
            >
              <div className="flex items-center space-x-3 mb-6">
                <AlertCircle className="h-6 w-6 text-teal-600" />
                <h3 className="text-xl font-bold text-gray-800">
                  Đánh giá rủi ro sức khỏe
                </h3>
              </div>
              <p className="text-gray-700 leading-relaxed mb-4">
                {result.healthRisk}
              </p>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Shield className="h-4 w-4" />
                <span>Kết quả dựa trên tiêu chuẩn y tế quốc tế</span>
              </div>
            </div>
          </div>
        )}
        {/* Nutrition Tab */}
        {activeTab === "nutrition" && result && (
          <div className="space-y-8">
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200">
              <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <Utensils className="h-6 w-6 mr-3 text-emerald-600" />
                Kế hoạch Dinh dưỡng Y tế
              </h3>
              <div className="grid lg:grid-cols-2 gap-8">
                {result.detailedAdvice.nutrition.map((item, index) => (
                  <div
                    key={index}
                    className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl text-gray-700"
                  >
                    <CheckCircle className="h-5 w-5 inline text-emerald-600 mr-2" />
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        {/* Exercise Tab */}
        {activeTab === "exercise" && result && (
          <div className="space-y-8">
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200">
              <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <Dumbbell className="h-6 w-6 mr-3 text-cyan-600" />
                Kế hoạch Tập luyện
              </h3>

              <div className="grid lg:grid-cols-2 gap-8">
                {result.detailedAdvice.exercise.map((item, index) => (
                  <div
                    key={index}
                    className="bg-cyan-50 border border-cyan-100 p-4 rounded-xl text-gray-700"
                  >
                    <CheckCircle className="h-5 w-5 inline text-cyan-600 mr-2" />
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        {/* Plan Tab */}
        {activeTab === "plan" && result && (
          <div className="space-y-8">
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200">
              <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <Calendar className="h-6 w-6 mr-3 text-orange-600" />
                Lối sống & Kế hoạch theo dõi
              </h3>

              <div className="grid lg:grid-cols-2 gap-8">
                {result.detailedAdvice.lifestyle.map((item, index) => (
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
          </div>
        )}{" "}
        {/* Medical Info Banner */}
        <div className="bg-white rounded-lg p-6  mt-6 mb-4 shadow-sm border border-teal-100">
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
                <p className="text-sm text-teal-600">Dựa trên chuẩn WHO</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-emerald-50 rounded-xl">
              <Users className="h-5 w-5 text-emerald-600" />
              <div>
                <p className="font-medium text-emerald-800">Cá nhân hóa</p>
                <p className="text-sm text-emerald-600">Phù hợp với bạn</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-cyan-50 rounded-xl">
              <Award className="h-5 w-5 text-cyan-600" />
              <div>
                <p className="font-medium text-cyan-800">
                  Khuyến nghị chuyên sâu
                </p>
                <p className="text-sm text-cyan-600">Từ chuyên gia</p>
              </div>
            </div>
          </div>
        </div>
        <Disclaimer />
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

import React, { useState, useEffect } from "react";
import {
  Heart,
  Activity,
  User,
  Weight,
  Ruler,
  Calendar,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle,
  Edit3,
  Save,
  X,
  Plus,
  BarChart3,
  Target,
  Zap,
  Shield,
  Droplets,
  Calculator,
  Brain,
  Timer,
  Flame,
  Mountain,
  Eye,
  Thermometer,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { fetchUserHealthInfo } from "../../../services/health.service";

const HealthInfo = () => {
  const dispatch = useDispatch();
  const { loading, error, healthInfo } = useSelector((state) => state.health);
  // Mock data - replace with actual Redux state

  useEffect(() => {
    dispatch(fetchUserHealthInfo());
  }, []);

  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    weight: "",
    height: "",
    waist: "",
    hip: "",
    neck: "",
    bloodType: "",
    heartRate: "",
    chronicDiseases: [],
    allergies: [],
    activityLevel: "",
    gender: "",
    goal: "",
    age: "",
  });

  useEffect(() => {
    if (healthInfo) {
      setEditData({
        weight: healthInfo.weight || "",
        height: healthInfo.height || "",
        waist: healthInfo.waist || "",
        hip: healthInfo.hip || "",
        neck: healthInfo.neck || "",
        bloodType: healthInfo.bloodType || "",
        heartRate: healthInfo.heartRate || 0,
        chronicDiseases: healthInfo.chronicDiseases || [],
        allergies: healthInfo.allergies || [],
        activityLevel: healthInfo.activityLevel || "",
        gender: healthInfo.gender || "",
        goal: healthInfo.goal || "",
        age: healthInfo.age || "",
      });
    }
  }, [healthInfo]);

  // Health calculations
  const calculateBMI = () => {
    if (!healthInfo?.height || !healthInfo?.weight) return null;
    const heightInM = healthInfo.height / 100;
    return (healthInfo.weight / (heightInM * heightInM)).toFixed(1);
  };

  const getBMICategory = () => {
    const bmi = calculateBMI();
    if (!bmi) return null;
    const bmiNum = parseFloat(bmi);

    if (bmiNum < 18.5)
      return {
        level: "Thiếu cân",
        color: "blue",
        description: "BMI dưới mức bình thường",
      };
    if (bmiNum < 24.9)
      return {
        level: "Bình thường",
        color: "teal",
        description: "BMI trong khoảng khỏe mạnh",
      };
    if (bmiNum < 29.9)
      return {
        level: "Thừa cân",
        color: "yellow",
        description: "BMI cao hơn mức khuyến nghị",
      };
    return {
      level: "Béo phì",
      color: "red",
      description: "BMI ở mức nguy hiểm",
    };
  };

  const calculateWHR = () => {
    if (!healthInfo?.waist || !healthInfo?.hip) return null;
    return (healthInfo.waist / healthInfo.hip).toFixed(2);
  };

  const getWHRRisk = () => {
    const whr = calculateWHR();
    if (!whr || !healthInfo?.gender) return null;
    const whrNum = parseFloat(whr);
    const isFemale = healthInfo.gender === "female";

    if (isFemale) {
      if (whrNum < 0.8) return { level: "Thấp", color: "teal" };
      if (whrNum < 0.85) return { level: "Trung bình", color: "yellow" };
      return { level: "Cao", color: "red" };
    } else {
      if (whrNum < 0.9) return { level: "Thấp", color: "teal" };
      if (whrNum < 0.95) return { level: "Trung bình", color: "yellow" };
      return { level: "Cao", color: "red" };
    }
  };

  const calculateBodyFat = () => {
    if (
      !healthInfo?.waist ||
      !healthInfo?.neck ||
      !healthInfo?.height ||
      !healthInfo?.gender
    )
      return null;

    // US Navy Method for women
    if (healthInfo.gender === "female" && healthInfo.hip) {
      const logValue = Math.log10(
        healthInfo.waist + healthInfo.hip - healthInfo.neck
      );
      const heightLog = Math.log10(healthInfo.height);
      return (
        495 / (1.29579 - 0.35004 * logValue + 0.221 * heightLog) -
        450
      ).toFixed(1);
    }

    // US Navy Method for men
    const logValue = Math.log10(healthInfo.waist - healthInfo.neck);
    const heightLog = Math.log10(healthInfo.height);
    return (
      495 / (1.0324 - 0.19077 * logValue + 0.15456 * heightLog) -
      450
    ).toFixed(1);
  };

  const calculateBMR = () => {
    if (
      !healthInfo?.weight ||
      !healthInfo?.height ||
      !healthInfo?.age ||
      !healthInfo?.gender
    )
      return null;

    // Mifflin-St Jeor Equation
    if (healthInfo.gender === "female") {
      return (
        10 * healthInfo.weight +
        6.25 * healthInfo.height -
        5 * healthInfo.age -
        161
      ).toFixed(0);
    } else {
      return (
        10 * healthInfo.weight +
        6.25 * healthInfo.height -
        5 * healthInfo.age +
        5
      ).toFixed(0);
    }
  };

  const calculateTDEE = () => {
    const bmr = calculateBMR();
    if (!bmr || !healthInfo?.activityLevel) return null;

    const activityMultipliers = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      active: 1.725,
      extra: 1.9,
    };

    const multiplier = activityMultipliers[healthInfo.activityLevel] || 1.55;
    return (parseFloat(bmr) * multiplier).toFixed(0);
  };

  const getHeartRateZones = () => {
    if (!healthInfo?.age) return null;
    const maxHR = 220 - healthInfo.age;

    return {
      resting: { min: 50, max: 90, color: "blue" },
      fat_burn: {
        min: Math.round(maxHR * 0.5),
        max: Math.round(maxHR * 0.69),
        color: "green",
      },
      cardio: {
        min: Math.round(maxHR * 0.7),
        max: Math.round(maxHR * 0.84),
        color: "orange",
      },
      peak: { min: Math.round(maxHR * 0.85), max: maxHR, color: "red" },
    };
  };

  const getIdealWeight = () => {
    if (!healthInfo?.height || !healthInfo?.gender) return null;

    // Robinson Formula
    const heightInInches = healthInfo.height / 2.54;
    if (healthInfo.gender === "female") {
      return (49 + 1.7 * (heightInInches - 60)).toFixed(1);
    } else {
      return (52 + 1.9 * (heightInInches - 60)).toFixed(1);
    }
  };

  const handleEdit = () => setIsEditing(true);
  const handleCancel = () => setIsEditing(false);
  const handleSave = () => {
    setIsEditing(false);
  };

  const StatCard = ({
    icon: Icon,
    label,
    value,
    color = "teal",
    trend = null,
    description = "",
  }) => (
    <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300">
      <div className="flex items-center justify-between mb-3">
        <div className={`p-2 rounded-lg bg-${color}-50`}>
          <Icon className={`h-5 w-5 text-${color}-600`} />
        </div>
        {trend && (
          <div
            className={`flex items-center text-xs ${
              trend > 0 ? "text-green-600" : "text-red-600"
            }`}
          >
            {trend > 0 ? (
              <TrendingUp className="h-3 w-3 mr-1" />
            ) : (
              <TrendingDown className="h-3 w-3 mr-1" />
            )}
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      <div className="space-y-1">
        <p className="text-xl font-bold text-gray-900">{value}</p>
        <p className="text-xs text-gray-600">{label}</p>
        {description && <p className="text-xs text-gray-500">{description}</p>}
      </div>
    </div>
  );

  const InputField = ({
    label,
    value,
    onChange,
    type = "text",
    placeholder,
    disabled = false,
    options = null,
  }) => (
    <div className="space-y-1">
      <label className="text-xs font-medium text-gray-700">{label}</label>
      {options ? (
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200 disabled:bg-gray-50 text-sm"
        >
          <option value="">Chọn...</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200 disabled:bg-gray-50 text-sm"
        />
      )}
    </div>
  );

  const bmi = calculateBMI();
  const bmiCategory = getBMICategory();
  const whr = calculateWHR();
  const whrRisk = getWHRRisk();
  const bodyFat = calculateBodyFat();
  const bmr = calculateBMR();
  const tdee = calculateTDEE();
  const heartRateZones = getHeartRateZones();
  const idealWeight = getIdealWeight();

  return (
    <div className="flex-1 flex flex-col gap-4 p-4 overflow-y-auto bg-gray-50">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">
            Thông tin sức khỏe
          </h1>
          <p className="text-sm text-gray-600">
            Theo dõi và quản lý tình trạng sức khỏe của bạn
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {!isEditing ? (
            <button
              onClick={handleEdit}
              className="flex items-center space-x-2 px-3 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors duration-200 text-sm"
            >
              <Edit3 className="h-4 w-4" />
              <span>Chỉnh sửa</span>
            </button>
          ) : (
            <div className="flex items-center space-x-2">
              <button
                onClick={handleSave}
                className="flex items-center space-x-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 text-sm"
              >
                <Save className="h-4 w-4" />
                <span>Lưu</span>
              </button>
              <button
                onClick={handleCancel}
                className="flex items-center space-x-2 px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200 text-sm"
              >
                <X className="h-4 w-4" />
                <span>Hủy</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* BMI & Key Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* BMI Card */}
        {bmi && bmiCategory && (
          <div className="lg:col-span-2 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-lg p-4 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold mb-2">Chỉ số BMI</h3>
                <p className="text-2xl font-bold">{bmi}</p>
                <p className="text-sm mt-1">Tình trạng: {bmiCategory.level}</p>
                <p className="text-xs mt-1 opacity-90">
                  {bmiCategory.description}
                </p>
              </div>
              <div className="p-3 bg-white/20 rounded-lg">
                <Activity className="h-6 w-6" />
              </div>
            </div>
            <div className="mt-3 p-3 bg-white/10 rounded-lg">
              <p className="text-xs font-medium">Cân nặng lý tưởng:</p>
              <p className="text-sm">
                {idealWeight ? `${idealWeight} kg` : "Chưa tính được"}
              </p>
            </div>
          </div>
        )}

        {/* Quick Stats */}
        <div className="space-y-3">
          <StatCard
            icon={Calculator}
            label="WHR"
            value={whr ? whr : "chưa cập nhật"}
            color={whrRisk?.color || "gray"}
            description={whrRisk?.level || ""}
          />
          <StatCard
            icon={Flame}
            label="BMR"
            value={bmr ? `${bmr} cal` : "chưa cập nhật"}
            color="orange"
            description="Tỷ lệ trao đổi chất cơ bản"
          />
        </div>
      </div>

      {/* Detailed Health Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        <StatCard
          icon={Weight}
          label="Cân nặng"
          value={
            healthInfo?.weight ? `${healthInfo.weight} kg` : "chưa cập nhật"
          }
          color="teal"
        />
        <StatCard
          icon={Ruler}
          label="Chiều cao"
          value={
            healthInfo?.height ? `${healthInfo.height} cm` : "chưa cập nhật"
          }
          color="cyan"
        />
        <StatCard
          icon={Heart}
          label="Nhịp tim"
          value={
            healthInfo?.heartRate
              ? `${healthInfo.heartRate} bpm`
              : "chưa cập nhật"
          }
          color="red"
        />
        <StatCard
          icon={Droplets}
          label="Nhóm máu"
          value={healthInfo?.bloodType || "chưa cập nhật"}
          color="purple"
        />
        <StatCard
          icon={Target}
          label="Body Fat"
          value={bodyFat ? `${bodyFat}%` : "chưa cập nhật"}
          color="indigo"
        />
        <StatCard
          icon={Zap}
          label="TDEE"
          value={tdee ? `${tdee} cal` : "chưa cập nhật"}
          color="yellow"
        />
      </div>

      {/* Heart Rate Zones */}
      {heartRateZones && (
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold mb-3 flex items-center">
            <Heart className="h-5 w-5 mr-2 text-red-600" />
            Vùng nhịp tim tối ưu (Tuổi: {healthInfo?.age})
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-xs font-medium text-blue-800">Nghỉ ngơi</p>
              <p className="text-sm font-bold text-blue-700">
                {heartRateZones.resting.min}-{heartRateZones.resting.max}
              </p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg border border-green-200">
              <p className="text-xs font-medium text-green-800">Đốt mỡ</p>
              <p className="text-sm font-bold text-green-700">
                {heartRateZones.fat_burn.min}-{heartRateZones.fat_burn.max}
              </p>
            </div>
            <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
              <p className="text-xs font-medium text-orange-800">Tim mạch</p>
              <p className="text-sm font-bold text-orange-700">
                {heartRateZones.cardio.min}-{heartRateZones.cardio.max}
              </p>
            </div>
            <div className="p-3 bg-red-50 rounded-lg border border-red-200">
              <p className="text-xs font-medium text-red-800">Tối đa</p>
              <p className="text-sm font-bold text-red-700">
                {heartRateZones.peak.min}-{heartRateZones.peak.max}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Health Info Form */}
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <User className="h-5 w-5 mr-2 text-teal-600" />
            Thông tin cá nhân
          </h3>

          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <InputField
                label="Cân nặng (kg)"
                value={editData.weight}
                onChange={(value) =>
                  setEditData({ ...editData, weight: value })
                }
                type="number"
                placeholder="Nhập cân nặng"
                disabled={!isEditing}
              />
              <InputField
                label="Chiều cao (cm)"
                value={editData.height}
                onChange={(value) =>
                  setEditData({ ...editData, height: value })
                }
                type="number"
                placeholder="Nhập chiều cao"
                disabled={!isEditing}
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <InputField
                label="Vòng eo (cm)"
                value={editData.waist}
                onChange={(value) => setEditData({ ...editData, waist: value })}
                type="number"
                placeholder="Vòng eo"
                disabled={!isEditing}
              />
              <InputField
                label="Vòng hông (cm)"
                value={editData.hip}
                onChange={(value) => setEditData({ ...editData, hip: value })}
                type="number"
                placeholder="Vòng hông"
                disabled={!isEditing}
              />
              <InputField
                label="Vòng cổ (cm)"
                value={editData.neck}
                onChange={(value) => setEditData({ ...editData, neck: value })}
                type="number"
                placeholder="Vòng cổ"
                disabled={!isEditing}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <InputField
                label="Nhóm máu"
                value={editData.bloodType}
                onChange={(value) =>
                  setEditData({ ...editData, bloodType: value })
                }
                options={[
                  { value: "A", label: "A" },
                  { value: "B", label: "B" },
                  { value: "AB", label: "AB" },
                  { value: "O", label: "O" },
                ]}
                disabled={!isEditing}
              />
              <InputField
                label="Nhịp tim (bpm)"
                value={editData.heartRate}
                onChange={(value) =>
                  setEditData({ ...editData, heartRate: value })
                }
                type="number"
                placeholder="Nhịp tim"
                disabled={!isEditing}
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <InputField
                label="Tuổi"
                value={editData.age}
                onChange={(value) => setEditData({ ...editData, age: value })}
                type="number"
                placeholder="Tuổi"
                disabled={!isEditing}
              />
              <InputField
                label="Giới tính"
                value={editData.gender}
                onChange={(value) =>
                  setEditData({ ...editData, gender: value })
                }
                options={[
                  { value: "male", label: "Nam" },
                  { value: "female", label: "Nữ" },
                ]}
                disabled={!isEditing}
              />
              <InputField
                label="Mức độ hoạt động"
                value={editData.activityLevel}
                onChange={(value) =>
                  setEditData({ ...editData, activityLevel: value })
                }
                options={[
                  { value: "sedentary", label: "Ít vận động" },
                  { value: "light", label: "Nhẹ" },
                  { value: "moderate", label: "Vừa" },
                  { value: "active", label: "Tích cực" },
                  { value: "extra", label: "Rất tích cực" },
                ]}
                disabled={!isEditing}
              />
            </div>
          </div>
        </div>

        {/* Health Status & Analysis */}
        <div className="space-y-4">
          {/* Current Health Status */}
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold mb-3 flex items-center">
              <Shield className="h-5 w-5 mr-2 text-purple-600" />
              Tình trạng sức khỏe
            </h3>

            <div className="space-y-3">
              {healthInfo?.chronicDiseases &&
                healthInfo.chronicDiseases.length > 0 && (
                  <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                    <h4 className="font-medium text-red-800 mb-2 text-sm">
                      Bệnh mãn tính
                    </h4>
                    <div className="flex flex-wrap gap-1">
                      {healthInfo.chronicDiseases.map((disease, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full"
                        >
                          {disease}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

              {healthInfo?.allergies && healthInfo.allergies.length > 0 && (
                <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                  <h4 className="font-medium text-orange-800 mb-2 text-sm">
                    Dị ứng
                  </h4>
                  <div className="flex flex-wrap gap-1">
                    {healthInfo.allergies.map((allergy, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded-full"
                      >
                        {allergy}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {(!healthInfo?.chronicDiseases ||
                healthInfo.chronicDiseases.length === 0) &&
                (!healthInfo?.allergies ||
                  healthInfo.allergies.length === 0) && (
                  <div className="p-3 bg-teal-50 rounded-lg border border-teal-200">
                    <h4 className="font-medium text-teal-800 mb-1 text-sm">
                      Tình trạng tốt
                    </h4>
                    <p className="text-xs text-teal-700">
                      Không có bệnh mãn tính hoặc dị ứng được ghi nhận.
                    </p>
                  </div>
                )}
            </div>
          </div>

          {/* Health Analysis */}
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold mb-3 flex items-center">
              <Brain className="h-5 w-5 mr-2 text-cyan-600" />
              Phân tích sức khỏe
            </h3>

            <div className="space-y-3">
              <div className="p-3 bg-teal-50 rounded-lg border border-teal-200">
                <h4 className="font-medium text-teal-800 mb-1 text-sm">
                  Đánh giá tổng thể
                </h4>
                <p className="text-xs text-teal-700">
                  BMI: {bmiCategory?.level || "chưa cập nhật"} • WHR:{" "}
                  {whrRisk?.level || "chưa cập nhật"} nguy cơ •
                  {bodyFat && ` Body Fat: ${bodyFat}%`}
                </p>
              </div>

              <div className="p-3 bg-cyan-50 rounded-lg border border-cyan-200">
                <h4 className="font-medium text-cyan-800 mb-1 text-sm">
                  Khuyến nghị dinh dưỡng
                </h4>
                <p className="text-xs text-cyan-700">
                  TDEE: {tdee ? `${tdee} calories/ngày` : "Chưa tính được"} •
                  Mục tiêu:{" "}
                  {healthInfo?.goal === "gain"
                    ? "Tăng cân"
                    : healthInfo?.goal === "lose"
                    ? "Giảm cân"
                    : "Duy trì"}
                </p>
              </div>

              <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                <h4 className="font-medium text-purple-800 mb-1 text-sm">
                  Hoạt động thể chất
                </h4>
                <p className="text-xs text-purple-700">
                  Mức độ:{" "}
                  {healthInfo?.activityLevel === "active"
                    ? "Tích cực"
                    : "Cần cải thiện"}{" "}
                  • Nhịp tim mục tiêu:{" "}
                  {heartRateZones
                    ? `${heartRateZones.cardio.min}-${heartRateZones.cardio.max} bpm`
                    : "chưa cập nhật"}
                </p>
              </div>

              <div className="p-3 bg-indigo-50 rounded-lg border border-indigo-200">
                <h4 className="font-medium text-indigo-800 mb-1 text-sm">
                  Lời khuyên
                </h4>
                <p className="text-xs text-indigo-700">
                  {bmiCategory?.level === "Bình thường"
                    ? "Duy trì chế độ ăn uống và tập luyện hiện tại"
                    : bmiCategory?.level === "Thiếu cân"
                    ? "Tăng cường dinh dưỡng và xây dựng cơ bắp"
                    : "Giảm cân thông qua chế độ ăn và tập luyện"}
                </p>
              </div>
            </div>
          </div>

          {/* Goal Setting */}
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold mb-3 flex items-center">
              <Target className="h-5 w-5 mr-2 text-green-600" />
              Mục tiêu cá nhân
            </h3>

            <div className="space-y-3">
              <InputField
                label="Mục tiêu"
                value={editData.goal}
                onChange={(value) => setEditData({ ...editData, goal: value })}
                options={[
                  { value: "lose", label: "Giảm cân" },
                  { value: "maintain", label: "Duy trì" },
                  { value: "gain", label: "Tăng cân" },
                ]}
                disabled={!isEditing}
              />

              {healthInfo?.goal && (
                <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                  <h4 className="font-medium text-green-800 mb-1 text-sm">
                    Mục tiêu hiện tại:{" "}
                    {healthInfo.goal === "gain"
                      ? "Tăng cân"
                      : healthInfo.goal === "lose"
                      ? "Giảm cân"
                      : "Duy trì cân nặng"}
                  </h4>
                  <p className="text-xs text-green-700">
                    {healthInfo.goal === "gain"
                      ? `Tăng 300-500 calories so với TDEE (${
                          tdee ? parseInt(tdee) + 400 : "chưa cập nhật"
                        } cal/ngày)`
                      : healthInfo.goal === "lose"
                      ? `Giảm 300-500 calories so với TDEE (${
                          tdee ? parseInt(tdee) - 400 : "chưa cập nhật"
                        } cal/ngày)`
                      : `Duy trì ở mức TDEE (${
                          tdee || "chưa cập nhật"
                        } cal/ngày)`}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Health Progress Tracking */}
      <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold mb-3 flex items-center">
          <BarChart3 className="h-5 w-5 mr-2 text-blue-600" />
          Theo dõi tiến trình
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Weight Progress */}
          <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="font-medium text-blue-800 mb-2 text-sm">Cân nặng</h4>
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-blue-700">Hiện tại:</span>
                <span className="font-medium text-blue-800">
                  {healthInfo?.weight || "chưa cập nhật"} kg
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-blue-700">Lý tưởng:</span>
                <span className="font-medium text-blue-800">
                  {idealWeight || "chưa cập nhật"} kg
                </span>
              </div>
              {healthInfo?.weight && idealWeight && (
                <div className="w-full bg-blue-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${Math.min(
                        100,
                        Math.max(
                          0,
                          (healthInfo.weight / parseFloat(idealWeight)) * 100
                        )
                      )}%`,
                    }}
                  ></div>
                </div>
              )}
            </div>
          </div>

          {/* BMI Progress */}
          <div className="p-3 bg-teal-50 rounded-lg border border-teal-200">
            <h4 className="font-medium text-teal-800 mb-2 text-sm">BMI</h4>
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-teal-700">Hiện tại:</span>
                <span className="font-medium text-teal-800">
                  {bmi || "chưa cập nhật"}
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-teal-700">Mục tiêu:</span>
                <span className="font-medium text-teal-800">18.5-24.9</span>
              </div>
              {bmi && (
                <div className="w-full bg-teal-200 rounded-full h-2">
                  <div
                    className="bg-teal-600 h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${Math.min(
                        100,
                        Math.max(0, ((parseFloat(bmi) - 15) / 15) * 100)
                      )}%`,
                    }}
                  ></div>
                </div>
              )}
            </div>
          </div>

          {/* Heart Rate */}
          <div className="p-3 bg-red-50 rounded-lg border border-red-200">
            <h4 className="font-medium text-red-800 mb-2 text-sm">
              Nhịp tim nghỉ
            </h4>
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-red-700">Hiện tại:</span>
                <span className="font-medium text-red-800">
                  {healthInfo?.heartRate || "chưa cập nhật"} bpm
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-red-700">Lý tưởng:</span>
                <span className="font-medium text-red-800">60-80 bpm</span>
              </div>
              {healthInfo?.heartRate && (
                <div className="w-full bg-red-200 rounded-full h-2">
                  <div
                    className="bg-red-600 h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${Math.min(
                        100,
                        Math.max(0, ((100 - healthInfo.heartRate) / 40) * 100)
                      )}%`,
                    }}
                  ></div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Health Tips */}
      <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold mb-3 flex items-center">
          <Eye className="h-5 w-5 mr-2 text-amber-600" />
          Lời khuyên sức khỏe
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
            <div className="flex items-center mb-2">
              <Droplets className="h-4 w-4 text-amber-600 mr-2" />
              <h4 className="font-medium text-amber-800 text-sm">Hydration</h4>
            </div>
            <p className="text-xs text-amber-700">
              Uống ít nhất{" "}
              {healthInfo?.weight ? Math.round(healthInfo.weight * 35) : "2000"}
              ml nước mỗi ngày (35ml/kg cân nặng)
            </p>
          </div>

          <div className="p-3 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center mb-2">
              <Timer className="h-4 w-4 text-green-600 mr-2" />
              <h4 className="font-medium text-green-800 text-sm">Giấc ngủ</h4>
            </div>
            <p className="text-xs text-green-700">
              Ngủ 7-9 giờ mỗi đêm để cơ thể phục hồi và trao đổi chất tốt nhất
            </p>
          </div>

          <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
            <div className="flex items-center mb-2">
              <Mountain className="h-4 w-4 text-purple-600 mr-2" />
              <h4 className="font-medium text-purple-800 text-sm">Vận động</h4>
            </div>
            <p className="text-xs text-purple-700">
              {healthInfo?.activityLevel === "sedentary"
                ? "Tăng hoạt động với 30 phút đi bộ mỗi ngày"
                : "Duy trì chế độ tập luyện hiện tại và thêm strength training"}
            </p>
          </div>
        </div>
      </div>

      {/* Emergency Contacts & Health Alerts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold mb-3 flex items-center">
            <AlertCircle className="h-5 w-5 mr-2 text-red-600" />
            Cảnh báo sức khỏe
          </h3>

          <div className="space-y-2">
            {bmi && parseFloat(bmi) > 30 && (
              <div className="p-2 bg-red-50 rounded border border-red-200">
                <p className="text-xs text-red-700">
                  <strong>Cảnh báo:</strong> BMI ở mức béo phì. Hãy tham khảo ý
                  kiến bác sĩ.
                </p>
              </div>
            )}

            {healthInfo?.heartRate && healthInfo.heartRate > 100 && (
              <div className="p-2 bg-orange-50 rounded border border-orange-200">
                <p className="text-xs text-orange-700">
                  <strong>Lưu ý:</strong> Nhịp tim nghỉ cao. Theo dõi thêm và
                  tham khảo bác sĩ.
                </p>
              </div>
            )}

            {whr &&
              parseFloat(whr) >
                (healthInfo?.gender === "female" ? 0.85 : 0.95) && (
                <div className="p-2 bg-yellow-50 rounded border border-yellow-200">
                  <p className="text-xs text-yellow-700">
                    <strong>Chú ý:</strong> Tỷ lệ vòng eo/hông cao - nguy cơ tim
                    mạch.
                  </p>
                </div>
              )}

            {(!healthInfo?.chronicDiseases ||
              healthInfo.chronicDiseases.length === 0) &&
              (!healthInfo?.allergies || healthInfo.allergies.length === 0) &&
              bmi &&
              parseFloat(bmi) >= 18.5 &&
              parseFloat(bmi) <= 24.9 && (
                <div className="p-2 bg-green-50 rounded border border-green-200">
                  <p className="text-xs text-green-700">
                    <CheckCircle className="h-3 w-3 inline mr-1" />
                    <strong>Tốt:</strong> Các chỉ số sức khỏe trong khoảng bình
                    thường.
                  </p>
                </div>
              )}
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold mb-3 flex items-center">
            <Thermometer className="h-5 w-5 mr-2 text-blue-600" />
            Thông tin quan trọng
          </h3>

          <div className="space-y-3">
            <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
              <span className="text-xs text-gray-600">Nhóm máu:</span>
              <span className="text-xs font-medium text-gray-800">
                {healthInfo?.bloodType || "chưa cập nhật"}
              </span>
            </div>

            <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
              <span className="text-xs text-gray-600">BMR:</span>
              <span className="text-xs font-medium text-gray-800">
                {bmr || "chưa cập nhật"} cal/ngày
              </span>
            </div>

            <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
              <span className="text-xs text-gray-600">TDEE:</span>
              <span className="text-xs font-medium text-gray-800">
                {tdee || "chưa cập nhật"} cal/ngày
              </span>
            </div>

            <div className="text-xs text-gray-500 mt-3">
              Cập nhật lần cuối: {new Date().toLocaleDateString("vi-VN")}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HealthInfo;

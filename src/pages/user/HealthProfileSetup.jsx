import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  User,
  Heart,
  Target,
  Activity,
  Phone,
  Calendar,
  Ruler,
  Weight,
  Users,
  Droplet,
  Monitor,
  Info,
  CheckCircle,
  Star,
  Shield,
  Coffee,
  Bed,
  PersonStanding,
  Bike,
  Zap,
  AlertTriangle,
} from "lucide-react";
import ActivityLevelSelect from "../../components/features/ActivityLevelSelect";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllTopics } from "../../services/topic.service";
import GoalSelect from "../../components/features/GoalSelect";
import {
  createHealthInfo,
  updateHealthInfo,
} from "../../services/health.service";
import { updateUserProfile } from "../../services/auth.service";
import { useNavigate } from "react-router-dom";

// Constants moved outside component to prevent recreation
const ACTIVITY_LEVELS = {
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

const GOALS = {
  lose: { label: "Giảm cân", deficit: -500, description: "Giảm 0.5kg/tuần" },
  maintain: {
    label: "Duy trì cân nặng",
    deficit: 0,
    description: "Giữ nguyên cân nặng hiện tại",
  },
  gain: { label: "Tăng cân", deficit: 500, description: "Tăng 0.5kg/tuần" },
};

const BLOOD_TYPES = [
  { value: "unknown", label: "Không rõ", color: "gray", icon: "❓" },
  { value: "A", label: "A", color: "red", icon: "🅰️" },
  { value: "B", label: "B", color: "blue", icon: "🅱️" },
  { value: "AB", label: "AB", color: "purple", icon: "🆎" },
  { value: "O", label: "O", color: "green", icon: "⭕" },
];

const CHRONIC_DISEASES = [
  "Tiểu đường",
  "Cao huyết áp",
  "Bệnh tim",
  "Hen suyễn",
  "Viêm khớp",
  "Loãng xương",
  "Bệnh thận",
  "Bệnh gan",
  "Ung thư",
  "Trầm cảm",
];

const ALLERGIES = [
  "Đậu phộng",
  "Hải sản",
  "Sữa",
  "Trứng",
  "Gluten",
  "Đậu nành",
  "Hạt cây",
  "Mè",
  "Thuốc",
  "Bụi",
];

// Value Slider Component - MOVED OUTSIDE to prevent recreation
const ValueSlider = React.memo(
  ({ label, value, onChange, min, max, step = 1, unit = "", error = "" }) => (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <label className="text-sm font-medium text-gray-700 capitalize">
          {label}
        </label>
        <span
          className={`text-lg font-bold ${
            error ? "text-red-600" : "text-teal-600"
          }`}
        >
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
        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider-teal"
        style={{
          background: error ? "#fee2e2" : "#f3f4f6",
        }}
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
      {error && (
        <div className="flex items-center text-red-600 text-sm">
          <AlertTriangle className="w-4 h-4 mr-1" />
          {error}
        </div>
      )}
    </div>
  )
);

// Header Component - MOVED OUTSIDE
const HeaderTool = React.memo(({ title, subtitle, icon: Icon }) => (
  <div className="text-center mb-8">
    <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-teal-500 to-emerald-500 rounded-full mb-6 shadow-lg">
      <Icon className="w-10 h-10 text-white" />
    </div>
    <h1 className="text-4xl font-bold text-gray-800 mb-3">{title}</h1>
    <p className="text-gray-600 text-lg max-w-2xl mx-auto">{subtitle}</p>
  </div>
));

// Input Field Component - MOVED OUTSIDE
const InputField = React.memo(
  ({
    label,
    icon: Icon,
    required = false,
    children,
    className = "",
    error = "",
  }) => (
    <div className={`space-y-2 w-full ${className}`}>
      <label className="flex items-center text-sm font-medium text-gray-700">
        {Icon && (
          <Icon
            className={`w-4 h-4 mr-2 ${
              error ? "text-red-500" : "text-teal-500"
            }`}
          />
        )}
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {children}
      {error && (
        <div className="flex items-center text-red-600 text-sm">
          <AlertTriangle className="w-4 h-4 mr-1" />
          {error}
        </div>
      )}
    </div>
  )
);

const HealthProfileSetup = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { topics } = useSelector((state) => state.topic);
  const [currentStep, setCurrentStep] = useState(1);
  const [showGuide, setShowGuide] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    // Thông tin cá nhân
    name: "",
    phone: "",
    birthDate: "",
    gender: "male",
    height: 0,
    weight: 0,
    waist: 0,
    hip: 0,
    neck: 0,
    activityLevel: "moderate",
    goal: "maintain",
    age: 0,
    bloodType: "unknown",
    concerns: [],
  });
  console.log(formData);

  useEffect(() => {
    dispatch(fetchAllTopics());
  }, [dispatch]);

  // Tính tuổi từ ngày sinh
  useEffect(() => {
    if (formData.birthDate) {
      const today = new Date();
      const birthDate = new Date(formData.birthDate);
      const age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();

      if (
        monthDiff < 0 ||
        (monthDiff === 0 && today.getDate() < birthDate.getDate())
      ) {
        setFormData((prev) => ({ ...prev, age: age - 1 }));
      } else {
        setFormData((prev) => ({ ...prev, age }));
      }
    }
  }, [formData.birthDate]);

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
  // Validation functions - wrapped in useMemo to prevent recreation
  const validateStep1 = useMemo(
    () => () => {
      const newErrors = {};

      if (!formData.name.trim()) {
        newErrors.name = "Vui lòng nhập họ và tên";
      }

      if (!formData.phone.trim()) {
        newErrors.phone = "Vui lòng nhập số điện thoại";
      } else if (!/^[0-9]{10,11}$/.test(formData.phone.replace(/\s/g, ""))) {
        newErrors.phone = "Số điện thoại không hợp lệ";
      }

      if (!formData.birthDate) {
        newErrors.birthDate = "Vui lòng chọn ngày sinh";
      }

      if (!formData.gender) {
        newErrors.gender = "Vui lòng chọn giới tính";
      }

      return newErrors;
    },
    [formData.name, formData.phone, formData.birthDate, formData.gender]
  );

  const validateStep2 = useMemo(
    () => () => {
      const newErrors = {};

      if (!formData.height || formData.height < 100 || formData.height > 250) {
        newErrors.height = "Chiều cao phải từ 100-250cm";
      }

      if (!formData.weight || formData.weight < 30 || formData.weight > 200) {
        newErrors.weight = "Cân nặng phải từ 30-200kg";
      }

      return newErrors;
    },
    [formData.height, formData.weight]
  );

  const validateStep3 = useMemo(
    () => () => {
      const newErrors = {};

      if (!formData.activityLevel) {
        newErrors.activityLevel = "Vui lòng chọn mức độ hoạt động";
      }

      if (!formData.goal) {
        newErrors.goal = "Vui lòng chọn mục tiêu";
      }

      return newErrors;
    },
    [formData.activityLevel, formData.goal]
  );

  const validateCurrentStep = useCallback(() => {
    let stepErrors = {};

    switch (currentStep) {
      case 1:
        stepErrors = validateStep1();
        break;
      case 2:
        stepErrors = validateStep2();
        break;
      case 3:
        stepErrors = validateStep3();
        break;
      default:
        break;
    }

    setErrors(stepErrors);
    return Object.keys(stepErrors).length === 0;
  }, [currentStep, validateStep1, validateStep2, validateStep3]);

  // FIX: Use useCallback to prevent function recreation
  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  }, []);

  // FIX: Alternative overload for direct value updates
  const handleDirectValueChange = useCallback((name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  }, []);

  const handleArrayToggle = useCallback((field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter((item) => item !== value)
        : [...prev[field], value],
    }));
  }, []);

  const handleTopicToggle = useCallback((topicId) => {
    setFormData((prev) => {
      const isSelected = prev.concerns.includes(topicId);

      if (!isSelected && prev.concerns.length >= 5) {
        console.error("Bạn chỉ có thể chọn tối đa 5 chủ đề");
        return prev;
      }

      return {
        ...prev,
        concerns: isSelected
          ? prev.concerns.filter((id) => id !== topicId)
          : [...prev.concerns, topicId],
      };
    });
  }, []);

  const nextStep = useCallback(() => {
    if (validateCurrentStep()) {
      if (currentStep < 4) {
        setCurrentStep(currentStep + 1);
      }
    } else {
      console.error("Vui lòng hoàn thành tất cả thông tin bắt buộc");
    }
  }, [currentStep, validateCurrentStep]);

  const prevStep = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      setErrors({}); // Clear errors when going back
    }
  }, [currentStep]);

  const handleSubmit = useCallback(async () => {
    // Validate all steps before submit
    const step1Errors = validateStep1();
    const step2Errors = validateStep2();
    const step3Errors = validateStep3();

    const allErrors = { ...step1Errors, ...step2Errors, ...step3Errors };

    if (Object.keys(allErrors).length > 0) {
      setErrors(allErrors);
      console.error("Vui lòng hoàn thành tất cả thông tin bắt buộc");
      return;
    }

    setLoading(true);
    try {
      const {
        height,
        weight,
        waist,
        hip,
        neck,
        activityLevel,
        goal,
        bloodType,
        concerns,
        allergies,
        name,
        birthDate,
        gender,
        phone,
      } = formData;
      await dispatch(
        updateUserProfile({
          fullName: name,
          dateOfBirth: birthDate,
          gender,
          phone,
          concerns,
        })
      );
      await dispatch(
        updateHealthInfo({
          height,
          weight,
          waist,
          hip,
          neck,
          activityLevel,
          goal,
          age: calculateAge(birthDate),
          bloodType,
          allergies,
        })
      );

      console.log("Hồ sơ sức khỏe đã được tạo thành công!");
      navigate("/");
    } catch (error) {
      console.log(error);
      console.error("Có lỗi xảy ra, vui lòng thử lại");
    } finally {
      setLoading(false);
    }
  }, [dispatch, formData, validateStep1, validateStep2, validateStep3]);

  const renderStepIndicator = useCallback(
    () => (
      <div className="flex justify-center mb-8">
        {[1, 2, 3, 4].map((step) => (
          <div key={step} className="flex items-center">
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center font-semibold transition-all ${
                step <= currentStep
                  ? "bg-teal-500 text-white shadow-lg"
                  : "bg-gray-200 text-gray-400"
              }`}
            >
              {step}
            </div>
            {step < 4 && (
              <div
                className={`w-16 h-1 mx-2 ${
                  step < currentStep ? "bg-teal-500" : "bg-gray-200"
                }`}
              />
            )}
          </div>
        ))}
      </div>
    ),
    [currentStep]
  );

  const renderPersonalInfo = useCallback(
    () => (
      <div className="space-y-6">
        <div className="bg-white rounded-lg p-8 shadow-sm border border-gray-200">
          <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center">
            <User className="h-5 w-5 mr-3 text-teal-600" />
            Thông tin cá nhân
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
            <InputField
              label="Họ và tên"
              icon={User}
              required
              error={errors.name}
            >
              <input
                type="text"
                value={formData.name}
                name="name"
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:border-transparent ${
                  errors.name
                    ? "border-red-300 focus:ring-red-500"
                    : "border-gray-300 focus:ring-teal-500"
                }`}
                placeholder="Nhập họ và tên của bạn"
              />
            </InputField>

            <InputField
              label="Số điện thoại"
              icon={Phone}
              required
              error={errors.phone}
            >
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:border-transparent ${
                  errors.phone
                    ? "border-red-300 focus:ring-red-500"
                    : "border-gray-300 focus:ring-teal-500"
                }`}
                placeholder="Nhập số điện thoại"
              />
            </InputField>

            <InputField
              label="Ngày sinh"
              icon={Calendar}
              required
              error={errors.birthDate}
            >
              <input
                type="date"
                name="birthDate"
                value={formData.birthDate}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:border-transparent ${
                  errors.birthDate
                    ? "border-red-300 focus:ring-red-500"
                    : "border-gray-300 focus:ring-teal-500"
                }`}
              />
              {formData.age > 0 && (
                <div className="flex items-center mt-2 px-3 py-1 bg-teal-50 border border-teal-200 rounded-lg">
                  <Calendar className="w-4 h-4 text-teal-500 mr-2" />
                  <span className="text-sm text-teal-600">
                    Tuổi: {formData.age}
                  </span>
                </div>
              )}
            </InputField>

            <InputField
              label="Giới tính"
              icon={Users}
              required
              error={errors.gender}
            >
              <select
                value={formData.gender}
                name="gender"
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:border-transparent ${
                  errors.gender
                    ? "border-red-300 focus:ring-red-500"
                    : "border-gray-300 focus:ring-teal-500"
                }`}
              >
                <option value="male">Nam</option>
                <option value="female">Nữ</option>
              </select>
            </InputField>
          </div>
        </div>
      </div>
    ),
    [formData, errors, handleInputChange]
  );

  const renderHealthMetrics = useCallback(
    () => (
      <div className="space-y-6">
        <div className="bg-white rounded-lg p-8 shadow-sm border border-gray-200">
          <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center">
            <Heart className="h-5 w-5 mr-3 text-teal-600" />
            Chỉ số sức khỏe
          </h2>

          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
              <div>
                <ValueSlider
                  label="chiều cao"
                  value={formData.height}
                  onChange={(value) => handleDirectValueChange("height", value)}
                  min={100}
                  max={250}
                  step={0.5}
                  unit=" cm"
                  error={errors.height}
                />
              </div>
              <div>
                <ValueSlider
                  label="cân nặng"
                  value={formData.weight}
                  onChange={(value) => handleDirectValueChange("weight", value)}
                  min={30}
                  max={200}
                  step={0.1}
                  unit=" kg"
                  error={errors.weight}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <InputField label="Vòng eo (cm)" className="text-center">
                <input
                  type="number"
                  min="0"
                  max="200"
                  value={formData.waist || ""}
                  onChange={(e) =>
                    handleDirectValueChange("waist", Number(e.target.value))
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-center"
                  placeholder="Tùy chọn"
                />
              </InputField>

              <InputField label="Vòng hông (cm)" className="text-center">
                <input
                  type="number"
                  min="0"
                  max="200"
                  value={formData.hip || ""}
                  onChange={(e) =>
                    handleDirectValueChange("hip", Number(e.target.value))
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-center"
                  placeholder="Tùy chọn"
                />
              </InputField>

              <InputField label="Vòng cổ (cm)" className="text-center">
                <input
                  type="number"
                  min="0"
                  max="200"
                  value={formData.neck || ""}
                  onChange={(e) =>
                    handleDirectValueChange("neck", Number(e.target.value))
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-center"
                  placeholder="Tùy chọn"
                />
              </InputField>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
              <div>
                <label className="flex items-center text-sm font-medium text-gray-700 mb-4">
                  <Droplet className="w-4 h-4 mr-2 text-red-500" />
                  Nhóm máu
                </label>
                <div className="w-full   grid grid-cols-5 gap-3">
                  {BLOOD_TYPES.map((blood) => (
                    <label
                      key={blood.value}
                      className={`relative flex flex-col items-center p-4 border-2 rounded-xl cursor-pointer transition-all hover:shadow-md ${
                        formData.bloodType === blood.value
                          ? "border-teal-400 bg-teal-50 shadow-md"
                          : "border-gray-200 bg-white hover:border-gray-300"
                      }`}
                    >
                      <input
                        type="radio"
                        name="bloodType"
                        value={blood.value}
                        checked={formData.bloodType === blood.value}
                        onChange={(e) =>
                          handleDirectValueChange("bloodType", e.target.value)
                        }
                        className="sr-only"
                      />
                      <div className="text-2xl mb-2">{blood.icon}</div>
                      <div
                        className={`text-sm font-semibold ${
                          formData.bloodType === blood.value
                            ? "text-teal-700"
                            : "text-gray-700"
                        }`}
                      >
                        {blood.label}
                      </div>
                      {formData.bloodType === blood.value && (
                        <div className="absolute top-2 right-2 w-5 h-5 bg-teal-500 rounded-full flex items-center justify-center">
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        </div>
                      )}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
    [formData, errors, handleDirectValueChange]
  );

  const renderLifestyleGoals = useCallback(
    () => (
      <div className="space-y-6">
        <div className="bg-white rounded-lg p-8 shadow-sm border border-gray-200">
          <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center">
            <Target className="h-5 w-5 mr-3 text-teal-600" />
            Mục tiêu & Lối sống
          </h2>

          <div className="space-y-8">
            <div>
              <label className="text-md font-semibold text-gray-700 mb-4 block">
                Mức độ hoạt động <span className="text-red-500">*</span>
              </label>
              {errors.activityLevel && (
                <div className="flex items-center text-red-600 text-sm mb-3">
                  <AlertTriangle className="w-4 h-4 mr-1" />
                  {errors.activityLevel}
                </div>
              )}
              <ActivityLevelSelect
                activityLevels={ACTIVITY_LEVELS}
                onChange={(value) =>
                  handleDirectValueChange("activityLevel", value)
                }
                value={formData.activityLevel}
              />
            </div>

            <div>
              <label className="text-md font-semibold text-gray-700 mb-4 block">
                Mục tiêu cân nặng <span className="text-red-500">*</span>
              </label>
              {errors.goal && (
                <div className="flex items-center text-red-600 text-sm mb-3">
                  <AlertTriangle className="w-4 h-4 mr-1" />
                  {errors.goal}
                </div>
              )}
              <GoalSelect
                value={formData.goal}
                onChange={(value) => handleDirectValueChange("goal", value)}
                goals={GOALS}
              />
            </div>
          </div>
        </div>
      </div>
    ),
    [formData, errors, handleDirectValueChange]
  );

  const renderHealthConditions = useCallback(
    () => (
      <div className="space-y-6">
        <div className="bg-white rounded-lg p-8 shadow-sm border border-gray-200">
          <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center">
            <Activity className="h-5 w-5 mr-3 text-teal-600" />
            Chuyên mục bạn quan tâm
          </h2>

          <div className="space-y-8">
            <div>
              <h3 className="text-md font-semibold text-gray-700 mb-4">
                Chủ đề sức khỏe quan tâm{" "}
                <span className="text-sm text-teal-500">
                  {formData.concerns.length}/5
                </span>
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {topics?.map((topic) => (
                  <label
                    key={topic._id}
                    className={`flex flex-col items-center p-4 border rounded-lg cursor-pointer transition-all ${
                      formData.concerns.includes(topic._id)
                        ? "border-teal-300 bg-teal-50"
                        : "border-gray-200 hover:border-gray-300"
                    } ${
                      !formData.concerns.includes(topic._id) &&
                      formData.concerns.length >= 5
                        ? "opacity-50 cursor-not-allowed"
                        : ""
                    }`}
                  >
                    <img
                      className="w-10 h-10 rounded-md object-cover mb-2"
                      src={topic.image.url}
                      alt=""
                    />
                    <input
                      type="checkbox"
                      checked={formData.concerns.includes(topic._id)}
                      onChange={() => handleTopicToggle(topic._id)}
                      className="sr-only"
                      disabled={
                        !formData.concerns.includes(topic._id) &&
                        formData.concerns.length >= 5
                      }
                    />
                    <div className="text-2xl mb-2">{topic.icon}</div>
                    <div className="text-sm font-medium text-center">
                      {topic.name}
                    </div>
                    {formData.concerns.includes(topic._id) && (
                      <CheckCircle className="w-4 h-4 text-teal-600 mt-2" />
                    )}
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
    [formData, handleArrayToggle, handleTopicToggle, topics, showGuide]
  );

  return (
    <div className="min-h-screen bg-gray-50 font-['Nunito']">
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Header */}
        <HeaderTool
          title="Thiết lập Hồ sơ Sức khỏe"
          subtitle="Cung cấp thông tin để nhận tư vấn sức khỏe cá nhân hóa"
          icon={Heart}
        />

        {renderStepIndicator()}

        <div className="mb-8">
          {currentStep === 1 && renderPersonalInfo()}
          {currentStep === 2 && renderHealthMetrics()}
          {currentStep === 3 && renderLifestyleGoals()}
          {currentStep === 4 && renderHealthConditions()}
        </div>

        <div className="flex justify-between items-center">
          <button
            onClick={prevStep}
            disabled={currentStep === 1}
            className={`px-6 py-3 rounded-lg font-medium transition-all ${
              currentStep === 1
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : "bg-gray-300 text-gray-700 hover:bg-gray-400"
            }`}
          >
            Quay lại
          </button>

          <div className="text-sm text-gray-500">Bước {currentStep} / 4</div>

          {currentStep < 4 ? (
            <button
              onClick={nextStep}
              className="px-6 py-3 bg-gradient-to-r from-teal-500 to-emerald-500 text-white rounded-lg font-medium hover:from-teal-600 hover:to-emerald-600 transition-all shadow-lg hover:shadow-xl"
            >
              Tiếp theo
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={loading}
              className={`px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-lg font-medium transition-all shadow-lg hover:shadow-xl ${
                loading
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:from-emerald-600 hover:to-teal-600"
              }`}
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Đang xử lý...
                </div>
              ) : (
                "Hoàn thành"
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default HealthProfileSetup;

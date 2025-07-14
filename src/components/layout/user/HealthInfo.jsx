import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
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
} from "lucide-react";
import {
  createHealthInfo,
  fetchUserHealthInfo,
  updateHealthInfo,
} from "../../../services/health.service";
import { useNotify } from "../../../hook/useNotify";

const HealthInfo = () => {
  const {
    healthInfo,
    bmi,
    bmiCategory,
    healthList,
    healthStats,
    loading,
    createLoading,
    updateLoading,
    deleteLoading,
    statsLoading,
    error,
    createError,
    updateError,
    deleteError,
    statsError,
    createSuccess,
    updateSuccess,
    deleteSuccess,
  } = useSelector((state) => state.health);

  const dispatch = useDispatch();
  const { notifySuccess, notifyError, notifyConfirm } = useNotify();
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
  });

  useEffect(() => {
    dispatch(fetchUserHealthInfo());
  }, []);

  console.log({ editData });

  useEffect(() => {
    if (healthInfo) {
      setEditData({
        weight: healthInfo.weight || "",
        height: healthInfo.height || "",
        waist: healthInfo.waist || "",
        hip: healthInfo.hip || "",
        neck: healthInfo.neck || "",
        bloodType: healthInfo.bloodType || "",
        heartRate: healthInfo.heartRate || "",
        chronicDiseases: healthInfo.chronicDiseases || [],
        allergies: healthInfo.allergies || [],
      });
    }
  }, [healthInfo]);

  const getBMIColor = (level) => {
    switch (level) {
      case "Thiếu cân":
        return "text-blue-600 bg-blue-50";
      case "Bình thường":
        return "text-green-600 bg-green-50";
      case "Thừa cân":
        return "text-yellow-600 bg-yellow-50";
      case "Béo phì":
        return "text-red-600 bg-red-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = async () => {
    try {
      // Chuyển đổi các trường string thành number
      const parsedData = {
        ...editData,
        weight: parseFloat(editData.weight),
        height: parseFloat(editData.height),
        waist: parseFloat(editData.waist),
        hip: parseFloat(editData.hip),
        neck: parseFloat(editData.neck),
        heartRate: parseFloat(editData.heartRate),
      };

      // Kiểm tra dữ liệu hợp lệ

      // Xác nhận trước khi lưu (nếu muốn)
      const confirmed = await notifyConfirm("Bạn có chắc muốn lưu thông tin?");
      if (!confirmed) return;

      // Dispatch lưu dữ liệu
      await dispatch(updateHealthInfo(parsedData));
      notifySuccess("Lưu thông tin sức khỏe thành công!");
    } catch (error) {
      console.error(error);
      notifyError("Đã xảy ra lỗi khi lưu thông tin.");
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    if (healthInfo) {
      setEditData({
        weight: healthInfo.weight || "",
        height: healthInfo.height || "",
        waist: healthInfo.waist || "",
        hip: healthInfo.hip || "",
        neck: healthInfo.neck || "",
        bloodType: healthInfo.bloodType || "",
        heartRate: healthInfo.heartRate || "",
        chronicDiseases: healthInfo.chronicDiseases || [],
        allergies: healthInfo.allergies || [],
      });
    }
  };

  const handleArrayChange = (field, value) => {
    const items = value
      .split(",")
      .map((item) => item.trim())
      .filter((item) => item);
    setEditData({ ...editData, [field]: items });
  };

  const StatCard = ({
    icon: Icon,
    label,
    value,
    color = "blue",
    trend = null,
  }) => (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-xl bg-${color}-50`}>
          <Icon className={`h-6 w-6 text-${color}-600`} />
        </div>
        {trend && (
          <div
            className={`flex items-center text-sm ${
              trend > 0 ? "text-green-600" : "text-red-600"
            }`}
          >
            {trend > 0 ? (
              <TrendingUp className="h-4 w-4 mr-1" />
            ) : (
              <TrendingDown className="h-4 w-4 mr-1" />
            )}
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      <div className="space-y-1">
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-sm text-gray-600">{label}</p>
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
  }) => (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 disabled:bg-gray-50 disabled:cursor-not-allowed"
      />
    </div>
  );

  if (loading) {
    return (
      <div className="flex-1 flex flex-col gap-[20px] pl-[20px] overflow-hidden">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col gap-[20px] pl-[20px] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Thông tin sức khỏe
          </h1>
          <p className="text-gray-600">
            Theo dõi và quản lý tình trạng sức khỏe của bạn
          </p>
        </div>
        <div className="flex items-center space-x-3">
          {!isEditing ? (
            <button
              onClick={handleEdit}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors duration-200"
            >
              <Edit3 className="h-4 w-4" />
              <span>Chỉnh sửa</span>
            </button>
          ) : (
            <div className="flex items-center space-x-2">
              <button
                onClick={handleSave}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors duration-200"
              >
                <Save className="h-4 w-4" />
                <span>Lưu</span>
              </button>
              <button
                onClick={handleCancel}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition-colors duration-200"
              >
                <X className="h-4 w-4" />
                <span>Hủy</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Error/Success Messages */}
      {error && (
        <div className="flex items-center space-x-2 p-4 bg-red-50 border border-red-200 rounded-xl">
          <AlertCircle className="h-5 w-5 text-red-600" />
          <span className="text-red-700">{error}</span>
        </div>
      )}

      {updateSuccess && (
        <div className="flex items-center space-x-2 p-4 bg-green-50 border border-green-200 rounded-xl">
          <CheckCircle className="h-5 w-5 text-green-600" />
          <span className="text-green-700">Cập nhật thông tin thành công!</span>
        </div>
      )}

      {/* BMI Card */}
      {bmi && bmiCategory && (
        <div className="bg-gradient-to-r from-vivanta-500 to-vivanta-300 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold mb-2">Chỉ số BMI</h3>
              <p className="text-3xl font-bold">{bmi}</p>
              <p className=" mt-1">Tình trạng: {bmiCategory.level}</p>
              <p className=" text-sm mt-2">{bmiCategory.description}</p>
            </div>
            <div className="p-4 bg-white/20 rounded-xl">
              <Activity className="h-8 w-8" />
            </div>
          </div>
          <div className="mt-4 p-3 bg-white/10 rounded-xl">
            <p className="text-sm font-medium">Lời khuyên:</p>
            <p className="text-sm ">{bmiCategory.advice}</p>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={Weight}
          label="Cân nặng"
          value={
            healthInfo?.weight ? `${healthInfo.weight} kg` : "Chưa cập nhật"
          }
          color="blue"
          trend={2.5}
        />
        <StatCard
          icon={Ruler}
          label="Chiều cao"
          value={
            healthInfo?.height ? `${healthInfo.height} cm` : "Chưa cập nhật"
          }
          color="green"
        />
        <StatCard
          icon={Heart}
          label="Nhịp tim"
          value={
            healthInfo?.heartRate && healthInfo.heartRate > 0
              ? `${healthInfo.heartRate} bpm`
              : "Chưa cập nhật"
          }
          color="red"
          trend={-1.2}
        />
        <StatCard
          icon={Droplets}
          label="Nhóm máu"
          value={healthInfo?.bloodType || "Chưa cập nhật"}
          color="purple"
        />
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Health Info Form */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-xl font-semibold mb-6 flex items-center">
            <User className="h-5 w-5 mr-2 text-blue-600" />
            Thông tin cá nhân
          </h3>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <InputField
                label="Vòng eo (cm)"
                value={editData.waist}
                onChange={(value) => setEditData({ ...editData, waist: value })}
                type="number"
                placeholder="Nhập vòng eo"
                disabled={!isEditing}
              />
              <InputField
                label="Vòng hông (cm)"
                value={editData.hip}
                onChange={(value) => setEditData({ ...editData, hip: value })}
                type="number"
                placeholder="Nhập vòng hông"
                disabled={!isEditing}
              />
              <InputField
                label="Vòng cổ (cm)"
                value={editData.neck}
                onChange={(value) => setEditData({ ...editData, neck: value })}
                type="number"
                placeholder="Nhập vòng cổ"
                disabled={!isEditing}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField
                label="Nhóm máu"
                value={editData.bloodType}
                onChange={(value) =>
                  setEditData({ ...editData, bloodType: value })
                }
                placeholder="VD: A, B, AB, O"
                disabled={!isEditing}
              />
              <InputField
                label="Nhịp tim (bpm)"
                value={editData.heartRate}
                onChange={(value) =>
                  setEditData({ ...editData, heartRate: value })
                }
                type="number"
                placeholder="Nhập nhịp tim"
                disabled={!isEditing}
              />
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Bệnh mãn tính (phân cách bằng dấu phẩy)
                </label>
                <input
                  type="text"
                  value={editData.chronicDiseases.join(", ")}
                  onChange={(e) =>
                    handleArrayChange("chronicDiseases", e.target.value)
                  }
                  placeholder="VD: Cao huyết áp, Tiểu đường"
                  disabled={!isEditing}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 disabled:bg-gray-50 disabled:cursor-not-allowed"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Dị ứng (phân cách bằng dấu phẩy)
                </label>
                <input
                  type="text"
                  value={editData.allergies.join(", ")}
                  onChange={(e) =>
                    handleArrayChange("allergies", e.target.value)
                  }
                  placeholder="VD: Hải sản, Phấn hoa"
                  disabled={!isEditing}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 disabled:bg-gray-50 disabled:cursor-not-allowed"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Health Status & Tips */}
        <div className="space-y-6">
          {/* Current Health Status */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-xl font-semibold mb-6 flex items-center">
              <Shield className="h-5 w-5 mr-2 text-purple-600" />
              Tình trạng sức khỏe hiện tại
            </h3>

            <div className="space-y-4">
              {healthInfo?.chronicDiseases &&
                healthInfo.chronicDiseases.length > 0 && (
                  <div className="p-4 bg-red-50 rounded-xl border border-red-200">
                    <h4 className="font-medium text-red-800 mb-2">
                      Bệnh mãn tính
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {healthInfo.chronicDiseases.map((disease, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-red-100 text-red-700 text-sm rounded-full"
                        >
                          {disease}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

              {healthInfo?.allergies && healthInfo.allergies.length > 0 && (
                <div className="p-4 bg-orange-50 rounded-xl border border-orange-200">
                  <h4 className="font-medium text-orange-800 mb-2">Dị ứng</h4>
                  <div className="flex flex-wrap gap-2">
                    {healthInfo.allergies.map((allergy, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-orange-100 text-orange-700 text-sm rounded-full"
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
                  <div className="p-4 bg-green-50 rounded-xl border border-green-200">
                    <h4 className="font-medium text-green-800 mb-2">
                      Tình trạng tốt
                    </h4>
                    <p className="text-sm text-green-700">
                      Không có bệnh mãn tính hoặc dị ứng được ghi nhận.
                    </p>
                  </div>
                )}
            </div>
          </div>

          {/* Health Tips */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-xl font-semibold mb-6 flex items-center">
              <Zap className="h-5 w-5 mr-2 text-green-600" />
              Lời khuyên sức khỏe
            </h3>

            <div className="space-y-4">
              <div className="p-4 bg-green-50 rounded-xl border border-green-200">
                <h4 className="font-medium text-green-800 mb-2">Dinh dưỡng</h4>
                <p className="text-sm text-green-700">
                  Duy trì chế độ ăn cân bằng với đủ rau xanh, trái cây và
                  protein.
                </p>
              </div>

              <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                <h4 className="font-medium text-blue-800 mb-2">Vận động</h4>
                <p className="text-sm text-blue-700">
                  Tập thể dục ít nhất 30 phút mỗi ngày để duy trì sức khỏe tốt.
                </p>
              </div>

              <div className="p-4 bg-purple-50 rounded-xl border border-purple-200">
                <h4 className="font-medium text-purple-800 mb-2">Nghỉ ngơi</h4>
                <p className="text-sm text-purple-700">
                  Đảm bảo ngủ đủ 7-8 tiếng mỗi đêm để phục hồi cơ thể.
                </p>
              </div>

              <div className="p-4 bg-orange-50 rounded-xl border border-orange-200">
                <h4 className="font-medium text-orange-800 mb-2">
                  Kiểm tra định kỳ
                </h4>
                <p className="text-sm text-orange-700">
                  Thăm khám sức khỏe định kỳ 6 tháng một lần để phát hiện sớm
                  các vấn đề.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HealthInfo;

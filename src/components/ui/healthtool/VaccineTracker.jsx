import React, { useState, useEffect } from "react";
import {
  Calendar,
  User,
  Baby,
  Plus,
  Edit3,
  Trash2,
  Check,
  Clock,
  AlertCircle,
  BarChart3,
  Settings,
  Home,
  BookOpen,
  TrendingUp,
  Shield,
  Syringe,
  Info,
  BookText,
  HeartHandshake,
  ShieldOff,
  HelpCircle,
  Users,
  Award,
} from "lucide-react";

import { useDispatch, useSelector } from "react-redux";
import {
  deleteChild,
  fetchChildren,
  fetchVaccinationRecords,
} from "../../../services/children.service";
import AddChildModal from "../../modals/tool/AddChildModal";
import UpdateChildModal from "../../modals/tool/UpdateChildModal";
import { useNotify } from "../../../hook/useNotify";
import VaccineModal from "./VaccineModal";
import HeaderTool from "./HeaderTool";

// Vaccine schedule data
const VACCINE_SCHEDULE = {
  0: [
    {
      name: "Viêm gan B lần 1",
      code: "HepB1",
      ageMonths: 0,
      required: true,
      definition: "Vaccine phòng chống virus viêm gan B",
      benefits: "Bảo vệ khỏi viêm gan B, ngăn ngừa xơ gan và ung thư gan",
      contraindications: "Dị ứng nặng với thành phần vaccine, sốt cao",
    },
    {
      name: "BCG",
      code: "BCG",
      ageMonths: 0,
      required: true,
      definition: "Vaccine phòng chống bệnh lao",
      benefits: "Bảo vệ khỏi các dạng lao nặng như lao màng não, lao hạch",
      contraindications: "Suy giảm miễn dịch, nhiễm HIV, đang mắc bệnh nặng",
    },
  ],
  1: [
    {
      name: "Viêm gan B lần 2",
      code: "HepB2",
      ageMonths: 1,
      required: true,
      definition: "Mũi tiêm thứ 2 vaccine phòng chống virus viêm gan B",
      benefits: "Tăng cường miễn dịch chống viêm gan B",
      contraindications: "Dị ứng nặng với thành phần vaccine, sốt cao",
    },
  ],
  2: [
    {
      name: "DPT-VGB-Hib lần 1",
      code: "DPT1",
      ageMonths: 2,
      required: true,
      definition:
        "Vaccine 5 trong 1 phòng bạch hầu, ho gà, uốn ván, viêm gan B, Hib",
      benefits:
        "Bảo vệ khỏi 5 bệnh nguy hiểm: bạch hầu, ho gà, uốn ván, viêm gan B, Hib",
      contraindications: "Dị ứng nặng, co giật không do sốt, bệnh não cấp tính",
    },
    {
      name: "Bại liệt uống lần 1",
      code: "OPV1",
      ageMonths: 2,
      required: true,
      definition: "Vaccine uống phòng bại liệt",
      benefits: "Bảo vệ khỏi virus bại liệt, ngăn ngừa tàn tật",
      contraindications: "Suy giảm miễn dịch, đang điều trị corticoid",
    },
  ],
  "2-12": [
    {
      name: "DPT-VGB-Hib lần 2",
      code: "DPT2",
      ageMonths: 3,
      required: true,
      definition: "Mũi tiêm thứ 2 vaccine 5 trong 1",
      benefits: "Tăng cường miễn dịch chống 5 bệnh nguy hiểm",
      contraindications: "Dị ứng nặng, co giật không do sốt, bệnh não cấp tính",
    },
    {
      name: "DPT-VGB-Hib lần 3",
      code: "DPT3",
      ageMonths: 4,
      required: true,
      definition: "Mũi tiêm thứ 3 vaccine 5 trong 1",
      benefits: "Hoàn thiện chu kì tiêm cơ bản chống 5 bệnh nguy hiểm",
      contraindications: "Dị ứng nặng, co giật không do sốt, bệnh não cấp tính",
    },

    {
      name: "Bại liệt uống lần 2",
      code: "OPV2",
      ageMonths: 3,
      required: true,
      definition: "Mũi uống thứ 2 vaccine phòng bại liệt",
      benefits: "Tăng cường miễn dịch chống bại liệt",
      contraindications: "Suy giảm miễn dịch, đang điều trị corticoid",
    },
    {
      name: "Bại liệt uống lần 3",
      code: "OPV3",
      ageMonths: 4,
      required: true,
      definition: "Mũi uống thứ 3 vaccine phòng bại liệt",
      benefits: "Hoàn thiện chu kì tiêm cơ bản chống bại liệt",
      contraindications: "Suy giảm miễn dịch, đang điều trị corticoid",
    },
    {
      name: "Sởi lần 1",
      code: "MCV1",
      ageMonths: 9,
      required: true,
      definition: "Vaccine phòng chống bệnh sởi",
      benefits: "Bảo vệ khỏi sởi, ngăn ngừa biến chứng như viêm phổi, viêm não",
      contraindications: "Suy giảm miễn dịch, dị ứng gelatin, đang có thai",
    },
    {
      name: "Viêm gan B lần 3",
      code: "HepB3",
      ageMonths: 6,
      required: true,
      definition: "Mũi tiêm cuối cùng vaccine phòng viêm gan B",
      benefits: "Hoàn thiện miễn dịch chống viêm gan B",
      contraindications: "Dị ứng nặng với thành phần vaccine, sốt cao",
    },
  ],
  "12-24": [
    {
      name: "Sởi - Rubella",
      code: "MR",
      ageMonths: 18,
      required: true,
      definition: "Vaccine phòng sởi và rubella",
      benefits: "Bảo vệ khỏi sởi và rubella, ngăn ngừa dị tật bẩm sinh",
      contraindications: "Suy giảm miễn dịch, dị ứng gelatin, đang có thai",
    },
    {
      name: "DPT nhắc lại",
      code: "DPT_B1",
      ageMonths: 18,
      required: true,
      definition: "Vaccine nhắc lại phòng bạch hầu, ho gà, uốn ván",
      benefits: "Duy trì miễn dịch chống bạch hầu, ho gà, uốn ván",
      contraindications: "Dị ứng nặng, co giật không do sốt",
    },
    {
      name: "Bại liệt nhắc lại",
      code: "OPV_B1",
      ageMonths: 18,
      required: true,
      definition: "Vaccine nhắc lại phòng bại liệt",
      benefits: "Duy trì miễn dịch chống bại liệt",
      contraindications: "Suy giảm miễn dịch, đang điều trị corticoid",
    },
    {
      name: "Viêm não Nhật Bản",
      code: "JE",
      ageMonths: 12,
      required: true,
      definition: "Vaccine phòng viêm não Nhật Bản",
      benefits: "Bảo vệ khỏi viêm não Nhật Bản do muỗi truyền",
      contraindications: "Dị ứng nặng với thành phần vaccine, sốt cao",
    },
  ],
  optional: [
    {
      name: "Rotavirus",
      code: "RV",
      ageMonths: 2,
      required: false,
      definition: "Vaccine phòng virus rotavirus",
      benefits: "Bảo vệ khỏi tiêu chảy nặng do rotavirus",
      contraindications: "Suy giảm miễn dịch, dị tật ruột nghiêm trọng",
    },
    {
      name: "Phế cầu",
      code: "PCV",
      ageMonths: 2,
      required: false,
      definition: "Vaccine phòng vi khuẩn phế cầu",
      benefits: "Bảo vệ khỏi viêm phổi, viêm màng não do phế cầu",
      contraindications: "Dị ứng nặng với thành phần vaccine",
    },
    {
      name: "Hib",
      code: "Hib",
      ageMonths: 2,
      required: false,
      definition: "Vaccine phòng vi khuẩn Haemophilus influenzae type b",
      benefits: "Bảo vệ khỏi viêm màng não, viêm phổi do Hib",
      contraindications: "Dị ứng nặng với thành phần vaccine",
    },
    {
      name: "Thủy đậu",
      code: "Varicella",
      ageMonths: 12,
      required: false,
      definition: "Vaccine phòng bệnh thủy đậu",
      benefits: "Bảo vệ khỏi thủy đậu và zona thần kinh",
      contraindications: "Suy giảm miễn dịch, dị ứng gelatin, đang có thai",
    },
  ],
};

const MedicalCard = ({
  title,
  value,
  unit,
  subtitle,
  icon: Icon,
  color = "indigo",
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

const VaccineTracker = () => {
  const dispatch = useDispatch();
  const { notifySuccess, notifyWarning, notifyError, notifyConfirm } =
    useNotify();
  const { loading, error, children, child, vaccinationRecords } = useSelector(
    (state) => state.children
  );
  const [currentView, setCurrentView] = useState("dashboard");
  const [selectedChild, setSelectedChild] = useState(null);
  const [showAddChild, setShowAddChild] = useState(false);
  const [showUpdateChildModal, setShowUpdateChildModal] = useState(false);
  const [showVaccineModal, setShowVaccineModal] = useState(false);
  const [selectedVaccine, setSelectedVaccine] = useState(null);
  const [totalCompleteCount, setTotalCompleteCount] = useState(0);
  const [totalOverdueCount, setTotalOverdueCount] = useState(0);
  const [totalVaccines, setTotalVaccines] = useState(0);

  useEffect(() => {
    if (children) {
      setTotalCompleteCount(
        children.reduce((total, child) => {
          return total + (child.completedCount || 0);
        }, 0)
      );
      setTotalOverdueCount(
        children.reduce((total, child) => {
          return total + (child.overdueCount || 0);
        }, 0)
      );
      setTotalVaccines(
        children.reduce((total, child) => {
          return total + (child.totalVaccines || 0);
        }, 0)
      );
    }
  }, [children]);

  useEffect(() => {
    dispatch(fetchChildren());
  }, []);

  useEffect(() => {
    if (currentView === "schedule" && selectedChild) {
      dispatch(fetchVaccinationRecords(selectedChild._id));
    }
  }, [currentView]);

  console.log({ vaccinationRecords, selectedChild, selectedVaccine });

  // Calculate age in months
  const calculateAgeInMonths = (birthDate) => {
    const birth = new Date(birthDate);
    const today = new Date();
    const months =
      (today.getFullYear() - birth.getFullYear()) * 12 +
      (today.getMonth() - birth.getMonth());
    return months;
  };

  // Process vaccination records into a more usable format
  const getChildVaccineData = (childId) => {
    if (!vaccinationRecords || !Array.isArray(vaccinationRecords)) {
      return {};
    }

    const childRecords = vaccinationRecords.filter(
      (record) => record.childId === childId
    );

    const vaccineData = {};
    childRecords.forEach((record) => {
      // Chỉ lấy record đầu tiên cho mỗi vaccine code (tránh duplicate)
      if (!vaccineData[record.code]) {
        vaccineData[record.code] = {
          date: record.date,
          status: record.status,
          _id: record._id,
        };
      }
    });

    return vaccineData;
  };

  // Delete child
  const deleteChildHandle = async (childId) => {
    try {
      const confirm = await notifyConfirm(
        "Bạn có chắc chắn muốn xóa hồ sơ của bé này!"
      );
      if (confirm) {
        await dispatch(deleteChild(childId));
      }
    } catch (error) {
      notifyError(error.response.data.message);
    }
  };

  const getRecommendedDate = (birthDate, ageMonths) => {
    const date = new Date(birthDate);
    date.setMonth(date.getMonth() + ageMonths);
    return date.toISOString().split("T")[0];
  };

  const getVaccineRecommendations = (child) => {
    const ageInMonths = calculateAgeInMonths(child.birthDate);
    const recommendations = [];
    const childVaccineData = getChildVaccineData(child._id);

    Object.entries(VACCINE_SCHEDULE).forEach(([category, vaccines]) => {
      vaccines.forEach((vaccine) => {
        const vaccineRecord = childVaccineData[vaccine.code];
        const isCompleted = !!(
          vaccineRecord && vaccineRecord.status === "completed"
        );
        const isOverdue =
          ageInMonths > vaccine.ageMonths && vaccine.required && !isCompleted;
        const isFuture = ageInMonths < vaccine.ageMonths;
        const isUpcoming =
          !isCompleted &&
          !isOverdue &&
          isFuture &&
          ageInMonths >= vaccine.ageMonths - 2;

        recommendations.push({
          ...vaccine,
          category,
          isCompleted,
          isOverdue: !isCompleted && !isFuture && isOverdue,
          isFuture,
          isUpcoming,
          recommendedDate: getRecommendedDate(
            child.birthDate,
            vaccine.ageMonths
          ),
          completedDate: vaccineRecord?.date || null,
          recordId: vaccineRecord?._id || null,
        });
      });
    });

    return recommendations.sort((a, b) => a.ageMonths - b.ageMonths);
  };

  // Get statistics
  const getStatistics = () => {
    const totalChildren = children?.length || 0;

    // Trường hợp không có trẻ
    if (totalChildren === 0) {
      return {
        totalChildren: 0,
        totalVaccines: 0,
        completedVaccines: 0,
        overdueVaccines: 0,
        completionRate: 0,
      };
    }

    // Khởi tạo bộ đếm
    let totalVaccines = 0;
    let completedVaccines = 0;
    let overdueVaccines = 0;

    children.forEach((child) => {
      const recommendations = getVaccineRecommendations(child) || [];
      totalVaccines += recommendations.length;
      completedVaccines += recommendations.filter((r) => r.isCompleted).length;
      overdueVaccines += recommendations.filter((r) => r.isOverdue).length;
    });

    const completionRate =
      totalVaccines > 0
        ? Math.round((completedVaccines / totalVaccines) * 100)
        : 0;

    return {
      totalChildren,
      totalVaccines,
      completedVaccines,
      overdueVaccines,
      completionRate,
    };
  };

  const stats = getStatistics();
  const childrenList = Array.isArray(children) ? children : [];

  // Dashboard view
  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MedicalCard
          title="Tổng số bé"
          value={stats.totalChildren}
          unit="bé"
          icon={Baby}
          color="blue"
        />{" "}
        <MedicalCard
          title="Đã tiêm"
          value={totalCompleteCount}
          unit="mũi"
          icon={Check}
          color="green"
        />{" "}
        <MedicalCard
          title="Quá hạn"
          value={totalOverdueCount}
          unit="mũi"
          icon={AlertCircle}
          color="red"
        />
        <MedicalCard
          title="Tỷ lệ hoàn thành"
          value={
            parseFloat(
              ((totalCompleteCount / totalVaccines) * 100).toFixed(1)
            ) || 0
          }
          unit="%"
          icon={TrendingUp}
          color="indigo"
        />
      </div>

      {/* Recent Children */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Hồ sơ gần đây</h3>
          <button
            onClick={() => setShowAddChild(true)}
            className="flex items-center cursor-pointer gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Thêm hồ sơ bé
          </button>
        </div>

        {childrenList.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Baby className="h-12 w-12 mx-auto mb-2 text-gray-400" />
            <p>Chưa có hồ sơ nào. Hãy thêm hồ sơ đầu tiên!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {childrenList.map((child) => {
              const ageInMonths = calculateAgeInMonths(child.birthDate);

              return (
                <div
                  key={child._id}
                  className="border flex flex-col justify-between border-gray-200 rounded-lg p-4 hover:bg-gray-50"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-semibold text-gray-800">
                        {child.name}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {ageInMonths} tháng tuổi •{" "}
                        {child.gender === "male" ? "Bé trai" : "Bé gái"}
                      </p>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => {
                          setShowUpdateChildModal(true);
                          setSelectedChild(child);
                        }}
                        className="p-1 text-gray-500 hover:text-indigo-600"
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => deleteChildHandle(child._id)}
                        className="p-1 text-gray-500 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Đã tiêm:</span>
                      <div className="font-semibold text-green-600">
                        {child.totalVaccines && (
                          <p>
                            {child.completedCount}/{child.totalVaccines}
                          </p>
                        )}
                      </div>
                    </div>
                    {child.overdueCount > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Quá hạn:</span>
                        <span className="font-semibold text-red-600">
                          {child.overdueCount}
                        </span>
                      </div>
                    )}
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full"
                        style={{
                          width: `${
                            child.totalVaccines > 0
                              ? (child.completedCount / child.totalVaccines) *
                                100
                              : 0
                          }%`,
                        }}
                      />
                    </div>
                    <button
                      onClick={() => {
                        setSelectedChild(child);
                        setCurrentView("schedule");
                      }}
                      className="w-full mt-3 px-3 py-2 bg-indigo-50 text-indigo-600 cursor-pointer rounded-md hover:bg-indigo-100 text-sm"
                    >
                      Xem lịch tiêm
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );

  // Children list view
  const renderChildren = () => (
    <div className="space-y-4 border-1 border-dark-700 shadow p-6 rounded-lg ">
      <div className="flex items-center justify-between ">
        <h2 className="text-xl font-semibold text-gray-800">Danh sách bé</h2>
        <button
          onClick={() => setShowAddChild(true)}
          className="flex items-center cursor-pointer gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          Thêm hồ sơ bé
        </button>
      </div>

      {children.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <Baby className="h-16 w-16 mx-auto mb-4 text-gray-400" />
          <p className="text-lg">Chưa có hồ sơ nào</p>
          <p className="text-sm">Hãy thêm hồ sơ đầu tiên cho bé!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {children.map((child) => {
            const ageInMonths = calculateAgeInMonths(child.birthDate);

            return (
              <div
                key={child._id}
                className="bg-white flex flex-col justify-between border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-12 h-12 ${
                          child.gender === "male"
                            ? "bg-indigo-100"
                            : "bg-pink-100"
                        } rounded-full flex items-center justify-center`}
                      >
                        <Baby
                          className={`h-6 w-6 ${
                            child.gender === "male"
                              ? "text-indigo-600"
                              : "text-pink-600"
                          }`}
                        />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-800">
                          {child.name}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {ageInMonths} tháng tuổi •{" "}
                          {child.gender === "male" ? "Bé trai" : "Bé gái"}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => {
                          setShowUpdateChildModal(true);
                          setSelectedChild(child);
                        }}
                        className="p-2 text-gray-500 hover:text-indigo-600 rounded-md hover:bg-gray-100"
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => deleteChildHandle(child._id)}
                        className="p-2 text-gray-500 hover:text-red-600 rounded-md hover:bg-gray-100"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <div className="flex justify-between text-sm pb-2">
                    <span className="text-gray-600">Ngày sinh:</span>
                    <span className="font-medium">
                      {new Date(child.birthDate).toLocaleDateString("vi-VN")}
                    </span>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Đã tiêm:</span>
                    <div className="font-semibold text-green-600">
                      {child.totalVaccines && (
                        <p>
                          {child.completedCount}/{child.totalVaccines}
                        </p>
                      )}
                    </div>
                  </div>
                  {child.overdueCount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Quá hạn:</span>
                      <span className="font-semibold text-red-600">
                        {child.overdueCount}
                      </span>
                    </div>
                  )}
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full"
                      style={{
                        width: `${
                          child.totalVaccines > 0
                            ? (child.completedCount / child.totalVaccines) * 100
                            : 0
                        }%`,
                      }}
                    />
                  </div>
                  {child.notes && (
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">Ghi chú:</span>{" "}
                      {child.notes}
                    </div>
                  )}{" "}
                  <button
                    onClick={() => {
                      setSelectedChild(child);
                      setCurrentView("schedule");
                    }}
                    className="w-full mt-4 px-4 py-2 cursor-pointer bg-indigo-50 text-indigo-600 rounded-md hover:bg-indigo-100"
                  >
                    Xem lịch tiêm
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  // Schedule view
  const renderSchedule = () => {
    if (!selectedChild) {
      return (
        <div className="text-center py-12 text-gray-500">
          <Calendar className="h-16 w-16 mx-auto mb-4 text-gray-400" />
          <p className="text-lg">Chọn bé để xem lịch tiêm</p>
        </div>
      );
    }
    if (loading) {
      return (
        <div className="flex items-center justify-center h-64 text-gray-500">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500 mr-3"></div>
          <p>Đang tải lịch tiêm...</p>
        </div>
      );
    }
    const recommendations = getVaccineRecommendations(selectedChild);
    const ageInMonths = calculateAgeInMonths(selectedChild.birthDate);

    return (
      <div className="space-y-6">
        {/* Child info header */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center">
                <Baby className="h-8 w-8 text-indigo-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-800">
                  {selectedChild?.name}
                </h2>
                <p className="text-gray-600">
                  {ageInMonths} tháng tuổi •{" "}
                  {selectedChild?.gender === "male" ? "Bé trai" : "Bé gái"}
                </p>
                <p className="text-sm text-gray-500">
                  Sinh ngày:{" "}
                  {new Date(selectedChild?.birthDate).toLocaleDateString(
                    "vi-VN"
                  )}
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                setCurrentView("dashboard");
              }}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
            >
              Quay lại
            </button>
          </div>
        </div>

        {/* Vaccine schedule */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800">
              Lịch tiêm chủng
            </h3>
          </div>
          <div className="p-6">
            <div className="space-y-6">
              {/* Required vaccines by age group */}
              {Object.entries(VACCINE_SCHEDULE).map(([category, vaccines]) => {
                if (category === "optional") return null;

                const categoryVaccines = recommendations.filter(
                  (r) => r.category === category
                );

                if (categoryVaccines.length === 0) return null;

                return (
                  <div key={category} className="space-y-3">
                    <h4 className=" text-gray-700 text-sm font-bold">
                      {category === "0" && "Sơ sinh"}
                      {category === "1" && "Từ 1 tháng tuổi"}
                      {category === "2" && "Từ 2 tháng tuổi"}
                      {category === "2-12" && "Từ 2-12 tháng tuổi"}
                      {category === "12-24" && "Từ 12-24 tháng tuổi"}
                    </h4>

                    <div className="space-y-2">
                      {categoryVaccines.map((vaccine) => (
                        <div
                          key={vaccine.code}
                          className={`flex items-center justify-between p-4 rounded-lg border ${
                            vaccine.isCompleted
                              ? "bg-green-50 border-green-200"
                              : vaccine.isOverdue
                              ? "bg-red-50 border-red-200"
                              : vaccine.isUpcoming
                              ? "bg-yellow-50 border-yellow-200"
                              : "bg-gray-50 border-gray-200"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex-shrink-0">
                              {vaccine.isCompleted ? (
                                <Check className="h-5 w-5 text-green-600" />
                              ) : vaccine.isOverdue ? (
                                <AlertCircle className="h-5 w-5 text-red-600" />
                              ) : vaccine.isUpcoming ? (
                                <Clock className="h-5 w-5 text-yellow-600" />
                              ) : (
                                <Syringe className="h-5 w-5 text-gray-400" />
                              )}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <h5 className="font-medium text-gray-800">
                                  {vaccine.name}
                                </h5>
                                <button
                                  onClick={() => {
                                    setSelectedVaccine(vaccine);
                                    setShowVaccineModal(true);
                                  }}
                                  className="p-1 text-gray-400 hover:text-indigo-600"
                                >
                                  <Info className="h-4 w-4" />
                                </button>
                              </div>
                              <p className="text-sm text-gray-600">
                                Khuyến nghị: {vaccine.ageMonths} tháng tuổi
                                {vaccine.recommendedDate && (
                                  <span className="ml-2">
                                    (
                                    {new Date(
                                      vaccine.recommendedDate
                                    ).toLocaleDateString("vi-VN")}
                                    )
                                  </span>
                                )}
                              </p>
                              {vaccine.isCompleted && vaccine.completedDate && (
                                <p className="text-sm text-green-600">
                                  Đã tiêm:{" "}
                                  {new Date(
                                    vaccine.completedDate
                                  ).toLocaleDateString("vi-VN")}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {vaccine.isCompleted ? (
                              <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                                Đã tiêm
                              </span>
                            ) : vaccine.isOverdue ? (
                              <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">
                                Quá hạn
                              </span>
                            ) : vaccine.isUpcoming ? (
                              <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">
                                Sắp tới
                              </span>
                            ) : (
                              <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded-full">
                                Chưa tới
                              </span>
                            )}

                            <button
                              onClick={() => {
                                setSelectedVaccine(vaccine);
                                setShowVaccineModal(true);
                              }}
                              className="px-3 py-1 text-sm bg-indigo-100 text-indigo-600 rounded-md hover:bg-indigo-200 cursor-pointer"
                            >
                              {vaccine.isCompleted ? "Xem" : "Tiêm"}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}

              {/* Optional vaccines */}
              <div className="space-y-3">
                <h4 className="font-bold text-sm text-gray-700">
                  Vaccine tự nguyện
                </h4>

                <div className="space-y-2">
                  {recommendations
                    .filter((r) => r.category === "optional")
                    .map((vaccine) => (
                      <div
                        key={vaccine.code}
                        className={`flex items-center justify-between p-4 rounded-lg border ${
                          vaccine.isCompleted
                            ? "bg-green-50 border-green-200"
                            : "bg-indigo-50 border-indigo-200"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex-shrink-0">
                            {vaccine.isCompleted ? (
                              <Check className="h-5 w-5 text-green-600" />
                            ) : (
                              <ShieldOff className="h-5 w-5 text-indigo-600" />
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h5 className="font-medium text-gray-800">
                                {vaccine.name}
                              </h5>
                              <button
                                onClick={() => {
                                  setSelectedVaccine(vaccine);
                                  setShowVaccineModal(true);
                                }}
                                className="p-1 text-gray-400 hover:text-indigo-600"
                              >
                                <Info className="h-4 w-4" />
                              </button>
                            </div>
                            <p className="text-sm text-gray-600">
                              Khuyến nghị: {vaccine.ageMonths} tháng tuổi
                            </p>
                            {vaccine.completedDate && (
                              <p className="text-sm text-green-600">
                                Đã tiêm:{" "}
                                {new Date(
                                  vaccine.completedDate
                                ).toLocaleDateString("vi-VN")}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {vaccine.isCompleted ? (
                            <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                              Đã tiêm
                            </span>
                          ) : (
                            <span className="px-2 py-1 text-xs bg-indigo-100 text-indigo-800 rounded-full">
                              Tự nguyện
                            </span>
                          )}

                          <button
                            onClick={() => {
                              setSelectedVaccine(vaccine);
                              setShowVaccineModal(true);
                            }}
                            className="px-3 py-1 text-sm bg-indigo-100 text-indigo-600 rounded-md hover:bg-indigo-200"
                          >
                            {vaccine.isCompleted ? "Xem" : "Tiêm"}
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>{" "}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen py-8 px-6">
      <HeaderTool
        title="Theo dõi tiêm vaccine cho bé"
        subtitle="Quản lý lịch tiêm vaccine và theo dõi sức khỏe cho bé yêu"
        icon={Shield}
        color="indigo"
      />
      <div className="mb-6 ">
        <div className="flex flex-wrap gap-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id)}
              className={`flex items-center gap-2 px-4 py-2 text-sm rounded-md transition-colors ${
                currentView === item.id
                  ? "bg-indigo-600 text-white"
                  : "text-gray-600 hover:bg-gray-100 border-1 border-gray-200 shadow cursor-pointer"
              }`}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </button>
          ))}
        </div>
      </div>
      <div className="w-full mx-auto">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-red-400" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  Có lỗi xảy ra
                </h3>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        <>
          {currentView === "dashboard" && renderDashboard()}
          {currentView === "children" && renderChildren()}
          {currentView === "schedule" && renderSchedule()}
        </>
      </div>

      {/* Modals */}
      {showAddChild && (
        <AddChildModal
          isOpen={showAddChild}
          closeModal={() => setShowAddChild(false)}
        />
      )}

      {showUpdateChildModal && selectedChild && (
        <UpdateChildModal
          isOpen={showUpdateChildModal}
          closeModal={() => {
            setShowUpdateChildModal(false);
            setSelectedChild(null);
          }}
          child={selectedChild}
        />
      )}

      {showVaccineModal && selectedVaccine && selectedChild && (
        <VaccineModal
          isOpen={showVaccineModal}
          closeModal={() => {
            setShowVaccineModal(false);
          }}
          selectedVaccine={selectedVaccine}
          vaccinationRecords={vaccinationRecords}
          child={selectedChild}
          onSuccess={() => {
            if (totalOverdueCount > 0) {
              setTotalOverdueCount(totalOverdueCount - 1);
            }
            setTotalCompleteCount(totalCompleteCount + 1);
          }}
        />
      )}
      <div className="bg-white rounded-lg p-6 mt-6 mb-4 shadow-sm border border-indigo-100">
        <div className="flex items-center space-x-4 mb-4">
          <Shield className="h-6 w-6 text-indigo-600" />
          <h3 className="text-lg font-semibold text-gray-800">
            Thông tin y tế quan trọng
          </h3>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="flex items-center space-x-3 p-3 bg-indigo-50 rounded-xl">
            <Info className="h-5 w-5 text-indigo-600" />
            <div>
              <p className="font-medium text-indigo-800">Độ chính xác cao</p>
              <p className="text-sm text-indigo-600">Dựa trên chuẩn y khoa</p>
            </div>
          </div>
          <div className="flex items-center space-x-3 p-3 bg-indigo-50 rounded-xl">
            <Users className="h-5 w-5 text-indigo-600" />
            <div>
              <p className="font-medium text-indigo-800">Nhiều phương pháp</p>
              <p className="text-sm text-indigo-600">Phù hợp mọi trường hợp</p>
            </div>
          </div>
          <div className="flex items-center space-x-3 p-3 bg-indigo-50 rounded-xl">
            <Award className="h-5 w-5 text-indigo-600" />
            <div>
              <p className="font-medium text-indigo-800">Tư vấn chuyên sâu</p>
              <p className="text-sm text-indigo-600">Theo dõi toàn diện</p>
            </div>
          </div>
        </div>
        <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
          <p className="text-sm text-yellow-800">
            <strong>Lưu ý:</strong> Đây chỉ là công cụ tham khảo. Hãy luôn tham
            khảo ý kiến bác sĩ để có lời khuyên chính xác nhất cho con của bạn.
          </p>
        </div>
      </div>
    </div>
  );
};

export default VaccineTracker;
const navItems = [
  { id: "dashboard", label: "Tổng quan", icon: Home },
  { id: "children", label: "Danh sách bé", icon: Baby },
  { id: "schedule", label: "Lịch tiêm", icon: Calendar },
];

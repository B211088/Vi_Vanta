import React, { useState } from "react";
import {
  Calendar,
  Baby,
  Heart,
  Activity,
  TrendingUp,
  Clock,
  Target,
  Info,
  Shield,
  Users,
  Award,
  CheckCircle,
  Stethoscope,
  Zap,
  Eye,
  Sparkles,
  Star,
  PillBottle,
  RefreshCcw,
} from "lucide-react";
import HeaderTool from "./HeaderTool";
import TabButton from "../../features/TabButton";
import ValueSlider from "../../features/ValueSlider";
import { useNotify } from "../../../hook/useNotify";

const PregnancyCalculator = () => {
  const { notifySuccess, notifyWarning, notifyError, notifyConfirm } =
    useNotify();
  const [activeTab, setActiveTab] = useState("calculator");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showGuide, setShowGuide] = useState(false);

  // Form states
  const [method, setMethod] = useState("lmp");
  const [lmpDate, setLmpDate] = useState("");
  const [cycleLength, setCycleLength] = useState(28);
  const [ivfDate, setIvfDate] = useState("");
  const [ivfType, setIvfType] = useState("3day");
  const [iuiDate, setIuiDate] = useState("");
  const [ultrasoundDate, setUltrasoundDate] = useState("");
  const [gestationalAge, setGestationalAge] = useState("");
  const [conceptDate, setConceptDate] = useState("");

  const methods = [
    { id: "lmp", name: "Chu kỳ kinh nguyệt cuối (LMP)", icon: Calendar },
    { id: "ivf", name: "Thụ tinh ống nghiệm (IVF)", icon: Zap },
    { id: "iui", name: "Thụ tinh nhân tạo (IUI)", icon: Heart },
    { id: "ultrasound", name: "Siêu âm", icon: Eye },
    { id: "conception", name: "Ngày thụ thai", icon: Sparkles },
  ];

  const ivfTypes = [
    { id: "3day", name: "Phôi 3 ngày", offset: 17 },
    { id: "5day", name: "Phôi 5 ngày (Blastocyst)", offset: 19 },
    { id: "frozen", name: "Phôi đông lạnh", offset: 17 },
  ];

  const MedicalCard = ({
    title,
    value,
    unit,
    subtitle,
    icon: Icon,
    color,
    description,
  }) => (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
      <div className="flex items-center space-x-3 mb-4">
        <div className={`p-2 bg-${color}-100 rounded-lg`}>
          <Icon className={`h-5 w-5 text-${color}-600`} />
        </div>
        <div>
          <h3 className="font-semibold text-gray-800">{title}</h3>
          <p className="text-sm text-gray-600">{subtitle}</p>
        </div>
      </div>
      <div className="text-2xl font-bold text-gray-800 mb-2">
        {value}{" "}
        <span className="text-sm font-normal text-gray-600">{unit}</span>
      </div>
      {description && (
        <p className="text-xs text-gray-600 mt-2">{description}</p>
      )}
    </div>
  );

  // Date calculation functions
  const calculateDueDate = () => {
    setLoading(true);

    let dueDate;
    let conceptionDate;
    let currentWeek = 0;
    let currentDay = 0;

    const today = new Date();

    switch (method) {
      case "lmp":
        if (lmpDate) {
          const lmp = new Date(lmpDate);
          dueDate = new Date(lmp.getTime() + 280 * 24 * 60 * 60 * 1000);
          conceptionDate = new Date(lmp.getTime() + 14 * 24 * 60 * 60 * 1000);
          const daysSinceLMP = Math.floor(
            (today - lmp) / (1000 * 60 * 60 * 24)
          );
          currentWeek = Math.floor(daysSinceLMP / 7);
          currentDay = daysSinceLMP % 7;
        }
        break;

      case "ivf":
        if (ivfDate) {
          const ivf = new Date(ivfDate);
          const selectedType = ivfTypes.find((t) => t.id === ivfType);
          dueDate = new Date(
            ivf.getTime() + (280 - selectedType.offset) * 24 * 60 * 60 * 1000
          );
          conceptionDate = new Date(
            ivf.getTime() - selectedType.offset * 24 * 60 * 60 * 1000
          );
          const daysSinceIVF = Math.floor(
            (today - ivf) / (1000 * 60 * 60 * 24)
          );
          const totalDays = daysSinceIVF + selectedType.offset;
          currentWeek = Math.floor(totalDays / 7);
          currentDay = totalDays % 7;
        }
        break;

      case "iui":
        if (iuiDate) {
          const iui = new Date(iuiDate);
          dueDate = new Date(iui.getTime() + 266 * 24 * 60 * 60 * 1000);
          conceptionDate = new Date(iui.getTime());
          const daysSinceIUI = Math.floor(
            (today - iui) / (1000 * 60 * 60 * 24)
          );
          const totalDays = daysSinceIUI + 14;
          currentWeek = Math.floor(totalDays / 7);
          currentDay = totalDays % 7;
        }
        break;

      case "ultrasound":
        if (ultrasoundDate && gestationalAge) {
          const ultrasound = new Date(ultrasoundDate);
          const [weeks, days] = gestationalAge.split(".").map(Number);
          const totalDays = weeks * 7 + (days || 0);
          const daysSinceUltrasound = Math.floor(
            (today - ultrasound) / (1000 * 60 * 60 * 24)
          );
          const currentTotalDays = totalDays + daysSinceUltrasound;
          currentWeek = Math.floor(currentTotalDays / 7);
          currentDay = currentTotalDays % 7;

          const remainingDays = 280 - totalDays;
          dueDate = new Date(
            ultrasound.getTime() + remainingDays * 24 * 60 * 60 * 1000
          );
          conceptionDate = new Date(
            ultrasound.getTime() - (totalDays - 14) * 24 * 60 * 60 * 1000
          );
        }
        break;

      case "conception":
        if (conceptDate) {
          const conception = new Date(conceptDate);
          dueDate = new Date(conception.getTime() + 266 * 24 * 60 * 60 * 1000);
          conceptionDate = conception;
          const daysSinceConception = Math.floor(
            (today - conception) / (1000 * 60 * 60 * 24)
          );
          const totalDays = daysSinceConception + 14;
          currentWeek = Math.floor(totalDays / 7);
          currentDay = totalDays % 7;
        }
        break;
    }

    if (dueDate && conceptionDate) {
      const trimester = currentWeek <= 13 ? 1 : currentWeek <= 27 ? 2 : 3;
      const daysUntilDue = Math.max(
        0,
        Math.floor((dueDate - today) / (1000 * 60 * 60 * 24))
      );

      const milestones = [
        { week: 4, event: "Nhịp tim bắt đầu đập" },
        { week: 8, event: "Các cơ quan chính hình thành" },
        { week: 12, event: "Kết thúc tam cá nguyệt đầu" },
        { week: 16, event: "Có thể biết giới tính" },
        { week: 20, event: "Siêu âm hình thái học" },
        { week: 24, event: "Khả năng sống ngoài tử cung" },
        { week: 28, event: "Kết thúc tam cá nguyệt thứ hai" },
        { week: 32, event: "Phát triển não bộ nhanh" },
        { week: 36, event: "Thai nhi hoàn thiện" },
        { week: 40, event: "Ngày dự sinh" },
      ];

      const nextMilestone = milestones.find((m) => m.week > currentWeek);

      setResult({
        dueDate: dueDate.toLocaleDateString("vi-VN"),
        conceptionDate: conceptionDate.toLocaleDateString("vi-VN"),
        currentWeek,
        currentDay,
        trimester,
        daysUntilDue,
        nextMilestone,
        method: methods.find((m) => m.id === method)?.name || "",
        bgColor: "bg-pink-50",
      });
    }

    setLoading(false);
  };

  const trimesterInfo = {
    1: {
      name: "Tam cá nguyệt đầu",
      color: "pink",
      description: "Giai đoạn hình thành cơ quan",
    },
    2: {
      name: "Tam cá nguyệt giữa",
      color: "pink",
      description: "Giai đoạn phát triển ổn định",
    },
    3: {
      name: "Tam cá nguyệt cuối",
      color: "rose",
      description: "Giai đoạn hoàn thiện và chuẩn bị sinh",
    },
  };

  return (
    <div className="min-h-screen font-nunito">
      <div className="w-full mx-auto px-4 py-8">
        {/* Header */}
        <HeaderTool
          title="Tính Ngày Dự Sinh"
          subtitle="Công cụ chuyên nghiệp tính toán ngày sinh dự kiến"
          icon={Baby}
          color="pink"
        />

        {/* Tab Navigation */}
        <div className="flex space-x-3 mb-3 overflow-x-auto pb-2">
          <TabButton
            id="calculator"
            color="pink-500"
            icon={Calendar}
            label="Tính toán"
            isActive={activeTab === "calculator"}
            onClick={setActiveTab}
          />
          {result && (
            <>
              <TabButton
                id="results"
                color="pink-500"
                icon={TrendingUp}
                label="Kết quả Chi tiết"
                isActive={activeTab === "results"}
                onClick={setActiveTab}
              />
              <TabButton
                id="timeline"
                icon={Clock}
                label="Lịch trình Thai kỳ"
                color="pink-500"
                isActive={activeTab === "timeline"}
                onClick={setActiveTab}
              />
            </>
          )}
        </div>

        {/* Guide Section */}
        <div className="mb-6 p-4 bg-pink-50 rounded-lg border border-pink-200">
          <div
            onClick={() => setShowGuide(!showGuide)}
            className="flex items-center justify-between cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <h3 className="text-md font-semibold text-pink-800">
                Hướng dẫn tính ngày dự sinh và Lưu ý
              </h3>
              <p className="text-xs text-pink-800">
                {"(Nhấp vào đây để xem chi tiết)"}
              </p>
            </div>

            <button className="text-pink-600 hover:text-pink-800">
              <Info className="h-5 w-5" />
            </button>
          </div>

          {showGuide && (
            <div className="text-sm text-pink-700 space-y-3 mt-3">
              <p>
                <strong>1. Các phương pháp tính ngày dự sinh:</strong>
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>
                  <strong>LMP (Chu kỳ kinh nguyệt cuối):</strong> Phương pháp
                  phổ biến nhất, tính từ ngày đầu của chu kỳ kinh nguyệt cuối
                </li>
                <li>
                  <strong>IVF (Thụ tinh ống nghiệm):</strong> Tính chính xác từ
                  ngày chuyển phôi
                </li>
                <li>
                  <strong>IUI (Thụ tinh nhân tạo):</strong> Tính từ ngày thực
                  hiện IUI
                </li>
                <li>
                  <strong>Siêu âm:</strong> Dựa trên tuổi thai đo được qua siêu
                  âm
                </li>
                <li>
                  <strong>Ngày thụ thai:</strong> Nếu biết chính xác ngày thụ
                  thai
                </li>
              </ul>

              <p>
                <strong>2. Độ chính xác:</strong>
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>IVF: Chính xác nhất (±1-2 ngày)</li>
                <li>Siêu âm sớm: Rất chính xác (±3-5 ngày)</li>
                <li>LMP: Chính xác với chu kỳ đều (±1 tuần)</li>
                <li>IUI: Khá chính xác (±3-5 ngày)</li>
              </ul>

              <p>
                <strong>3. Lưu ý:</strong> Chỉ có 5% thai phụ sinh đúng ngày dự
                sinh. Khoảng 85% sinh trong vòng 2 tuần trước và sau ngày dự
                sinh.
              </p>
            </div>
          )}
        </div>

        {/* Calculator Tab */}
        {activeTab === "calculator" && (
          <div className="grid lg:grid-cols-2 gap-8">
            <div className="bg-white rounded-lg p-8 shadow-sm border border-gray-200">
              <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center">
                <Baby className="h-5 w-5 mr-3 text-pink-600" />
                Thông tin tính toán
              </h2>

              <div className="space-y-6">
                {/* Method Selection */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-3 block">
                    Phương pháp tính toán
                  </label>
                  <div className="grid grid-cols-1 gap-3">
                    {methods.map((m) => (
                      <label
                        key={m.id}
                        className="flex items-center space-x-3 p-3 border border-dark-700 rounded-lg cursor-pointer hover:bg-gray-50"
                      >
                        <input
                          type="radio"
                          name="method"
                          value={m.id}
                          checked={method === m.id}
                          onChange={(e) => setMethod(e.target.value)}
                          className="text-pink-600"
                        />
                        <m.icon className="h-5 w-5 text-pink-600" />
                        <span className="text-sm font-medium">{m.name}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Method-specific inputs */}
                {method === "lmp" && (
                  <div className="space-y-4">
                    <div className="w-full flex flex-col">
                      <label className="text-sm pb-1">
                        Ngày đầu chu kỳ kinh nguyệt cuối
                      </label>
                      <div className="w-full flex items-center gap-2 py-2 px-3 text-sm border border-gray-300 rounded-md hover:pink-blue-500 focus:ring-pink-500 cursor-pointer">
                        <RefreshCcw className="text-pink-600 h-5 w-5" />
                        <input
                          type="date"
                          value={lmpDate}
                          onChange={(e) => setLmpDate(e.target.value)}
                          placeholder="Nhập ngày chuyển phôi"
                          className="flex-1 outline-none"
                        />
                      </div>
                    </div>
                    <div>
                      <ValueSlider
                        label="Độ dài chu kỳ kinh nguyệt (ngày)"
                        value={cycleLength}
                        onChange={setCycleLength}
                        min={21}
                        max={35}
                        step={1}
                      />
                    </div>
                  </div>
                )}

                {method === "ivf" && (
                  <div className="space-y-4">
                    <div className="w-full flex flex-col">
                      <label className="text-sm pb-1"> Ngày chuyển phôi</label>
                      <div className="w-full flex items-center gap-2 py-2 px-3 text-sm border border-gray-300 rounded-md hover:pink-blue-500 focus:ring-pink-500 cursor-pointer">
                        <Calendar className="text-pink-600 h-5 w-5" />
                        <input
                          type="date"
                          value={ivfDate}
                          onChange={(e) => setIvfDate(e.target.value)}
                          placeholder="Nhập ngày chuyển phôi"
                          className="flex-1 outline-none"
                        />
                      </div>
                    </div>
                    <div className="w-full flex flex-col">
                      <label className="text-sm pb-1"> Loại phôi</label>
                      <div className="w-full flex items-center gap-2 py-2 px-3 text-sm border border-gray-300 rounded-md hover:border-pink-500 cursor-pointer">
                        <PillBottle className="text-pink-500 h-5 w-5" />
                        <select
                          value={ivfType}
                          onChange={(e) => setIvfType(e.target.value)}
                          className="w-full outline-none cursor-pointer"
                        >
                          {ivfTypes.map((type) => (
                            <option key={type.id} value={type.id}>
                              {type.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {method === "iui" && (
                  <div className="w-full flex flex-col">
                    <label className="text-sm pb-1"> Ngày thực hiện IUI</label>
                    <div className="w-full flex items-center gap-2 py-2 px-3 text-sm border border-gray-300 rounded-md hover:pink-blue-500 focus:ring-pink-500 cursor-pointer">
                      <Calendar className="text-pink-600 h-5 w-5" />
                      <input
                        type="date"
                        value={iuiDate}
                        onChange={(e) => setIuiDate(e.target.value)}
                        placeholder="Nhập ngày chuyển phôi"
                        className="flex-1 outline-none"
                      />
                    </div>
                  </div>
                )}

                {method === "ultrasound" && (
                  <div className="space-y-4">
                    <div className="w-full flex flex-col">
                      <label className="text-sm pb-1"> Ngày siêu âm</label>
                      <div className="w-full flex items-center gap-2 py-2 px-3 text-sm border border-gray-300 rounded-md hover:pink-blue-500 focus:ring-pink-500 cursor-pointer">
                        <Calendar className="text-pink-600 h-5 w-5" />
                        <input
                          type="date"
                          value={ultrasoundDate}
                          onChange={(e) => setUltrasoundDate(e.target.value)}
                          placeholder="Nhập ngày siêu âm"
                          className="flex-1 outline-none"
                        />
                      </div>
                    </div>
                    <div className="w-full flex flex-col">
                      <label className="text-sm pb-1">
                        Tuổi thai khi siêu âm (tuần.ngày)
                      </label>
                      <div className="w-full flex items-center gap-2 py-2 px-3 text-sm border border-gray-300 rounded-md hover:pink-blue-500 focus:ring-pink-500 cursor-pointer">
                        <Calendar className="text-pink-600 h-5 w-5" />
                        <input
                          type="text"
                          placeholder="Ví dụ: 12.3 (12 tuần 3 ngày)"
                          value={gestationalAge}
                          onChange={(e) => setGestationalAge(e.target.value)}
                          className="flex-1 outline-none"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {method === "conception" && (
                  <div className="w-full flex flex-col">
                    <label className="text-sm pb-1"> Ngày thụ thai</label>
                    <div className="w-full flex items-center gap-2 py-2 px-3 text-sm border border-gray-300 rounded-md hover:pink-blue-500 focus:ring-pink-500 cursor-pointer">
                      <Calendar className="text-pink-600 h-5 w-5" />
                      <input
                        type="date"
                        value={conceptDate}
                        onChange={(e) => setConceptDate(e.target.value)}
                        placeholder="Nhập ngày thụ thai"
                        className="flex-1 outline-none"
                      />
                    </div>
                  </div>
                )}

                <button
                  disabled={loading}
                  onClick={calculateDueDate}
                  className="w-full bg-gradient-to-r from-pink-500 to-pink-500 text-white py-3 px-6 rounded-lg cursor-pointer hover:from-pink-600 hover:to-pink-600 transition-all font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  <Calendar className="h-5 w-5 mr-2 inline" />
                  <span>
                    {loading ? "Đang tính toán..." : "Tính Ngày Dự Sinh"}
                  </span>
                </button>
              </div>
            </div>

            {result && (
              <div className="flex flex-col gap-4">
                <MedicalCard
                  title="Ngày dự sinh"
                  value={result.dueDate}
                  unit=""
                  subtitle="Ngày sinh dự kiến"
                  icon={Baby}
                  color="pink"
                />
                <MedicalCard
                  title="Tuổi thai hiện tại"
                  value={`${result.currentWeek}.${result.currentDay}`}
                  unit="tuần"
                  subtitle="Tuần.ngày"
                  icon={Clock}
                  color="pink"
                />
                <MedicalCard
                  title="Tam cá nguyệt"
                  value={result.trimester}
                  unit=""
                  subtitle={trimesterInfo[result.trimester]?.name}
                  icon={Heart}
                  color="rose"
                />
                <MedicalCard
                  title="Còn lại"
                  value={result.daysUntilDue}
                  unit="ngày"
                  subtitle="Đến ngày dự sinh"
                  icon={Target}
                  color="pink"
                />
              </div>
            )}
          </div>
        )}

        {/* Results Tab */}
        {activeTab === "results" && result && (
          <div className="space-y-8">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <MedicalCard
                title="Ngày dự sinh"
                value={result.dueDate}
                unit=""
                subtitle="Ngày sinh dự kiến"
                icon={Baby}
                color="pink"
                description="Ngày sinh dự kiến dựa trên phương pháp tính toán được chọn"
              />
              <MedicalCard
                title="Ngày thụ thai"
                value={result.conceptionDate}
                unit=""
                subtitle="Ngày thụ thai ước tính"
                icon={Heart}
                color="pink"
                description="Ngày thụ thai được ước tính dựa trên phương pháp tính toán"
              />
              <MedicalCard
                title="Tuổi thai"
                value={`${result.currentWeek} tuần ${result.currentDay} ngày`}
                unit=""
                subtitle="Tuổi thai hiện tại"
                icon={Clock}
                color="rose"
                description="Tuổi thai tính từ ngày đầu chu kỳ kinh nguyệt cuối"
              />
              <MedicalCard
                title="Tam cá nguyệt"
                value={result.trimester}
                unit=""
                subtitle={trimesterInfo[result.trimester]?.name}
                icon={Activity}
                color="pink"
                description={trimesterInfo[result.trimester]?.description}
              />
              <MedicalCard
                title="Còn lại"
                value={result.daysUntilDue}
                unit="ngày"
                subtitle="Đến ngày dự sinh"
                icon={Target}
                color="pink"
                description="Số ngày còn lại cho đến ngày dự sinh"
              />
              <MedicalCard
                title="Phương pháp"
                value={result.method}
                unit=""
                subtitle="Phương pháp tính toán"
                icon={Stethoscope}
                color="rose"
                description="Phương pháp được sử dụng để tính ngày dự sinh"
              />
            </div>

            {result.nextMilestone && (
              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                <div className="flex items-center space-x-3 mb-4">
                  <Star className="h-6 w-6 text-pink-600" />
                  <h3 className="text-lg font-semibold text-gray-800">
                    Cột mốc tiếp theo
                  </h3>
                </div>
                <div className="bg-pink-50 p-4 rounded-lg">
                  <p className="text-pink-800 font-medium">
                    Tuần {result.nextMilestone.week}:{" "}
                    {result.nextMilestone.event}
                  </p>
                  <p className="text-sm text-pink-600 mt-1">
                    Còn {result.nextMilestone.week - result.currentWeek} tuần
                    nữa
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Timeline Tab */}
        {activeTab === "timeline" && result && (
          <div className="space-y-8">
            <div className="bg-white rounded-lg p-8 shadow-sm border border-gray-200">
              <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <Clock className="h-6 w-6 mr-3 text-pink-600" />
                Lịch trình Thai kỳ
              </h3>

              <div className="space-y-4">
                {[
                  {
                    week: 4,
                    title: "Nhịp tim bắt đầu",
                    desc: "Tim thai nhi bắt đầu đập",
                    color: "pink",
                  },
                  {
                    week: 8,
                    title: "Hình thành cơ quan",
                    desc: "Các cơ quan chính được hình thành",
                    color: "pink",
                  },
                  {
                    week: 12,
                    title: "Kết thúc tam cá nguyệt 1",
                    desc: "Nguy cơ sảy thai giảm đáng kể",
                    color: "rose",
                  },
                  {
                    week: 16,
                    title: "Biết giới tính",
                    desc: "Có thể xác định được giới tính",
                    color: "pink",
                  },
                  {
                    week: 20,
                    title: "Siêu âm hình thái",
                    desc: "Siêu âm chi tiết kiểm tra dị tật",
                    color: "pink",
                  },
                  {
                    week: 24,
                    title: "Khả năng sống",
                    desc: "Thai nhi có khả năng sống ngoài tử cung",
                    color: "rose",
                  },
                  {
                    week: 28,
                    title: "Kết thúc tam cá nguyệt 2",
                    desc: "Bắt đầu giai đoạn cuối thai kỳ",
                    color: "pink",
                  },
                  {
                    week: 32,
                    title: "Phát triển não bộ",
                    desc: "Não bộ phát triển nhanh chóng",
                    color: "pink",
                  },
                  {
                    week: 36,
                    title: "Thai nhi hoàn thiện",
                    desc: "Các cơ quan đã hoàn thiện",
                    color: "rose",
                  },
                  {
                    week: 40,
                    title: "Ngày dự sinh",
                    desc: "Thai kỳ đủ tháng",
                    color: "pink",
                  },
                ].map((milestone, index) => (
                  <div
                    key={index}
                    className={`flex items-center space-x-4 p-4 rounded-lg ${
                      result.currentWeek >= milestone.week
                        ? "bg-green-50 border-green-200"
                        : result.currentWeek >= milestone.week - 2
                        ? "bg-yellow-50 border-yellow-200"
                        : "bg-gray-50 border-gray-200"
                    } border`}
                  >
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        result.currentWeek >= milestone.week
                          ? "bg-green-500"
                          : result.currentWeek >= milestone.week - 2
                          ? "bg-yellow-500"
                          : "bg-gray-300"
                      }`}
                    >
                      <span className="text-white font-bold text-sm">
                        {milestone.week}
                      </span>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-800">
                        {milestone.title}
                      </h4>
                      <p className="text-sm text-gray-600">{milestone.desc}</p>
                    </div>
                    <div className="text-right">
                      {result.currentWeek >= milestone.week ? (
                        <CheckCircle className="h-6 w-6 text-green-500" />
                      ) : result.currentWeek >= milestone.week - 2 ? (
                        <Clock className="h-6 w-6 text-yellow-500" />
                      ) : (
                        <Clock className="h-6 w-6 text-gray-400" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Trimester breakdown */}
            <div className="grid md:grid-cols-3 gap-6">
              {Object.entries(trimesterInfo).map(([num, info]) => (
                <div
                  key={num}
                  className={`bg-white rounded-lg p-6 shadow-sm border-2 ${
                    result.trimester === parseInt(num)
                      ? "border-pink-300"
                      : "border-gray-200"
                  }`}
                >
                  <div className="flex items-center space-x-3 mb-4">
                    <div
                      className={`w-10 h-10 rounded-full bg-${info.color}-100 flex items-center justify-center`}
                    >
                      <span className={`text-${info.color}-600 font-bold`}>
                        {num}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800">
                        {info.name}
                      </h4>
                      <p className="text-sm text-gray-600">
                        Tuần 1-{num === "1" ? "13" : num === "2" ? "27" : "40"}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-700">{info.description}</p>
                  {result.trimester === parseInt(num) && (
                    <div className="mt-3 p-2 bg-pink-50 rounded">
                      <p className="text-sm text-pink-700 font-medium">
                        Hiện tại: Tuần {result.currentWeek}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Health recommendations */}
            <div className="bg-white rounded-lg p-8 shadow-sm border border-gray-200">
              <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <Heart className="h-6 w-6 mr-3 text-rose-600" />
                Khuyến nghị theo tam cá nguyệt
              </h3>

              <div className="space-y-4">
                {result.trimester === 1 && (
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-pink-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-pink-800 mb-2">
                        Dinh dưỡng
                      </h4>
                      <ul className="text-sm text-pink-700 space-y-1">
                        <li>• Bổ sung acid folic 400-800 mcg/ngày</li>
                        <li>• Tránh rượu bia, thuốc lá</li>
                        <li>• Ăn nhiều rau xanh, trái cây</li>
                        <li>• Uống đủ nước</li>
                      </ul>
                    </div>
                    <div className="bg-pink-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-pink-800 mb-2">
                        Khám thai
                      </h4>
                      <ul className="text-sm text-pink-700 space-y-1">
                        <li>• Khám thai lần đầu trước 12 tuần</li>
                        <li>• Xét nghiệm máu cơ bản</li>
                        <li>• Siêu âm xác định túi thai</li>
                        <li>• Tầm soát nhiễm trùng</li>
                      </ul>
                    </div>
                  </div>
                )}

                {result.trimester === 2 && (
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-pink-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-pink-800 mb-2">
                        Dinh dưỡng
                      </h4>
                      <ul className="text-sm text-pink-700 space-y-1">
                        <li>• Tăng 300-500 calo/ngày</li>
                        <li>• Bổ sung canxi và vitamin D</li>
                        <li>• Protein chất lượng cao</li>
                        <li>• Sắt để phòng thiếu máu</li>
                      </ul>
                    </div>
                    <div className="bg-pink-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-pink-800 mb-2">
                        Khám thai
                      </h4>
                      <ul className="text-sm text-pink-700 space-y-1">
                        <li>• Siêu âm hình thái học 18-22 tuần</li>
                        <li>• Tầm soát đái tháo đường thai kỳ</li>
                        <li>• Đo huyết áp thường xuyên</li>
                        <li>• Khám thai mỗi 4 tuần</li>
                      </ul>
                    </div>
                  </div>
                )}

                {result.trimester === 3 && (
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-pink-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-pink-800 mb-2">
                        Chuẩn bị sinh
                      </h4>
                      <ul className="text-sm text-pink-700 space-y-1">
                        <li>• Học lớp tiền sản</li>
                        <li>• Chuẩn bị đồ dùng cho mẹ và bé</li>
                        <li>• Lập kế hoạch sinh</li>
                        <li>• Nghỉ thai sản</li>
                      </ul>
                    </div>
                    <div className="bg-pink-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-pink-800 mb-2">
                        Khám thai
                      </h4>
                      <ul className="text-sm text-pink-700 space-y-1">
                        <li>• Khám thai mỗi 2 tuần</li>
                        <li>• Theo dõi cử động thai nhi</li>
                        <li>• Siêu âm đánh giá tăng trưởng</li>
                        <li>• Chuẩn bị sinh từ 37 tuần</li>
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Medical Info Banner */}
        <div className="bg-white rounded-lg p-6 mt-6 mb-4 shadow-sm border border-pink-100">
          <div className="flex items-center space-x-4 mb-4">
            <Shield className="h-6 w-6 text-pink-600" />
            <h3 className="text-lg font-semibold text-gray-800">
              Thông tin y tế quan trọng
            </h3>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-3 p-3 bg-pink-50 rounded-xl">
              <Info className="h-5 w-5 text-pink-600" />
              <div>
                <p className="font-medium text-pink-800">Độ chính xác cao</p>
                <p className="text-sm text-pink-600">Dựa trên chuẩn y khoa</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-pink-50 rounded-xl">
              <Users className="h-5 w-5 text-pink-600" />
              <div>
                <p className="font-medium text-pink-800">Nhiều phương pháp</p>
                <p className="text-sm text-pink-600">Phù hợp mọi trường hợp</p>
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
              <strong>Lưu ý:</strong> Đây chỉ là công cụ tham khảo. Hãy luôn
              tham khảo ý kiến bác sĩ sản khoa để có lời khuyên chính xác nhất
              cho thai kỳ của bạn.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PregnancyCalculator;

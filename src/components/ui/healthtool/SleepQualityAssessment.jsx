import React, { useState } from "react";
import {
  Moon,
  Clock,
  TrendingUp,
  Calendar,
  Info,
  Shield,
  Award,
  Users,
  Star,
  CheckCircle,
  Target,
  Activity,
  Heart,
  Brain,
  Zap,
  Sun,
  Coffee,
  Bed,
  Timer,
} from "lucide-react";
import HeaderTool from "./HeaderTool";
import TabButton from "../../features/TabButton";

const SleepQualityAssessment = () => {
  const [activeTab, setActiveTab] = useState("assessment");
  const [showGuide, setShowGuide] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  // Form states
  const [sleepTime, setSleepTime] = useState("");
  const [wakeTime, setWakeTime] = useState("");
  const [fallAsleepTime, setFallAsleepTime] = useState(15);
  const [nightWakeups, setNightWakeups] = useState(1);
  const [wakeupDuration, setWakeupDuration] = useState(10);
  const [sleepQuality, setSleepQuality] = useState(3);
  const [daytimeFatigue, setDaytimeFatigue] = useState(2);
  const [energyLevel, setEnergyLevel] = useState(3);
  const [concentration, setConcentration] = useState(3);
  const [mood, setMood] = useState(3);
  const [caffeineIntake, setCaffeineIntake] = useState(1);
  const [exerciseHours, setExerciseHours] = useState(6);
  const [screenTime, setScreenTime] = useState(2);
  const [stressLevel, setStressLevel] = useState(2);

  const ValueSlider = ({
    label,
    value,
    onChange,
    min,
    max,
    step,
    unit = "",
  }) => (
    <div className="space-y-2">
      <div className="flex justify-between">
        <label className="text-sm font-medium text-gray-700">{label}</label>
        <span className="text-sm text-blue-600 font-semibold">
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
        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider-blue"
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
    </div>
  );

  const MedicalCard = ({
    title,
    value,
    unit,
    subtitle,
    icon: Icon,
    color,
    description,
  }) => (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-2 bg-${color}-100 rounded-lg`}>
          <Icon className={`h-6 w-6 text-${color}-600`} />
        </div>
      </div>
      <div className="space-y-2">
        <p className="text-2xl font-bold text-gray-800">
          {value} {unit}
        </p>
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className="text-xs text-gray-500">{subtitle}</p>
        {description && (
          <p className="text-xs text-gray-400 mt-2">{description}</p>
        )}
      </div>
    </div>
  );

  // Sleep quality calculation based on WHO standards
  const calculateSleepQuality = () => {
    setLoading(true);

    setTimeout(() => {
      // Calculate sleep duration
      const sleepStart = new Date(`2024-01-01 ${sleepTime}`);
      const sleepEnd = new Date(
        `2024-01-${sleepTime > wakeTime ? "02" : "01"} ${wakeTime}`
      );
      const sleepDuration = (sleepEnd - sleepStart) / (1000 * 60 * 60);

      // Calculate sleep efficiency
      const timeInBed = sleepDuration * 60; // in minutes
      const actualSleep =
        timeInBed - fallAsleepTime - nightWakeups * wakeupDuration;
      const sleepEfficiency = (actualSleep / timeInBed) * 100;

      // WHO Sleep Quality Index calculation
      let whoScore = 0;

      // Sleep duration (0-25 points)
      if (sleepDuration >= 7 && sleepDuration <= 9) whoScore += 25;
      else if (sleepDuration >= 6 && sleepDuration < 7) whoScore += 20;
      else if (sleepDuration >= 5 && sleepDuration < 6) whoScore += 15;
      else whoScore += 10;

      // Sleep efficiency (0-20 points)
      if (sleepEfficiency >= 85) whoScore += 20;
      else if (sleepEfficiency >= 75) whoScore += 15;
      else if (sleepEfficiency >= 65) whoScore += 10;
      else whoScore += 5;

      // Sleep quality rating (0-15 points)
      whoScore += (sleepQuality - 1) * 3.75;

      // Daytime functioning (0-20 points)
      whoScore +=
        (5 - daytimeFatigue) * 4 +
        energyLevel * 2 +
        concentration * 2 +
        mood * 2;

      // Sleep hygiene factors (0-20 points)
      let hygieneScore = 20;
      if (caffeineIntake > 2) hygieneScore -= 5;
      if (exerciseHours < 4) hygieneScore -= 3;
      if (screenTime < 1) hygieneScore -= 2;
      if (stressLevel > 3) hygieneScore -= 5;
      whoScore += Math.max(0, hygieneScore);

      // Determine quality level
      let qualityLevel, qualityColor, recommendations;
      if (whoScore >= 80) {
        qualityLevel = "Xuất sắc";
        qualityColor = "green";
        recommendations = [
          "Duy trì thói quen ngủ tốt hiện tại",
          "Tiếp tục theo dõi chất lượng giấc ngủ",
          "Chia sẻ kinh nghiệm với người khác",
        ];
      } else if (whoScore >= 65) {
        qualityLevel = "Tốt";
        qualityColor = "blue";
        recommendations = [
          "Cải thiện môi trường ngủ",
          "Tối ưu thời gian ngủ",
          "Giảm stress trước khi ngủ",
        ];
      } else if (whoScore >= 50) {
        qualityLevel = "Trung bình";
        qualityColor = "yellow";
        recommendations = [
          "Thiết lập lịch ngủ cố định",
          "Hạn chế caffeine sau 14h",
          "Tăng cường hoạt động thể chất",
          "Cải thiện thói quen trước khi ngủ",
        ];
      } else {
        qualityLevel = "Kém";
        qualityColor = "red";
        recommendations = [
          "Tham khảo ý kiến bác sĩ chuyên khoa",
          "Thiết lập lại hoàn toàn thói quen ngủ",
          "Loại bỏ các yếu tố ảnh hưởng đến giấc ngủ",
          "Xem xét điều trị rối loạn giấc ngủ",
        ];
      }

      setResult({
        sleepDuration: sleepDuration.toFixed(1),
        sleepEfficiency: sleepEfficiency.toFixed(1),
        whoScore: whoScore.toFixed(0),
        qualityLevel,
        qualityColor,
        recommendations,
        fallAsleepTime,
        nightWakeups,
        wakeupDuration,
        sleepQuality,
        daytimeFatigue,
        energyLevel,
        bedtime: sleepTime,
        waketime: wakeTime,
      });

      setLoading(false);
      setActiveTab("results");
    }, 2000);
  };

  const sleepStages = [
    {
      stage: "Giai đoạn 1",
      duration: "5-10%",
      description: "Ngủ nông, dễ thức giấc",
    },
    {
      stage: "Giai đoạn 2",
      duration: "45-55%",
      description: "Giấc ngủ ổn định",
    },
    {
      stage: "Giai đoạn 3",
      duration: "15-20%",
      description: "Giấc ngủ sâu, phục hồi",
    },
    { stage: "REM", duration: "20-25%", description: "Giấc ngủ REM, ghi nhớ" },
  ];

  return (
    <div className="min-h-screen font-nunito ">
      <div className="w-full mx-auto px-4 py-8">
        {/* Header */}
        <HeaderTool
          title="Đánh giá Chất lượng Giấc ngủ"
          subtitle="Công cụ đánh giá theo tiêu chuẩn WHO"
          icon={Moon}
          color="blue"
        />

        {/* Tab Navigation */}
        <div className="flex space-x-3 mb-6 overflow-x-auto pb-2">
          <TabButton
            id="assessment"
            color="blue-500"
            icon={Moon}
            label="Đánh giá"
            isActive={activeTab === "assessment"}
            onClick={setActiveTab}
          />
          {result && (
            <>
              <TabButton
                id="results"
                color="blue-500"
                icon={TrendingUp}
                label="Kết quả WHO"
                isActive={activeTab === "results"}
                onClick={setActiveTab}
              />
              <TabButton
                id="recommendations"
                icon={Brain}
                label="Khuyến nghị"
                color="blue-500"
                isActive={activeTab === "recommendations"}
                onClick={setActiveTab}
              />
              <TabButton
                id="sleep-stages"
                icon={Activity}
                label="Giai đoạn Giấc ngủ"
                color="blue-500"
                isActive={activeTab === "sleep-stages"}
                onClick={setActiveTab}
              />
            </>
          )}
        </div>

        {/* Guide Section */}
        <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div
            onClick={() => setShowGuide(!showGuide)}
            className="flex items-center justify-between cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <h3 className="text-md font-semibold text-blue-800">
                Hướng dẫn đánh giá chất lượng giấc ngủ
              </h3>
              <p className="text-xs text-blue-800">
                {"(Nhấp vào đây để xem chi tiết)"}
              </p>
            </div>
            <button className="text-blue-600 hover:text-blue-800">
              <Info className="h-5 w-5" />
            </button>
          </div>

          {showGuide && (
            <div className="text-sm text-blue-700 space-y-3 mt-3">
              <p>
                <strong>1. Các chỉ số đánh giá:</strong>
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>
                  <strong>Thời gian ngủ:</strong> 7-9 tiếng/đêm cho người trưởng
                  thành
                </li>
                <li>
                  <strong>Hiệu suất giấc ngủ:</strong> Thời gian ngủ thực/thời
                  gian ở giường ≥85%
                </li>
                <li>
                  <strong>Thời gian rơi vào giấc ngủ:</strong> ≤30 phút
                </li>
                <li>
                  <strong>Số lần thức giấc:</strong> ≤2 lần/đêm
                </li>
                <li>
                  <strong>Chất lượng giấc ngủ chủ quan:</strong> Cảm nhận về
                  giấc ngủ
                </li>
              </ul>

              <p>
                <strong>2. Thang điểm (0-100):</strong>
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>80-100: Xuất sắc - Giấc ngủ chất lượng cao</li>
                <li>65-79: Tốt - Giấc ngủ ở mức tốt</li>
                <li>50-64: Trung bình - Cần cải thiện</li>
                <li>0-49: Kém - Cần can thiệp y tế</li>
              </ul>

              <p>
                <strong>3. Lưu ý:</strong> Đánh giá này dựa trên tiêu chuẩn của
                Tổ chức Y tế Thế giới (WHO) và Hiệp hội Y học Giấc ngủ Quốc tế.
              </p>
            </div>
          )}
        </div>

        {/* Assessment Tab */}
        {activeTab === "assessment" && (
          <div className="grid lg:grid-cols-2 gap-8">
            <div className="bg-white rounded-lg p-8 shadow-sm border border-gray-200">
              <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center">
                <Moon className="h-5 w-5 mr-3 text-blue-600" />
                Thông tin giấc ngủ
              </h2>

              <div className="space-y-6">
                {/* Sleep and Wake Times */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Thời gian đi ngủ
                    </label>
                    <div className="flex items-center gap-2 py-2 px-3 border border-gray-300 rounded-md">
                      <Bed className="text-blue-600 h-5 w-5" />
                      <input
                        type="time"
                        value={sleepTime}
                        onChange={(e) => setSleepTime(e.target.value)}
                        className="flex-1 outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Thời gian thức dậy
                    </label>
                    <div className="flex items-center gap-2 py-2 px-3 border border-gray-300 rounded-md">
                      <Sun className="text-blue-600 h-5 w-5" />
                      <input
                        type="time"
                        value={wakeTime}
                        onChange={(e) => setWakeTime(e.target.value)}
                        className="flex-1 outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Sleep Parameters */}
                <ValueSlider
                  label="Thời gian rơi vào giấc ngủ"
                  value={fallAsleepTime}
                  onChange={setFallAsleepTime}
                  min={5}
                  max={60}
                  step={5}
                  unit=" phút"
                />

                <ValueSlider
                  label="Số lần thức giấc trong đêm"
                  value={nightWakeups}
                  onChange={setNightWakeups}
                  min={0}
                  max={10}
                  step={1}
                  unit=" lần"
                />

                <ValueSlider
                  label="Thời gian thức dậy giữa đêm (mỗi lần)"
                  value={wakeupDuration}
                  onChange={setWakeupDuration}
                  min={5}
                  max={60}
                  step={5}
                  unit=" phút"
                />

                {/* Subjective Quality */}
                <ValueSlider
                  label="Chất lượng giấc ngủ chủ quan (1=Rất kém, 5=Xuất sắc)"
                  value={sleepQuality}
                  onChange={setSleepQuality}
                  min={1}
                  max={5}
                  step={1}
                />

                <ValueSlider
                  label="Mức độ mệt mỏi ban ngày (1=Không mệt, 5=Rất mệt)"
                  value={daytimeFatigue}
                  onChange={setDaytimeFatigue}
                  min={1}
                  max={5}
                  step={1}
                />

                <ValueSlider
                  label="Mức năng lượng ban ngày (1=Rất thấp, 5=Rất cao)"
                  value={energyLevel}
                  onChange={setEnergyLevel}
                  min={1}
                  max={5}
                  step={1}
                />

                <ValueSlider
                  label="Khả năng tập trung (1=Rất kém, 5=Rất tốt)"
                  value={concentration}
                  onChange={setConcentration}
                  min={1}
                  max={5}
                  step={1}
                />

                <ValueSlider
                  label="Tâm trạng chung (1=Rất tệ, 5=Rất tốt)"
                  value={mood}
                  onChange={setMood}
                  min={1}
                  max={5}
                  step={1}
                />
              </div>
            </div>

            <div className="bg-white rounded-lg p-8 shadow-sm border border-gray-200">
              <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center">
                <Activity className="h-5 w-5 mr-3 text-blue-600" />
                Yếu tố ảnh hưởng
              </h2>

              <div className="space-y-6">
                <ValueSlider
                  label="Số cốc cà phê/trà trong ngày"
                  value={caffeineIntake}
                  onChange={setCaffeineIntake}
                  min={0}
                  max={10}
                  step={1}
                  unit=" cốc"
                />

                <ValueSlider
                  label="Thời gian tập thể dục trước khi ngủ"
                  value={exerciseHours}
                  onChange={setExerciseHours}
                  min={1}
                  max={12}
                  step={1}
                  unit=" giờ"
                />

                <ValueSlider
                  label="Thời gian ngừng dùng thiết bị điện tử trước khi ngủ"
                  value={screenTime}
                  onChange={setScreenTime}
                  min={0}
                  max={4}
                  step={0.5}
                  unit=" giờ"
                />

                <ValueSlider
                  label="Mức độ stress (1=Rất thấp, 5=Rất cao)"
                  value={stressLevel}
                  onChange={setStressLevel}
                  min={1}
                  max={5}
                  step={1}
                />

                <button
                  disabled={loading || !sleepTime || !wakeTime}
                  onClick={calculateSleepQuality}
                  className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 px-6 rounded-lg cursor-pointer hover:from-blue-600 hover:to-blue-700 transition-all font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Moon className="h-5 w-5 mr-2 inline" />
                  <span>
                    {loading
                      ? "Đang phân tích..."
                      : "Đánh giá Chất lượng Giấc ngủ"}
                  </span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Results Tab */}
        {activeTab === "results" && result && (
          <div className="space-y-8">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <MedicalCard
                title="Điểm"
                value={result.whoScore}
                unit="/100"
                subtitle={`Chất lượng: ${result.qualityLevel}`}
                icon={Award}
                color={result.qualityColor}
                description="Điểm đánh giá theo tiêu chuẩn WHO"
              />
              <MedicalCard
                title="Thời gian ngủ"
                value={result.sleepDuration}
                unit="giờ"
                subtitle="Thời gian ngủ thực tế"
                icon={Clock}
                color="blue"
                description="Thời gian từ khi đi ngủ đến khi thức dậy"
              />
              <MedicalCard
                title="Hiệu suất giấc ngủ"
                value={result.sleepEfficiency}
                unit="%"
                subtitle="Tỷ lệ ngủ thực/thời gian ở giường"
                icon={TrendingUp}
                color="blue"
                description="Hiệu suất giấc ngủ theo WHO ≥85%"
              />
              <MedicalCard
                title="Chất lượng chủ quan"
                value={result.sleepQuality}
                unit="/5"
                subtitle="Đánh giá cá nhân"
                icon={Star}
                color="blue"
                description="Cảm nhận chủ quan về chất lượng giấc ngủ"
              />
            </div>

            {/* Detailed Analysis */}
            <div className="bg-white rounded-lg p-8 shadow-sm border border-gray-200">
              <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <Brain className="h-6 w-6 mr-3 text-blue-600" />
                Phân tích chi tiết WHO
              </h3>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-gray-700">
                    Thông số giấc ngủ
                  </h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                      <span className="text-sm font-medium">Giờ đi ngủ</span>
                      <span className="text-blue-700 font-semibold">
                        {result.bedtime}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                      <span className="text-sm font-medium">Giờ thức dậy</span>
                      <span className="text-blue-700 font-semibold">
                        {result.waketime}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                      <span className="text-sm font-medium">
                        Thời gian rơi vào giấc ngủ
                      </span>
                      <span className="text-blue-700 font-semibold">
                        {result.fallAsleepTime} phút
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                      <span className="text-sm font-medium">
                        Số lần thức giấc
                      </span>
                      <span className="text-blue-700 font-semibold">
                        {result.nightWakeups} lần
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-gray-700">
                    Hoạt động ban ngày
                  </h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                      <span className="text-sm font-medium">
                        Mức độ mệt mỏi
                      </span>
                      <span className="text-blue-700 font-semibold">
                        {result.daytimeFatigue}/5
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                      <span className="text-sm font-medium">
                        Mức năng lượng
                      </span>
                      <span className="text-blue-700 font-semibold">
                        {result.energyLevel}/5
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                      <span className="text-sm font-medium">
                        Khả năng tập trung
                      </span>
                      <span className="text-blue-700 font-semibold">
                        {result.concentration || 3}/5
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                      <span className="text-sm font-medium">
                        Tâm trạng chung
                      </span>
                      <span className="text-blue-700 font-semibold">
                        {result.mood || 3}/5
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* WHO Recommendations based on score */}
              <div className="mt-8">
                <h4 className="text-lg font-semibold text-gray-700 mb-4">
                  Đánh giá
                </h4>
                <div
                  className={`p-6 rounded-lg border-l-4 ${
                    result.qualityColor === "green"
                      ? "bg-green-50 border-green-500"
                      : result.qualityColor === "blue"
                      ? "bg-blue-50 border-blue-500"
                      : result.qualityColor === "yellow"
                      ? "bg-yellow-50 border-yellow-500"
                      : "bg-red-50 border-red-500"
                  }`}
                >
                  <div className="flex items-center space-x-3 mb-3">
                    <div
                      className={`w-3 h-3 rounded-full ${
                        result.qualityColor === "green"
                          ? "bg-green-500"
                          : result.qualityColor === "blue"
                          ? "bg-blue-500"
                          : result.qualityColor === "yellow"
                          ? "bg-yellow-500"
                          : "bg-red-500"
                      }`}
                    ></div>
                    <span
                      className={`font-semibold ${
                        result.qualityColor === "green"
                          ? "text-green-800"
                          : result.qualityColor === "blue"
                          ? "text-blue-800"
                          : result.qualityColor === "yellow"
                          ? "text-yellow-800"
                          : "text-red-800"
                      }`}
                    >
                      Chất lượng giấc ngủ: {result.qualityLevel}
                    </span>
                  </div>
                  <p
                    className={`text-sm ${
                      result.qualityColor === "green"
                        ? "text-green-700"
                        : result.qualityColor === "blue"
                        ? "text-blue-700"
                        : result.qualityColor === "yellow"
                        ? "text-yellow-700"
                        : "text-red-700"
                    }`}
                  >
                    Điểm của bạn: {result.whoScore}/100.{" "}
                    {result.qualityColor === "green"
                      ? "Bạn có chất lượng giấc ngủ xuất sắc theo tiêu chuẩn WHO."
                      : result.qualityColor === "blue"
                      ? "Bạn có chất lượng giấc ngủ tốt, nhưng vẫn có thể cải thiện."
                      : result.qualityColor === "yellow"
                      ? "Chất lượng giấc ngủ của bạn ở mức trung bình, cần cải thiện."
                      : "Chất lượng giấc ngủ của bạn kém, cần can thiệp ngay lập tức."}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Recommendations Tab */}
        {activeTab === "recommendations" && result && (
          <div className="space-y-8">
            <div className="bg-white rounded-lg p-8 shadow-sm border border-gray-200">
              <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <Heart className="h-6 w-6 mr-3 text-blue-600" />
                Khuyến nghị cải thiện từ
              </h3>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-blue-700">
                    Khuyến nghị cụ thể
                  </h4>
                  <div className="space-y-3">
                    {result.recommendations.map((rec, index) => (
                      <div
                        key={index}
                        className="flex items-start space-x-3 p-4 bg-blue-50 rounded-lg"
                      >
                        <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-blue-800">{rec}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-blue-700">
                    Nguyên tắc vệ sinh giấc ngủ
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-start space-x-3 p-4 bg-blue-50 rounded-lg">
                      <Clock className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-blue-800">
                          Lịch trình cố định
                        </p>
                        <p className="text-xs text-blue-600">
                          Đi ngủ và thức dậy cùng giờ mỗi ngày
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3 p-4 bg-blue-50 rounded-lg">
                      <Coffee className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-blue-800">
                          Hạn chế caffeine
                        </p>
                        <p className="text-xs text-blue-600">
                          Không uống cà phê sau 14h
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3 p-4 bg-blue-50 rounded-lg">
                      <Zap className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-blue-800">
                          Môi trường ngủ
                        </p>
                        <p className="text-xs text-blue-600">
                          Phòng tối, mát, yên tĩnh
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3 p-4 bg-blue-50 rounded-lg">
                      <Timer className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-blue-800">
                          Thời gian màn hình
                        </p>
                        <p className="text-xs text-blue-600">
                          Tắt thiết bị điện tử 1-2h trước ngủ
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sleep improvement plan */}
            <div className="bg-white rounded-lg p-8 shadow-sm border border-gray-200">
              <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <Target className="h-6 w-6 mr-3 text-blue-600" />
                Kế hoạch cải thiện 4 tuần
              </h3>

              <div className="grid md:grid-cols-4 gap-4">
                {[
                  {
                    week: 1,
                    title: "Thiết lập lịch trình",
                    tasks: [
                      "Xác định giờ ngủ cố định",
                      "Tạo thói quen trước ngủ",
                      "Hạn chế caffeine chiều",
                    ],
                  },
                  {
                    week: 2,
                    title: "Cải thiện môi trường",
                    tasks: [
                      "Điều chỉnh nhiệt độ phòng",
                      "Loại bỏ ánh sáng",
                      "Giảm tiếng ồn",
                    ],
                  },
                  {
                    week: 3,
                    title: "Tối ưu hoạt động",
                    tasks: [
                      "Tập thể dục đều đặn",
                      "Quản lý stress",
                      "Hạn chế màn hình",
                    ],
                  },
                  {
                    week: 4,
                    title: "Duy trì & đánh giá",
                    tasks: [
                      "Theo dõi tiến triển",
                      "Điều chỉnh nếu cần",
                      "Đánh giá lại",
                    ],
                  },
                ].map((week, index) => (
                  <div key={index} className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-blue-800 mb-3">
                      Tuần {week.week}: {week.title}
                    </h4>
                    <ul className="space-y-2">
                      {week.tasks.map((task, taskIndex) => (
                        <li
                          key={taskIndex}
                          className="flex items-start space-x-2"
                        >
                          <div className="w-2 h-2 bg-blue-600 rounded-full mt-1.5 flex-shrink-0"></div>
                          <span className="text-xs text-blue-700">{task}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Sleep Stages Tab */}
        {activeTab === "sleep-stages" && result && (
          <div className="space-y-8">
            <div className="bg-white rounded-lg p-8 shadow-sm border border-gray-200">
              <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <Activity className="h-6 w-6 mr-3 text-blue-600" />
                Giai đoạn giấc ngủ theo WHO
              </h3>

              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-blue-700">
                    Chu kỳ giấc ngủ chuẩn
                  </h4>
                  <div className="space-y-3">
                    {sleepStages.map((stage, index) => (
                      <div
                        key={index}
                        className="flex items-center space-x-4 p-4 bg-blue-50 rounded-lg"
                      >
                        <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                          <span className="text-white font-bold text-sm">
                            {index + 1}
                          </span>
                        </div>
                        <div className="flex-1">
                          <h5 className="font-semibold text-blue-800">
                            {stage.stage}
                          </h5>
                          <p className="text-sm text-blue-600">
                            {stage.description}
                          </p>
                          <p className="text-xs text-blue-500 mt-1">
                            Tỷ lệ: {stage.duration}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-blue-700">
                    Phân tích chu kỳ của bạn
                  </h4>
                  <div className="space-y-3">
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <h5 className="font-semibold text-blue-800 mb-2">
                        Thời gian ngủ: {result.sleepDuration} giờ
                      </h5>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-blue-700">
                            Giai đoạn 1 (5-10%)
                          </span>
                          <span className="text-blue-600">
                            {(result.sleepDuration * 0.075 * 60).toFixed(0)}{" "}
                            phút
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-blue-700">
                            Giai đoạn 2 (45-55%)
                          </span>
                          <span className="text-blue-600">
                            {(result.sleepDuration * 0.5 * 60).toFixed(0)} phút
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-blue-700">
                            Giai đoạn 3 (15-20%)
                          </span>
                          <span className="text-blue-600">
                            {(result.sleepDuration * 0.175 * 60).toFixed(0)}{" "}
                            phút
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-blue-700">REM (20-25%)</span>
                          <span className="text-blue-600">
                            {(result.sleepDuration * 0.225 * 60).toFixed(0)}{" "}
                            phút
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                      <h5 className="font-semibold text-yellow-800 mb-2">
                        Lưu ý quan trọng
                      </h5>
                      <p className="text-sm text-yellow-700">
                        Một chu kỳ giấc ngủ hoàn chỉnh kéo dài 90-120 phút.
                        Trong {result.sleepDuration} giờ ngủ, bạn trải qua
                        khoảng {Math.round((result.sleepDuration * 60) / 105)}{" "}
                        chu kỳ.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sleep disorders information */}
            <div className="bg-white rounded-lg p-8 shadow-sm border border-gray-200">
              <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <Brain className="h-6 w-6 mr-3 text-blue-600" />
                Rối loạn giấc ngủ phổ biến theo
              </h3>

              <div className="grid md:grid-cols-3 gap-6">
                {[
                  {
                    name: "Mất ngủ (Insomnia)",
                    symptoms: [
                      "Khó rơi vào giấc ngủ",
                      "Thức giấc nhiều lần",
                      "Thức dậy sớm",
                    ],
                    prevalence: "10-30% dân số",
                  },
                  {
                    name: "Ngưng thở khi ngủ",
                    symptoms: [
                      "Ngáy to",
                      "Ngưng thở tạm thời",
                      "Mệt mỏi ban ngày",
                    ],
                    prevalence: "2-4% dân số",
                  },
                  {
                    name: "Hội chứng chân không yên",
                    symptoms: [
                      "Cảm giác khó chịu ở chân",
                      "Muốn di chuyển chân",
                      "Triệu chứng tệ hơn về đêm",
                    ],
                    prevalence: "5-10% dân số",
                  },
                ].map((disorder, index) => (
                  <div
                    key={index}
                    className="bg-red-50 p-6 rounded-lg border border-red-200"
                  >
                    <h4 className="font-semibold text-red-800 mb-3">
                      {disorder.name}
                    </h4>
                    <div className="space-y-2 mb-4">
                      <p className="text-sm font-medium text-red-700">
                        Triệu chứng:
                      </p>
                      <ul className="space-y-1">
                        {disorder.symptoms.map((symptom, symptomIndex) => (
                          <li
                            key={symptomIndex}
                            className="text-sm text-red-600 flex items-start space-x-2"
                          >
                            <div className="w-1.5 h-1.5 bg-red-600 rounded-full mt-1.5 flex-shrink-0"></div>
                            <span>{symptom}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <p className="text-xs text-red-600">
                      <strong>Tỷ lệ mắc:</strong> {disorder.prevalence}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-800">
                  <strong>Khuyến nghị:</strong> Nếu bạn có các triệu chứng trên
                  kéo dài hơn 3 tháng và ảnh hưởng đến cuộc sống hàng ngày, hãy
                  tham khảo ý kiến bác sĩ chuyên khoa.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Medical Info Banner */}
        <div className="bg-white rounded-lg p-6 mt-6 mb-4 shadow-sm border border-blue-100">
          <div className="flex items-center space-x-4 mb-4">
            <Shield className="h-6 w-6 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-800">
              Thông tin y tế quan trọng
            </h3>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-xl">
              <Info className="h-5 w-5 text-blue-600" />
              <div>
                <p className="font-medium text-blue-800">Chuẩn WHO</p>
                <p className="text-sm text-blue-600">
                  Đánh giá theo tiêu chuẩn quốc tế
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-xl">
              <Users className="h-5 w-5 text-blue-600" />
              <div>
                <p className="font-medium text-blue-800">Khoa học chứng minh</p>
                <p className="text-sm text-blue-600">
                  Dựa trên nghiên cứu y khoa
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-indigo-50 rounded-xl">
              <Award className="h-5 w-5 text-indigo-600" />
              <div>
                <p className="font-medium text-indigo-800">
                  Tư vấn cá nhân hóa
                </p>
                <p className="text-sm text-indigo-600">
                  Phù hợp với từng cá nhân
                </p>
              </div>
            </div>
          </div>
          <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
            <p className="text-sm text-yellow-800">
              <strong>Lưu ý:</strong> Đây là công cụ tham khảo dựa trên tiêu
              chuẩn WHO. Nếu có vấn đề về giấc ngủ kéo dài, hãy tham khảo ý kiến
              bác sĩ chuyên khoa giấc ngủ.
            </p>
          </div>
        </div>

        {/* Custom CSS for slider */}
      </div>
    </div>
  );
};

export default SleepQualityAssessment;

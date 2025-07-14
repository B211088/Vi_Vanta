import React, { useState } from "react";
import {
  Clock,
  Moon,
  Sun,
  Info,
  Brain,
  Zap,
  Coffee,
  Calendar,
  Power,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import TimePickerComponent from "./TimePickerComponent";

const SleepCalculator = ({ onBack }) => {
  const [fatigue, setFatigue] = useState(3);
  const [mode, setMode] = useState("sleepNow");
  const [wakeUpTime, setWakeUpTime] = useState("06:30");
  const [plannedSleepTime, setPlannedSleepTime] = useState("22:00");
  const [napDuration, setNapDuration] = useState(20);
  const [result, setResult] = useState([]);
  const [showInfo, setShowInfo] = useState(false);

  // Hàm tính toán thời gian ngủ
  const calculateSleepTime = () => {
    const now = new Date();
    const cycleMinutes = 90;
    const fallAsleepMinutes = 15;
    let suggestions = [];

    if (mode === "sleepNow") {
      // Ngủ ngay - tính giờ thức dậy
      let cycles = getCyclesFromFatigue(fatigue);

      for (let i = cycles; i >= 1; i--) {
        const totalSleepMinutes = i * cycleMinutes;
        const wakeTime = new Date(
          now.getTime() + (totalSleepMinutes + fallAsleepMinutes) * 60000
        );
        const timeString = wakeTime.toLocaleTimeString("vi-VN", {
          hour: "2-digit",
          minute: "2-digit",
        });
        const totalHours = Math.floor(totalSleepMinutes / 60);
        const totalMinutes = totalSleepMinutes % 60;

        suggestions.push({
          time: timeString,
          cycles: i,
          duration: `${totalHours}h ${totalMinutes}m`,
          quality: getQualityFromCycles(i),
          type: "fullSleep",
          note: i === cycles ? "Tối ưu cho mức mệt mỏi hiện tại" : "",
        });
      }
    } else if (mode === "wakeUpAt") {
      // Muốn thức dậy vào lúc - tính giờ đi ngủ
      const [h, m] = wakeUpTime.split(":");
      const target = new Date();
      target.setHours(parseInt(h), parseInt(m), 0, 0);

      if (target <= now) {
        target.setDate(target.getDate() + 1);
      }

      for (let i = 6; i >= 1; i--) {
        const totalSleepMinutes = i * cycleMinutes;
        const sleepTime = new Date(
          target.getTime() - (totalSleepMinutes + fallAsleepMinutes) * 60000
        );
        const timeString = sleepTime.toLocaleTimeString("vi-VN", {
          hour: "2-digit",
          minute: "2-digit",
        });
        const totalHours = Math.floor(totalSleepMinutes / 60);
        const totalMinutes = totalSleepMinutes % 60;

        const isToday = sleepTime.toDateString() === now.toDateString();
        const dayLabel = isToday ? "Hôm nay" : "Hôm qua";

        suggestions.push({
          time: timeString,
          cycles: i,
          duration: `${totalHours}h ${totalMinutes}m`,
          quality: getQualityFromCycles(i),
          type: "fullSleep",
          note: `${dayLabel} - ${getQualityFromCycles(i)} cho sức khỏe`,
        });
      }
    } else if (mode === "plannedSleep") {
      // Ngủ vào lúc đã định - tính giờ thức dậy
      const [h, m] = plannedSleepTime.split(":");
      const plannedTime = new Date();
      plannedTime.setHours(parseInt(h), parseInt(m), 0, 0);

      if (plannedTime <= now) {
        plannedTime.setDate(plannedTime.getDate() + 1);
      }

      let cycles = getCyclesFromFatigue(fatigue);

      for (let i = cycles; i >= 1; i--) {
        const totalSleepMinutes = i * cycleMinutes;
        const wakeTime = new Date(
          plannedTime.getTime() +
            (totalSleepMinutes + fallAsleepMinutes) * 60000
        );
        const timeString = wakeTime.toLocaleTimeString("vi-VN", {
          hour: "2-digit",
          minute: "2-digit",
        });
        const totalHours = Math.floor(totalSleepMinutes / 60);
        const totalMinutes = totalSleepMinutes % 60;

        const isNextDay =
          wakeTime.toDateString() !== plannedTime.toDateString();
        const dayLabel = isNextDay ? "Ngày mai" : "Cùng ngày";

        suggestions.push({
          time: timeString,
          cycles: i,
          duration: `${totalHours}h ${totalMinutes}m`,
          quality: getQualityFromCycles(i),
          type: "fullSleep",
          note: `${dayLabel} - ${
            i === cycles ? "Tối ưu" : "Ít hơn"
          } cho mức mệt mỏi`,
        });
      }
    } else if (mode === "powerNap") {
      // Ngủ trưa ngắn
      const napOptions = [10, 20, 30, 45, 60, 90];

      napOptions.forEach((duration) => {
        const wakeTime = new Date(now.getTime() + (duration + 5) * 60000); // 5 phút để ngủ
        const timeString = wakeTime.toLocaleTimeString("vi-VN", {
          hour: "2-digit",
          minute: "2-digit",
        });

        let quality, note;
        if (duration <= 20) {
          quality = "Tuyệt vời";
          note = "Ngủ ngắn lý tưởng - không gây mệt mỏi";
        } else if (duration <= 30) {
          quality = "Tốt";
          note = "Có thể hơi mệt khi thức dậy";
        } else if (duration <= 60) {
          quality = "Cẩn thận";
          note = "Có thể gây mệt mỏi và khó ngủ tối";
        } else {
          quality = "Một chu kỳ đủ";
          note = "Ngủ đủ 1 chu kỳ - tốt nếu rất mệt";
        }

        suggestions.push({
          time: timeString,
          cycles: duration === 90 ? 1 : 0,
          duration: `${duration} phút`,
          quality: quality,
          type: "nap",
          note: note,
        });
      });
    }

    setResult(suggestions);
  };

  const getCyclesFromFatigue = (fatigue) => {
    if (fatigue <= 2) return 4; // Ít mệt vẫn nên ngủ đủ
    else if (fatigue === 3) return 4;
    else if (fatigue === 4) return 5;
    else if (fatigue === 5) return 6;
    return 4;
  };

  const getQualityFromCycles = (cycles) => {
    if (cycles >= 5) return "Tuyệt vời";
    else if (cycles >= 4) return "Tốt";
    else if (cycles >= 3) return "Đủ dùng";
    else if (cycles >= 2) return "Ít";
    else return "Rất ít";
  };

  const fatigueLabels = {
    1: { label: "Rất tỉnh táo", color: "text-green-600", bg: "bg-green-100" },
    2: { label: "Hơi buồn ngủ", color: "text-green-500", bg: "bg-green-50" },
    3: { label: "Mệt vừa phải", color: "text-yellow-600", bg: "bg-yellow-100" },
    4: { label: "Khá mệt", color: "text-orange-600", bg: "bg-orange-100" },
    5: { label: "Kiệt sức", color: "text-red-600", bg: "bg-red-100" },
  };

  const modeOptions = [
    {
      value: "sleepNow",
      icon: Moon,
      title: "Ngủ ngay",
      subtitle: "Tính giờ thức dậy",
      description: "Bạn muốn ngủ ngay bây giờ",
    },
    {
      value: "wakeUpAt",
      icon: Sun,
      title: "Thức dậy lúc",
      subtitle: "Tính giờ đi ngủ",
      description: "Bạn muốn thức dậy vào giờ cụ thể",
    },
    {
      value: "plannedSleep",
      icon: Calendar,
      title: "Ngủ lúc",
      subtitle: "Tính giờ thức dậy",
      description: "Bạn dự định ngủ vào giờ cụ thể",
    },
    {
      value: "powerNap",
      icon: Coffee,
      title: "Ngủ ngắn",
      subtitle: "Ngủ ngắn hồi phục",
      description: "Ngủ ngắn từ 10-90 phút",
    },
  ];

  const InfoPanel = () => (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
      <h3 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
        <Info size={18} />
        Khoa học về giấc ngủ
      </h3>
      <div className="space-y-2 text-sm text-blue-700">
        <p>
          <strong>Chu kỳ ngủ 90 phút:</strong> Não bộ trải qua 4 giai đoạn: ngủ
          nhẹ → ngủ sâu → ngủ rất sâu → REM. Thức dậy đúng lúc kết thúc chu kỳ
          giúp tỉnh táo.
        </p>
        <p>
          <strong>Mức độ mệt mỏi:</strong> Quyết định số chu kỳ cần thiết. Người
          càng mệt cần ngủ càng lâu để cơ thể và não bộ phục hồi.
        </p>
        <p>
          <strong>Ngủ ngắn:</strong> 10-20 phút là lý tưởng. Ngủ quá 30 phút có
          thể gây mệt mỏi và ảnh hưởng giấc ngủ đêm.
        </p>
        <p>
          <strong>Thời gian chìm vào giấc ngủ:</strong> Người bình thường mất
          5-15 phút để ngủ được.
        </p>
      </div>
    </div>
  );

  return (
    <div className="w-f mx-auto p-6 bg-gradient-to-br from-indigo-50 via-white to-purple-50 rounded-2xl shadow-xl mt-10">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-3 rounded-full">
            <Moon className="text-white" size={32} />
          </div>
        </div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
          Máy Tính Giấc Ngủ Thông Minh
        </h1>
        <p className="text-gray-600">Tối ưu hóa giấc ngủ cho mọi tình huống</p>
      </div>

      {/* Info Toggle */}
      <div className="mb-6">
        <button
          onClick={() => setShowInfo(!showInfo)}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors"
        >
          <Info size={16} />
          {showInfo ? "Ẩn thông tin" : "Khoa học về giấc ngủ"}
        </button>
      </div>

      {showInfo && <InfoPanel />}

      {/* Mode Selection */}
      <div className="mb-6">
        <label className="block font-semibold mb-3 text-gray-700 flex items-center gap-2">
          <Clock size={20} className="text-blue-600" />
          Tình huống của bạn
        </label>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {modeOptions.map((option) => {
            const Icon = option.icon;
            return (
              <button
                key={option.value}
                onClick={() => setMode(option.value)}
                className={`p-3 rounded-lg border-2 transition-all text-center ${
                  mode === option.value
                    ? "border-blue-500 bg-blue-50 text-blue-700"
                    : "border-gray-200 bg-white hover:border-gray-300"
                }`}
              >
                <Icon size={20} className="mx-auto mb-1" />
                <p className="font-medium text-sm">{option.title}</p>
                <p className="text-xs text-gray-600">{option.subtitle}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Fatigue Level - Only for sleep modes */}
      {mode !== "powerNap" && (
        <div className="mb-6">
          <label className="block font-semibold mb-3 text-gray-700 flex items-center gap-2">
            <Brain size={20} className="text-purple-600" />
            Mức độ mệt mỏi hiện tại
          </label>
          <div className="bg-white rounded-lg p-4 shadow-sm border">
            <input
              type="range"
              min="1"
              max="5"
              value={fatigue}
              onChange={(e) => setFatigue(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Tỉnh táo</span>
              <span>Kiệt sức</span>
            </div>
            <div className={`mt-3 p-2 rounded-lg ${fatigueLabels[fatigue].bg}`}>
              <p
                className={`text-center font-semibold ${fatigueLabels[fatigue].color}`}
              >
                {fatigue} - {fatigueLabels[fatigue].label}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Time Pickers */}
      {mode === "wakeUpAt" && (
        <div className="mb-6">
          <label className="block font-semibold mb-3 text-gray-700">
            Giờ muốn thức dậy
          </label>
          <TimePickerComponent
            value={wakeUpTime}
            onChange={setWakeUpTime}
            label="Thức dậy"
            icon="sun"
          />
        </div>
      )}

      {mode === "plannedSleep" && (
        <div className="mb-6">
          <label className="block font-semibold mb-3 text-gray-700">
            Giờ dự định đi ngủ
          </label>
          <TimePickerComponent
            value={plannedSleepTime}
            onChange={setPlannedSleepTime}
            label="Đi ngủ"
            icon="moon"
          />
        </div>
      )}

      {mode === "powerNap" && (
        <div className="mb-6">
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <h3 className="font-semibold text-amber-800 mb-2 flex items-center gap-2">
              <Coffee size={18} />
              Lưu ý về ngủ ngắn
            </h3>
            <p className="text-sm text-amber-700">
              Tránh ngủ ngắn sau 15:00 và không ngủ quá 30 phút để không ảnh
              hưởng giấc ngủ đêm.
            </p>
          </div>
        </div>
      )}

      {/* Calculate button */}
      <button
        onClick={calculateSleepTime}
        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold px-6 py-4 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg flex items-center justify-center gap-2"
      >
        <Zap size={20} />
        Tính toán thời gian tối ưu
      </button>

      {/* Results */}
      {result.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-800 flex items-center gap-2">
            <Power size={20} className="text-green-600" />
            Gợi ý thời gian{" "}
            {mode === "sleepNow" || mode === "plannedSleep"
              ? "thức dậy"
              : mode === "wakeUpAt"
              ? "đi ngủ"
              : "ngủ ngắn"}
          </h2>

          <div className="space-y-3">
            {result.map((r, i) => (
              <div
                key={i}
                className={`p-4 rounded-lg border-2 transition-all hover:shadow-md ${
                  i === 0 && mode !== "powerNap"
                    ? "border-green-300 bg-green-50"
                    : r.quality === "Tuyệt vời" && mode === "powerNap"
                    ? "border-green-300 bg-green-50"
                    : "border-gray-200 bg-white hover:border-gray-300"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-2xl font-bold text-gray-800">{r.time}</p>
                    <p className="text-sm text-gray-600">
                      {r.type === "nap"
                        ? `${r.duration} ngủ ngắn`
                        : `${r.cycles} chu kỳ • ${r.duration}`}
                    </p>
                    {r.note && (
                      <p className="text-xs text-gray-500 mt-1">{r.note}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        r.quality === "Tuyệt vời"
                          ? "bg-green-100 text-green-700"
                          : r.quality === "Tốt"
                          ? "bg-blue-100 text-blue-700"
                          : r.quality === "Đủ dùng"
                          ? "bg-yellow-100 text-yellow-700"
                          : r.quality === "Cẩn thận"
                          ? "bg-orange-100 text-orange-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {r.quality}
                    </span>
                    {((i === 0 && mode !== "powerNap") ||
                      (r.quality === "Tuyệt vời" && mode === "powerNap")) && (
                      <p className="text-xs text-green-600 mt-1 font-medium">
                        Khuyến nghị
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Explanation */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-gray-800 mb-2">
              💡 Giải thích kết quả:
            </h3>
            <div className="space-y-1 text-sm text-gray-700">
              {mode === "powerNap" ? (
                <>
                  <p>
                    • <strong>10-20 phút:</strong> Ngủ ngắn lý tưởng, tăng tỉnh
                    táo không gây mệt mỏi
                  </p>
                  <p>
                    • <strong>30 phút:</strong> Bắt đầu vào giai đoạn ngủ sâu,
                    có thể hơi mệt khi thức
                  </p>
                  <p>
                    • <strong>45-60 phút:</strong> Ngủ ở giữa chu kỳ, dễ gây mệt
                    mỏi
                  </p>
                  <p>
                    • <strong>90 phút:</strong> Một chu kỳ đầy đủ, tốt nếu rất
                    mệt nhưng có thể ảnh hưởng đêm
                  </p>
                </>
              ) : (
                <>
                  <p>
                    • <strong>Chu kỳ ngủ:</strong> Mỗi chu kỳ 90 phút giúp não
                    bộ phục hồi hoàn toàn
                  </p>
                  <p>
                    • <strong>Thời gian chìm vào giấc ngủ:</strong> Đã tính thêm
                    5-15 phút tùy tình huống
                  </p>
                  <p>
                    • <strong>Chất lượng giấc ngủ:</strong> Thức dậy đúng lúc
                    kết thúc chu kỳ = tỉnh táo
                  </p>
                  <p>
                    • <strong>Gợi ý đầu tiên:</strong> Tối ưu nhất cho mức độ
                    mệt mỏi của bạn
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: linear-gradient(45deg, #3b82f6, #8b5cf6);
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }

        .slider::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: linear-gradient(45deg, #3b82f6, #8b5cf6);
          cursor: pointer;
          border: none;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }
      `}</style>
    </div>
  );
};

export default SleepCalculator;

import { ChevronDown, ChevronUp, Moon, Sun } from "lucide-react";
import { useState } from "react";

const TimePickerComponent = ({ value, onChange, label, icon }) => {
  const [hour, minute] = value.split(":");
  const [isOpen, setIsOpen] = useState(false);

  const updateTime = (newHour, newMinute) => {
    const formattedHour = newHour.toString().padStart(2, "0");
    const formattedMinute = newMinute.toString().padStart(2, "0");
    onChange(`${formattedHour}:${formattedMinute}`);
  };

  const adjustTime = (type, direction) => {
    let currentHour = parseInt(hour);
    let currentMinute = parseInt(minute);

    if (type === "hour") {
      if (direction === "up") {
        currentHour = (currentHour + 1) % 24;
      } else {
        currentHour = currentHour === 0 ? 23 : currentHour - 1;
      }
    } else {
      if (direction === "up") {
        currentMinute = (currentMinute + 15) % 60;
      } else {
        currentMinute = currentMinute === 0 ? 45 : currentMinute - 15;
      }
    }

    updateTime(currentHour, currentMinute);
  };

  const timeOptions = {
    hours: Array.from({ length: 24 }, (_, i) => i),
    minutes: [0, 15, 30, 45],
  };

  return (
    <div className="relative">
      <div className="bg-white rounded-lg border border-dark-800  shadow-sm overflow-hidden">
        {/* Display */}
        <div
          className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50"
          onClick={() => setIsOpen(!isOpen)}
        >
          <div className="flex items-center gap-3">
            {icon === "sun" ? (
              <Sun className="text-yellow-500" size={24} />
            ) : (
              <Moon className="text-blue-500" size={24} />
            )}
            <div>
              <p className="text-sm text-gray-600">{label}</p>
              <p className="text-2xl font-bold text-gray-800">{value}</p>
            </div>
          </div>
          <ChevronDown
            className={`text-gray-400 transition-transform ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </div>

        {/* Quick adjusters */}
        <div className="flex border-t border-dark-800 pb-3  bg-gray-50">
          <div className="flex-1 text-center">
            <p className="text-xs text-gray-500 py-1">Giờ</p>
            <div className="flex">
              <button
                onClick={() => adjustTime("hour", "down")}
                className="flex-1 p-2 hover:bg-gray-100 border-r border-dark-800 "
              >
                <ChevronDown size={16} className="mx-auto text-gray-600" />
              </button>
              <div className="flex-1 p-2 font-mono text-lg font-bold bg-white">
                {hour}
              </div>
              <button
                onClick={() => adjustTime("hour", "up")}
                className="flex-1 p-2 hover:bg-gray-100 border-l border-dark-800 "
              >
                <ChevronUp size={16} className="mx-auto text-gray-600" />
              </button>
            </div>
          </div>
          <div className="w-px bg-gray-200"></div>
          <div className="flex-1 text-center">
            <p className="text-xs text-gray-500 py-1">Phút</p>
            <div className="flex">
              <button
                onClick={() => adjustTime("minute", "down")}
                className="flex-1 p-2 hover:bg-gray-100 border-r border-dark-800 "
              >
                <ChevronDown size={16} className="mx-auto text-gray-600" />
              </button>
              <div className="flex-1 p-2 font-mono text-lg font-bold bg-white">
                {minute}
              </div>
              <button
                onClick={() => adjustTime("minute", "up")}
                className="flex-1 p-2 hover:bg-gray-100 border-l border-dark-800 "
              >
                <ChevronUp size={16} className="mx-auto text-gray-600" />
              </button>
            </div>
          </div>
        </div>

        {/* Dropdown picker */}
        {isOpen && (
          <div className="border-t h-full border-dark-800  bg-white p-4 ">
            <div className="grid grid-cols-2 gap-4">
              {/* Hours */}
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-2">Giờ</p>
                <div className="flex flex-wrap  h-full pb-6">
                  {timeOptions.hours.map((h) => (
                    <div className="w-3/12 p-1">
                      <button
                        key={h}
                        onClick={() => updateTime(h, parseInt(minute))}
                        className={`p-2 w-full text-sm rounded transition-colors border border-dark-800 cursor-pointer  ${
                          parseInt(hour) === h
                            ? "bg-blue-500 text-white border-transparent"
                            : "bg-gray-100 hover:bg-gray-200"
                        }`}
                      >
                        {h.toString().padStart(2, "0")} giờ
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Minutes */}
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-2">Phút</p>
                <div className="grid grid-cols-2 gap-1">
                  {timeOptions.minutes.map((m) => (
                    <button
                      key={m}
                      onClick={() => updateTime(parseInt(hour), m)}
                      className={`p-2 text-sm border border-dark-800 rounded transition-colors cursor-pointer ${
                        parseInt(minute) === m
                          ? "bg-blue-500 text-white border-transparent"
                          : "bg-gray-100 hover:bg-gray-200"
                      }`}
                    >
                      {m.toString().padStart(2, "0")}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Common times */}
            <div className="mt-4 border-t border-dark-800  pt-3">
              <p className="text-sm font-semibold text-gray-700 mb-2">
                Thời gian phổ biến
              </p>
              <div className="flex flex-wrap gap-2">
                {(icon === "sun"
                  ? ["06:00", "06:30", "07:00", "07:30", "08:00"]
                  : ["22:00", "22:30", "23:00", "23:30", "00:00"]
                ).map((time) => (
                  <button
                    key={time}
                    onClick={() => onChange(time)}
                    className={`px-3 py-1 text-sm rounded-full transition-colors ${
                      value === time
                        ? "bg-blue-500 text-white"
                        : "bg-gray-100 hover:bg-gray-200"
                    }`}
                  >
                    {time}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
export default TimePickerComponent;

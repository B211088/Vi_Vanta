import React, { useState, useEffect, useRef } from "react";
import { ChevronDown } from "lucide-react";

const ActivityLevelSelect = ({ value, onChange, activityLevels }) => {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef(null); // Tham chiếu tới toàn bộ component

  const currentLevel = activityLevels[value];
  const CurrentIcon = currentLevel?.icon;

  // Đóng dropdown khi click bên ngoài
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="w-full" ref={wrapperRef}>
      <div className="w-full flex flex-col">
        <label className="text-xs pb-1 text-gray-700 font-medium">
          Mức độ vận động
        </label>

        <div className="relative">
          <div
            className="w-full flex items-center gap-3 py-3 px-4 text-sm border border-gray-300 rounded-lg cursor-pointer hover:border-teal-500 transition-colors bg-white"
            onClick={() => setIsOpen(!isOpen)}
          >
            {CurrentIcon && (
              <CurrentIcon className={`${currentLevel.color} w-5 h-5`} />
            )}
            <div className="flex-1">
              <div className="font-medium">{currentLevel?.label}</div>
              <div className="text-xs text-gray-500">
                {currentLevel?.description}
              </div>
            </div>
            <ChevronDown
              className={`w-4 h-4 text-gray-400 transition-transform ${
                isOpen ? "rotate-180" : ""
              }`}
            />
          </div>

          {isOpen && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-10">
              {Object.entries(activityLevels).map(([key, level]) => {
                const IconComponent = level.icon;
                return (
                  <div
                    key={key}
                    className={`flex items-center gap-3 py-3 px-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                      value === key
                        ? "bg-teal-50 border-l-4 border-teal-500"
                        : ""
                    }`}
                    onClick={() => {
                      onChange(key);
                      setIsOpen(false);
                    }}
                  >
                    <IconComponent className={`${level.color} w-5 h-5`} />
                    <div className="flex-1">
                      <div className="font-medium text-sm">{level.label}</div>
                      <div className="text-xs text-gray-500">
                        {level.description}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ActivityLevelSelect;

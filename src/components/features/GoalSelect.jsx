import { Minus, Plus, Target, TrendingDown, ChevronDown } from "lucide-react";
import React, { useState, useRef, useEffect } from "react";

const GoalSelect = ({ value, onChange, goals }) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef(null); // tham chiếu tới container

  const goalIcons = {
    lose: { icon: TrendingDown, color: "text-red-500" },
    maintain: { icon: Minus, color: "text-green-500" },
    gain: { icon: Plus, color: "text-blue-500" },
  };

  const currentGoal = goals[value];
  const currentIcon = goalIcons[value];
  const CurrentIcon = currentIcon?.icon || Target;

  // Đóng dropdown nếu click ra ngoài
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectRef.current && !selectRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="w-full flex flex-col" ref={selectRef}>
      <label className="text-xs pb-1 font-medium text-gray-700">
        Mục tiêu sức khỏe
      </label>

      <div className="relative">
        <div
          className="w-full flex items-center gap-3 py-3 px-3 text-sm border border-gray-300 rounded-md cursor-pointer hover:border-teal-500 transition-colors bg-white"
          onClick={() => setIsOpen(!isOpen)}
        >
          <CurrentIcon
            className={`${currentIcon?.color || "text-teal-600"} w-5 h-5`}
          />
          <div className="flex-1">
            <div className="font-medium">{currentGoal?.label}</div>
            <div className="text-xs text-gray-500">
              {currentGoal?.description}
            </div>
          </div>
          <ChevronDown
            className={`w-4 h-4 text-gray-400 transition-transform ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </div>

        {isOpen && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-md shadow-lg z-50">
            {Object.entries(goals).map(([key, goal]) => {
              const iconData = goalIcons[key];
              const IconComponent = iconData?.icon || Target;
              return (
                <div
                  key={key}
                  className={`flex items-center gap-3 py-3 px-3 cursor-pointer hover:bg-gray-50 transition-colors ${
                    value === key ? "bg-teal-50 border-l-4 border-teal-500" : ""
                  }`}
                  onClick={() => {
                    onChange(key);
                    setIsOpen(false);
                  }}
                >
                  <IconComponent
                    className={`${iconData?.color || "text-teal-600"} w-5 h-5`}
                  />
                  <div className="flex-1">
                    <div className="font-medium text-sm">{goal.label}</div>
                    <div className="text-xs text-gray-500">
                      {goal.description}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default GoalSelect;

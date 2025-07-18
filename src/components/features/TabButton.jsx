import React from "react";

const TabButton = ({ id, icon: Icon, label, isActive, onClick, color }) => {
  return (
    <button
      onClick={() => onClick(id)}
      className={`flex items-center space-x-2 px-4 py-1.5 text-sm rounded-md   transition-all duration-300 font-medium cursor-pointer shadow-sm ${
        isActive
          ? `bg-${color} text-white shadow-lg transform `
          : `bg-white text-gray-700 hover:bg-${color}-500 hover:text-${color}-700 border border-gray-200`
      }`}
    >
      <Icon className="h-4 w-4" />
      <span>{label}</span>
    </button>
  );
};

export default TabButton;

import { ArrowLeft } from "lucide-react";
import React from "react";
import { useNavigate } from "react-router-dom";

const HeaderTool = ({ title, subtitle, icon: Icon, color = "teal" }) => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col mb-8">
      <button
        onClick={() => navigate(-1)}
        className={`flex w-fit items-center text-${color}-600 mr-6 py-2 rounded-lg transition-colors cursor-pointer`}
      >
        <ArrowLeft className="h-5 w-5 mr-2" />
        Quay lại
      </button>
      <div className="flex items-center space-x-4">
        <div className="p-3 bg-white rounded-xl shadow-sm">
          <Icon className={`h-8 w-8 text-${color}-600`} />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-800">{title}</h1>
          <p className="text-gray-600 mt-1">{subtitle}</p>
        </div>
      </div>
    </div>
  );
};

export default HeaderTool;

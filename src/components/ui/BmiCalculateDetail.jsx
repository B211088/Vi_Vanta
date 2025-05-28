import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { fetchBMIRecordById } from "../../services/bodyIndex.service";

const getBmiColor = (level) => {
  if (!level)
    return {
      border: "border-gray-300",
      text: "text-gray-700",
      icon: "text-gray-400",
    };
  if (level.includes("Bình thường"))
    return {
      border: "border-blue-400",
      text: "text-blue-700",
      icon: "text-blue-400",
    };
  if (level.includes("Gầy"))
    return {
      border: "border-yellow-400",
      text: "text-yellow-700",
      icon: "text-yellow-400",
    };
  if (level.includes("Thừa cân"))
    return {
      border: "border-orange-400",
      text: "text-orange-700",
      icon: "text-orange-400",
    };
  if (level.includes("Béo phì"))
    return {
      border: "border-red-500",
      text: "text-red-700",
      icon: "text-red-500",
    };
  return {
    border: "border-gray-300",
    text: "text-gray-700",
    icon: "text-gray-400",
  };
};

const BmiCalculateDetail = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { loading, bmiRecord } = useSelector((state) => state.bodyIndex);

  useEffect(() => {
    if (id) dispatch(fetchBMIRecordById(id));
  }, [id]);

  if (loading)
    return <div className="w-full text-center py-8">Đang tải...</div>;
  if (!bmiRecord)
    return (
      <div className="w-full text-center py-8 text-gray-500">
        Không có dữ liệu.
      </div>
    );

  const { height, weight, bmi, categoryBMI } = bmiRecord;
  const color = getBmiColor(categoryBMI?.level);

  return (
    <div className="w-full flex flex-col gap-4">
      <h2 className="text-lg font-bold text-blue-700 mb-2">
        Chi tiết chỉ số BMI
      </h2>
      <div className="flex flex-col gap-2 text-sm">
        <div>
          <span className="font-semibold">Chiều cao:</span> {height} cm
        </div>
        <div>
          <span className="font-semibold">Cân nặng:</span> {weight} kg
        </div>
        <div>
          <span className="font-semibold">BMI:</span>{" "}
          <span className="text-blue-600 font-bold">{bmi}</span>
        </div>
      </div>
      {categoryBMI && (
        <div
          className={`mt-2 p-3 bg-blue-50 border-l-4 rounded flex gap-2 items-start ${color.border}`}
        >
          <span className={`mt-1 text-xl ${color.icon}`}>
            <i className="fa-solid fa-circle-info"></i>
          </span>
          <div>
            <div className={`font-semibold ${color.text}`}>
              Phân loại: {categoryBMI.level}
            </div>
            <div className="text-gray-700 mt-1">{categoryBMI.description}</div>
            <div className="text-green-700 mt-1 font-medium">
              Lời khuyên: {categoryBMI.advice}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BmiCalculateDetail;

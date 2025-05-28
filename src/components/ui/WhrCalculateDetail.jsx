import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { fetchWHRRecordById } from "../../services/bodyIndex.service";

const getWhrColor = (level) => {
  if (!level)
    return {
      border: "border-gray-300",
      text: "text-gray-700",
      icon: "text-gray-400",
    };
  if (level.includes("Thấp"))
    return {
      border: "border-blue-400",
      text: "text-blue-700",
      icon: "text-blue-400",
    };
  if (level.includes("Trung bình"))
    return {
      border: "border-yellow-400",
      text: "text-yellow-700",
      icon: "text-yellow-400",
    };
  if (level.includes("Cao"))
    return {
      border: "border-orange-400",
      text: "text-orange-700",
      icon: "text-orange-400",
    };
  if (level.includes("Rất cao") || level.includes("Nguy hiểm"))
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

const WhrCalculateDetail = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { loading, whrRecord } = useSelector((state) => state.bodyIndex);

  useEffect(() => {
    if (id) dispatch(fetchWHRRecordById(id));
  }, [id, dispatch]);

  if (loading)
    return <div className="w-full text-center py-8">Đang tải...</div>;
  if (!whrRecord)
    return (
      <div className="w-full text-center py-8 text-gray-500">
        Không có dữ liệu.
      </div>
    );

  const { gender, waist, hip, whr, categoryWHR } = whrRecord;
  const color = getWhrColor(categoryWHR?.level);

  return (
    <div className="w-full flex flex-col gap-4">
      <h2 className="text-lg font-bold text-blue-700 mb-2">
        Chi tiết chỉ số WHR
      </h2>
      <div className="flex flex-col gap-2 text-sm">
        <div>
          <span className="font-semibold">Giới tính:</span>{" "}
          {gender === "male" ? "Nam" : "Nữ"}
        </div>
        <div>
          <span className="font-semibold">Vòng eo:</span> {waist} cm
        </div>
        <div>
          <span className="font-semibold">Vòng mông:</span> {hip} cm
        </div>
        <div>
          <span className="font-semibold">Chỉ số WHR:</span>{" "}
          <span className="text-blue-600 font-bold">{whr}</span>
        </div>
      </div>
      {categoryWHR && (
        <div
          className={`mt-2 p-3 bg-blue-50 border-l-4 rounded flex gap-2 items-start ${color.border}`}
        >
          <span className={`mt-1 text-xl ${color.icon}`}>
            <i className="fa-solid fa-circle-info"></i>
          </span>
          <div>
            <div className={`font-semibold ${color.text}`}>
              Phân loại: {categoryWHR.level}
            </div>
            <div className="text-gray-700 mt-1">{categoryWHR.description}</div>
            <div className="text-green-700 mt-1 font-medium">
              Lời khuyên: {categoryWHR.advice}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WhrCalculateDetail;

import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { fetchEMMRecordById } from "../../services/bodyIndex.service";

const getBmrColor = (level) => {
  if (!level) return { border: "border-gray-300", text: "text-gray-700" };
  if (level.includes("Thấp"))
    return { border: "border-yellow-400", text: "text-yellow-700" };
  if (level.includes("Trung bình"))
    return { border: "border-blue-400", text: "text-blue-700" };
  if (level.includes("Cao"))
    return { border: "border-green-500", text: "text-green-700" };
  return { border: "border-gray-300", text: "text-gray-700" };
};

const EmmCalculateDetail = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { loading, emmRecord } = useSelector((state) => state.bodyIndex);

  useEffect(() => {
    if (id) dispatch(fetchEMMRecordById(id));
  }, [id, dispatch]);

  if (loading)
    return <div className="w-full text-center py-8">Đang tải...</div>;
  if (!emmRecord)
    return (
      <div className="w-full text-center py-8 text-gray-500">
        Không có dữ liệu.
      </div>
    );

  const {
    weight,
    height,
    age,
    gender,
    bmr,
    tdee,
    activityLevel,
    categoryBMR,
    categoryTDEE,
  } = emmRecord;
  const bmrColor = getBmrColor(categoryBMR?.level);

  return (
    <div className="w-full flex flex-col gap-4">
      <h2 className="text-lg font-bold text-blue-700 mb-2">
        Chi tiết chỉ số EMM (BMR/TDEE)
      </h2>
      <div className="flex flex-col gap-2 text-sm">
        <div>
          <span className="font-semibold">Cân nặng:</span> {weight} kg
        </div>
        <div>
          <span className="font-semibold">Chiều cao:</span> {height} cm
        </div>
        <div>
          <span className="font-semibold">Tuổi:</span> {age}
        </div>
        <div>
          <span className="font-semibold">Giới tính:</span>{" "}
          {gender === "male" ? "Nam" : "Nữ"}
        </div>
        <div>
          <span className="font-semibold">Mức độ vận động:</span>{" "}
          {activityLevel}
        </div>
        <div>
          <span className="font-semibold">BMR:</span>{" "}
          <span className="text-blue-600 font-bold">{bmr}</span>
        </div>
        <div>
          <span className="font-semibold">TDEE:</span>{" "}
          <span className="text-green-600 font-bold">{tdee}</span>
        </div>
      </div>
      {categoryBMR && (
        <div
          className={`mt-2 p-3 bg-blue-50 border-l-4 rounded ${bmrColor.border}`}
        >
          <div className={`font-semibold ${bmrColor.text}`}>
            Phân loại BMR: {categoryBMR.level}
          </div>
          <div className="text-gray-700 mt-1">{categoryBMR.description}</div>
          <div className="text-green-700 mt-1 font-medium">
            Lời khuyên: {categoryBMR.advice}
          </div>
        </div>
      )}
      {categoryTDEE && (
        <div className="mt-2 p-3 bg-blue-50 border-l-4 border-blue-400 rounded">
          <div className="font-semibold text-blue-700">
            Phân loại TDEE: {categoryTDEE.level}
          </div>
          <div className="text-gray-700 mt-1">{categoryTDEE.description}</div>
          <div className="text-green-700 mt-1 font-medium">
            Lời khuyên: {categoryTDEE.advice}
          </div>
        </div>
      )}
    </div>
  );
};

export default EmmCalculateDetail;

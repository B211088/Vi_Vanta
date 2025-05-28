import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNotify } from "../../../hook/useNotify";
import { useTheme } from "../../../hook/useTheme";
import {
  createBMI,
  fetchBMIRecords,
} from "../../../services/bodyIndex.service";
import { formatDateDDMMYY } from "../../../utils/formatDate";

const BmiCalculateForm = () => {
  const dispatch = useDispatch();
  const { loading, bmiRecords } = useSelector((state) => state.bodyIndex);
  const { isDarkMode } = useTheme();
  const { notifyWarning } = useNotify();
  const [bmiInput, setBmiInput] = useState({ weight: "", height: "" });
  console.log({ bmiRecords });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setBmiInput((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  useEffect(() => {
    dispatch(fetchBMIRecords());
  }, []);

  const handleBMI = (e) => {
    const isPositive = (v) => v !== "" && !isNaN(v) && Number(v) > 0;
    e.preventDefault();

    // Validate logic
    const height = Number(bmiInput.height);
    const weight = Number(bmiInput.weight);
    if (!isPositive(weight) || !isPositive(height)) {
      notifyWarning("Cân nặng và chiều cao phải là số dương.");
      return;
    }
    if (height < 80 || height > 300) {
      notifyWarning("Chiều cao phải từ 80cm đến 300cm.");
      return;
    }
    if (weight < 20 || weight > 500) {
      notifyWarning("Cân nặng phải từ 20kg đến 500kg.");
      return;
    }
    dispatch(
      createBMI({
        weight,
        height,
      })
    );
  };
  return (
    <div className="">
      <h3 className="text-md font-semibold mb-3 text-blue-600">
        Tính chỉ số BMI (Body Mass Index – Chỉ số khối cơ thể)
      </h3>
      <div className="w-full flex flex-col gap-[20px]">
        {" "}
        <form
          onSubmit={handleBMI}
          className="w-full flex flex-col gap-[20px] border-1 border-[#efefef] p-[10px] rounded-sm"
        >
          <div className="w-full flex gap-[10px]">
            <div className="w-full flex flex-col">
              <span className="text-sm font-bold pb-[5px]">Chiều cao*</span>
              <div
                className={`w-full flex items-center border-[1px] ${
                  isDarkMode
                    ? " border-dark-600 "
                    : "bg-dark-400 border-transparent"
                }  rounded-sm`}
              >
                <input
                  className="flex-1  text-sm px-[5px] py-[8px] outline-none"
                  placeholder="Nhập chiều cao của bạn"
                  type="number"
                  required
                  name="height"
                  onChange={handleChange}
                />
              </div>
            </div>
            <div className="w-full flex flex-col">
              <span className="text-sm font-bold pb-[5px]">Cân nặng*</span>
              <div
                className={`w-full flex items-center border-[1px] ${
                  isDarkMode
                    ? " border-dark-600 "
                    : "bg-dark-400 border-transparent"
                }  rounded-sm`}
              >
                <input
                  className="flex-1  text-sm px-[5px] py-[8px] outline-none"
                  placeholder="Nhập cân nặng của bạn"
                  type="number"
                  required
                  name="weight"
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className={`w-full flex justify-center items-center rounded-sm py-[8px] text-sm text-light-50 font-bold 
                ${loading ? "bg-gray-400" : "bg-green-500 hover:bg-dark-600"} 
                transition-colors cursor-pointer`}
          >
            <span>{loading ? "Đang xử lý..." : "Tính BMI"}</span>
          </button>
        </form>
        <div
          style={{ maxHeight: "calc(100vh - 400px)" }}
          className="w-full  flex flex-col overflow-y-auto gap-[20px] border-1 border-[#efefef] rounded-sm"
        >
          <h1 className="w-full font-bold sticky top-0 bg-light-50  p-[10px]">
            Lịch sử tính <i class="fa-solid fa-clock-rotate-left"></i>
          </h1>
          <div className="w-full p-[10px] flex flex-col gap-[10px]">
            {bmiRecords.map((bmiRecord) => (
              <div
                key={bmiRecord._id}
                className="w-full flex items-center gap-[10px] text-sm cursor-pointer border-1 border-[#efefef] p-[8px] rounded-sm"
              >
                <div className="flex-1 flex items-center gap-[10px] ">
                  <div className="flex-1 flex items-center gap-[10px]">
                    <div className="">Chiều cao: {bmiRecord.height}</div>
                    <div className="">Cân nặng: {bmiRecord.weight}</div>
                    <div className="">BMI: {bmiRecord.bmi}</div>
                  </div>
                  <div className="w-3/12 flex justify-end px-[10px] ">
                    {formatDateDDMMYY(bmiRecord.createdAt)}
                  </div>
                </div>

                <div className="aspect-square flex items-center justify-center rounded-sm px-[6px] border-1 border-dark-700 cursor-pointer">
                  <i className="fa-solid fa-trash-can-arrow-up"></i>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BmiCalculateForm;

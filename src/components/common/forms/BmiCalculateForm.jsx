import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNotify } from "../../../hook/useNotify";
import { useTheme } from "../../../hook/useTheme";
import {
  createBMI,
  deleteBMI,
  fetchBMIRecords,
} from "../../../services/bodyIndex.service";
import { formatDateDDMMYY } from "../../../utils/formatDate";
import { Outlet, Link, useNavigate } from "react-router-dom";

const BmiCalculateForm = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading, bmiRecords } = useSelector((state) => state.bodyIndex);
  const { isDarkMode } = useTheme();
  const { notifyWarning, notifySuccess, notifyError } = useNotify();
  const [bmiInput, setBmiInput] = useState({ weight: "", height: "" });

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

  const handleBMI = async (e) => {
    try {
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
      const response = await dispatch(
        createBMI({
          weight,
          height,
        })
      );
      navigate(response.bmiRecord._id);
      notifySuccess("Tính chỉ số BMI thành công!");
    } catch (error) {
      notifyError(error.response.data.message);
    }
  };

  const handleDeleteBmi = (id) => {
    dispatch(deleteBMI(id));
  };
  return (
    <div className="flex-1 flex  gap-[10px]  ">
      <div className="w-7/12 flex flex-col border-1 border-[#efefef] shadow rounded-lg  p-[10px]">
        <h3 className="text-md font-semibold mb-3 text-blue-600 flex items-center gap-2">
          Tính chỉ số BMI (Body Mass Index – Chỉ số khối cơ thể)
          <div className="relative group">
            <div className="ml-2 text-blue-500 hover:text-blue-700 relative  cursor-pointer">
              <i className="fa-solid fa-circle-question"></i>
            </div>{" "}
            <div className="group-hover:flex absolute w-[300px] top-[0%] left-[110%]  bg-opacity-30 hidden items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 max-w-md shadow-lg relative">
                <h4 className="font-bold text-lg mb-2">BMI là gì?</h4>
                <p className="text-justify text-sm">
                  BMI (Body Mass Index) là chỉ số khối cơ thể, được tính bằng
                  cân nặng (kg) chia cho bình phương chiều cao (m). Chỉ số này
                  giúp đánh giá tình trạng gầy, bình thường, thừa cân hay béo
                  phì của một người.
                </p>
              </div>
            </div>
          </div>
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
            className="w-full  flex flex-col overflow-y-auto gap-[10px] border-1 border-[#efefef] rounded-sm"
          >
            <h1 className="w-full font-bold sticky top-0 bg-light-50  p-[10px]">
              Lịch sử tính <i className="fa-solid fa-clock-rotate-left"></i>
            </h1>
            <div className="w-full p-[10px] flex flex-col gap-[10px]">
              {bmiRecords.length > 0 ? (
                bmiRecords.map((bmiRecord) => (
                  <Link
                    key={bmiRecord._id}
                    to={`${bmiRecord._id}`}
                    className="w-full flex items-center gap-[10px] text-sm cursor-pointer border-1 border-[#efefef] p-[8px] rounded-sm hover:bg-blue-50 transition"
                    style={{ textDecoration: "none", color: "inherit" }}
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
                    <div
                      className="aspect-square flex items-center justify-center rounded-sm px-[6px] border-1 border-dark-700 cursor-pointer"
                      onClick={() => handleDeleteBmi(bmiRecord._id)}
                    >
                      <i className="fa-solid fa-trash-can-arrow-up"></i>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="w-full flex justify-center items-center text-sm text-dark-500">
                  Chưa có tính toán
                </div>
              )}
            </div>
          </div>
        </div>{" "}
      </div>
      <div className="w-5/12 flex border-1 border-[#efefef] shadow rounded-lg  p-[10px]">
        <Outlet />
      </div>
    </div>
  );
};

export default BmiCalculateForm;

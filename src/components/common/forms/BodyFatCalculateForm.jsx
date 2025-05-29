// BodyFatCalculateForm.jsx
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  createBodyFat,
  fetchBodyFatRecords,
  deleteBodyFat,
} from "../../../services/bodyIndex.service";
import { formatDateDDMMYY } from "../../../utils/formatDate";
import { Outlet, Link, useNavigate } from "react-router-dom";
import { useNotify } from "../../../hook/useNotify";
import { useTheme } from "../../../hook/useTheme";

const BodyFatCalculateForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const { notifyWarning, notifySuccess, notifyError } = useNotify();
  const { loading, bodyFatRecords } = useSelector((state) => state.bodyIndex);
  const [input, setInput] = useState({
    gender: "male",
    waist: "",
    neck: "",
    hip: "",
    height: "",
    weight: "",
  });

  useEffect(() => {
    dispatch(fetchBodyFatRecords());
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setInput((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    try {
      e.preventDefault();
      const { gender, waist, neck, hip, height, weight } = input;
      if (
        !gender ||
        !waist ||
        !neck ||
        !height ||
        !weight ||
        Number(waist) <= 0 ||
        Number(neck) <= 0 ||
        Number(height) <= 0 ||
        Number(weight) <= 0 ||
        (gender === "female" && (!hip || Number(hip) <= 0))
      ) {
        notifyWarning("Vui lòng nhập đầy đủ và hợp lệ các trường!");
        return;
      }
      const response = await dispatch(
        createBodyFat({
          gender,
          waist: Number(waist),
          neck: Number(neck),
          hip: hip ? Number(hip) : undefined,
          height: Number(height),
          weight: Number(weight),
        })
      );
      notifySuccess("Tính chỉ số Body Fat thành công!");
      navigate(response.bodyFat._id);
    } catch (error) {
      notifyError(error.response.data.message);
    }
  };

  const handleDelete = (id) => dispatch(deleteBodyFat(id));

  return (
    <div className="flex-1 flex gap-[10px]">
      <div className="w-7/12 flex flex-col border-1 border-[#efefef] shadow rounded-lg p-[10px]">
        <h3 className="text-md font-semibold mb-3 text-blue-600 flex items-center gap-2">
          Tính chỉ số BF (Body Fat - Tỷ lệ mỡ cơ thể)
          <div className="relative group">
            <div className="ml-2 text-blue-500 hover:text-blue-700 relative  cursor-pointer">
              <i className="fa-solid fa-circle-question"></i>
            </div>{" "}
            <div className="group-hover:flex absolute w-[300px] top-[0%] left-[110%]  bg-opacity-30 hidden items-center justify-center z-50">
              <div className=" flex flex-col gap-[10px] bg-white rounded-lg p-6 max-w-md shadow-lg relative">
                <h4 className="font-bold text-lg mb-2">BF là gì?</h4>
                <p className="text-justify text-sm">
                  <strong>Body Fat</strong> hay tỷ lệ mỡ cơ thể (% Body Fat) là
                  phần trăm khối lượng mỡ trong tổng trọng lượng cơ thể của bạn.
                </p>
              </div>
            </div>
          </div>
        </h3>
        <div className="w-full flex flex-col gap-[20px]">
          {" "}
          <form onSubmit={handleSubmit} className="flex flex-col gap-2">
            <div className="w-full flex gap-[10px]">
              <div className="w-full flex flex-col">
                <span className="text-sm font-bold pb-[5px]">
                  Vòng eo (cm)*
                </span>
                <div
                  className={`w-full flex items-center border-[1px] ${
                    isDarkMode
                      ? " border-dark-600 "
                      : "bg-dark-400 border-transparent"
                  }  rounded-sm`}
                >
                  <input
                    className="flex-1  text-sm px-[5px] py-[8px] outline-none"
                    name="waist"
                    type="number"
                    placeholder="Vòng eo (cm)"
                    value={input.waist}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            </div>
            <div className="w-full flex gap-[10px]">
              <div className="w-full flex flex-col">
                <span className="text-sm font-bold pb-[5px]">
                  Vòng cổ (cm)*
                </span>
                <div
                  className={`w-full flex items-center border-[1px] ${
                    isDarkMode
                      ? " border-dark-600 "
                      : "bg-dark-400 border-transparent"
                  }  rounded-sm`}
                >
                  <input
                    className="flex-1  text-sm px-[5px] py-[8px] outline-none"
                    name="neck"
                    type="number"
                    placeholder="Vòng cổ (cm)"
                    value={input.neck}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            </div>
            <div className="w-full flex gap-[10px]">
              <div className="w-full flex flex-col">
                <span className="text-sm font-bold pb-[5px]">
                  Vòng mông (cm)*
                </span>
                <div
                  className={`w-full flex items-center border-[1px] ${
                    isDarkMode
                      ? " border-dark-600 "
                      : "bg-dark-400 border-transparent"
                  }  rounded-sm`}
                >
                  <input
                    className="flex-1  text-sm px-[5px] py-[8px] outline-none"
                    name="hip"
                    type="number"
                    placeholder="Vòng mông (cm) (nữ)"
                    value={input.hip}
                    onChange={handleChange}
                    required={input.gender === "female"}
                  />
                </div>
              </div>
            </div>
            <div className="w-full flex gap-[10px]">
              <div className="w-full flex flex-col">
                <span className="text-sm font-bold pb-[5px]">Giới tính*</span>
                <select
                  className={`w-full flex items-center border-[1px] py-[8px] outline-none text-sm ${
                    isDarkMode
                      ? "border-dark-600"
                      : "bg-dark-400 border-transparent"
                  } rounded-sm`}
                  name="gender"
                  value={input.gender}
                  onChange={handleChange}
                >
                  <option value="male">Nam</option>
                  <option value="female">Nữ</option>
                </select>
              </div>
            </div>

            <div className="w-full flex gap-[10px]">
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
                      name="height"
                      type="number"
                      placeholder="Chiều cao (cm)"
                      value={input.height}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
              </div>
              <div className="w-full flex gap-[10px]">
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
                      name="weight"
                      type="number"
                      placeholder="Cân nặng (kg)"
                      value={input.weight}
                      onChange={handleChange}
                      required
                    />
                  </div>
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
              <span>{loading ? "Đang xử lý..." : "Tính Tỉ lệ mỡ"}</span>
            </button>
          </form>
          <div
            style={{ maxHeight: "calc(100vh - 660px)" }}
            className="w-full  flex flex-col overflow-y-auto gap-[10px] border-1 border-[#efefef] rounded-sm"
          >
            <h1 className="w-full font-bold sticky top-0 bg-light-50  p-[10px]">
              Lịch sử tính <i className="fa-solid fa-clock-rotate-left"></i>
            </h1>
            <div className="w-full p-[10px] flex flex-col gap-[10px]">
              <div className="flex flex-col gap-2">
                {bodyFatRecords.length > 0 ? (
                  bodyFatRecords.map((record) => (
                    <Link
                      key={record._id}
                      to={`${record._id}`}
                      className="w-full flex items-center gap-[10px] text-sm cursor-pointer border-1 border-[#efefef] p-[8px] rounded-sm hover:bg-blue-50 transition"
                    >
                      <div className="flex flex-1 items-center gap-[20px]">
                        <span>Body Fat: {record.bodyFatPercent}%</span>
                      </div>
                      <span>{formatDateDDMMYY(record.createdAt)}</span>
                      <div
                        className="aspect-square flex items-center justify-center rounded-sm px-[6px] border-1 border-dark-700 cursor-pointer"
                        onClick={(e) => {
                          e.preventDefault();
                          handleDelete(record._id);
                        }}
                      >
                        <i className="fa-solid fa-trash-can-arrow-up"></i>
                      </div>
                    </Link>
                  ))
                ) : (
                  <span>Chưa có tính toán</span>
                )}
              </div>{" "}
            </div>
          </div>
        </div>
      </div>
      <div className="w-5/12 flex border-1 border-[#efefef] shadow rounded-lg p-[10px]">
        <Outlet />
      </div>
    </div>
  );
};

export default BodyFatCalculateForm;

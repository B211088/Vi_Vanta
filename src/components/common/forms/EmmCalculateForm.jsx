import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  createEMM,
  fetchEMMRecords,
  deleteEMM,
} from "../../../services/bodyIndex.service";
import { formatDateDDMMYY } from "../../../utils/formatDate";
import { Outlet, Link, useNavigate } from "react-router-dom";
import { useNotify } from "../../../hook/useNotify";
import { useTheme } from "../../../hook/useTheme";

const EmmCalculateForm = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isDarkMode } = useTheme();
  const { loading, emmRecords } = useSelector((state) => state.bodyIndex);
  const { notifyWarning, notifyError, notifySuccess } = useNotify();
  const [emmInput, setEmmInput] = useState({
    weight: "",
    height: "",
    age: "",
    gender: "male",
    activityLevel: "sedentary",
  });

  useEffect(() => {
    dispatch(fetchEMMRecords());
  }, [dispatch]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEmmInput((prev) => ({ ...prev, [name]: value }));
  };

  const handleEMM = async (e) => {
    try {
      e.preventDefault();
      const { weight, height, age, gender, activityLevel } = emmInput;
      if (
        !weight ||
        !height ||
        !age ||
        Number(weight) <= 0 ||
        Number(height) <= 0 ||
        Number(age) <= 0
      ) {
        notifyWarning("Vui lòng nhập đầy đủ và hợp lệ các trường!");
        return;
      }
      const response = await dispatch(
        createEMM({
          weight: Number(weight),
          height: Number(height),
          age: Number(age),
          gender,
          activityLevel,
        })
      );
      navigate(response.emmRecord._id);
      notifySuccess("Tính chỉ số EMM thành công!");
    } catch (error) {
      notifyError(error.response.data.message);
    }
  };

  const handleDelete = (id) => dispatch(deleteEMM(id));

  return (
    <div className="flex-1 flex gap-[10px]">
      <div className="w-7/12 flex flex-col border-1 border-[#efefef] shadow rounded-lg p-[10px]">
        {" "}
        <h3 className="text-md font-semibold mb-3 text-blue-600 flex items-center gap-2">
          Tính chỉ số (BMR/TDEE)
          <div className="relative group">
            <div className="ml-2 text-blue-500 hover:text-blue-700 relative  cursor-pointer">
              <i className="fa-solid fa-circle-question"></i>
            </div>{" "}
            <div className="group-hover:flex absolute w-[300px] top-[0%] left-[110%]  bg-opacity-30 hidden items-center justify-center z-50">
              <div className=" flex flex-col gap-[10px] bg-white rounded-lg p-6 max-w-md shadow-lg relative">
                <h4 className="font-bold text-lg mb-2">BMR/TDEE là gì?</h4>
                <p className="text-justify text-sm">
                  <strong>BMR</strong> là lượng calo tối thiểu mà cơ thể bạn cần
                  để duy trì các chức năng sống cơ bản khi nghỉ ngơi hoàn toàn,
                  ví dụ như: hô hấp, tuần hoàn máu, điều hòa thân nhiệt, hoạt
                  động não.
                </p>
                <p className="text-justify text-sm">
                  <strong>TDEE</strong> là tổng lượng calo mà bạn đốt cháy mỗi
                  ngày, bao gồm: BMR (nền tảng) và mức độ vận động thể chất
                </p>
              </div>
            </div>
          </div>
        </h3>
        <h3 className="text-md font-semibold mb-3 text-blue-600"></h3>
        <div className="w-full flex flex-col gap-[20px]">
          {" "}
          <form onSubmit={handleEMM} className="flex flex-col gap-[16px]">
            <div className="w-full flex gap-[10px]">
              {" "}
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
                    value={emmInput.height}
                    onChange={handleChange}
                    required
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
                    name="weight"
                    type="number"
                    placeholder="Cân nặng (kg)"
                    value={emmInput.weight}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            </div>
            <div className="w-full flex gap-[10px]">
              {" "}
              <div className="w-full flex flex-col">
                <span className="text-sm font-bold pb-[5px]">Tuổi*</span>
                <div
                  className={`w-full flex items-center border-[1px] ${
                    isDarkMode
                      ? " border-dark-600 "
                      : "bg-dark-400 border-transparent"
                  }  rounded-sm`}
                >
                  <input
                    className="flex-1  text-sm px-[5px] py-[8px] outline-none"
                    name="age"
                    type="number"
                    placeholder="Tuổi"
                    value={emmInput.age}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>{" "}
              <div className="w-full flex flex-col">
                <span className="text-sm font-bold pb-[5px]">Giới tính*</span>{" "}
                <select
                  className={`w-full flex items-center border-[1px] py-[8px] outline-none text-sm ${
                    isDarkMode
                      ? "border-dark-600"
                      : "bg-dark-400 border-transparent"
                  } rounded-sm`}
                  name="gender"
                  value={emmInput.gender}
                  onChange={handleChange}
                >
                  <option value="male">Nam</option>
                  <option value="female">Nữ</option>
                </select>
              </div>{" "}
            </div>
            <div className="w-full flex flex-col">
              <span className="text-sm font-bold pb-[5px]">
                Mức động vận động*
              </span>{" "}
              <select
                className={`w-full flex items-center border-[1px] py-[8px] outline-none text-sm ${
                  isDarkMode
                    ? "border-dark-600"
                    : "bg-dark-400 border-transparent"
                } rounded-sm`}
                name="activityLevel"
                value={emmInput.activityLevel}
                onChange={handleChange}
              >
                <option value="sedentary">Ít vận động</option>
                <option value="light">Vận động nhẹ</option>
                <option value="moderate">Vận động vừa</option>
                <option value="active">Vận động nhiều</option>
                <option value="very_active">Rất nhiều</option>
              </select>
            </div>
            <button
              type="submit"
              disabled={loading}
              className={`w-full flex justify-center items-center rounded-sm py-[8px] text-sm text-light-50 font-bold 
                ${loading ? "bg-gray-400" : "bg-green-500 hover:bg-dark-600"} 
                transition-colors cursor-pointer`}
            >
              <span>{loading ? "Đang xử lý..." : "Tính EMM"}</span>
            </button>
          </form>
          <div
            style={{ maxHeight: "calc(100vh - 520px)" }}
            className="w-full  flex flex-col overflow-y-auto gap-[10px] border-1 border-[#efefef] rounded-sm"
          >
            <h1 className="w-full font-bold sticky top-0 bg-light-50  p-[10px]">
              Lịch sử tính <i className="fa-solid fa-clock-rotate-left"></i>
            </h1>
            <div className="w-full p-[10px] flex flex-col gap-[10px]">
              <div className="flex flex-col gap-2">
                {emmRecords.length > 0 ? (
                  emmRecords.map((record) => (
                    <Link
                      key={record._id}
                      to={`${record._id}`}
                      className="w-full flex items-center gap-[10px] text-sm cursor-pointer border-1 border-[#efefef] p-[8px] rounded-sm hover:bg-blue-50 transition"
                    >
                      <div className="flex-1 flex items-center gap-[20px]">
                        {" "}
                        <span>Chiều cao: {record.height}</span>
                        <span>Cân nặng: {record.weight}</span>
                        <span>TDEE: {record.tdee}</span>
                        <span>BMR: {record.bmr}</span>
                      </div>{" "}
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
              </div>
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

export default EmmCalculateForm;

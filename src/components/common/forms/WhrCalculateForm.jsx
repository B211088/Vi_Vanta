// WhrCalculateForm.jsx
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  createWHR,
  fetchWHRRecords,
  deleteWHR,
} from "../../../services/bodyIndex.service";
import { formatDateDDMMYY } from "../../../utils/formatDate";
import { Outlet, Link, useNavigate } from "react-router-dom";
import { useNotify } from "../../../hook/useNotify";
import { useTheme } from "../../../hook/useTheme";

const WhrCalculateForm = () => {
  const { isDarkMode } = useTheme();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, whrRecords } = useSelector((state) => state.bodyIndex);
  const { notifyWarning, notifySuccess, notifyError } = useNotify();
  const [input, setInput] = useState({
    waist: "",
    hip: "",
    gender: "male",
  });

  useEffect(() => {
    dispatch(fetchWHRRecords());
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setInput((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    try {
      e.preventDefault();
      const { waist, hip, gender } = input;
      if (!waist || !hip || Number(waist) <= 0 || Number(hip) <= 0) {
        notifyWarning("Vui lòng nhập đầy đủ và hợp lệ các trường!");
        return;
      }
      const response = dispatch(
        createWHR({
          waist: Number(waist),
          hip: Number(hip),
          gender,
        })
      );
      notifySuccess("Tính toán chỉ số whr thành công!");
      navigate(response.data.whrRecord._id);
    } catch (error) {
      notifyError(error.response.data.message);
    }
  };

  const handleDelete = (id) => dispatch(deleteWHR(id));

  return (
    <div className="flex-1 flex gap-[10px]">
      <div className="w-7/12 flex flex-col border-1 border-[#efefef] shadow rounded-lg p-[10px]">
        <h3 className="text-md font-semibold mb-3 text-blue-600 flex items-center gap-2">
          Tính chỉ số WHR (Tỉ số eo/mông)
          <div className="relative group">
            <div className="ml-2 text-blue-500 hover:text-blue-700 relative  cursor-pointer">
              <i className="fa-solid fa-circle-question"></i>
            </div>{" "}
            <div className="group-hover:flex absolute w-[300px] top-[0%] left-[110%]  bg-opacity-30 hidden items-center justify-center z-50">
              <div className=" flex flex-col gap-[10px] bg-white rounded-lg p-6 max-w-md shadow-lg relative">
                <h4 className="font-bold text-lg mb-2">BF là gì?</h4>
                <p className="text-justify text-sm">
                  Chỉ số <strong>WHR</strong> (Waist-Hip Ratio) hay tỉ số
                  eo/mông là một chỉ số dùng để đánh giá phân bố mỡ cơ thể, từ
                  đó giúp xác định nguy cơ mắc các bệnh liên quan đến béo phì
                  như tim mạch, cao huyết áp, đái tháo đường type 2, v.v.
                </p>
              </div>
            </div>
          </div>
        </h3>
        <div className="w-full flex flex-col gap-[20px]">
          {" "}
          <form onSubmit={handleSubmit} className="flex flex-col gap-2">
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

            <div className="w-full flex flex-col">
              <span className="text-sm font-bold pb-[5px]">Vòng eo (cm)</span>
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
                  placeholder="Nhập vòng eo (cm)"
                  value={input.waist}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            <div className="w-full flex flex-col">
              <span className="text-sm font-bold pb-[5px]">Vòng mông (cm)</span>
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
                  placeholder="Nhập vòng mông (cm)"
                  value={input.hip}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full flex justify-center items-center rounded-sm py-[8px] text-sm text-light-50 font-bold 
                ${loading ? "bg-gray-400" : "bg-green-500 hover:bg-dark-600"} 
                transition-colors cursor-pointer`}
            >
              <span>{loading ? "Đang xử lý..." : "Tính WHR"}</span>
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
                <div className="flex flex-col gap-2">
                  {whrRecords.length > 0 ? (
                    whrRecords.map((record) => (
                      <Link
                        key={record._id}
                        to={`${record._id}`}
                        className="w-full flex items-center gap-[10px] text-sm cursor-pointer border-1 border-[#efefef] p-[8px] rounded-sm hover:bg-blue-50 transition"
                      >
                        <div className="flex-1 flex items-center gap-[10px]">
                          <span>WHR: {record.whr}</span>
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
                </div>
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

export default WhrCalculateForm;

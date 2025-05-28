// WhrCalculateForm.jsx
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  createWHR,
  fetchWHRRecords,
  deleteWHR,
} from "../../../services/bodyIndex.service";
import { formatDateDDMMYY } from "../../../utils/formatDate";
import { Outlet, Link } from "react-router-dom";
import { useNotify } from "../../../hook/useNotify";

const WhrCalculateForm = () => {
  const dispatch = useDispatch();
  const { loading, whrRecords } = useSelector((state) => state.bodyIndex);
  const { notifyWarning } = useNotify();
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

  const handleSubmit = (e) => {
    e.preventDefault();
    const { waist, hip, gender } = input;
    if (!waist || !hip || Number(waist) <= 0 || Number(hip) <= 0) {
      notifyWarning("Vui lòng nhập đầy đủ và hợp lệ các trường!");
      return;
    }
    dispatch(
      createWHR({
        waist: Number(waist),
        hip: Number(hip),
        gender,
      })
    );
  };

  const handleDelete = (id) => dispatch(deleteWHR(id));

  return (
    <div className="flex-1 flex gap-[10px]">
      <div className="w-7/12 flex flex-col border-1 border-[#efefef] shadow rounded-lg p-[10px]">
        <h3 className="text-md font-semibold mb-3 text-blue-600">
          Tính chỉ số WHR (Tỉ số eo/mông)
        </h3>
        <form onSubmit={handleSubmit} className="flex flex-col gap-2">
          <select name="gender" value={input.gender} onChange={handleChange}>
            <option value="male">Nam</option>
            <option value="female">Nữ</option>
          </select>
          <input
            name="waist"
            type="number"
            placeholder="Vòng eo (cm)"
            value={input.waist}
            onChange={handleChange}
            required
          />
          <input
            name="hip"
            type="number"
            placeholder="Vòng mông (cm)"
            value={input.hip}
            onChange={handleChange}
            required
          />
          <button type="submit" disabled={loading}>
            Tính WHR
          </button>
        </form>
        <div className="mt-4">
          <h4 className="font-bold">Lịch sử tính</h4>
          <div className="flex flex-col gap-2">
            {whrRecords.length > 0 ? (
              whrRecords.map((record) => (
                <Link
                  key={record._id}
                  to={`${record._id}`}
                  className="flex items-center gap-2 border p-2 rounded hover:bg-blue-50"
                >
                  <span>WHR: {record.whr}</span>
                  <span>{formatDateDDMMYY(record.createdAt)}</span>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      handleDelete(record._id);
                    }}
                    className="ml-auto text-red-500"
                  >
                    Xóa
                  </button>
                </Link>
              ))
            ) : (
              <span>Chưa có tính toán</span>
            )}
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

import { BookText, HeartHandshake, ShieldOff } from "lucide-react";
import React, { useEffect, useState } from "react";
import {
  checkingVaccinacationRecord,
  fetchVaccinationRecords,
} from "../../../services/children.service";
import { useDispatch, useSelector } from "react-redux";
import { useNotify } from "../../../hook/useNotify";

const VaccineModal = ({
  selectedVaccine,
  child,
  closeModal,
  vaccinationRecords,
  onSuccess,
}) => {
  const dispatch = useDispatch();
  const { notifySuccess, notifyWarning, notifyError, notifyConfirm } =
    useNotify();
  const [selectedVaccineDate, setSelectedVaccineDate] = useState("");

  const findStatus = () => {
    return vaccinationRecords.some((vac) => vac.code === selectedVaccine.code);
  };

  const checkingVaccinacationRecordHandle = async (e) => {
    e.preventDefault();
    try {
      if (!selectedVaccineDate) {
        notifyWarning("Vui lòng nhập ngày tiêm!");
        return;
      }
      await dispatch(
        checkingVaccinacationRecord(child._id, {
          code: selectedVaccine.code,
          date: selectedVaccineDate,
          status: "completed",
        })
      );
      onSuccess(selectedVaccine);
      closeModal();
      notifySuccess("Đánh giấu tiêm thành công!");
    } catch (error) {
      notifyError(error.response.data.message);
    }
  };
  return (
    <div className="fixed inset-0 bg-[#00000028] bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-xl mx-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">
          {selectedVaccine.name}
        </h3>
        <p className="mb-2 text-sm text-gray-600">
          Độ tuổi khuyến nghị: {selectedVaccine.ageMonths} tháng
        </p>
        {!findStatus() && (
          <div className="">
            <label className="block text-sm font-medium mb-1">
              Chọn ngày tiêm
            </label>
            <input
              type="date"
              className="w-full border border-gray-300 rounded-md p-2 mb-4"
              value={selectedVaccineDate}
              onChange={(e) => setSelectedVaccineDate(e.target.value)}
            />
          </div>
        )}
        <div className="mb-6 space-y-4 text-gray-700 bg-blue-50 p-3 rounded-lg text-sm">
          <div className="flex items-start gap-3">
            <BookText className="text-blue-500 mt-1" size={20} />
            <p>
              <b className="text-gray-800">Định nghĩa:</b>{" "}
              {selectedVaccine.definition}
            </p>
          </div>

          <div className="flex items-start gap-3">
            <HeartHandshake className="text-green-500 mt-1" size={20} />
            <p>
              <b className="text-gray-800">Lợi ích:</b>{" "}
              {selectedVaccine.benefits}
            </p>
          </div>

          <div className="flex items-start gap-3">
            <ShieldOff className="text-red-500 mt-1" size={20} />
            <p>
              <b className="text-gray-800">Chống chỉ định:</b>{" "}
              {selectedVaccine.contraindications}
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={closeModal}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md"
          >
            Đóng
          </button>
          {!findStatus() && (
            <button
              onClick={checkingVaccinacationRecordHandle}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Xác nhận đã tiêm
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default VaccineModal;

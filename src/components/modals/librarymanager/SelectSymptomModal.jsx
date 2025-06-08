import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAllSymptomsHandle } from "../../../services/disease.service";
import Modal from "../../layout/Modal";
import Pagination from "../../features/Pagination";

const SelectSymptomModal = ({
  closeModal,
  selectedSymptomsHandle,
  currentSelected,
}) => {
  const dispatch = useDispatch();
  const { symptoms } = useSelector((state) => state.disease);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);

  useEffect(() => {
    dispatch(getAllSymptomsHandle(page, limit));
  }, [dispatch, page, limit]);

  useEffect(() => {
    if (currentSelected && currentSelected.length > 0) {
      setSelectedSymptoms(currentSelected);
    }
  }, [currentSelected]);

  const handleSelectedSymptoms = (symptom) => {
    if (selectedSymptoms.some((item) => item._id === symptom._id)) return;
    setSelectedSymptoms([...selectedSymptoms, symptom]);
  };

  const handleDeleteSelectedSymptom = (id) => {
    setSelectedSymptoms(selectedSymptoms.filter((item) => item._id !== id));
  };

  const handleSelect = () => {
    selectedSymptomsHandle(selectedSymptoms);
    closeModal();
  };

  const pagination = symptoms.pagination || { currentPage: 1, totalPages: 1 };

  return (
    <Modal closeModal={closeModal}>
      <div className="w-8/12 max-w-11/12 max-h-[80vh] overflow-y-auto bg-light-50 p-4 rounded-lg flex flex-col gap-4">
        <div className="w-full flex items-center gap-[20px] ">
          <h1 className="font-bold text-lg">Chọn triệu chứng</h1>
        </div>
        <div className="w-full flex gap-[10px] min-h-[400px]">
          <div className="w-full flex flex-col border-[1px] border-dark-800 rounded-md ">
            <h1 className="text-sm font-bold py-[8px] px-[8px]">
              Danh sách các triệu chứng
            </h1>
            <ul className="w-full min-h-[320px] max-h-[320px] overflow-y-auto flex flex-col gap-[5px] p-[5px]">
              {symptoms.symptoms?.map((symptom) => {
                const isSelected = selectedSymptoms.some(
                  (c) => c._id === symptom._id
                );
                return (
                  <li
                    key={symptom._id}
                    className={`w-full flex items-center justify-between border-[1px] border-dark-800 p-[5px] rounded-md cursor-pointer transition-all ${
                      isSelected ? "bg-blue-100" : "bg-white"
                    }`}
                    onClick={() => handleSelectedSymptoms(symptom)}
                  >
                    <span>{symptom.name}</span>
                    {isSelected && (
                      <i className="fa-solid fa-check text-blue-500 ml-2"></i>
                    )}
                  </li>
                );
              })}
            </ul>
            <Pagination
              currentPage={page}
              totalPages={pagination.totalPages}
              onPageChange={setPage}
            />
          </div>
          <div className="w-full flex flex-col border-[1px] border-dark-800 rounded-md ">
            <div className="w-full flex justify-between">
              <h1 className="text-sm font-bold py-[8px] px-[8px]">
                Triệu chứng đã chọn
              </h1>
              <div
                className="text-[0.8rem] font-bold py-[8px] px-[8px] text-red-500"
                onClick={() => setSelectedSymptoms([])}
              >
                Xóa tất cả
              </div>
            </div>
            <ul className="w-full max-h-[350px] overflow-y-auto flex flex-col gap-[5px] p-[5px]">
              {selectedSymptoms.length > 0 ? (
                selectedSymptoms.map((selectedSymptom) => (
                  <li
                    key={selectedSymptom._id}
                    className="w-full flex items-center px-[10px] py-[6px] border-[1px] rounded-md border-dark-800 text-sm"
                  >
                    <span className="flex-1">{selectedSymptom.name}</span>
                    <div
                      className="text-sm text-red-500"
                      onClick={() =>
                        handleDeleteSelectedSymptom(selectedSymptom._id)
                      }
                    >
                      <i className="fa-regular fa-square-minus"></i>
                    </div>
                  </li>
                ))
              ) : (
                <div className=""></div>
              )}
            </ul>
          </div>
        </div>
        <div className="w-full flex flex-col gap-[10px]">
          <button
            onClick={handleSelect}
            className={`w-full flex justify-center items-center rounded-sm py-[8px] text-sm text-light-50 font-bold bg-green-500 hover:bg-dark-600 transition-colors cursor-pointer`}
          >
            <span>Chọn </span>
          </button>
          <button
            onClick={closeModal}
            className={`w-full flex justify-center items-center rounded-sm py-[8px] text-sm border-[1px] border-dark-600 font-bold cursor-pointer `}
          >
            <span>Quay lại</span>
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default SelectSymptomModal;

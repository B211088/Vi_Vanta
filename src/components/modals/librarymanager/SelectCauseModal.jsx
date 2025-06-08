import React, { useEffect, useState } from "react";
import Modal from "../../layout/Modal";
import { useDispatch, useSelector } from "react-redux";
import { getAllCausesHandle } from "../../../services/disease.service";
import Pagination from "../../features/Pagination";

const SelectCauseModal = ({
  closeModal,
  selectedCausesHandle,
  currentSelected,
}) => {
  const dispatch = useDispatch();
  const { causes } = useSelector((state) => state.disease);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [selectedCauses, setSelectedCauses] = useState([]);

  useEffect(() => {
    dispatch(getAllCausesHandle(page, limit));
  }, [dispatch, page, limit]);

  useEffect(() => {
    if (currentSelected && currentSelected.length > 0) {
      setSelectedCauses(currentSelected);
    }
  }, [currentSelected]);

  const handleSelectedCauses = (cause) => {
    if (selectedCauses.some((item) => item._id === cause._id)) return;
    setSelectedCauses([...selectedCauses, cause]);
  };

  const handleDeleteSelectedCause = (id) => {
    setSelectedCauses(selectedCauses.filter((item) => item._id !== id));
  };

  const handleSelect = () => {
    selectedCausesHandle(selectedCauses);
    closeModal();
  };

  const pagination = causes.pagination || { currentPage: 1, totalPages: 1 };

  return (
    <Modal closeModal={closeModal}>
      <div className="w-8/12 max-w-11/12 max-h-[80vh] overflow-y-auto bg-light-50 p-4 rounded-lg flex flex-col gap-4">
        <div className="w-full flex items-center gap-[20px] ">
          <h1 className="font-bold text-lg">Chọn nguyên nhân gây bệnh</h1>
        </div>
        <div className="w-full flex gap-[10px] min-h-[400px]">
          <div className="w-full flex flex-col border-[1px] border-dark-800 rounded-md ">
            <h1 className="text-sm font-bold py-[8px] px-[8px]">
              Danh sách các nguyên nhân
            </h1>
            <ul className="w-full min-h-[320px] max-h-[320px] overflow-y-auto flex flex-col gap-[5px] p-[5px]">
              {causes.causes?.map((cause) => {
                const isSelected = selectedCauses.some(
                  (c) => c._id === cause._id
                );
                return (
                  <li
                    key={cause._id}
                    className={`w-full flex items-center justify-between border-[1px] border-dark-800 p-[5px] rounded-md cursor-pointer transition-all ${
                      isSelected ? "bg-blue-100" : "bg-white"
                    }`}
                    onClick={() => handleSelectedCauses(cause)}
                  >
                    <span>{cause.name}</span>
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
                Nguyên nhân đã chọn
              </h1>
              <div
                className="text-[0.8rem] font-bold py-[8px] px-[8px] text-red-500"
                onClick={() => setSelectedCauses([])}
              >
                Xóa tất cả
              </div>
            </div>
            <ul className="w-full max-h-[350px] overflow-y-auto flex flex-col gap-[5px] p-[5px]">
              {selectedCauses.length > 0 ? (
                selectedCauses.map((selectedCause) => (
                  <li
                    key={selectedCause._id}
                    className="w-full flex items-center px-[10px] py-[6px] border-[1px] rounded-md border-dark-800 text-sm"
                  >
                    <span className="flex-1">{selectedCause.name}</span>
                    <div
                      className="text-sm text-red-500"
                      onClick={() =>
                        handleDeleteSelectedCause(selectedCause._id)
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

export default SelectCauseModal;

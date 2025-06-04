import React, { useEffect, useState } from "react";
import Modal from "../../layout/Modal";
import { useDispatch, useSelector } from "react-redux";
import { getAllTreatmentsHandle } from "../../../services/disease.service";

const SelectTreatmentModal = ({
  closeModal,
  selectedTreatmentsHandle,
  currentSelected,
}) => {
  const dispatch = useDispatch();
  const { treatments } = useSelector((state) => state.disease);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [selectedTreatments, setSelectedTreatments] = useState([]);
  console.log({ treatments });

  useEffect(() => {
    dispatch(getAllTreatmentsHandle(page, limit));
  }, [dispatch]);

  useEffect(() => {
    if (currentSelected && currentSelected.length > 0) {
      setSelectedTreatments(currentSelected);
    }
  }, [currentSelected]);

  const handleSelectedTreatments = (treatment) => {
    if (selectedTreatments.some((item) => item._id === treatment._id)) return;
    setSelectedTreatments([...selectedTreatments, treatment]);
  };

  const handleDeleteSelectedTreatment = (id) => {
    setSelectedTreatments(selectedTreatments.filter((item) => item._id !== id));
  };

  const handleSelect = () => {
    selectedTreatmentsHandle(selectedTreatments);
    closeModal();
  };

  return (
    <Modal closeModal={closeModal}>
      <div className="w-8/12 max-w-11/12 max-h-[80vh] overflow-y-auto bg-light-50 p-4 rounded-lg flex flex-col gap-4">
        <div className="w-full flex items-center gap-[20px] ">
          <h1 className="font-bold text-lg">Chọn phương pháp điều trị</h1>
        </div>
        <div className="w-full flex gap-[10px] min-h-[400px]">
          <div className="w-full max-h-[400px] overflow-y-auto flex flex-col border-[1px] border-dark-800 rounded-md ">
            <h1 className="text-sm font-bold py-[8px] px-[8px]">
              Danh sách các phương pháp điều trị
            </h1>
            <ul className="w-full flex flex-col gap-[5px] p-[5px]">
              {treatments.treatments?.map((treatment) => (
                <li
                  key={treatment._id}
                  onClick={() => handleSelectedTreatments(treatment)}
                  className="w-full flex items-center px-[10px] py-[6px] border-[1px] rounded-md border-dark-800 hover:bg-blue-100  text-sm"
                >
                  {treatment.name}
                </li>
              ))}
            </ul>
          </div>
          <div className="w-full max-h-[400px] overflow-y-auto flex flex-col border-[1px] border-dark-800 rounded-md ">
            <h1 className="text-sm font-bold py-[8px] px-[8px]">
              Phương pháp điều trị đã chọn
            </h1>
            <ul className="w-full flex flex-col gap-[5px] p-[5px]">
              {selectedTreatments.length > 0 ? (
                selectedTreatments.map((selectedTreatment) => (
                  <li
                    key={selectedTreatment._id}
                    className="w-full flex items-center px-[10px] py-[6px] border-[1px] rounded-md border-dark-800 text-sm"
                  >
                    <span className="flex-1">{selectedTreatment.name}</span>
                    <div
                      className="text-sm text-red-500"
                      onClick={() =>
                        handleDeleteSelectedTreatment(selectedTreatment._id)
                      }
                    >
                      xóa
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
            className={`w-full flex justify-center items-center rounded-sm py-[8px] text-sm text-light-50 font-bold 
          bg-green-500 hover:bg-dark-600
             transition-colors cursor-pointer`}
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

export default SelectTreatmentModal;

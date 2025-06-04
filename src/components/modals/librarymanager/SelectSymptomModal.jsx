import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAllSymptomsHandle } from "../../../services/disease.service";
import Modal from "../../layout/Modal";

const SelectSymptomModal = ({
  closeModal,
  selectedSymptomsHandle,
  currentSelected,
}) => {
  const dispatch = useDispatch();
  const { symptoms } = useSelector((state) => state.disease);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [selectedSymptoms, setSelectSymptoms] = useState([]);

  console.log({ symptoms });

  useEffect(() => {
    dispatch(getAllSymptomsHandle(page, limit));
  }, []);

  useEffect(() => {
    if (currentSelected.length > 0) {
      setSelectSymptoms(currentSelected);
    }
  }, [currentSelected]);

  const handleSelectedSymptoms = (symptom) => {
    if (selectedSymptoms.some((item) => item._id === symptom._id)) {
      return;
    } else {
      setSelectSymptoms([...selectedSymptoms, symptom]);
    }
  };

  const handleDeleteSelectedSymptom = (id) => {
    const updateSelectsymptoms = selectedSymptoms.filter(
      (item) => item._id !== id
    );
    setSelectSymptoms(updateSelectsymptoms);
  };

  const handleSelect = () => {
    selectedSymptomsHandle(selectedSymptoms);
    closeModal();
  };
  return (
    <Modal closeModal={closeModal}>
      <div className="w-8/12 max-w-11/12 max-h-[80vh] overflow-y-auto bg-light-50 p-4 rounded-lg flex flex-col gap-4">
        <div className="w-full flex items-center gap-[20px] ">
          <h1 className="font-bold text-lg">Chọn triệu chứng</h1>
        </div>
        <div className="w-full flex gap-[10px] min-h-[400px]">
          <div className="w-full max-h-[400px] overflow-y-auto flex flex-col border-[1px] border-dark-800 rounded-md ">
            <h1 className="text-sm font-bold py-[8px] px-[8px]">
              Danh sách các triệu chứng
            </h1>
            <ul className="w-full flex flex-col gap-[5px] p-[5px]">
              {symptoms.symptoms?.map((symptom) => (
                <li
                  key={symptom._id}
                  onClick={() => handleSelectedSymptoms(symptom)}
                  className="w-full flex items-center px-[10px] py-[6px] border-[1px] rounded-md border-dark-800 hover:bg-blue-100  text-sm"
                >
                  {symptom.name}
                </li>
              ))}
            </ul>
          </div>
          <div className="w-full max-h-[400px] overflow-y-auto flex flex-col border-[1px] border-dark-800 rounded-md ">
            <h1 className="text-sm font-bold py-[8px] px-[8px]">
              Biện triệu chứng đã chọn
            </h1>{" "}
            <ul className="w-full flex flex-col gap-[5px] p-[5px]">
              {selectedSymptoms ? (
                selectedSymptoms.map((selectedPrevention) => (
                  <li
                    key={selectedPrevention._id}
                    className="w-full flex items-center px-[10px] py-[6px] border-[1px] rounded-md border-dark-800 text-sm"
                  >
                    <span className="flex-1">{selectedPrevention.name}</span>
                    <div
                      className="text-sm text-red-500"
                      onClick={() =>
                        handleDeleteSelectedSymptom(selectedPrevention._id)
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
          </button>{" "}
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

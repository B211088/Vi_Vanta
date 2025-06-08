import React, { useState, useEffect } from "react";
import Modal from "../../layout/Modal";
import { useSelector, useDispatch } from "react-redux";
import { getAllDiseasesHandle } from "../../../services/disease.service";

const SelectRelatedDiseasesModal = ({
  closeModal,
  selectedRelatedDiseasesHandle,
  currentSelected,
}) => {
  const dispatch = useDispatch();
  const { diseases } = useSelector((state) => state.disease);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [selectedRelatedDiseases, setSelectedRelatedDiseases] = useState([]);

  useEffect(() => {
    dispatch(getAllDiseasesHandle(page, limit, "all"));
  }, [dispatch, page, limit]);

  useEffect(() => {
    if (currentSelected && currentSelected.length > 0) {
      setSelectedRelatedDiseases(currentSelected);
    }
  }, [currentSelected]);

  const handleSelectDisease = (disease) => {
    if (selectedRelatedDiseases.some((item) => item._id === disease._id))
      return;
    setSelectedRelatedDiseases([...selectedRelatedDiseases, disease]);
  };

  const handleDeleteSelected = (id) => {
    setSelectedRelatedDiseases(
      selectedRelatedDiseases.filter((item) => item._id !== id)
    );
  };

  const handleSelect = () => {
    selectedRelatedDiseasesHandle(selectedRelatedDiseases);
    closeModal();
  };

  return (
    <Modal closeModal={closeModal}>
      <div className="w-8/12 max-w-11/12 max-h-[80vh] overflow-y-auto bg-light-50 p-4 rounded-lg flex flex-col gap-4">
        <div className="w-full flex items-center gap-[20px] ">
          <h1 className="font-bold text-lg">Chọn các bệnh liên quan</h1>
        </div>
        <div className="w-full flex gap-[10px] min-h-[400px]">
          <div className="w-full max-h-[400px] overflow-y-auto flex flex-col border-[1px] border-dark-800 rounded-md ">
            <h1 className="text-sm font-bold py-[8px] px-[8px]">
              Danh sách các bệnh
            </h1>
            <ul className="w-full flex flex-col gap-[5px] p-[5px]">
              {diseases.diseases?.map((disease) => (
                <li
                  key={disease._id}
                  onClick={() => handleSelectDisease(disease)}
                  className="w-full flex items-center px-[10px] py-[6px] border-[1px] rounded-md border-dark-800 hover:bg-blue-100  text-sm"
                >
                  {disease.name}
                </li>
              ))}
            </ul>
          </div>
          <div className="w-full max-h-[400px] overflow-y-auto flex flex-col border-[1px] border-dark-800 rounded-md ">
            <h1 className="text-sm font-bold py-[8px] px-[8px]">
              Bệnh đã chọn
            </h1>
            <ul className="w-full flex flex-col gap-[5px] p-[5px]">
              {selectedRelatedDiseases.length > 0 ? (
                selectedRelatedDiseases.map((disease) => (
                  <li
                    key={disease._id}
                    className="w-full flex items-center px-[10px] py-[6px] border-[1px] rounded-md border-dark-800 text-sm"
                  >
                    <span className="flex-1">{disease.name}</span>
                    <div
                      className="text-sm text-red-500"
                      onClick={() => handleDeleteSelected(disease._id)}
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
            <span>Chọn</span>
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

export default SelectRelatedDiseasesModal;

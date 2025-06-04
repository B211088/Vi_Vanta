import React, { useEffect, useState } from "react";
import { getAllDiseaseCategoriesHandle } from "../../../services/disease.service";
import { useDispatch, useSelector } from "react-redux";
import Modal from "../../layout/Modal";

const SelectDiseaseCategoryModal = ({
  closeModal,
  selectedDiseaseCategoryHandle,
  currentSelected,
}) => {
  const dispatch = useDispatch();
  const { categories } = useSelector((state) => state.disease);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [selectedDiseaseCategories, setSelectedDiseaseCategories] = useState(
    []
  );

  useEffect(() => {
    dispatch(getAllDiseaseCategoriesHandle(page, limit));
  }, [dispatch]);

  useEffect(() => {
    if (currentSelected && currentSelected.length > 0) {
      setSelectedDiseaseCategories(currentSelected);
    }
  }, [currentSelected]);

  const handleSelectedDiseaseCategory = (category) => {
    if (selectedDiseaseCategories.some((item) => item._id === category._id))
      return;
    setSelectedDiseaseCategories([...selectedDiseaseCategories, category]);
  };

  const handleDeleteSelectedCause = (id) => {
    setSelectedDiseaseCategories(
      selectedDiseaseCategories.filter((item) => item._id !== id)
    );
  };

  const handleSelect = () => {
    selectedDiseaseCategoryHandle(selectedDiseaseCategories);
    closeModal();
  };

  return (
    <Modal closeModal={closeModal}>
      <div className="w-8/12 max-w-11/12 max-h-[80vh] overflow-y-auto bg-light-50 p-4 rounded-lg flex flex-col gap-4">
        <div className="w-full flex items-center gap-[20px] ">
          <h1 className="font-bold text-lg">Chọn phân loại bệnh</h1>
        </div>
        <div className="w-full flex gap-[10px] min-h-[400px]">
          <div className="w-full max-h-[400px] overflow-y-auto flex flex-col border-[1px] border-dark-800 rounded-md ">
            <h1 className="text-sm font-bold py-[8px] px-[8px]">
              Danh sách các phân loại bệnh
            </h1>
            <ul className="w-full flex flex-col gap-[5px] p-[5px]">
              {categories.categories?.map((category) => (
                <li
                  key={category._id}
                  onClick={() => handleSelectedDiseaseCategory(category)}
                  className="w-full flex items-center px-[10px] py-[6px] border-[1px] rounded-md border-dark-800 hover:bg-blue-100  text-sm"
                >
                  {category.name}
                </li>
              ))}
            </ul>
          </div>
          <div className="w-full max-h-[400px] overflow-y-auto flex flex-col border-[1px] border-dark-800 rounded-md ">
            <h1 className="text-sm font-bold py-[8px] px-[8px]">
              Phân loại đã chọn
            </h1>
            <ul className="w-full flex flex-col gap-[5px] p-[5px]">
              {selectedDiseaseCategories.length > 0 ? (
                selectedDiseaseCategories.map((selectedDiseaseCategory) => (
                  <li
                    key={selectedDiseaseCategory._id}
                    className="w-full flex items-center px-[10px] py-[6px] border-[1px] rounded-md border-dark-800 text-sm"
                  >
                    <span className="flex-1">
                      {selectedDiseaseCategory.name}
                    </span>
                    <div
                      className="text-sm text-red-500"
                      onClick={() =>
                        handleDeleteSelectedCause(selectedDiseaseCategory._id)
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

export default SelectDiseaseCategoryModal;

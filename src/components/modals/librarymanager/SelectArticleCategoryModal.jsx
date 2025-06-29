import React, { useEffect, useState } from "react";

import { useDispatch, useSelector } from "react-redux";
import Modal from "../../layout/Modal";
import Pagination from "../../features/Pagination";
import { useNotify } from "../../../hook/useNotify";

const SelectDiseaseCategoryModal = ({
  closeModal,
  selectedDiseaseCategoryHandle,
  currentSelected,
}) => {
  const dispatch = useDispatch();
  const { categories } = useSelector((state) => state.disease);
  const { notifySuccess, notifyWarning } = useNotify();
  const [pageRoot, setPageRoot] = useState(1);
  const [limitRoot, setLimitRoot] = useState(20);
  const [pageChilren, setPageChildren] = useState(1);
  const [limitChilren, setLimitChilren] = useState(20);
  const [categoryPath, setCategoryPath] = useState([]);
  const [categoryBefore, setCategoryBefore] = useState(null);
  const [selectedDiseaseCategories, setSelectedDiseaseCategories] = useState(
    []
  );

  console.log({ categoryBefore });

  //   const loadRootCategories = async () => {
  //     try {
  //       await dispatch(getAllDiseaseCategoriesHandle(pageRoot, limitRoot));
  //     } catch (error) {
  //       notifyWarning(error.message || "Không thể tải danh sách phân loại!");
  //     }
  //   };

  //   useEffect(() => {
  //     loadRootCategories();
  //   }, [pageRoot]);

  //   const handleGetDiseaseCategoriesChildren = async (id) => {
  //     try {
  //       await dispatch(
  //         getChildrenDiseaseCategoriesHandle(pageChilren, limitChilren, id)
  //       );
  //       notifySuccess("Lấy danh mục con thành công!");
  //     } catch (error) {
  //       notifyWarning(error.message || "Không thể tải danh sách phân loại con!");
  //     }
  //   };

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

  //   const handleBreadcrumbClick = async (index) => {
  //     const clickedCategory = categoryPath[index];
  //     setCategoryBefore(clickedCategory);
  //     setCategoryPath(categoryPath.slice(0, index + 1));
  //     await handleGetDiseaseCategoriesChildren(clickedCategory._id);
  //   };

  const pagination = categories.pagination || { currentPage: 1, totalPages: 1 };

  return (
    <Modal closeModal={closeModal}>
      <div className="w-8/12 max-w-11/12 max-h-[80vh] overflow-y-auto bg-light-50 p-4 rounded-lg flex flex-col gap-4">
        <div className="w-full flex items-center gap-[5px] ">
          <div
            onClick={() => {
              setCategoryBefore(null);
              setCategoryPath([]);
              setPageRoot(1);
            }}
            className="w-[32px] h-[32px] flex items-center justify-center rounded-full border-[1px] border-dark-700 text-sm cursor-pointer hover:bg-gray-50"
          >
            <i className="fa-solid fa-house"></i>
          </div>
          {categoryPath.map((cat, idx) => (
            <React.Fragment key={cat._id}>
              <span className="">/</span>
              <span className="cursor-pointer hover:underline text-blue-600">
                {cat.name}
              </span>
            </React.Fragment>
          ))}
        </div>
        <div className="w-full flex gap-[10px] min-h-[400px]">
          <div className="w-full  flex flex-col border-[1px] border-dark-800 rounded-md ">
            <div className="w-full flex justify-between">
              <h1 className="text-sm font-bold py-[8px] px-[8px]">
                Danh sách phân loại bệnh
              </h1>
            </div>
            <ul className="w-full min-h-[320px] max-h-[320px] overflow-y-auto flex flex-col gap-[5px] p-[5px]">
              {categories.categories?.map((category) => {
                const isSelected = selectedDiseaseCategories.some(
                  (c) => c._id === category._id
                );
                return (
                  <li
                    key={category._id}
                    className={`w-full flex items-center justify-between border-[1px] border-dark-800 p-[5px] rounded-md cursor-pointer transition-all ${
                      isSelected ? "bg-blue-100" : "bg-white"
                    }`}
                    onClick={() => {
                      if (!isSelected && !category.hasChildren) {
                        handleSelectedDiseaseCategory(category);
                      } else if (isSelected && !category.hasChildren) {
                        setSelectedDiseaseCategories(
                          selectedDiseaseCategories.filter(
                            (item) => item._id !== category._id
                          )
                        );
                      } else if (!isSelected && category.hasChildren) {
                        setCategoryBefore(category);
                        setCategoryPath((prev) => [...prev, category]);
                      }
                    }}
                  >
                    <span>{category.name}</span>
                    {isSelected && (
                      <i className="fa-solid fa-check text-blue-500 ml-2"></i>
                    )}
                  </li>
                );
              })}
            </ul>
            <Pagination
              currentPage={pageRoot}
              totalPages={pagination.totalPages}
              onPageChange={setPageRoot}
            />
          </div>
          <div className="w-full  flex flex-col border-[1px] border-dark-800 rounded-md ">
            <div className="w-full flex justify-between">
              <h1 className="text-sm font-bold py-[8px] px-[8px]">
                Phân loại đã chọn
              </h1>
              <div
                className="text-[0.8rem] font-bold py-[8px] px-[8px] text-red-500"
                onClick={() => {
                  setSelectedDiseaseCategories([]);
                }}
              >
                Xóa tất cả
              </div>
            </div>
            <ul className="w-full  max-h-[350px] overflow-y-auto flex flex-col gap-[5px] p-[5px]">
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

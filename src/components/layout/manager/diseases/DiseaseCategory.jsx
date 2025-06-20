import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  deleteDiseaseCategoryHandle,
  getAllDiseaseCategoriesHandle,
  getChildrenDiseaseCategoriesHandle,
} from "../../../../services/disease.service";
import { formatDateTimeVietnamese } from "../../../../utils/formatDate";
import { useNotify } from "../../../../hook/useNotify";
import CreateDiseaseCategoryModal from "../../../modals/librarymanager/CreateDiseaseCategoryModal";
import UpdateDiseaseCategoryModal from "../../../modals/librarymanager/UpdateDiseaseCategoryModal";
import Pagination from "../../../features/Pagination";

const DiseaseCategory = () => {
  const dispatch = useDispatch();
  const { categories } = useSelector((state) => state.disease);
  const { notifySuccess, notifyWarning, notifyConfirm } = useNotify();
  const [navigation, setNavigation] = useState([]);
  const [pageRoot, setPageRoot] = useState(1);
  const [limitRoot, setLimitRoot] = useState(20);
  const [pageChildren, setPageChildren] = useState(1);
  const [limitChildren, setLimitChildren] = useState(20);
  const [currentCategory, setCurrentCategory] = useState(null);
  const [createCategoryModal, setCreateCategoryModal] = useState(false);
  const [updateCategoryModal, setUpdateCategoryModal] = useState(false);
  const [currentCategoryData, setCurrentCategoryData] = useState(null);

  const loadRootCategories = async () => {
    try {
      await dispatch(getAllDiseaseCategoriesHandle(pageRoot, limitRoot));
    } catch (error) {
      notifyWarning(error.message || "Không thể tải danh sách phân loại!");
    }
  };

  useEffect(() => {
    loadRootCategories();
  }, [pageRoot, limitRoot, dispatch]);

  const handleGetDiseaseCategoriesChildren = async (id) => {
    try {
      await dispatch(
        getChildrenDiseaseCategoriesHandle(pageChildren, limitChildren, id)
      );
      notifySuccess("Lấy danh mục con thành công!");
    } catch (error) {
      notifyWarning(error.message || "Không thể tải danh sách phân loại con!");
    }
  };

  const handleTriggerNavigation = async (cat) => {
    const existingIndex = navigation.findIndex((item) => item._id === cat._id);
    if (existingIndex !== -1) {
      setNavigation(navigation.slice(0, existingIndex + 1));
      setCurrentCategory(cat);
    } else {
      setCurrentCategory(cat);
      setNavigation([...navigation, { _id: cat._id, name: cat.name }]);
    }
    await handleGetDiseaseCategoriesChildren(cat._id);
  };

  const handleDeleteCategory = async (id) => {
    try {
      const confirmDelete = await notifyConfirm(
        "Bạn có chắc chắn muốn xóa phân loại này? bạn sẽ không thể xóa nếu có phân loại con"
      );
      if (confirmDelete) {
        await dispatch(deleteDiseaseCategoryHandle(id));
        notifySuccess("Xóa phân loại thành công!");
      }
    } catch (error) {
      console.error("Error navigating:", error);
      notifyWarning(
        error.response?.data?.message || "Không thể xóa phân loại!"
      );
    }
  };

  const handleNavigationClick = async (nav, index) => {
    try {
      if (!nav) {
        // Nếu click vào root
        setCurrentCategory(null);
        setNavigation([]);
        await loadRootCategories();
      } else {
        setNavigation(navigation.slice(0, index + 1));
        setCurrentCategory(nav);
        await handleGetDiseaseCategoriesChildren(nav._id);
      }
    } catch (error) {
      notifyWarning(
        error.response?.data?.message || "Không thể tải danh sách phân loại!"
      );
    }
  };

  const pagination = categories.pagination || { currentPage: 1, totalPages: 1 };
  return (
    <div className="w-full h-full flex flex-col gap-[10px] overflow-hidden">
      {createCategoryModal && (
        <CreateDiseaseCategoryModal
          closeModal={() => setCreateCategoryModal(false)}
          parent={currentCategory}
        />
      )}{" "}
      {updateCategoryModal && (
        <UpdateDiseaseCategoryModal
          closeModal={() => setUpdateCategoryModal(false)}
          currentData={currentCategoryData}
        />
      )}
      <div className="w-full flex items-center">
        <h1 className="font-bold text-lg">Phân loại bệnh</h1>
      </div>
      <div className="w-full flex items-center justify-between gap-[10px] border-[1px] border-dark-800 rounded-lg p-[10px]">
        <div className="flex-1 flex items-center gap-[10px]">
          <div
            onClick={() => handleNavigationClick(null, 0)}
            className="w-[32px] h-[32px] flex items-center justify-center rounded-full border-[1px] border-dark-700 text-sm cursor-pointer hover:bg-gray-50"
          >
            <i className="fa-solid fa-house"></i>
          </div>
          <div className="flex items-center gap-[2px] text-sm">
            {navigation.length > 0 ? (
              navigation?.map((nav, index) => (
                <div
                  key={nav._id}
                  className="flex items-center justify-center gap-[3px] rounded-sm cursor-pointer"
                  onClick={() => handleNavigationClick(nav, index)}
                >
                  <span>/</span>
                  <span className="hover:text-blue-500">{nav.name}</span>
                </div>
              ))
            ) : (
              <div className="flex items-center justify-center rounded-sm cursor-pointer hover:text-blue-500">
                <span>Trang chủ</span>
              </div>
            )}
          </div>
        </div>
        <button
          className="bg-blue-400 px-[10px] py-[10px] rounded-md text-light-50 text-sm cursor-pointer"
          onClick={() => setCreateCategoryModal(true)}
        >
          Tạo phân loại mới
        </button>
      </div>
      <div className="w-full h-full flex flex-col gap-[10px] border-[1px] border-dark-800 rounded-lg p-[10px]">
        <div className="w-full h-full flex flex-col gap-[10px] border-[1px] border-dark-800 rounded-md">
          <div className="w-full flex items-center gap-[10px] justify-between border-b-[1px] pl-[18px] pr-[24px] border-dark-800 font-bold py-[10px] cursor-pointer text-sm">
            <div className="min-w-[40px] text-nowrap">
              <span>STT</span>
            </div>
            <div className="w-4/12 text-nowrap truncate">
              <span>Tên phân loại</span>
            </div>
            <div className="w-2/12 text-nowrap">
              <span>Thời gian tạo</span>
            </div>
            <div className="w-2/12 text-nowrap">
              <span>Cập nhật gần đây</span>
            </div>
            <div className="w-2/12 text-nowrap flex ">
              <span>Tạo bởi nhật bởi</span>
            </div>
            <div className="w-2/12 text-nowrap flex ">
              <span>Cập nhật bởi</span>
            </div>
            <div className="w-2/12 text-nowrap flex justify-end">
              <span>Hành động</span>
            </div>
          </div>
          <ul
            style={{ maxHeight: "calc(100vh - 385px)" }}
            className="w-full h-full flex flex-col gap-[10px] overflow-y-auto p-[10px]"
          >
            {categories?.categories?.length > 0 ? (
              categories.categories?.map((category, index) => (
                <div
                  key={category._id}
                  className={`w-full flex items-center gap-[10px] justify-between border-[1px] border-dark-800 rounded-md px-[8px] py-[10px] cursor-pointer text-sm hover:bg-gray-50`}
                  onClick={() => handleTriggerNavigation(category)}
                >
                  <div className="min-w-[40px] text-nowrap">
                    <span>{index + 1}</span>
                  </div>
                  <div className="w-4/12">
                    <span>{category.name || ""}</span>
                  </div>
                  <div className="w-2/12 text-nowrap truncate">
                    <span>
                      {category.createdAt
                        ? formatDateTimeVietnamese(category.createdAt)
                        : ""}
                    </span>
                  </div>
                  <div className="w-2/12 text-nowrap e">
                    <span>
                      {category.updatedAt
                        ? formatDateTimeVietnamese(category.updatedAt)
                        : ""}
                    </span>
                  </div>{" "}
                  <div className="w-2/12 text-nowrap ">
                    <span>
                      {category.createdBy ? category.createdBy.fullName : ""}
                    </span>
                  </div>{" "}
                  <div className="w-2/12 text-nowrap ">
                    <span>
                      {category.updatedBy ? category.updatedBy.fullName : ""}
                    </span>
                  </div>
                  <div className="w-2/12 truncate gap-[10px] flex justify-end">
                    <div
                      className="w-[28px] h-[28px] flex items-center justify-center border-[1px] border-dark-800 rounded-md text-[0.8rem] hover:bg-blue-500 hover:text-light-50"
                      onClick={(e) => {
                        e.stopPropagation();
                        setUpdateCategoryModal(true);
                        setCurrentCategoryData(category);
                      }}
                    >
                      <i className="fa-regular fa-pen-to-square"></i>
                    </div>
                    <div
                      className="w-[28px] h-[28px] flex items-center justify-center border-[1px] border-dark-800 rounded-md text-[0.8rem] hover:bg-blue-500 hover:text-light-50"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteCategory(category._id);
                      }}
                    >
                      <i className="fa-regular fa-trash-can"></i>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="w-full h-full flex items-center justify-center text-center py-4">
                <div className="w-full h-full flex flex-col items-center justify-center gap-[10px] text-dark-600">
                  <i className="fa-solid fa-box-open text-[3rem] "></i>{" "}
                  <h1 className="text-md">Không có phân loại con</h1>
                </div>
              </div>
            )}
          </ul>{" "}
          <Pagination
            currentPage={currentCategory ? pageChildren : pageRoot}
            totalPages={pagination.totalPages}
            onPageChange={currentCategory ? setPageChildren : setPageRoot}
          />
        </div>
      </div>
    </div>
  );
};

export default DiseaseCategory;

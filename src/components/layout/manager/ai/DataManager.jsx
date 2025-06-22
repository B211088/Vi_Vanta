import { useDispatch, useSelector } from "react-redux";
import { Link, Outlet, useLocation } from "react-router-dom";
import {
  deleteCollection,
  getAllInfoCollections,
} from "../../../../services/collection.service";
import { useNotify } from "../../../../hook/useNotify";
import { useEffect, useState } from "react";
import { formatDateDDMMYYHHMMSS } from "../../../../utils/formatDate";
import CreateCollection from "../../../modals/ai/CreateCollection";
const DataManager = () => {
  const dispatch = useDispatch();
  const { laoding, collections } = useSelector((state) => state.collection);
  const { notifySuccess, notifyWarning, notifyError, notifyConfirm } =
    useNotify();
  const [showCreateCollectionModal, setCreateColelectionModal] =
    useState(false);
  const loadCollection = async () => {
    try {
      const response = await dispatch(getAllInfoCollections());
    } catch (error) {
      notifyError(error.message);
    }
  };

  useEffect(() => {
    loadCollection();
  }, []);

  const handleDeleteCollection = async (id, e) => {
    e.stopPropagation();
    try {
      const confirm = await notifyConfirm(
        "Bạn có chắc chắn muốn xóa collection này? nếu xác nhận bạn sẽ xóa nó vĩnh viễn!"
      );
      if (confirm) {
        const response = await dispatch(deleteCollection(id));
        if (response.success) {
          notifySuccess("Xoá collection thành công!");
        }
      }
    } catch (error) {
      console.error("Error:", error);
      notifyWarning(
        error.response?.data?.message || "Không thể xóa phân collection!"
      );
    }
  };

  return (
    <div className="flex-1 flex flex-col  gap-[10px] overflow-hidden ">
      {showCreateCollectionModal && (
        <CreateCollection closeModal={() => setCreateColelectionModal(false)} />
      )}
      <div className="w-full  flex items-center border-b-[1px]  border-dark-700  gap-[10px]  px-[20px] py-[12px] text-[1.2rem]">
        <h1>RAG Manager</h1>
        <div
          className="flex items-center gap-[5px] text-sm font-bold text-blue-500 cursor-pointer"
          onClick={() => setCreateColelectionModal(true)}
        >
          <i className="fa-regular fa-square-plus"></i>
          <span>Tạo bộ dữ liệu</span>
        </div>
      </div>
      <div className="w-full  flex items-center  gap-[10px]  px-[20px] py-[12px] ">
        <p className="w-5/12 text-sm text-justify ">
          Chức năng này cho phép người quản trị hoặc nhà phát triển hệ thống
          theo dõi và quản lý các bộ sưu tập dữ liệu (data collections) đang
          được lưu trữ trong hệ thống. Mỗi collection có thể chứa nhiều tài liệu
          (documents) cùng với metadata và vector embeddings phục vụ cho các
          chức năng tìm kiếm thông minh, phân tích, hoặc truy vấn dựa trên AI.
        </p>
      </div>
      <div className="w-full  flex flex-col gap-[10px]  px-[20px] py-[12px]">
        <div className="w-full flex items-center gap-[10px] py-[8px] border-[1px] border-transparent bg-dark-900 px-[10px] text-sm font-semibold text-dark-300 rounded-sm">
          <div className="w-2/12">Tên </div>
          <div className="w-1/12">Trạng thái</div>
          <div className="w-3/12">Mô tả</div>
          <div className="w-2/12">Vector Database</div>
          <div className="w-2/12">Ngày tạo</div>
          <div className="w-1/12">Testing</div>{" "}
          <div className="w-1/12">Hành động</div>
        </div>
        <div className="w-full flex flex-col gap-[10px] py-[5px]  text-sm font-semibold text-dark-300">
          {collections?.map((collection) => (
            <div
              key={collection._id}
              className="w-full flex items-center gap-[10px] border-[1px] rounded-sm border-dark-900 py-[8px] px-[10px]"
            >
              <Link
                to={`/ai-manager/collection/data?id=${collection._id}&name=${collection.name}`}
                className="w-2/12 max-w-2/12 hover:underline"
              >
                {collection.name}
              </Link>
              <div className="w-1/12 text-[0.8rem]">
                <i className="fa-solid fa-circle-check text-green-600 mr-[3px]"></i>
                <span>Sẵn sàng</span>
              </div>
              <div className="w-3/12">{collection.description}</div>
              <div className="w-2/12">{collection.vectorDatabase}</div>
              <div className="w-2/12 text-[0.8rem]">
                {formatDateDDMMYYHHMMSS(collection.createdAt)}
              </div>
              <Link
                to={`/ai-manager/testing?id=${collection._id}&name=${collection.name}`}
                className="w-1/12 hover:text-blue-400"
              >
                Testing
              </Link>
              <div className="w-1/12 text-[0.8rem]">
                <div
                  onClick={(e) => handleDeleteCollection(collection._id, e)}
                  className="w-[28px] h-[28px] border-[1px] rounded-sm border-dark-600 flex items-center justify-center cursor-pointer hover:border-red-600 hover:text-red-600"
                >
                  <i className="fa-solid fa-trash-can-arrow-up mt-[2px]"></i>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DataManager;

import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";
import {
  deleteCollection,
  getDetailCollection,
} from "../../../../services/collection.service";
import { formatDateDDMMYYHHMMSS } from "../../../../utils/formatDate";
import { useNotify } from "../../../../hook/useNotify";

const DataCollection = () => {
  const { loading, collection, documents } = useSelector(
    (state) => state.collection
  );
  const { notifySuccess, notifyWarning, notifyError, notifyConfirm } =
    useNotify();
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const id = searchParams.get("id");

  useEffect(() => {
    dispatch(getDetailCollection(id));
  }, [id, dispatch]);

  console.log({ documents });

  return (
    <div className="w-full  flex flex-col gap-[10px]  px-[20px] py-[12px]">
      <div className="w-full flex items-center gap-[10px] py-[8px] border-[1px] border-transparent bg-dark-900 px-[10px] text-sm font-semibold text-dark-300 rounded-sm">
        <div className="w-4/12">Tên </div>
        <div className="w-1/12">Trạng thái</div>
        <div className="w-1/12">Số chunk</div>
        <div className="w-2/12">Mã hóa lúc</div>
        <div className="w-2/12">Ngày tạo</div>{" "}
        <div className="w-2/12">Hành động</div>
      </div>
      <div className="w-full flex flex-col gap-[10px] py-[5px]  text-sm font-semibold text-dark-300">
        {loading ? (
          <div className="w-full flex items-center justify-center ">
            <div className="flex items-center gap-[10px] animate-pulse text-sm p-[10px]">
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
              </div>
              <span>Đang tải dữ liệu...</span>
            </div>
          </div>
        ) : documents.length > 0 ? (
          documents?.map((document) => (
            <div
              key={document.documentId}
              className="w-full flex items-center  gap-[10px] border-[1px] rounded-sm border-dark-900 py-[8px] px-[10px]  "
            >
              <div className="w-4/12 ">{document.fileName}</div>
              <div className="w-1/12 text-[0.8rem]">
                <i className="fa-solid fa-circle-check text-green-600 mr-[3px]"></i>
                <span>Sẵn sàng</span>
              </div>
              <div className="w-1/12">{document.chunks}</div>
              <div className="w-2/12 text-[0.8rem]">
                {formatDateDDMMYYHHMMSS(document.indexedAt)}
              </div>
              <div className="w-2/12 text-[0.8rem]">
                {formatDateDDMMYYHHMMSS(document.createdAt)}
              </div>
              <div className="w-2/12 text-[0.8rem]">
                <div className="w-[28px] h-[28px] border-[1px] rounded-sm border-dark-600 flex items-center justify-center cursor-pointer hover:border-red-600 hover:text-red-600">
                  <i className="fa-solid fa-trash-can-arrow-up mt-[2px]"></i>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="w-full flex items-center justify-center  gap-[10px] border-[1px] rounded-sm border-dark-900 py-[8px] px-[10px]  ">
            <span>Chưa có tài liệu nào</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default DataCollection;

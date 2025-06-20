import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";
import { getDetailCollection } from "../../../../services/collection.service";
import { formatDateDDMMYYHHMMSS } from "../../../../utils/formatDate";

const DataCollection = () => {
  const { laoding, collection } = useSelector((state) => state.collection);
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const id = searchParams.get("id");
  useEffect(() => {
    dispatch(getDetailCollection(id));
  }, [id, dispatch]);
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
        {collection?.documents?.map((document) => (
          <div
            key={document._id}
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
        ))}
      </div>
    </div>
  );
};

export default DataCollection;

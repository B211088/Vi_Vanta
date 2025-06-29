import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllTopics } from "../../../services/topic.service";
import { formatDateDDMMYYHHMMSS } from "../../../utils/formatDate";
import { Link } from "react-router-dom";

const ListAllTopics = () => {
  const dispatch = useDispatch();
  const { loading, error, topics } = useSelector((state) => state.topic);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [status, setStatus] = useState(null);

  useEffect(() => {
    dispatch(fetchAllTopics(page, limit, sortBy, sortOrder, status));
  }, []);

  return (
    <div className="w-full  flex flex-col gap-[10px]  px-[20px] py-[12px]">
      <div className="w-full flex items-center gap-[10px] py-[8px] border-[1px] border-transparent bg-dark-900 px-[10px] text-sm font-semibold text-dark-300 rounded-sm">
        <div className="w-2/12">Tên </div>
        <div className="w-1/12">Trạng thái</div>
        <div className="w-5/12">Mô tả</div>
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
        ) : topics.length > 0 ? (
          topics?.map((topic) => (
            <div
              key={topic.topicId}
              className="w-full flex items-center  gap-[10px] border-[1px] rounded-sm border-dark-900 py-[8px] px-[10px]  "
            >
              <Link
                to={`/article-manager/topics/detail?id=${topic._id}`}
                className="w-2/12  "
              >
                <span className="w-fit hover:border-b-1">{topic.name}</span>
              </Link>
              <div className="w-1/12 text-[0.8rem]">
                {topic?.status === "active" ? (
                  <div className="">
                    <i className="fa-solid fa-circle-check text-green-600 mr-[3px]"></i>
                    <span>hoạt động</span>
                  </div>
                ) : (
                  <div className="">
                    <i className="fa-solid fa-circle-xmark text-red-600 mr-[3px]"></i>
                    <span>đã ẩn</span>
                  </div>
                )}
              </div>
              <div className="w-5/12 line-clamp-1">{topic.description}</div>

              <div className="w-2/12 text-[0.8rem]">
                {formatDateDDMMYYHHMMSS(topic.createdAt)}
              </div>
              <div className="w-2/12 flex items-center gap-[10px] text-[0.8rem]">
                <div className="w-[28px] h-[28px] border-[1px] rounded-sm border-dark-600 flex items-center justify-center cursor-pointer hover:border-red-600 hover:text-red-600">
                  <i className="fa-solid fa-trash-can-arrow-up mt-[2px]"></i>
                </div>
                <div className="w-[28px] h-[28px] border-[1px] rounded-sm border-dark-600 flex items-center justify-center cursor-pointer hover:border-green-600 hover:text-green-600">
                  <i className="fa-solid fa-pen-to-square mt-[2px]"></i>
                </div>
                {topic?.status === "deleted" && (
                  <div className="w-[28px] h-[28px] border-[1px] rounded-sm border-dark-600 flex items-center justify-center cursor-pointer hover:border-yellow-600 hover:text-yellow-600">
                    <i className="fa-solid fa-arrow-rotate-left mt-[2px]"></i>
                  </div>
                )}{" "}
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

export default ListAllTopics;

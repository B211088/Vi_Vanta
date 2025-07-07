import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { formatDateDDMMYYHHMMSS } from "../../../utils/formatDate";
import { useEffect } from "react";
import { fetchAllArticles } from "../../../services/article.service";
import { useState } from "react";
import { useNotify } from "../../../hook/useNotify";
import { Link } from "react-router-dom";
import Pagination from "../../features/Pagination";

const ListAllArticle = () => {
  const dispatch = useDispatch();
  const { loading, error, articles } = useSelector((state) => state.article);
  const { notifySuccess, notifyWarning, notifyError, notifyConfirm } =
    useNotify();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [showCreateTopicModal, setShowCreateTopicModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [status, setStatus] = useState("");

  useEffect(() => {
    dispatch(fetchAllArticles(page, limit, sortBy, sortOrder, status));
  }, [page, limit, sortBy, sortOrder]);

  console.log(articles);
  return (
    <div className="w-full  flex flex-col gap-[10px]  px-[10px] py-[12px]">
      <div className="w-full flex items-center justify-end gap-[5px]  rounded-md">
        <div className="w-6/12 flex items-center gap-[5px]">
          <div className="w-8/12 flex items-center gap-[5px] border-1 rounded-md border-dark-600 px-[5px] py-[5px] cursor-pointer">
            <i className="fa-solid fa-magnifying-glass"></i>
            <input
              type="text"
              className="flex-1 outline-none border-none text-[0.8rem] "
              placeholder="Tìm kiếm chuyên mục..."
            />
          </div>
          <div className="w-4/12 flex items-center gap-[5px] border-1 rounded-md border-dark-600 px-[5px] py-[5px]">
            <i className="fa-regular fa-chart-bar"></i>
            <select className="flex-1 outline-none border-none text-[0.8rem] cursor-pointer">
              <option id="all" value="">
                Tất cả
              </option>
              <option id="pending" value="pending">
                Lượt view tăng dần
              </option>
              <option id="active" value="active">
                Lượt view giảm dần
              </option>
              <option id="deleted" value="deleted">
                Đã xóa
              </option>
            </select>
          </div>
        </div>
      </div>
      <div className="w-full flex items-center gap-[10px] py-[8px] border-[1px] border-transparent bg-dark-900 px-[10px] text-sm font-semibold text-dark-300 rounded-sm">
        <div className="w-2/12">Tiêu đề </div>
        <div className="w-1/12">Lượt xem</div>
        <div className="w-3/12">Tác giả</div>
        <div className="w-2/12">Ngày tạo</div>
        <div className="w-2/12">Ngày duyệt</div>{" "}
        <div className="w-2/12">Người duyệt</div>
        <div className="w-2/12">Hành động</div>
      </div>
      <div className="w-full flex flex-col py-[5px] gap-2 text-sm font-semibold text-dark-300">
        {loading ? (
          <div className="w-full flex items-center justify-center ">
            <div className="flex items-center gap-[10px] animate-pulse text-sm p-[10px]">
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
              </div>
              <span>Đang tải dữ liệu...</span>
            </div>
          </div>
        ) : articles?.articles?.length > 0 ? (
          articles?.articles?.map((article) => (
            <div
              key={article._id}
              className="w-full flex items-center   gap-[10px] border-1 rounded-sm border-dark-800 py-[8px] px-3 "
            >
              <Link
                to={`/article-manager/articles/detail?id=${article._id}`}
                className="w-2/12 flex flex-col"
              >
                <span className="w-fit font-bold">{article?.title}</span>
                <span className="text-[0.8rem] text-dark-500">
                  {article?.topics?.map((top) => top.name)}
                </span>
              </Link>
              <div className="w-1/12 text-[0.8rem]">{article?.views}</div>
              <div className="w-3/12 line-clamp-1">
                {article?.author?.fullName}
              </div>
              <div className="w-2/12 text-[0.8rem]">
                {formatDateDDMMYYHHMMSS(article.createdAt)}
              </div>
              <div className="w-2/12 text-[0.8rem]">
                {formatDateDDMMYYHHMMSS(article.publishedAt)}
              </div>{" "}
              <div className="w-2/12 text-[0.8rem]">
                {article?.publishedBy?.fullName}
              </div>
              <div className="w-2/12 flex items-center gap-[10px] text-[0.8rem]">
                <div className="w-[28px] h-[28px] border-[1px] rounded-sm border-dark-600 flex items-center justify-center cursor-pointer hover:border-green-600 hover:text-green-600 relative group">
                  <i className="fa-solid fa-pen-to-square mt-[2px]"></i>{" "}
                  <div className="group-hover:block hidden absolute top-[120%] font-bold text-[0.8rem] text-light-50 bg-[#00000078] px-2 py-1   rounded-md text-nowrap">
                    Chỉnh sửa
                  </div>
                </div>
                <div className="w-[28px] h-[28px] border-[1px] rounded-sm border-dark-600 flex items-center justify-center cursor-pointer hover:border-green-600 hover:text-green-600 relative group">
                  <i className="fa-solid fa-eye-low-vision"></i>
                  <div className="group-hover:block hidden absolute top-[120%] font-bold text-[0.8rem] text-light-50 bg-[#00000078] px-2 py-1   rounded-md text-nowrap">
                    Ẩn chuyên mục
                  </div>
                </div>
                {article?.status === "hidden" && (
                  <div className="w-[28px] h-[28px] border-[1px] rounded-sm border-dark-600 flex items-center justify-center cursor-pointer hover:border-green-600 hover:text-green-600 relative group">
                    <i className="fa-solid fa-arrow-rotate-left mt-[2px]"></i>
                    <div className="group-hover:block hidden absolute top-[120%] font-bold text-[0.8rem] text-light-50 bg-[#00000078] px-2 py-1   rounded-md text-nowrap">
                      Hoàn tác
                    </div>
                  </div>
                )}{" "}
              </div>
            </div>
          ))
        ) : (
          <div className="w-full flex items-center justify-center  gap-[10px] border-[1px] rounded-sm border-dark-900 py-[8px] px-[10px]  ">
            <span>Chưa có chuyên mục nào</span>
          </div>
        )}
        <Pagination
          currentPage={page}
          totalPages={articles?.pagination?.pages}
          onPageChange={setPage}
        />
      </div>
    </div>
  );
};

export default ListAllArticle;

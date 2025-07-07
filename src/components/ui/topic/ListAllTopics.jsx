import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  deleteTopic,
  fetchAllTopics,
  restoreTopic,
  searchTopics,
} from "../../../services/topic.service";
import { formatDateDDMMYYHHMMSS } from "../../../utils/formatDate";
import { Link } from "react-router-dom";
import CreateTopicForm from "../../modals/topic/CreateTopicForm";
import { useNotify } from "../../../hook/useNotify";

const ListAllTopics = () => {
  const dispatch = useDispatch();
  const { loading, error, topics } = useSelector((state) => state.topic);
  const { notifySuccess, notifyWarning, notifyError, notifyConfirm } =
    useNotify();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [status, setStatus] = useState(null);
  const [showCreateTopicModal, setShowCreateTopicModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const debounceTimeout = useRef(null);

  useEffect(() => {
    if (!isSearching) {
      dispatch(fetchAllTopics(page, limit, sortBy, sortOrder, status));
    }
  }, [page, limit, sortBy, sortOrder, status, isSearching]);

  const handleSearchTopic = async (e) => {
    const value = e.target.value;
    setSearchTerm(value);

    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    debounceTimeout.current = setTimeout(async () => {
      try {
        if (!value || value.trim() === "") {
          setIsSearching(false);
        } else {
          setIsSearching(true);
          await dispatch(searchTopics(1, 10, sortBy, sortOrder, value));
        }
      } catch (error) {
        console.log(error);
      }
    }, 500);
  };

  const handleHiddenTopic = async (id) => {
    try {
      const confirm = await notifyConfirm(
        "Bạn có chắc muốn ẩn chuyên mục này không!"
      );
      if (confirm) {
        const response = await dispatch(deleteTopic(id, false));
        notifySuccess(response.message);
      }
    } catch (error) {
      console.log(error);
    }
  };
  const handleRestoreTopic = async (id) => {
    try {
      const confirm = await notifyConfirm(
        "Bạn có chắc muốn phục hồi chuyên mục này không!"
      );
      if (confirm) {
        const response = await dispatch(restoreTopic(id));
        notifySuccess(response.message);
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="w-full  flex flex-col gap-[10px]  px-[10px] py-[12px]">
      <div className="w-full flex items-center justify-end gap-[5px]  rounded-md">
        {showCreateTopicModal && (
          <CreateTopicForm closeModal={() => setShowCreateTopicModal(false)} />
        )}
        <div className="w-6/12 flex items-center gap-[5px]">
          <button
            onClick={() => setShowCreateTopicModal(true)}
            className="flex items-center gap-[3px] px-[10px] py-[6px] bg-blue-500 text-light-50 rounded-md text-sm cursor-pointer"
          >
            <i className="fa-regular fa-square-plus"></i>
            <span>Thêm chuyên mục</span>
          </button>
        </div>
        <div className="w-6/12 flex items-center gap-[5px]">
          <div className="w-8/12 flex items-center gap-[5px] border-1 rounded-md border-dark-600 px-[5px] py-[5px] cursor-pointer">
            <i className="fa-solid fa-magnifying-glass"></i>
            <input
              type="text"
              className="flex-1 outline-none border-none text-[0.8rem] "
              placeholder="Tìm kiếm chuyên mục..."
              value={searchTerm}
              onChange={handleSearchTopic}
            />
          </div>
          <div className="w-4/12 flex items-center gap-[5px] border-1 rounded-md border-dark-600 px-[5px] py-[5px]">
            <i className="fa-regular fa-chart-bar"></i>
            <select
              className="flex-1 outline-none border-none text-[0.8rem] cursor-pointer"
              onChange={(e) => setStatus(e.target.value)}
            >
              <option id="all" value="">
                Tất cả
              </option>{" "}
              <option id="pending" value="pending">
                Chờ duyệt
              </option>
              <option id="active" value="active">
                Hoạt động
              </option>
              <option id="deleted" value="deleted">
                Đã xóa
              </option>
            </select>
          </div>
        </div>
      </div>
      <div className="w-full flex items-center gap-[10px] py-[8px] border-[1px] border-transparent bg-dark-900 px-[10px] text-sm font-semibold text-dark-300 rounded-sm">
        <div className="w-2/12">Tên </div>
        <div className="w-1/12">Trạng thái</div>
        <div className="w-5/12">Mô tả</div>
        <div className="w-2/12">Ngày tạo</div>
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
              key={topic._id}
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
                ) : topic?.status === "hidden" ? (
                  <div className="">
                    <i className="fa-solid fa-circle-xmark text-gay-600 mr-[3px]"></i>
                    <span>đã ẩn</span>
                  </div>
                ) : (
                  <div className="">
                    <i className="fa-solid fa-clock text-orange-400 mr-[3px]"></i>
                    <span>Chờ duyệt</span>
                  </div>
                )}
              </div>
              <div className="w-5/12 line-clamp-1">{topic.description}</div>

              <div className="w-2/12 text-[0.8rem]">
                {formatDateDDMMYYHHMMSS(topic.createdAt)}
              </div>
              <div className="w-2/12 flex items-center gap-[10px] text-[0.8rem]">
                <div className="w-[28px] h-[28px] border-[1px] rounded-sm border-dark-600 flex items-center justify-center cursor-pointer hover:border-green-600 hover:text-green-600 relative group">
                  <i className="fa-solid fa-pen-to-square mt-[2px]"></i>{" "}
                  <div className="group-hover:block hidden absolute top-[120%] font-bold text-[0.8rem] text-light-50 bg-[#00000078] px-2 py-1   rounded-md text-nowrap">
                    Chỉnh sửa
                  </div>
                </div>
                <div
                  onClick={() => handleHiddenTopic(topic?._id)}
                  className="w-[28px] h-[28px] border-[1px] rounded-sm border-dark-600 flex items-center justify-center cursor-pointer hover:border-green-600 hover:text-green-600 relative group"
                >
                  <i className="fa-solid fa-eye-low-vision"></i>
                  <div className="group-hover:block hidden absolute top-[120%] font-bold text-[0.8rem] text-light-50 bg-[#00000078] px-2 py-1   rounded-md text-nowrap">
                    Ẩn chuyên mục
                  </div>
                </div>
                {topic?.status === "hidden" && (
                  <div
                    onClick={() => handleRestoreTopic(topic?._id)}
                    className="w-[28px] h-[28px] border-[1px] rounded-sm border-dark-600 flex items-center justify-center cursor-pointer hover:border-green-600 hover:text-green-600 relative group"
                  >
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
      </div>
    </div>
  );
};

export default ListAllTopics;

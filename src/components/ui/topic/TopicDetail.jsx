import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { fetchDetailTopic } from "../../../services/topic.service";
import { formatDateDDMMYYHHMMSS } from "../../../utils/formatDate";
import CreateTopicForm from "../../modals/topic/CreateTopicForm";
import UpdateTopicModal from "../../modals/topic/UpdateTopicModal";

const TopicDetail = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, topic } = useSelector((state) => state.topic);
  const [searchParams] = useSearchParams();
  const id = searchParams.get("id");
  const [showCreateTopicModal, setShowCreateTopicModal] = useState(false);
  const [showUpdateTopicModal, setShowUpdateTopicModal] = useState(false);
  useEffect(() => {
    dispatch(fetchDetailTopic(id));
  }, [id]);
  return (
    <div className="w-full flex flex-col gap-[10px] font-nunito ">
      {showUpdateTopicModal && (
        <UpdateTopicModal closeModal={() => setShowUpdateTopicModal(false)} />
      )}
      <div className="w-full flex  px-[20px] py-[10px]">
        <div
          onClick={() => navigate(-1)}
          className="  rounded-sm flex gap-[5px] items-center justify-center cursor-pointer  hover:text-blue-600"
        >
          <i className="fa-solid fa-arrow-left text-xl"></i>
          <span className="text-md font-bold">Quay lại</span>
        </div>
      </div>
      <div className="w-full flex flex-col gap-[10px] p-[20px] ">
        <div className="flex items-center bg-gradient-to-r from-blue-300 to-blue-400 rounded-md px-[20px] pt-[100px] pb-[20px] gap-[10px]">
          <div className="w-[80px] h-[80px] rounded-md flex items-center justify-center overflow-hidden">
            <img
              className="h-full w-full aspect-square object-cover"
              src={topic?.image?.url}
              alt=""
            />
          </div>
          <div className="flex flex-col gap-[5px]">
            <div className="flex items-center gap-[5px]">
              <h1 className="font-bold text-lg">{topic?.name}</h1>{" "}
              {topic?.status === "active" ? (
                <div className="px-3 py-[2px] rounded-full bg-green-100 text-sm text-green-600">
                  <i className="fa-solid fa-circle-check  mr-[3px]"></i>
                  <span>hoạt động</span>
                </div>
              ) : topic?.status === "deleted" ? (
                <div className="px-3 py-[2px] rounded-full bg-red-100 text-sm text-red-600">
                  <i className="fa-solid fa-circle-xmark  mr-[3px]"></i>
                  <span>đã ẩn</span>
                </div>
              ) : (
                <div className="px-3 py-[2px] rounded-full bg-orange-100 text-sm text-orange-400">
                  <i className="fa-solid fa-clock  mr-[3px]"></i>
                  <span>Chờ duyệt</span>
                </div>
              )}
            </div>
            <p className="  text-sm ">ID: {topic?._id}</p>
          </div>
        </div>
        <div className="w-full flex flex-col gap-2 py-3">
          <h1 className="font-bold">Mô tả</h1>
          <p className="w-full shadow-sm text-sm bg-dark-900 rounded-md p-3 border-l-3 border-blue-500">
            {topic?.description}
          </p>
        </div>
        <div className="w-full flex flex-col gap-2 py-3">
          <h1 className="font-bold">Chủ đề con</h1>{" "}
          {showCreateTopicModal && (
            <CreateTopicForm
              parent={topic}
              closeModal={() => setShowCreateTopicModal(false)}
            />
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
          <div className="w-full max-h-[300px] overflow-y-auto flex flex-col gap-[10px] py-[5px]  text-sm font-semibold text-dark-300">
            {topic?.children?.length > 0 ? (
              topic?.children?.map((topic) => (
                <Link
                  to={`/article-manager/topics/detail?id=${topic._id}`}
                  key={topic?._id}
                  className="w-full flex gap-[10px] border-[1px] rounded-sm shadow-sm border-dark-900 p-3 hover:bg-dark-900 "
                >
                  <div className="w-[60px] h-[60px] border-1 border-dark-700 rounded-md flex items-center justify-center overflow-hidden">
                    <img
                      className="h-full w-full aspect-square object-cover"
                      src={topic?.image?.url}
                      alt=""
                    />
                  </div>
                  <div className="w-full flex flex-col gap-1">
                    <div className="w-full font-bold text-md ">
                      {topic?.name}
                    </div>
                    <div className="w-full text-sm text-dark-400">
                      {topic?.description}
                    </div>
                    <div className="w-full flex items-center gap-[10px] ">
                      <div className=" text-[0.8rem] flex items-center gap-[5px] text-dark-400">
                        <i className="fa-regular fa-calendar"></i>
                        <span className="">
                          {formatDateDDMMYYHHMMSS(topic?.createdAt)}
                        </span>
                      </div>
                      {topic?.status === "active" ? (
                        <div className="px-3 py-[2px] rounded-full bg-green-100 text-sm text-green-600">
                          <i className="fa-solid fa-circle-check  mr-[3px]"></i>
                          <span>hoạt động</span>
                        </div>
                      ) : topic?.status === "deleted" ? (
                        <div className="px-3 py-[2px] rounded-full bg-red-100 text-sm text-red-600">
                          <i className="fa-solid fa-circle-xmark  mr-[3px]"></i>
                          <span>đã ẩn</span>
                        </div>
                      ) : (
                        <div className="px-3 py-[2px] rounded-full bg-orange-100 text-sm text-orange-400">
                          <i className="fa-solid fa-clock  mr-[3px]"></i>
                          <span>Chờ duyệt</span>
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="w-full flex items-center justify-center  gap-[10px] border-[1px] rounded-sm border-dark-900 py-[8px] px-[10px]  ">
                <span>Không có chủ đề con</span>
              </div>
            )}
          </div>
        </div>
        <div className="w-full bg-dark-900 p-3 rounded-md text-sm">
          <h1 className="font-bold text-md py-2">Thông tin chi tiết</h1>
          <div className="space-y-4 ">
            <div className="flex items-start gap-3">
              <i className="fa-regular fa-calendar  mt-0.5 flex-shrink-0"></i>
              <div>
                <p className="text-sm font-medium text-gray-900">Ngày tạo</p>
                <p className="text-[0.83rem] text-gray-600">
                  {formatDateDDMMYYHHMMSS(topic?.createdAt)}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <i className="fa-regular fa-user mt-0.5 flex-shrink-0"></i>
              <div>
                <p className="text-sm font-medium text-gray-900">Tạo bởi</p>
                <p className="text-sm text-gray-600">
                  {topic?.createdBy?.fullName || "Không xác định"}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <i className="fa-regular fa-clock   mt-0.5 flex-shrink-0"></i>
              <div>
                <p className="text-sm font-medium text-gray-900">
                  Cập nhật lần cuối
                </p>
                <p className="text-[0.83rem] text-gray-600">
                  {formatDateDDMMYYHHMMSS(topic?.updatedAt)}
                </p>
              </div>
            </div>

            {topic?.deletedAt && (
              <div className="flex items-start gap-3">
                <i className="fa-regular fa-calendar-xmark  mt-0.5 flex-shrink-0"></i>
                <div>
                  <p className="text-sm font-medium text-gray-900">Ngày xóa</p>
                  <p className="text-[0.83rem] text-red-600">
                    {formatDateDDMMYYHHMMSS(topic?.deletedAt)}
                  </p>
                </div>
              </div>
            )}

            {topic?.children && topic.children.length > 0 && (
              <div className="flex items-start gap-3">
                <i className="fa-regular fa-rectangle-list mt-0.5 flex-shrink-0"></i>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Chủ đề con
                  </p>
                  <p className="text-sm text-gray-600">
                    {topic?.children.length} chủ đề
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>{" "}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="flex flex-col gap-2">
            <button
              onClick={() => setShowUpdateTopicModal(true)}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center gap-2"
            >
              <i className="fa-solid fa-pen-to-square mt-[2px]"></i>
              Chỉnh sửa
            </button>
            {!topic?.status === "deleted" && (
              <button className="w-full bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors duration-200 flex items-center justify-center gap-2">
                <i className="fa-solid fa-trash-can-arrow-up mt-[2px]"></i>
                Xóa chủ đề
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopicDetail;

import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  deleteArticle,
  fetchDetailArticle,
  // restoreArticle, // Assuming this function exists
} from "../../../services/article.service";
import { formatDateDDMMYYHHMMSS } from "../../../utils/formatDate";
import { useNotify } from "../../../hook/useNotify";

const ArticleDetail = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, article } = useSelector((state) => state.article);
  const { notifySuccess, notifyWarning, notifyError, notifyConfirm } =
    useNotify();
  const [searchParams] = useSearchParams();
  const id = searchParams.get("id");

  const [showUpdateArticleModal, setShowUpdateArticleModal] = useState(false);

  useEffect(() => {
    dispatch(fetchDetailArticle(id));
  }, [id, dispatch]);

  console.log({ article });

  const handleDeleteArticle = async () => {
    try {
      const confirm = await notifyConfirm(
        "Bạn có chắc muốn xóa bài viết này không!"
      );
      if (confirm) {
        const response = await dispatch(deleteArticle(article?._id));
        notifySuccess(response.message);
        navigate(-1);
      }
    } catch (error) {
      notifyError("Có lỗi xảy ra khi xóa bài viết");
      console.log(error);
    }
  };

  const getStatusConfig = (status) => {
    switch (status) {
      case "published":
        return {
          icon: "fa-solid fa-circle-check",
          text: "Đã xuất bản",
          className: "bg-green-100 text-green-600",
        };
      case "draft":
        return {
          icon: "fa-solid fa-file-pen",
          text: "Bản nháp",
          className: "bg-yellow-100 text-yellow-600",
        };
      case "hidden":
        return {
          icon: "fa-solid fa-eye-low-vision",
          text: "Đã ẩn",
          className: "bg-gray-100 text-gray-600",
        };
      default:
        return {
          icon: "fa-solid fa-clock",
          text: "Chờ duyệt",
          className: "bg-orange-100 text-orange-400",
        };
    }
  };

  const statusConfig = getStatusConfig(article?.status);

  if (loading) {
    return (
      <div className="w-full flex items-center justify-center py-20">
        <div className="text-center">
          <i className="fa-solid fa-spinner fa-spin text-2xl text-blue-500 mb-4"></i>
          <p>Đang tải...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full flex items-center justify-center py-20">
        <div className="text-center text-red-500">
          <i className="fa-solid fa-exclamation-triangle text-2xl mb-4"></i>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col gap-[10px] font-nunito">
      <div className="w-full flex px-[20px] py-[10px]">
        <div
          onClick={() => navigate(-1)}
          className="rounded-sm flex gap-[5px] items-center justify-center cursor-pointer hover:text-blue-600"
        >
          <i className="fa-solid fa-arrow-left text-xl"></i>
          <span className="text-md font-bold">Quay lại</span>
        </div>
      </div>

      <div className="w-full flex flex-col gap-[10px] p-[20px]">
        {/* Header Section */}
        <div className="flex items-center bg-gradient-to-r from-blue-300 to-blue-400 rounded-md px-[20px] pt-[100px] pb-[20px] gap-[10px]">
          <div className="w-[120px] h-[120px] rounded-md flex items-center justify-center overflow-hidden">
            <img
              className="h-full w-full object-cover"
              src={article?.thumbnail?.url}
              alt={article?.title}
            />
          </div>
          <div className="flex flex-col gap-[5px]">
            <div className="flex items-center gap-[5px]">
              <h1 className="font-bold text-xl">{article?.title}</h1>
              <div
                className={`px-3 py-[2px] rounded-full text-sm ${statusConfig.className}`}
              >
                <i className={`${statusConfig.icon} mr-[3px]`}></i>
                <span>{statusConfig.text}</span>
              </div>
            </div>
            <p className="text-sm">ID: {article?._id}</p>
            <p className="text-sm">Slug: {article?.slug}</p>
            <p className="text-sm">Lượt xem: {article?.views || 0}</p>
            {article?.isFeatured && (
              <div className="px-3 py-[2px] rounded-full bg-purple-100 text-sm text-purple-600 w-fit">
                <i className="fa-solid fa-star mr-[3px]"></i>
                <span>Bài viết nổi bật</span>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="w-full flex gap-3 py-3">
          <div
            onClick={() => setShowUpdateArticleModal(true)}
            className="w-[28px] h-[28px] border-[1px] rounded-sm border-dark-600 flex items-center justify-center cursor-pointer hover:border-green-600 hover:text-green-600 relative group"
          >
            <i className="fa-solid fa-pen-to-square"></i>
            <div className="group-hover:block hidden absolute top-[120%] font-bold text-[0.8rem] text-light-50 bg-[#00000078] px-2 py-1 rounded-md text-nowrap">
              Chỉnh sửa
            </div>
          </div>
          <div
            onClick={handleDeleteArticle}
            className="w-[28px] h-[28px] border-[1px] rounded-sm border-dark-600 flex items-center justify-center cursor-pointer hover:border-red-600 hover:text-red-600 relative group"
          >
            <i className="fa-solid fa-trash-can"></i>
            <div className="group-hover:block hidden absolute top-[120%] font-bold text-[0.8rem] text-light-50 bg-[#00000078] px-2 py-1 rounded-md text-nowrap">
              Xóa
            </div>
          </div>
        </div>

        {/* Summary Section */}
        <div className="w-full flex flex-col gap-2 py-3">
          <h1 className="font-bold">Tóm tắt</h1>
          <p className="w-full shadow-sm text-sm bg-dark-900 rounded-md p-3 border-l-3 border-blue-500">
            {article?.summary || "Không có tóm tắt"}
          </p>
        </div>

        {/* Topics Section */}
        <div className="w-full flex flex-col gap-2 py-3">
          <h1 className="font-bold">Chủ đề</h1>
          <div className="flex flex-wrap gap-2">
            {article?.topics?.length > 0 ? (
              article.topics.map((topic) => (
                <div
                  key={topic._id}
                  className="px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-sm"
                >
                  {topic.name}
                </div>
              ))
            ) : (
              <span className="text-gray-500 text-sm">Chưa có chủ đề</span>
            )}
          </div>
        </div>

        {/* Sections Content */}
        <div className="w-full flex flex-col gap-2 py-3">
          <h1 className="font-bold">Nội dung bài viết</h1>
          <div className="w-full flex flex-col gap-4">
            {article?.sections?.length > 0 ? (
              article.sections.map((section, index) => (
                <div
                  key={section._id}
                  className="border border-dark-900 rounded-md p-4 bg-white"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm">
                      {index + 1}
                    </span>
                    <h3 className="font-bold text-lg">{section.heading}</h3>
                  </div>

                  {section.image && (
                    <div className="mb-3">
                      <img
                        src={section.image.url}
                        alt={section.image.description || section.heading}
                        className="w-full max-w-md h-auto rounded-md"
                      />
                      {section.image.description && (
                        <p className="text-sm text-gray-600 mt-1 italic">
                          {section.image.description}
                        </p>
                      )}
                    </div>
                  )}

                  <div className="text-sm text-gray-700 whitespace-pre-wrap">
                    {section.content}
                  </div>
                </div>
              ))
            ) : (
              <div className="w-full flex items-center justify-center gap-[10px] border-[1px] rounded-sm border-dark-900 py-[20px] px-[10px]">
                <span>Chưa có nội dung</span>
              </div>
            )}
          </div>
        </div>

        {/* References Section */}
        {article?.references?.length > 0 && (
          <div className="w-full flex flex-col gap-2 py-3">
            <h1 className="font-bold">Tài liệu tham khảo</h1>
            <div className="bg-dark-900 rounded-md p-3">
              <ul className="list-disc list-inside space-y-1">
                {article.references.map((ref, index) => (
                  <li key={index} className="text-sm text-gray-700">
                    {ref}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Detail Information */}
        <div className="w-full bg-dark-900 p-3 rounded-md text-sm">
          <h1 className="font-bold text-md py-2">Thông tin chi tiết</h1>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <i className="fa-regular fa-calendar mt-0.5 flex-shrink-0"></i>
              <div>
                <p className="text-sm font-medium text-gray-900">Ngày tạo</p>
                <p className="text-[0.83rem] text-gray-600">
                  {formatDateDDMMYYHHMMSS(article?.createdAt)}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <i className="fa-regular fa-user mt-0.5 flex-shrink-0"></i>
              <div>
                <p className="text-sm font-medium text-gray-900">Tác giả</p>
                <p className="text-sm text-gray-600">
                  {article?.author?.fullName || "Không xác định"}
                </p>
                <p className="text-xs text-gray-500">
                  {article?.author?.email}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <i className="fa-regular fa-user-pen mt-0.5 flex-shrink-0"></i>
              <div>
                <p className="text-sm font-medium text-gray-900">Tạo bởi</p>
                <p className="text-sm text-gray-600">
                  {article?.createdBy?.fullName || "Không xác định"}
                </p>
                <p className="text-xs text-gray-500">
                  {article?.createdBy?.email}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <i className="fa-regular fa-clock mt-0.5 flex-shrink-0"></i>
              <div>
                <p className="text-sm font-medium text-gray-900">
                  Cập nhật lần cuối
                </p>
                <p className="text-[0.83rem] text-gray-600">
                  {formatDateDDMMYYHHMMSS(article?.updatedAt)}
                </p>
              </div>
            </div>

            {article?.updatedBy && (
              <div className="flex items-start gap-3">
                <i className="fa-regular fa-user-pen mt-0.5 flex-shrink-0"></i>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Cập nhật bởi
                  </p>
                  <p className="text-sm text-gray-600">
                    {article?.updatedBy?.fullName || "Không xác định"}
                  </p>
                  <p className="text-xs text-gray-500">
                    {article?.updatedBy?.email}
                  </p>
                </div>
              </div>
            )}

            <div className="flex items-start gap-3">
              <i className="fa-regular fa-eye mt-0.5 flex-shrink-0"></i>
              <div>
                <p className="text-sm font-medium text-gray-900">Lượt xem</p>
                <p className="text-sm text-gray-600">
                  {article?.views || 0} lượt
                </p>
              </div>
            </div>

            {article?.sections && article.sections.length > 0 && (
              <div className="flex items-start gap-3">
                <i className="fa-regular fa-rectangle-list mt-0.5 flex-shrink-0"></i>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Số phần nội dung
                  </p>
                  <p className="text-sm text-gray-600">
                    {article?.sections.length} phần
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArticleDetail;

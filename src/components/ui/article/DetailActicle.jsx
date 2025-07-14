import React, { useEffect, useState } from "react";
import { Eye, Calendar, User, Tag, Clock } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchArticleById,
  fetchMostViewedArticles,
  fetchRelatedArticles,
} from "../../../services/article.service";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Header from "../../layout/Header";
import ContentParser from "./ContentParser";
import Disclaimer from "./Disclaimer";
import Footer from "../../../pages/user/Footer";

const DetailArticle = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { loading, error, article, relatedArticles, articlesAttribute } =
    useSelector((state) => state.article);
  // Tách query string
  const searchParams = new URLSearchParams(location.search);
  const id = searchParams.get("id");
  const slug = searchParams.get("slug"); // nếu bạn cũng muốn lấy slug

  useEffect(() => {
    dispatch(fetchArticleById(id));
    dispatch(fetchRelatedArticles(id, { limit: 5 }));
    dispatch(fetchMostViewedArticles({ limit: 4 }));
  }, [id, slug]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-300 rounded w-1/2 mb-8"></div>
            <div className="h-64 bg-gray-300 rounded mb-8"></div>
            <div className="space-y-4">
              <div className="h-4 bg-gray-300 rounded"></div>
              <div className="h-4 bg-gray-300 rounded"></div>
              <div className="h-4 bg-gray-300 rounded w-2/3"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">
            Lỗi tải bài viết
          </h2>
          <p className="text-gray-600">{error}</p>
          <button
            onClick={() => window.history.back()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Quay lại
          </button>
        </div>
      </div>
    );
  }

  // No article found
  if (!article) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-600 mb-4">
            Không tìm thấy bài viết
          </h2>
          <button
            onClick={() => window.history.back()}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Quay lại
          </button>
        </div>
      </div>
    );
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="w-full flex flex-col font-nunito">
      <Header />{" "}
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto py-3 px-4 mt-2">
          <div className="flex items-center gap-2 border-r-1 border-dark-700 pr-2">
            <div
              onClick={() => navigate(-1)}
              className="w-8 h-8 flex items-center justify-center border border-dark-700 rounded-full cursor-pointer"
            >
              <i className="fa-solid fa-arrow-left"></i>
            </div>
            <span>Quay lại</span>
          </div>
        </div>

        <div className="container flex gap-3 mx-auto px-4 py-3 ">
          <div className="w-8/12 flex flex-col">
            <div className="w-full flex flex-col bg-light-50">
              <div className=" p-6 mb-8">
                {/* Topics */}
                <div className="flex flex-wrap gap-2 mb-6">
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                    <Tag className="w-3 h-3" />
                    {article?.topic?.name}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-4">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(article.createdAt)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{formatTime(article.createdAt)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Eye className="w-4 h-4" />
                    <span>{article.views} lượt xem</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <User className="w-4 h-4" />
                    <span>{article.author.fullName}</span>
                  </div>
                </div>

                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                  {article.title}
                </h1>

                {article.summary && (
                  <p className="text-md text-gray-700 mb-6 italic border-l-4 border-blue-500 pl-4">
                    {article.summary}
                  </p>
                )}

                {/* Thumbnail */}
                {article.thumbnail && article.thumbnail.url && (
                  <div className="mb-3">
                    <img
                      src={article.thumbnail.url}
                      alt={article.title}
                      className="w-full  aspect-[16/9] object-cover rounded-lg shadow-sm"
                    />
                  </div>
                )}
              </div>

              {/* Content Sections */}
              <div className="space-y-8">
                {article.sections &&
                  article.sections.map((section, index) => (
                    <div key={section._id} className=" px-6 py-2">
                      {section.heading && (
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">
                          {section.heading}
                        </h2>
                      )}

                      {section.image && section.image.url && (
                        <div className="mb-6">
                          <img
                            src={section.image.url}
                            alt={section.image.description || section.heading}
                            className="w-full aspect-[16/9] object-cover rounded-lg shadow-sm"
                          />
                          {section.image.description && (
                            <p className="text-sm text-gray-600 mt-2 italic text-center">
                              {section.image.description}
                            </p>
                          )}
                        </div>
                      )}

                      {section.content && (
                        <ContentParser content={section?.content} />
                      )}
                    </div>
                  ))}
              </div>

              {/* Article Footer */}
              <div className="bg-white rounded-lg shadow-sm p-6 mt-8">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <p className="text-sm text-gray-600">
                      Tác giả:{" "}
                      <span className="font-semibold">
                        {article.author.fullName}
                      </span>
                    </p>
                    <p className="text-sm text-gray-600">
                      Email:{" "}
                      <span className="font-semibold">
                        {article.author.email}
                      </span>
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">
                      Xuất bản:{" "}
                      {formatDate(article.publishedAt || article.createdAt)}
                    </p>
                    <p className="text-sm text-gray-600">
                      Cập nhật: {formatDate(article.updatedAt)}
                    </p>
                  </div>
                </div>

                {article.references && article.references.length > 0 && (
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <h3 className="text-lg font-semibold mb-3">Tham khảo:</h3>
                    <ul className="list-disc pl-5 space-y-1">
                      {article.references.map((ref, index) => (
                        <li key={index} className="text-sm text-gray-600">
                          {ref.replace(/\[\[\]"]/g, "")}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
            <Disclaimer />
          </div>
          <div className="w-4/12 flex flex-col ">
            <div className="w-full h-[800px] flex flex-col top-10  sticky">
              <div className=" border-t-4 border-vivanta-500 mb-2">
                <h1 className="font-bold bg-light-50 px-2 py-2">
                  Bài viết liên quan
                </h1>
              </div>
              {relatedArticles?.map((article) => (
                <Link
                  to={`/article?slug=${article?.slug}&id=${article?._id}`}
                  key={article._id}
                  className="w-full flex gap-2 p-2 rounded-md shadow cursor-pointer"
                >
                  <img
                    className="w-40 aspect-[16/9] object-cover rounded-md"
                    src={article?.thumbnail?.url}
                    alt={article?.title || ""}
                  />
                  <div className="flex flex-col">
                    <div className="text-vivanta-500">
                      {article?.topics?.map((topic) => (
                        <span key={topic._id}>{topic?.name}</span>
                      ))}
                    </div>
                    <h1 className="font-bold text-md line-clamp-2 py-1 min-h-10">
                      {article?.title}
                    </h1>
                    <p className="line-clamp-1 text-sm text-dark-500 mt-1">
                      {article?.summary}
                    </p>
                    <div className="flex items-center gap-2 text-sm pt-2">
                      <div className="w-5 h-5 flex items-center justify-center bg-vivanta-cyan-400 text-light-50 rounded-sm text-[0.8rem]">
                        <i className="fa-solid fa-user-doctor"></i>
                      </div>
                      Tác giả:
                      <span className="font-bold ">
                        {article?.author?.fullName}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
        <div className="container flex flex-col gap-3 mx-auto px-4 py-3 ">
          <h2 className=" text-2xl font-bold mb-6">
            Xem thêm các bài viết nổi bật
          </h2>
          <div className="w-full h-fit flex flex-wrap  pb-5">
            {articlesAttribute.length > 0 &&
              articlesAttribute?.map((article) => (
                <Link
                  to={`/article?slug=${article?.slug}&id=${article?._id}&tilte=${article?.title}`}
                  key={article._id}
                  className="w-3/12 pr-3 pb-3 "
                >
                  <div className="w-full flex flex-col p-3 cursor-pointer border-1 border-dark-800 rounded-md hover:translate-y-[-3px] transition-all duration-300">
                    {" "}
                    <img
                      className="w-full aspect-[16/9] object-cover rounded-md"
                      src={article?.thumbnail?.url}
                      alt={article?.title || ""}
                    />
                    <div className="flex flex-col">
                      <div className="text-vivanta-500">
                        {article?.topics?.map((topic) => (
                          <span key={topic._id}>{topic?.name}</span>
                        ))}
                      </div>
                      <h1 className="font-bold text-md line-clamp-2 py-2 min-h-12">
                        {article?.title}
                      </h1>
                      <p className="line-clamp-1 text-sm text-dark-500 mt-1">
                        {article?.summary}
                      </p>
                      <div className="flex items-center gap-2 text-sm pt-2">
                        <div className="w-5 h-5 flex items-center justify-center bg-vivanta-cyan-400 text-light-50 rounded-sm text-[0.8rem]">
                          <i className="fa-solid fa-user-doctor"></i>
                        </div>
                        Tác giả:
                        <span className="font-bold">
                          {article?.author?.fullName}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default DetailArticle;

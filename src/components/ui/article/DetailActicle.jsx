import React, { useEffect, useState } from "react";
import {
  Eye,
  Calendar,
  User,
  Tag,
  Clock,
  ArrowLeft,
  Share2,
  Bookmark,
} from "lucide-react";
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
  const [showSidebar, setShowSidebar] = useState(false);
  const { loading, error, article, relatedArticles, articlesAttribute } =
    useSelector((state) => state.article);

  // Tách query string
  const searchParams = new URLSearchParams(location.search);
  const id = searchParams.get("id");
  const slug = searchParams.get("slug");

  useEffect(() => {
    dispatch(fetchArticleById(id));
    dispatch(fetchRelatedArticles(id, { limit: 5 }));
    dispatch(fetchMostViewedArticles({ limit: 4 }));
  }, [id, slug, dispatch]);

  // Responsive Loading Skeleton
  if (loading) {
    return (
      <div className="w-full flex flex-col font-nunito">
        <Header />
        <div className="min-h-screen bg-gray-50">
          <div className="container max-w-6xl mx-auto px-4 py-8">
            <div className="animate-pulse">
              {/* Back button skeleton */}
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
                <div className="w-16 h-4 bg-gray-300 rounded"></div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Main content skeleton */}
                <div className="lg:col-span-8">
                  <div className="bg-white rounded-lg p-4 md:p-6">
                    <div className="h-6 bg-gray-300 rounded w-20 mb-4"></div>
                    <div className="h-8 bg-gray-300 rounded w-3/4 mb-4"></div>
                    <div className="h-4 bg-gray-300 rounded w-1/2 mb-8"></div>
                    <div className="h-48 md:h-64 bg-gray-300 rounded mb-8"></div>
                    <div className="space-y-4">
                      <div className="h-4 bg-gray-300 rounded"></div>
                      <div className="h-4 bg-gray-300 rounded"></div>
                      <div className="h-4 bg-gray-300 rounded w-2/3"></div>
                    </div>
                  </div>
                </div>

                {/* Sidebar skeleton - hidden on mobile */}
                <div className="hidden lg:block lg:col-span-4">
                  <div className="bg-white rounded-lg p-4">
                    <div className="h-6 bg-gray-300 rounded w-32 mb-4"></div>
                    <div className="space-y-4">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="flex gap-3">
                          <div className="w-20 h-16 bg-gray-300 rounded"></div>
                          <div className="flex-1 space-y-2">
                            <div className="h-4 bg-gray-300 rounded"></div>
                            <div className="h-3 bg-gray-300 rounded w-3/4"></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="w-full flex flex-col font-nunito">
        <Header />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
          <div className="text-center max-w-md">
            <h2 className="text-xl md:text-2xl font-bold text-red-600 mb-4">
              Lỗi tải bài viết
            </h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => window.history.back()}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Quay lại
            </button>
          </div>
        </div>
      </div>
    );
  }

  // No article found
  if (!article) {
    return (
      <div className="w-full flex flex-col font-nunito">
        <Header />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
          <div className="text-center max-w-md">
            <h2 className="text-xl md:text-2xl font-bold text-gray-600 mb-4">
              Không tìm thấy bài viết
            </h2>
            <button
              onClick={() => window.history.back()}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Quay lại
            </button>
          </div>
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
    <div className="w-full flex flex-col  font-nunito">
      <Header />

      <div className="min-h-screen">
        {/* Back Navigation */}
        <div className="container  max-w-7xl  mx-auto py-3 px-4 md:px-6 mt-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate(-1)}
                className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center border border-gray-300 rounded-full cursor-pointer hover:bg-gray-100 transition-colors"
              >
                <ArrowLeft className="w-4 h-4 md:w-5 md:h-5" />
              </button>
              <span className="text-sm md:text-base font-medium">Quay lại</span>
            </div>

            {/* Mobile Related Articles Toggle */}
            <button
              onClick={() => setShowSidebar(!showSidebar)}
              className="lg:hidden px-3 py-2 bg-blue-600 text-white rounded-lg text-sm"
            >
              Bài viết liên quan
            </button>
          </div>
        </div>

        {/* Main Container */}
        <div className="container  max-w-7xl mx-auto px-4 md:px-6 py-3">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Main Article Content */}
            <div className="lg:col-span-8">
              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="p-4 md:p-6 lg:p-8">
                  {/* Article Header */}
                  <div className="mb-6 md:mb-8">
                    {/* Topic Badge */}
                    <div className="flex flex-wrap gap-2 mb-4 md:mb-6">
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                        <Tag className="w-3 h-3" />
                        {article?.topic?.name}
                      </span>
                    </div>

                    {/* Article Meta */}
                    <div className="flex flex-wrap items-center gap-3 md:gap-4 text-xs md:text-sm text-gray-600 mb-4 md:mb-6">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 md:w-4 md:h-4" />
                        <span className="hidden sm:inline">
                          {formatDate(article.createdAt)}
                        </span>
                        <span className="sm:hidden">
                          {new Date(article.createdAt).toLocaleDateString(
                            "vi-VN",
                            { day: "2-digit", month: "2-digit" }
                          )}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3 md:w-4 md:h-4" />
                        <span>{formatTime(article.createdAt)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Eye className="w-3 h-3 md:w-4 md:h-4" />
                        <span>{article.views} lượt xem</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <User className="w-3 h-3 md:w-4 md:h-4" />
                        <span className="truncate max-w-[120px] md:max-w-none">
                          {article.author.fullName}
                        </span>
                      </div>
                    </div>

                    {/* Article Title */}
                    <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 mb-4 md:mb-6 leading-tight">
                      {article.title}
                    </h1>

                    {/* Article Summary */}
                    {article.summary && (
                      <p className="text-sm md:text-base text-justify text-gray-700 mb-6 md:mb-8 italic border-l-4 border-blue-500 pl-4 leading-relaxed">
                        {article.summary}
                      </p>
                    )}

                    {/* Main Thumbnail */}
                    {article.thumbnail && article.thumbnail.url && (
                      <div className="w-full flex flex-col items-center mb-6 md:mb-8">
                        <img
                          src={article.thumbnail.url}
                          alt={article.title}
                          className="w-full md:w-10/12 lg:w-9/12 aspect-[16/9] object-cover rounded-lg shadow-sm"
                          loading="eager"
                        />
                      </div>
                    )}
                  </div>

                  {/* Article Content Sections */}
                  <div className="space-y-6 md:space-y-8">
                    {article.sections &&
                      article.sections.map((section, index) => (
                        <div
                          key={section._id}
                          className="prose prose-sm md:prose-base lg:prose-lg max-w-none"
                        >
                          {section.heading && (
                            <h2 className="text-lg md:text-xl lg:text-2xl font-bold text-gray-900 mb-3 md:mb-4">
                              {section.heading}
                            </h2>
                          )}

                          {section.image && section.image.url && (
                            <div className="w-full flex flex-col items-center my-4 md:my-6">
                              <img
                                src={section.image.url}
                                alt={
                                  section.image.description || section.heading
                                }
                                className="w-full md:w-10/12 lg:w-9/12 aspect-[16/9] object-cover rounded-lg shadow-sm"
                                loading="lazy"
                              />
                              {section.image.description && (
                                <p className="text-xs md:text-sm text-gray-600 mt-2 italic text-center max-w-lg">
                                  {section.image.description}
                                </p>
                              )}
                            </div>
                          )}

                          {section.content && (
                            <div className="text-sm md:text-base leading-relaxed">
                              <ContentParser content={section?.content} />
                            </div>
                          )}
                        </div>
                      ))}
                  </div>

                  {/* Article Footer */}
                  <div className="bg-gray-50 rounded-lg p-4 md:p-6 mt-6 md:mt-8">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div className="space-y-1">
                        <p className="text-xs md:text-sm text-gray-600">
                          Tác giả:{" "}
                          <span className="font-semibold">
                            {article.author.fullName}
                          </span>
                        </p>
                        <p className="text-xs md:text-sm text-gray-600">
                          Email:{" "}
                          <span className="font-semibold break-all">
                            {article.author.email}
                          </span>
                        </p>
                      </div>
                      <div className="text-left sm:text-right space-y-1">
                        <p className="text-xs md:text-sm text-gray-600">
                          Xuất bản:{" "}
                          {formatDate(article.publishedAt || article.createdAt)}
                        </p>
                        <p className="text-xs md:text-sm text-gray-600">
                          Cập nhật: {formatDate(article.updatedAt)}
                        </p>
                      </div>
                    </div>

                    {article.references && article.references.length > 0 && (
                      <div className="mt-4 md:mt-6 pt-4 md:pt-6 border-t border-gray-200">
                        <h3 className="text-base md:text-lg font-semibold mb-3">
                          Tham khảo:
                        </h3>
                        <ul className="list-disc pl-5 space-y-1">
                          {article.references.map((ref, index) => (
                            <li
                              key={index}
                              className="text-xs md:text-sm text-gray-600 break-words"
                            >
                              {ref.replace(/\[\[\]"]/g, "")}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Mobile Disclaimer */}
              <div className="mt-6">
                <Disclaimer />
              </div>
            </div>

            {/* Desktop Sidebar */}
            <div className="hidden lg:block lg:col-span-4">
              <div className="sticky top-6">
                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                  <div className="border-t-4 border-blue-600 bg-blue-50 px-4 py-3">
                    <h2 className="font-bold text-gray-900">
                      Bài viết liên quan
                    </h2>
                  </div>
                  <div className="p-4 space-y-4 max-h-[600px] overflow-y-auto">
                    {relatedArticles?.map((relatedArticle) => (
                      <Link
                        to={`/article?slug=${relatedArticle?.slug}&id=${relatedArticle?._id}`}
                        key={relatedArticle._id}
                        className="block group"
                      >
                        <div className="flex gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                          <img
                            className="w-20 h-16 object-cover rounded-md flex-shrink-0"
                            src={relatedArticle?.thumbnail?.url}
                            alt={relatedArticle?.title || ""}
                            loading="lazy"
                          />
                          <div className="flex flex-col min-w-0 flex-1">
                            <div className="text-xs text-blue-600 mb-1">
                              {relatedArticle?.topics?.map((topic) => (
                                <span key={topic._id}>{topic?.name}</span>
                              ))}
                            </div>
                            <h3 className="font-semibold text-sm line-clamp-2 text-gray-900 group-hover:text-blue-600 transition-colors mb-2">
                              {relatedArticle?.title}
                            </h3>
                            <p className="line-clamp-1 text-xs text-gray-500 mb-2">
                              {relatedArticle?.summary}
                            </p>
                            <div className="flex items-center gap-1 text-xs text-gray-400 mt-auto">
                              <div className="w-3 h-3 flex items-center justify-center bg-blue-400 text-white rounded-sm">
                                <i className="fa-solid fa-user-doctor text-[8px]"></i>
                              </div>
                              <span className="truncate">
                                {relatedArticle?.author?.fullName}
                              </span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Related Articles Modal */}
          {showSidebar && (
            <div className="fixed inset-0 bg-black bg-opacity-50 z-50 lg:hidden">
              <div className="absolute right-0 top-0 h-full w-80 max-w-[85vw] bg-white overflow-y-auto">
                <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex justify-between items-center">
                  <h2 className="font-bold text-gray-900">
                    Bài viết liên quan
                  </h2>
                  <button
                    onClick={() => setShowSidebar(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                  >
                    ✕
                  </button>
                </div>
                <div className="p-4 space-y-4">
                  {relatedArticles?.map((relatedArticle) => (
                    <Link
                      to={`/article?slug=${relatedArticle?.slug}&id=${relatedArticle?._id}`}
                      key={relatedArticle._id}
                      className="block"
                      onClick={() => setShowSidebar(false)}
                    >
                      <div className="flex gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                        <img
                          className="w-20 h-16 object-cover rounded-md flex-shrink-0"
                          src={relatedArticle?.thumbnail?.url}
                          alt={relatedArticle?.title || ""}
                          loading="lazy"
                        />
                        <div className="flex flex-col min-w-0 flex-1">
                          <div className="text-xs text-blue-600 mb-1">
                            {relatedArticle?.topics?.map((topic) => (
                              <span key={topic._id}>{topic?.name}</span>
                            ))}
                          </div>
                          <h3 className="font-semibold text-sm line-clamp-2 text-gray-900 mb-2">
                            {relatedArticle?.title}
                          </h3>
                          <p className="line-clamp-1 text-xs text-gray-500 mb-2">
                            {relatedArticle?.summary}
                          </p>
                          <div className="flex items-center gap-1 text-xs text-gray-400 mt-auto">
                            <div className="w-3 h-3 flex items-center justify-center bg-blue-400 text-white rounded-sm">
                              <i className="fa-solid fa-user-doctor text-[8px]"></i>
                            </div>
                            <span className="truncate">
                              {relatedArticle?.author?.fullName}
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Featured Articles Section */}
          <div className="mt-8 md:mt-12 py-12">
            <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6 text-gray-900">
              Xem thêm các bài viết nổi bật
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
              {articlesAttribute.length > 0 &&
                articlesAttribute?.map((featuredArticle) => (
                  <Link
                    to={`/article?slug=${featuredArticle?.slug}&id=${featuredArticle?._id}&title=${featuredArticle?.title}`}
                    key={featuredArticle._id}
                    className="group"
                  >
                    <div className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md hover:-translate-y-1 transition-all duration-300">
                      <img
                        className="w-full aspect-[16/9] object-cover group-hover:scale-105 transition-transform duration-300"
                        src={featuredArticle?.thumbnail?.url}
                        alt={featuredArticle?.title || ""}
                        loading="lazy"
                      />
                      <div className="p-3 md:p-4">
                        <div className="text-xs md:text-sm text-blue-600 mb-2">
                          {featuredArticle?.topics?.map((topic) => (
                            <span key={topic._id}>{topic?.name}</span>
                          ))}
                        </div>
                        <h3 className="font-bold text-sm md:text-base line-clamp-2 text-gray-900 group-hover:text-blue-600 transition-colors mb-2 min-h-[2.5rem] md:min-h-[3rem]">
                          {featuredArticle?.title}
                        </h3>
                        <p className="line-clamp-2 text-xs md:text-sm text-gray-500 mb-3">
                          {featuredArticle?.summary}
                        </p>
                        <div className="flex items-center gap-2 text-xs md:text-sm text-gray-400">
                          <div className="w-4 h-4 md:w-5 md:h-5 flex items-center justify-center bg-blue-400 text-white rounded-sm">
                            <i className="fa-solid fa-user-doctor text-[8px] md:text-xs"></i>
                          </div>
                          <span className="truncate">
                            {featuredArticle?.author?.fullName}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default DetailArticle;

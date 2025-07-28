import React, { useEffect, useState } from "react";
import {
  TrendingUp,
  Eye,
  Clock,
  Calendar,
  User,
  ArrowRight,
  Heart,
  ThumbsUp,
  MessageCircle,
  Share2,
  BookOpen,
  Star,
  Filter,
  Search,
  ChevronRight,
  Bookmark,
  Play,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAllArticles,
  fetchFeaturedArticles,
  fetchLatestArticles,
  fetchMostViewedArticles,
} from "../../../services/article.service";
import { Link } from "react-router-dom";

// Responsive Skeleton Loading Component
const ArticlesSkeleton = () => {
  return (
    <section className="py-6 md:py-10 bg-gradient-to-br from-gray-50 via-white to-gray-100 min-h-screen">
      <div className="container mx-auto px-4 md:px-6">
        {/* Tab Skeleton */}
        <div className="py-2 mb-4">
          <div className="w-fit flex bg-gray-100 rounded-xl p-1">
            {[1, 2, 3].map((index) => (
              <div
                key={index}
                className="flex items-center space-x-2 px-3 md:px-4 py-2 rounded-lg"
              >
                <div className="w-4 h-4 bg-gray-300 rounded animate-pulse"></div>
                <div className="w-12 md:w-16 h-4 bg-gray-300 rounded animate-pulse hidden sm:block"></div>
              </div>
            ))}
          </div>
        </div>

        {/* Main Content Skeleton */}
        <div className="w-full flex flex-col lg:flex-row gap-4 md:gap-5">
          {/* Main Article Skeleton */}
          <article className="w-full lg:w-7/12 flex flex-col">
            <div className="w-full">
              <div className="w-full rounded-md aspect-[16/9] bg-gray-300 animate-pulse"></div>
            </div>
            <div className="w-full flex flex-col mt-3 md:mt-4">
              <div className="w-full flex flex-col">
                {/* Topic Skeleton */}
                <div className="py-1 md:py-2">
                  <div className="w-16 md:w-20 h-3 md:h-4 bg-gray-300 rounded animate-pulse"></div>
                </div>
                {/* Title Skeleton */}
                <div className="py-1 md:py-2 space-y-2">
                  <div className="w-full h-5 md:h-6 bg-gray-300 rounded animate-pulse"></div>
                  <div className="w-4/5 h-5 md:h-6 bg-gray-300 rounded animate-pulse"></div>
                </div>
                {/* Summary Skeleton */}
                <div className="space-y-2 mt-2">
                  <div className="w-full h-3 md:h-4 bg-gray-300 rounded animate-pulse"></div>
                  <div className="w-full h-3 md:h-4 bg-gray-300 rounded animate-pulse"></div>
                  <div className="w-3/4 h-3 md:h-4 bg-gray-300 rounded animate-pulse"></div>
                </div>
              </div>
              {/* Author Skeleton */}
              <div className="w-full flex items-center py-3 md:py-4">
                <div className="flex items-center gap-2">
                  <div className="w-5 md:w-6 h-5 md:h-6 bg-gray-300 rounded-sm animate-pulse"></div>
                  <div className="w-10 md:w-12 h-3 md:h-4 bg-gray-300 rounded animate-pulse"></div>
                  <div className="w-20 md:w-24 h-3 md:h-4 bg-gray-300 rounded animate-pulse"></div>
                </div>
              </div>
            </div>
          </article>

          {/* Side Articles Skeleton */}
          <div className="w-full lg:w-5/12 flex flex-col gap-2 md:gap-3">
            {[1, 2, 3, 4, 5, 6].map((index) => (
              <article
                key={index}
                className="w-full flex gap-3 p-3 rounded-md shadow bg-white"
              >
                <div className="w-24 sm:w-32 md:w-40 aspect-[16/9] bg-gray-300 rounded-md animate-pulse flex-shrink-0"></div>
                <div className="flex flex-col flex-1 min-w-0">
                  {/* Topic Skeleton */}
                  <div className="w-12 md:w-16 h-3 bg-gray-300 rounded animate-pulse mb-1"></div>
                  {/* Title Skeleton */}
                  <div className="space-y-1 py-1">
                    <div className="w-full h-3 md:h-4 bg-gray-300 rounded animate-pulse"></div>
                    <div className="w-4/5 h-3 md:h-4 bg-gray-300 rounded animate-pulse"></div>
                  </div>
                  {/* Summary Skeleton */}
                  <div className="w-full h-2 md:h-3 bg-gray-300 rounded animate-pulse mt-1 hidden sm:block"></div>
                  {/* Author Skeleton */}
                  <div className="flex items-center gap-1 md:gap-2 pt-2 mt-auto">
                    <div className="w-4 md:w-5 h-4 md:h-5 bg-gray-300 rounded-sm animate-pulse"></div>
                    <div className="w-8 md:w-10 h-2 md:h-3 bg-gray-300 rounded animate-pulse"></div>
                    <div className="w-12 md:w-16 h-2 md:h-3 bg-gray-300 rounded animate-pulse"></div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

const ArticlesSection = () => {
  const dispatch = useDispatch();
  const { loading, articlesAttribute } = useSelector((state) => state.article);
  const [activeTab, setActiveTab] = useState("featured");
  const [searchQuery, setSearchQuery] = useState("");

  // Khởi tạo component với dữ liệu featured
  useEffect(() => {
    dispatch(fetchFeaturedArticles({ limit: 7 }));
  }, [dispatch]);

  // Xử lý khi thay đổi tab
  useEffect(() => {
    if (activeTab === "featured") {
      dispatch(fetchFeaturedArticles({ limit: 7 }));
    } else if (activeTab === "latest") {
      dispatch(fetchLatestArticles({ limit: 7 }));
    } else if (activeTab === "popular") {
      dispatch(fetchMostViewedArticles({ limit: 7 }));
    }
  }, [activeTab, dispatch]);

  // Tính toán mainArticle và sideArticles từ articlesAttribute
  const mainArticle =
    articlesAttribute && articlesAttribute.length > 0
      ? articlesAttribute[0]
      : null;
  const sideArticles =
    articlesAttribute && articlesAttribute.length > 1
      ? articlesAttribute.slice(1)
      : [];

  // Show skeleton loading when loading is true
  if (loading) {
    return <ArticlesSkeleton />;
  }

  return (
    <section className="py-6 md:py-10 bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        {/* Responsive Tab Navigation */}
        <div className="py-2 mb-4 md:mb-6">
          <div className="w-fit flex bg-gray-100 rounded-xl p-1 mx-auto sm:mx-0">
            {[
              { key: "featured", label: "Nổi Bật", icon: Star },
              { key: "popular", label: "Phổ Biến", icon: TrendingUp },
              { key: "latest", label: "Mới Nhất", icon: Clock },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center justify-center space-x-1 md:space-x-2 px-3 md:px-4 py-2 cursor-pointer rounded-lg font-medium transition-all text-sm md:text-base ${
                  activeTab === tab.key
                    ? "bg-white text-teal-600 shadow-sm"
                    : "text-gray-600 hover:text-teal-600"
                }`}
              >
                <tab.icon className="w-3 h-3 md:w-4 md:h-4" />
                <span className="hidden xs:inline md:inline">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content Section */}
        <div className="w-full flex justify-center">
          {(!articlesAttribute || articlesAttribute.length === 0) && (
            <div className="text-center py-8 md:py-12">
              <BookOpen className="w-12 h-12 md:w-16 md:h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 text-sm md:text-base">
                Không có bài viết nào để hiển thị.
              </p>
            </div>
          )}

          {/* Articles Content */}
          {articlesAttribute && articlesAttribute.length > 0 && (
            <div className="w-full  flex flex-col lg:flex-row gap-4 md:gap-6">
              {/* Main Article */}
              <Link
                to={`/article?slug=${mainArticle?.slug}&title=${mainArticle?.title}&id=${mainArticle?._id}`}
                className="w-full lg:w-7/12 h-fit flex flex-col bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden group"
              >
                <div className="relative overflow-hidden">
                  <img
                    className="w-full aspect-[16/9] object-cover group-hover:scale-105 transition-transform duration-300"
                    src={mainArticle?.thumbnail?.url}
                    alt={mainArticle?.title || ""}
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>

                <div className="p-4 md:p-6 h-fit flex flex-col ">
                  <div className="">
                    {/* Topic Badge */}
                    <div className="mb-2 md:mb-3">
                      {mainArticle?.topics?.map((topic) => (
                        <span
                          key={topic._id}
                          className="inline-block px-2 md:px-3 py-1 bg-teal-100 text-teal-700 text-xs md:text-sm font-medium rounded-full"
                        >
                          {topic.name}
                        </span>
                      ))}
                    </div>

                    {/* Title */}
                    <h1 className="font-bold text-lg md:text-xl lg:text-2xl text-gray-900 line-clamp-2 md:line-clamp-3 mb-2 md:mb-3 group-hover:text-teal-600 transition-colors">
                      {mainArticle?.title}
                    </h1>

                    {/* Summary */}
                    <p className="text-sm md:text-base text-gray-600 line-clamp-2 md:line-clamp-3 leading-relaxed">
                      {mainArticle?.summary}
                    </p>
                  </div>

                  {/* Author */}
                  <div className="flex items-center mt-4 pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-2 text-xs md:text-sm text-gray-500">
                      <div className="w-5 h-5 md:w-6 md:h-6 flex items-center justify-center bg-teal-500 text-white rounded-sm">
                        <i className="fa-solid fa-user-doctor text-xs"></i>
                      </div>
                      <span>Tác giả:</span>
                      <span className="font-semibold text-gray-700">
                        {mainArticle?.author?.fullName}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>

              {/* Side Articles */}
              <div className="w-full lg:w-5/12 flex flex-col gap-3 md:gap-4">
                {sideArticles.map((article, index) => (
                  <Link
                    to={`/article?slug=${article?.slug}&id=${article?._id}&title=${article?.title}`}
                    key={article._id}
                    className={`w-full flex gap-3 md:gap-4 p-3 md:p-4 bg-white rounded-lg hover:shadow-md transition-all duration-300 group ${
                      index !== sideArticles.length - 1
                        ? "border-b border-gray-100 lg:border-b-0"
                        : ""
                    }`}
                  >
                    <div className="flex flex-col flex-1 min-w-0">
                      {/* Topic */}
                      <div className="mb-1 md:mb-2">
                        {article?.topics?.map((topic) => (
                          <span
                            key={topic._id}
                            className="inline-block px-2 py-0.5 bg-teal-50 text-teal-600 text-xs font-medium rounded"
                          >
                            {topic?.name}
                          </span>
                        ))}
                      </div>

                      {/* Title */}
                      <h2 className="font-bold text-sm md:text-base lg:text-lg text-gray-900 line-clamp-2 mb-1 md:mb-2 group-hover:text-teal-600 transition-colors leading-tight">
                        {article?.title}
                      </h2>

                      {/* Summary - Hidden on small screens */}
                      <p className=" truncate line-clamp-2 text-xs md:text-sm text-gray-500 mb-2 hidden sm:block">
                        {article?.summary}
                      </p>

                      {/* Author */}
                      <div className="flex items-center gap-1 md:gap-2 text-xs text-gray-400 mt-auto">
                        <div className="w-3 h-3 md:w-4 md:h-4 flex items-center justify-center bg-teal-400 text-white rounded-sm">
                          <i className="fa-solid fa-user-doctor text-[8px] md:text-xs"></i>
                        </div>
                        <span>Tác giả:</span>
                        <span className="font-semibold text-gray-600 truncate">
                          {article?.author?.fullName}
                        </span>
                      </div>
                    </div>

                    {/* Thumbnail */}
                    <div className="w-20 sm:w-24 md:w-28 lg:w-32 aspect-[16/9] flex-shrink-0">
                      <img
                        className="w-full h-full object-cover rounded-md group-hover:scale-105 transition-transform duration-300"
                        src={article?.thumbnail?.url}
                        alt={article?.title || ""}
                        loading="lazy"
                      />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default ArticlesSection;

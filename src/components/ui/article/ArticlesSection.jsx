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

// Skeleton Loading Component
const ArticlesSkeleton = () => {
  return (
    <section className="py-10 bg-gradient-to-br from-gray-50 via-white to-gray-100 min-h-screen">
      <div className="container mx-auto px-6">
        {/* Tab Skeleton */}
        <div className="py-2">
          <div className="w-fit flex bg-gray-100 rounded-xl p-1">
            {[1, 2, 3].map((index) => (
              <div
                key={index}
                className="flex items-center space-x-2 px-4 py-2 rounded-lg"
              >
                <div className="w-4 h-4 bg-gray-300 rounded animate-pulse"></div>
                <div className="w-16 h-4 bg-gray-300 rounded animate-pulse hidden sm:block"></div>
              </div>
            ))}
          </div>
        </div>

        {/* Main Content Skeleton */}
        <div className="w-full flex gap-5 rounded-md">
          {/* Main Article Skeleton */}
          <article className="w-7/12 flex flex-col">
            <div className="w-full">
              <div className="w-full rounded-md aspect-[16/9] bg-gray-300 animate-pulse"></div>
            </div>
            <div className="w-full flex flex-col">
              <div className="w-full flex flex-col">
                {/* Topic Skeleton */}
                <div className="py-2">
                  <div className="w-20 h-4 bg-gray-300 rounded animate-pulse"></div>
                </div>
                {/* Title Skeleton */}
                <div className="py-2 space-y-2">
                  <div className="w-full h-6 bg-gray-300 rounded animate-pulse"></div>
                  <div className="w-4/5 h-6 bg-gray-300 rounded animate-pulse"></div>
                </div>
                {/* Summary Skeleton */}
                <div className="space-y-2">
                  <div className="w-full h-4 bg-gray-300 rounded animate-pulse"></div>
                  <div className="w-full h-4 bg-gray-300 rounded animate-pulse"></div>
                  <div className="w-3/4 h-4 bg-gray-300 rounded animate-pulse"></div>
                </div>
              </div>
              {/* Author Skeleton */}
              <div className="w-full flex items-center py-4">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-gray-300 rounded-sm animate-pulse"></div>
                  <div className="w-12 h-4 bg-gray-300 rounded animate-pulse"></div>
                  <div className="w-24 h-4 bg-gray-300 rounded animate-pulse"></div>
                </div>
              </div>
            </div>
          </article>

          {/* Side Articles Skeleton */}
          <div className="w-5/12 flex flex-col gap-2">
            {[1, 2, 3, 4, 5, 6].map((index) => (
              <article
                key={index}
                className="w-full flex gap-2 p-2 rounded-md shadow"
              >
                <div className="w-40 aspect-[16/9] bg-gray-300 rounded-md animate-pulse"></div>
                <div className="flex flex-col flex-1">
                  {/* Topic Skeleton */}
                  <div className="w-16 h-3 bg-gray-300 rounded animate-pulse mb-1"></div>
                  {/* Title Skeleton */}
                  <div className="space-y-1 py-1">
                    <div className="w-full h-4 bg-gray-300 rounded animate-pulse"></div>
                    <div className="w-4/5 h-4 bg-gray-300 rounded animate-pulse"></div>
                  </div>
                  {/* Summary Skeleton */}
                  <div className="w-full h-3 bg-gray-300 rounded animate-pulse mt-1"></div>
                  {/* Author Skeleton */}
                  <div className="flex items-center gap-2 pt-2">
                    <div className="w-5 h-5 bg-gray-300 rounded-sm animate-pulse"></div>
                    <div className="w-10 h-3 bg-gray-300 rounded animate-pulse"></div>
                    <div className="w-16 h-3 bg-gray-300 rounded animate-pulse"></div>
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
      dispatch(fetchFeaturedArticles({ limit: 6 }));
    } else if (activeTab === "latest") {
      dispatch(fetchLatestArticles({ limit: 6 }));
    } else if (activeTab === "popular") {
      dispatch(fetchMostViewedArticles({ limit: 6 }));
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
  console.log({ mainArticle });
  return (
    <section className="py-10 bg-gradient-to-br from-gray-50 via-white to-gray-100 ">
      <div className="container mx-auto px-6">
        <div className="py-2">
          <div className="w-fit flex bg-gray-100 rounded-xl p-1">
            {[
              { key: "featured", label: "Nổi Bật", icon: Star },
              { key: "popular", label: "Phổ Biến", icon: TrendingUp },
              { key: "latest", label: "Mới Nhất", icon: Clock },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all ${
                  activeTab === tab.key
                    ? "bg-white text-teal-600 shadow-sm"
                    : "text-gray-600 hover:text-teal-600"
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Hiển thị thông báo khi không có dữ liệu */}
        {(!articlesAttribute || articlesAttribute.length === 0) && (
          <div className="text-center py-8">
            <p className="text-gray-500">Không có bài viết nào để hiển thị.</p>
          </div>
        )}

        {/* Hiển thị nội dung khi có dữ liệu */}
        {articlesAttribute && articlesAttribute.length > 0 && (
          <div className="w-full flex gap-5 rounded-md">
            <Link
              to={`/article?slug=${mainArticle?.slug}&title=${mainArticle?.title}&id=${mainArticle?._id}`}
              className="w-7/12 flex flex-col border-1 border-dark-800 rounded-md p-4 "
            >
              <div className="w-full">
                <img
                  className="w-full rounded-md aspect-[16/9]"
                  src={mainArticle?.thumbnail?.url}
                  alt={mainArticle?.title || ""}
                />
              </div>
              <div className="w-full flex flex-col">
                <div className="w-full flex flex-col">
                  <div className="text-vivanta-500 py-1">
                    {mainArticle?.topics?.map((topic) => (
                      <span key={topic._id}>{topic.name}</span>
                    ))}
                  </div>
                  <h1 className="font-bold text-2xl py-2 line-clamp-2">
                    {mainArticle?.title}
                  </h1>
                  <p className="text-md text-dark-400 line-clamp-3">
                    {mainArticle?.summary}
                  </p>
                </div>
                <div className="w-full flex items-center py-4">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 flex items-center justify-center bg-vivanta-cyan-400 text-light-50 rounded-sm">
                      <i className="fa-solid fa-user-doctor"></i>
                    </div>
                    Tác giả:
                    <span className="font-bold">
                      {mainArticle?.author?.fullName}
                    </span>
                  </div>
                </div>
              </div>
            </Link>

            <div className="w-5/12 flex flex-col justify-between">
              {sideArticles.map((article) => (
                <Link
                  to={`/article?slug=${article?.slug}&id=${article?._id}&tilte=${article?.title}`}
                  key={article._id}
                  className="w-full flex gap-2 p-2  cursor-pointer border-1 border-dark-800 rounded-md hover:translate-y-[-3px] transition-all duration-300"
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
                    <h1 className="font-bold text-md line-clamp-2 py-1 min-h-12">
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
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default ArticlesSection;

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
  Grid,
  List,
  ChevronDown,
  Tag,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAllArticles,
  fetchFeaturedArticles,
  fetchLatestArticles,
  fetchMostViewedArticles,
  fetchArticlesByTopic, // Thêm import này
} from "../../../services/article.service";
import { Link } from "react-router-dom";
import { fetchAllTopics } from "../../../services/topic.service";

// Responsive Skeleton Loading Component
const ArticlesSkeleton = () => {
  return (
    <section className="py-8 bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4">
        {/* Header Skeleton */}
        <div className="mb-8">
          <div className="w-48 h-8 bg-gray-300 rounded animate-pulse mb-4"></div>
          <div className="flex gap-4 mb-6">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="w-24 h-10 bg-gray-300 rounded-lg animate-pulse"
              ></div>
            ))}
          </div>
        </div>

        {/* Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="bg-white rounded-xl shadow-sm overflow-hidden"
            >
              <div className="w-full h-48 bg-gray-300 animate-pulse"></div>
              <div className="p-6 space-y-3">
                <div className="w-20 h-6 bg-gray-300 rounded animate-pulse"></div>
                <div className="space-y-2">
                  <div className="w-full h-5 bg-gray-300 rounded animate-pulse"></div>
                  <div className="w-4/5 h-5 bg-gray-300 rounded animate-pulse"></div>
                </div>
                <div className="space-y-2">
                  <div className="w-full h-4 bg-gray-300 rounded animate-pulse"></div>
                  <div className="w-3/4 h-4 bg-gray-300 rounded animate-pulse"></div>
                </div>
                <div className="flex items-center gap-2 pt-4">
                  <div className="w-6 h-6 bg-gray-300 rounded animate-pulse"></div>
                  <div className="w-24 h-4 bg-gray-300 rounded animate-pulse"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const ArticlesSectionTopic = () => {
  const dispatch = useDispatch();
  const { topics } = useSelector((state) => state.topic);
  const { loading, articlesByTopic, articlesAttribute } = useSelector(
    (state) => state.article
  );
  const [activeTab, setActiveTab] = useState("featured");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [viewMode, setViewMode] = useState("grid");
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);

  useEffect(() => {
    dispatch(fetchAllTopics());
  }, [dispatch]);

  // Khởi tạo component với dữ liệu featured
  useEffect(() => {
    dispatch(fetchFeaturedArticles({ limit: 12 }));
  }, [dispatch]);

  // Xử lý khi chọn category/topic
  const handleCategoryChange = (categoryId) => {
    setSelectedCategory(categoryId);
    setShowCategoryDropdown(false);
    if (categoryId !== "all") {
      dispatch(fetchArticlesByTopic(categoryId, { limit: 12 }));
    }
  };

  // Lấy danh sách articles dựa trên tab và category
  const getCurrentArticles = () => {
    if (selectedCategory !== "all") {
      // Nếu đã chọn category cụ thể, return articlesByTopic
      return articlesByTopic || [];
    } else {
      return articlesAttribute;
    }
  };

  const currentArticles = getCurrentArticles();

  // Lấy danh sách các chuyên mục từ topics state
  const categories = React.useMemo(() => {
    return topics || [];
  }, [topics]);

  // Show skeleton loading when loading is true
  if (loading) {
    return <ArticlesSkeleton />;
  }

  return (
    <section className="py-8 bg-gradient-to-br from-gray-50 via-white to-blue-50/30">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-4 sm:mb-0">
              Bài viết theo chuyên mục
            </h1>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-2 bg-white rounded-lg p-1 shadow-sm">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-md transition-all ${
                  viewMode === "grid"
                    ? "bg-teal-500 text-white shadow-sm"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-md transition-all ${
                  viewMode === "list"
                    ? "bg-teal-500 text-white shadow-sm"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex flex-col lg:flex-row lg:items-center gap-4 mb-6">
            {/* Category Filter */}
            <div className="relative">
              <button
                onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                className="flex items-center gap-2 px-4 py-3 bg-white rounded-lg shadow-sm border border-gray-200 hover:border-teal-300 transition-colors"
              >
                <Tag className="w-4 h-4 text-teal-500" />
                <span className="text-gray-700">
                  {selectedCategory === "all"
                    ? "Tất cả chuyên mục"
                    : categories.find((cat) => cat._id === selectedCategory)
                        ?.name || "Chuyên mục"}
                </span>
                <ChevronDown
                  className={`w-4 h-4 text-gray-400 transition-transform ${
                    showCategoryDropdown ? "rotate-180" : ""
                  }`}
                />
              </button>

              {showCategoryDropdown && (
                <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-64 overflow-y-auto">
                  <button
                    onClick={() => handleCategoryChange("all")}
                    className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors ${
                      selectedCategory === "all"
                        ? "bg-teal-50 text-teal-600 font-medium"
                        : ""
                    }`}
                  >
                    Tất cả chuyên mục
                  </button>
                  {categories.map((category) => (
                    <button
                      key={category._id}
                      onClick={() => handleCategoryChange(category._id)}
                      className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors ${
                        selectedCategory === category._id
                          ? "bg-teal-50 text-teal-600 font-medium"
                          : ""
                      }`}
                    >
                      {category.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Content Section */}
        {(!currentArticles || currentArticles.length === 0) && (
          <div className="text-center py-16">
            <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">
              Không có bài viết nào để hiển thị.
            </p>
          </div>
        )}

        {/* Articles Grid/List */}
        {currentArticles && currentArticles.length > 0 && (
          <div
            className={
              viewMode === "grid"
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                : "space-y-6"
            }
          >
            {currentArticles.map((article, index) => (
              <Link
                key={article._id}
                to={`/article?slug=${article?.slug}&title=${article?.title}&id=${article?._id}`}
                className={`bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden group ${
                  viewMode === "list" ? "flex gap-6 p-6" : ""
                }`}
              >
                {viewMode === "grid" ? (
                  // Grid View
                  <>
                    <div className="relative overflow-hidden">
                      <img
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                        src={article?.thumbnail?.url}
                        alt={article?.title || ""}
                        loading="lazy"
                      />
                      <div className="absolute top-4 left-4">
                        {article?.topics?.slice(0, 1).map((topic) => (
                          <span
                            key={topic._id}
                            className="inline-block px-3 py-1 bg-teal-500 text-white text-xs font-medium rounded-full shadow-sm"
                          >
                            {topic.name}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="p-6">
                      <h2 className="font-bold text-lg text-gray-900 line-clamp-2 mb-3 group-hover:text-teal-600 transition-colors leading-tight">
                        {article?.title}
                      </h2>

                      <p className="text-gray-600 line-clamp-3 text-sm leading-relaxed mb-4">
                        {article?.summary}
                      </p>

                      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <div className="w-6 h-6 flex items-center justify-center bg-teal-500 text-white rounded-full">
                            <i className="fa-solid fa-user-doctor text-xs"></i>
                          </div>
                          <span className="font-medium text-gray-700 truncate">
                            {article?.author?.fullName}
                          </span>
                        </div>
                        <ArrowRight className="w-4 h-4 text-teal-500 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </>
                ) : (
                  // List View
                  <>
                    <div className="w-48 flex-shrink-0">
                      <img
                        className="w-full h-32 object-cover rounded-lg group-hover:scale-105 transition-transform duration-300"
                        src={article?.thumbnail?.url}
                        alt={article?.title || ""}
                        loading="lazy"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="mb-2">
                        {article?.topics?.slice(0, 1).map((topic) => (
                          <span
                            key={topic._id}
                            className="inline-block px-3 py-1 bg-teal-100 text-teal-700 text-xs font-medium rounded-full"
                          >
                            {topic.name}
                          </span>
                        ))}
                      </div>

                      <h2 className="font-bold text-xl text-gray-900 line-clamp-2 mb-3 group-hover:text-teal-600 transition-colors">
                        {article?.title}
                      </h2>

                      <p className="text-gray-600 line-clamp-2 mb-4 leading-relaxed">
                        {article?.summary}
                      </p>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <div className="w-6 h-6 flex items-center justify-center bg-teal-500 text-white rounded-full">
                            <i className="fa-solid fa-user-doctor text-xs"></i>
                          </div>
                          <span>Tác giả:</span>
                          <span className="font-medium text-gray-700">
                            {article?.author?.fullName}
                          </span>
                        </div>
                        <ArrowRight className="w-5 h-5 text-teal-500 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Click outside to close dropdown */}
      {showCategoryDropdown && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowCategoryDropdown(false)}
        ></div>
      )}
    </section>
  );
};

export default ArticlesSectionTopic;

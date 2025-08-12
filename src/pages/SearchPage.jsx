import React, { useEffect, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import {
  Search,
  Calendar,
  User,
  Eye,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { searchArticles } from "../services/article.service";
import Container from "../components/layout/Container";
import Footer from "./user/Footer";
import Header from "../components/layout/Header";
import Pagination from "../components/features/Pagination";
import VoiceChatbot from "../components/ui/chatbot/VoiceChatbot";

const SearchPage = () => {
  const location = useLocation();
  const dispatch = useDispatch();
  const { searchResults, loading, error, paginationSearch } = useSelector(
    (state) => state.article
  );

  const { searchValue: initialSearchValue, selectedArticle } =
    location.state || {};

  const [searchTerm, setSearchTerm] = useState(initialSearchValue || "");
  const [currentPage, setCurrentPage] = useState(1);
  const [limit] = useState(10);
  const [searchHistory, setSearchHistory] = useState([]);
  const [totalResults, setTotalResults] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    if (searchTerm) {
      performSearch(searchTerm, currentPage);

      setSearchHistory((prev) => {
        const filtered = prev.filter((item) => item !== searchTerm);
        return [searchTerm, ...filtered].slice(0, 5);
      });
    }
  }, [searchTerm, currentPage]);

  const performSearch = async (term, page = 1) => {
    try {
      const result = await dispatch(
        searchArticles({
          page,
          limit,
          search: term,
        })
      );

      if (result && result.data) {
        setTotalResults(result.data.pagination?.total || 0);
        setTotalPages(result.data.pagination?.pages || 1);
      }
    } catch (error) {
      console.error("Search error:", error);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    if (searchTerm.trim()) {
      performSearch(searchTerm, 1);
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const truncateText = (text, maxLength = 150) => {
    if (text.length <= maxLength) return text;
    return text.substr(0, maxLength) + "...";
  };

  return (
    <div className="min-h-screen ">
      <Header />
      <VoiceChatbot />
      {/* Search Header */}
      <div className="container mx-auto p-8">
        <div className="mb-8 ">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            Tìm kiếm bài viết
          </h1>

          {/* Search Form */}
          <form onSubmit={handleSearchSubmit} className="max-w-2xl">
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Nhập từ khóa tìm kiếm..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-vivanta-500 focus:border-transparent"
                />
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              </div>
              <button
                type="submit"
                className="px-6 py-3 bg-vivanta-500 text-white rounded-lg hover:bg-vivanta-600 transition-colors font-medium"
              >
                Tìm kiếm
              </button>
            </div>
          </form>

          {/* Search History */}
          {searchHistory.length > 0 && (
            <div className="mt-4">
              <p className="text-sm text-gray-600 mb-2">Tìm kiếm gần đây:</p>
              <div className="flex flex-wrap gap-2">
                {searchHistory.map((term, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setSearchTerm(term);
                      setCurrentPage(1);
                    }}
                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200 transition-colors"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-vivanta-500"></div>
            <span className="ml-2 text-gray-600">Đang tìm kiếm...</span>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-600">
              Có lỗi xảy ra khi tìm kiếm. Vui lòng thử lại!
            </p>
          </div>
        )}

        {/* Search Results */}
        {!loading && searchResults && (
          <>
            {/* Results Summary */}
            <div className="mb-6">
              <p className="text-gray-600">
                {totalResults > 0 ? (
                  <>
                    Tìm thấy{" "}
                    <span className="font-semibold text-vivanta-600">
                      {totalResults}
                    </span>{" "}
                    kết quả
                    {searchTerm && (
                      <>
                        {" "}
                        cho "
                        <span className="font-semibold text-gray-800">
                          {searchTerm}
                        </span>
                        "
                      </>
                    )}
                  </>
                ) : (
                  <>
                    Không tìm thấy kết quả nào
                    {searchTerm && (
                      <>
                        {" "}
                        cho "
                        <span className="font-semibold text-gray-800">
                          {searchTerm}
                        </span>
                        "
                      </>
                    )}
                  </>
                )}
              </p>
            </div>

            {/* Articles Grid */}
            {searchResults.length > 0 ? (
              <div className="space-y-6">
                {searchResults.map((article, index) => (
                  <div
                    key={article._id}
                    className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden border border-gray-200"
                  >
                    <div className="flex flex-col md:flex-row">
                      {/* Article Image */}
                      <div className="md:w-64 flex-shrink-0">
                        <img
                          src={article.thumbnail?.url}
                          alt={article.title}
                          className="w-full h-48 md:h-full object-cover"
                          onError={(e) => {
                            e.target.src = "/api/placeholder/300/200";
                          }}
                        />
                      </div>

                      {/* Article Content */}
                      <div className="flex-1 p-6">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="inline-block bg-vivanta-100 text-vivanta-700 px-2 py-1 rounded-full text-xs font-medium">
                            {article.topic?.name}
                          </span>
                          {article.isFeatured && (
                            <span className="inline-block bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full text-xs font-medium">
                              Nổi bật
                            </span>
                          )}
                        </div>

                        <Link
                          to={`/article/?slug=${article.slug}&title=${article.title}&id=${article._id}`}
                          className="block group"
                        >
                          <h2 className="text-xl font-bold text-gray-800 group-hover:text-vivanta-600 transition-colors duration-300 mb-2 line-clamp-2">
                            {article.title}
                          </h2>
                        </Link>

                        <p className="text-gray-600 mb-4 line-clamp-3">
                          {truncateText(article.summary)}
                        </p>

                        {/* Article Meta */}
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            <span>
                              {formatDate(
                                article.publishedAt || article.createdAt
                              )}
                            </span>
                          </div>

                          {article.publishedBy && (
                            <div className="flex items-center gap-1">
                              <User className="w-4 h-4" />
                              <span>{article.publishedBy.fullName}</span>
                            </div>
                          )}

                          <div className="flex items-center gap-1">
                            <Eye className="w-4 h-4" />
                            <span>{article.views} lượt xem</span>
                          </div>
                        </div>

                        {/* Read More Link */}
                        <Link
                          to={`/article/?slug=${article.slug}&title=${article.title}&id=${article._id}`}
                          className="inline-flex items-center gap-1 mt-4 text-vivanta-600 hover:text-vivanta-700 font-medium text-sm transition-colors"
                        >
                          Đọc tiếp
                          <ChevronRight className="w-4 h-4" />
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              // No Results State
              <div className="text-center py-12">
                <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-gray-800 mb-2">
                  Không tìm thấy kết quả
                </h3>
                <p className="text-gray-600 mb-4">
                  Hãy thử tìm kiếm với từ khóa khác hoặc kiểm tra lỗi chính tả.
                </p>
                <div className="space-y-2 text-sm text-gray-500">
                  <p>Gợi ý:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Sử dụng từ khóa ngắn gọn hơn</li>
                    <li>Thử các từ đồng nghĩa</li>
                    <li>Kiểm tra chính tả</li>
                    <li>Sử dụng từ khóa tổng quát hơn</li>
                  </ul>
                </div>
              </div>
            )}

            {/* Pagination */}
            <div className="py-10">
              <Pagination
                currentPage={paginationSearch?.page}
                totalPages={paginationSearch?.pages}
                onPageChange={setCurrentPage}
              />
            </div>
          </>
        )}

        {/* Initial State - No search performed */}
        {!loading && !searchTerm && (
          <div className="text-center py-12">
            <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-800 mb-2">
              Tìm kiếm bài viết y tế
            </h3>
            <p className="text-gray-600">
              Nhập từ khóa để tìm kiếm các bài viết về sức khỏe và y tế
            </p>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default SearchPage;

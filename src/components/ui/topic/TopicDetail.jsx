import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchDetailTopic } from "../../../services/topic.service";
import { useLocation, Link, useNavigate } from "react-router-dom";
import Header from "../../layout/Header";
import {
  fetchAllArticles,
  fetchArticlesByTopic,
} from "../../../services/article.service";
import { useState } from "react";
import Pagination from "../../features/Pagination";
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
  Dot,
} from "lucide-react";
import Footer from "../../../pages/user/Footer";
import { formatDateDDMMYY } from "../../../utils/formatDate";
import VoiceChatbot from "../chatbot/VoiceChatbot";
const TopicDetail = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();

  // Tách query string
  const searchParams = new URLSearchParams(location.search);
  const id = searchParams.get("id");
  const slug = searchParams.get("slug");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(3);
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [status, setStatus] = useState("published");

  const { loading, error, topic } = useSelector((state) => state.topic);
  const { articlesByTopic, articles, totalArticles, currentPage, totalPages } =
    useSelector((state) => state.article);

  useEffect(() => {
    if (id) {
      dispatch(fetchDetailTopic(id));
      dispatch(fetchArticlesByTopic(id, { page: 1, limit: 5 }));
    }
  }, [id, dispatch]);

  useEffect(() => {
    dispatch(
      fetchAllArticles({
        page,
        limit,
        sortBy,
        sortOrder,
        status,
        topic: id,
      })
    );
  }, [page, limit, sortBy, sortOrder, status, id]);

  console.log({
    topic,
    articlesByTopic,
    articles,
    totalArticles,
    currentPage,
    totalPages,
  });

  const mainArticle =
    articlesByTopic && articlesByTopic.length > 0 ? articlesByTopic[0] : null;
  const sideArticles =
    articlesByTopic && articlesByTopic.length > 1
      ? articlesByTopic.slice(1)
      : [];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
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
        </div>{" "}
        <Footer />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-red-600 mb-4">
              Lỗi tải chủ đề
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
        <Footer />
      </div>
    );
  }

  // No topic found
  if (!topic) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-600 mb-4">
              Không tìm thấy chủ đề
            </h2>
            <button
              onClick={() => window.history.back()}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Quay lại
            </button>
          </div>
        </div>{" "}
        <Footer />
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col font-nunito">
      <Header />
      <VoiceChatbot />
      <div className="container mx-auto px-4 py-8">
        <div className="w-full flex items-center gap-2 pb-10">
          <div className="flex items-center gap-2 border-r-1 border-dark-700 pr-2">
            <div
              onClick={() => navigate(-1)}
              className="w-8 h-8 flex items-center justify-center border border-dark-700 rounded-full cursor-pointer"
            >
              <i className="fa-solid fa-arrow-left"></i>
            </div>
            <span>Quay lại</span>
          </div>
          <span>{topic?.name}</span>
        </div>
        {/* Topic Header */}
        <div className="mb-8">
          <div className="flex items-center gap-6 mb-6">
            {topic.image && (
              <img
                src={topic.image.url}
                alt={topic.name}
                className="w-32 h-32 object-cover rounded-lg shadow-lg"
              />
            )}
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                {topic.name}
              </h1>
              <p className="text-gray-600 text-lg leading-relaxed">
                {topic.description}
              </p>
            </div>
          </div>
        </div>
        <section className="my-12">
          <h2 className=" text-2xl font-bold mb-6">
            Kiến thức phổ biến về {topic.name}
            {articlesByTopic?.articles && (
              <span className="text-lg font-normal text-gray-600 ml-2">
                ({articlesByTopic.articles.length} bài viết)
              </span>
            )}
          </h2>

          {/* Hiển thị thông báo khi không có dữ liệu */}
          {(!articlesByTopic || articlesByTopic.length === 0) && (
            <div className="text-center py-8">
              <p className="text-gray-500">
                Không có bài viết nào để hiển thị.
              </p>
            </div>
          )}

          {/* Hiển thị nội dung khi có dữ liệu */}
          {articlesByTopic && articlesByTopic.length > 0 && (
            <div className="w-full flex gap-5 rounded-md">
              <Link
                to={`/article?slug=${mainArticle?.slug}&title=${mainArticle?.title}&id=${mainArticle?._id}`}
                className="w-6/12 h-fit flex flex-col p-3 cursor-pointer border-1 border-dark-900  rounded-md "
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
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-5 h-5 flex items-center justify-center bg-vivanta-cyan-400 text-light-50 rounded-sm">
                        <i className="fa-solid fa-user-doctor"></i>
                      </div>
                      <div className="flex ">
                        <span> Tác giả:</span>
                        <span className="font-bold">
                          {mainArticle?.author?.fullName}
                        </span>
                      </div>{" "}
                      <Dot />
                      <div className="flex items-center gap-1 text-dark-400">
                        <span> {mainArticle?.views} lượt xem</span>
                        <Dot />
                        <span>
                          Ngày đăng:{" "}
                          {formatDateDDMMYY(mainArticle?.publishedAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
              <div className="w-6/12 h-fit flex flex-wrap  pb-5">
                {sideArticles.map((article) => (
                  <Link
                    to={`/article?slug=${article?.slug}&id=${article?._id}&tilte=${article?.title}`}
                    key={article._id}
                    className="w-6/12 pr-3 pb-3 "
                  >
                    <div className="w-full flex flex-col p-3 cursor-pointer border-1 border-dark-900  rounded-md hover:translate-y-[-3px] transition-all duration-300">
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
          )}
        </section>
        <div className="w-full flex flex-col ">
          {topic.children && topic.children.length > 0 && (
            <div className="mb-6">
              <h1 className="font-bold text-2xl pb-6">
                Khám phá thêm các chuyên mục về {topic?.name}
              </h1>
              <div className="flex flex-wrap  pl-2">
                {topic.children.map((child) => (
                  <Link
                    key={child._id}
                    to={`/topic?id=${child._id}&slug=${child.name}`}
                    className="min-w-[250px] w-3/12 pr-3 mt-3 cursor-pointer "
                  >
                    <div className=" flex items-center gap-2 border-1 border-dark-800  py-2 rounded-md px-2 shadow">
                      <img
                        className="w-16 h-16 object-cover aspect-square rounded-md"
                        src={child?.image?.url}
                        alt=""
                      />
                      <span className="font-bold">{child?.name}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="w-8/12 flex flex-col my-12">
          <h2 className=" text-2xl font-bold mb-6">
            Xem thêm bài viết về {topic.name}
            {articlesByTopic?.articles && (
              <span className="text-lg font-normal text-gray-600 ml-2">
                ({articlesByTopic.articles.length} bài viết)
              </span>
            )}
          </h2>

          {articles && articles.length > 0 ? (
            <div className="grid gap-6">
              {articles?.map((article) => (
                <Link
                  to={`/article?slug=${article?.slug}&id=${article?._id}&title=${article?.title}`}
                  key={article._id}
                  className="w-full flex gap-4 p-4 cursor-pointer border border-gray-200 rounded-lg hover:shadow-lg hover:translate-y-[-2px] transition-all duration-300 bg-white"
                >
                  <img
                    className="w-42 aspect-[16/9] object-cover rounded-md flex-shrink-0"
                    src={article?.thumbnail?.url}
                    alt={article?.title || ""}
                  />
                  <div className="flex flex-col flex-1">
                    <div className="text-vivanta-500 mb-2">
                      {article?.topics?.map((topic, index) => (
                        <span key={topic._id}>
                          {topic?.name}
                          {index < article.topics.length - 1 && ", "}
                        </span>
                      ))}
                    </div>
                    <h3 className="font-bold text-xl line-clamp-2 py-1 min-h-12 text-gray-800">
                      {article?.title}
                    </h3>
                    <p className="line-clamp-2 text-gray-600 text-sm mt-2 mb-4 flex-1">
                      {article?.summary}
                    </p>
                    <div className="flex items-center gap-2 text-sm text-gray-500 mt-auto">
                      <div className="w-5 h-5 flex items-center justify-center bg-vivanta-cyan-400 text-light-50 rounded-sm text-[0.8rem]">
                        <i className="fa-solid fa-user-doctor"></i>
                      </div>
                      <span>Tác giả:</span>
                      <span className="font-bold text-gray-700">
                        {article?.author?.fullName}
                      </span>
                      <span className="mx-2">•</span>
                      <span>{article?.views || 0} lượt xem</span>
                      <span className="mx-2">•</span>
                      <span>
                        {new Date(article?.publishedAt).toLocaleDateString(
                          "vi-VN"
                        )}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">
                <i className="fa-solid fa-newspaper"></i>
              </div>
              <h3 className="text-xl font-semibold text-gray-600 mb-2">
                Chưa có bài viết nào
              </h3>
              <p className="text-gray-500">
                Hiện tại chưa có bài viết nào trong chủ đề này.
              </p>
            </div>
          )}

          {/* Pagination */}
          <div className="my-6">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default TopicDetail;

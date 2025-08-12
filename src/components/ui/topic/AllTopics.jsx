import React, { useEffect } from "react";
import { useTheme } from "../../../hook/useTheme";
import Header from "../../layout/Header";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllTopics } from "../../../services/topic.service";
import Footer from "../../../pages/user/Footer";
import Loading from "../../../pages/Loading";
import { Link } from "react-router-dom";
import { getCollectionActive } from "../../../services/chatbot.service";
import VoiceChatbot from "../chatbot/VoiceChatbot";

const AllTopics = () => {
  const { isDarkMode } = useTheme();
  const dispatch = useDispatch();
  const { loading, topics } = useSelector((state) => state.topic);

  useEffect(() => {
    dispatch(fetchAllTopics({ page: 1, limit: 100 }));
  }, []);

  if (loading) {
    return <Loading />;
  }

  return (
    <div
      className={`w-full flex flex-col font-nunito ${
        isDarkMode ? "bg-light-50 text-dark-50" : "bg-dark-200 text-light-50"
      }`}
    >
      <Header />
      <VoiceChatbot />
      <div
        style={{ minHeight: "calc(100vh - 63px)" }}
        className="container flex flex-col items-center gap-10 mx-auto py-10 px-6 "
      >
        <h1 className="w-full text-center font-bold text-2xl">
          Bạn đang tìm kiếm chuyên mục nào?
        </h1>
        <div className="w-[80%] flex items-center gap-2 border-1 border-dark-800 px-2 py-2  rounded-md">
          <input
            className="outline-none flex-1 px-2 "
            type="text"
            placeholder="Tìm kiếm chuyên mục"
          />
          <button className="px-12 py-1 bg-vivanta-500 rounded-md text-light-50">
            <i className="fa-solid fa-magnifying-glass"></i>
          </button>
        </div>

        <div className="w-full flex flex-wrap ml-2">
          {!loading &&
            topics?.length > 0 &&
            topics?.map((topic) => (
              <Link
                to={`/topic?name=${topic?.name}&id=${topic?._id}`}
                key={topic._id}
                className="min-w-[250px] w-3/12 pr-3 mt-3 cursor-pointer"
              >
                <div className=" flex items-center gap-2 border-1 border-dark-800  py-2 rounded-md px-2">
                  <img
                    className="w-16 h-16 object-cover aspect-square rounded-md"
                    src={topic?.image?.url}
                    alt=""
                  />
                  <span className="font-bold">{topic.name}</span>
                </div>
              </Link>
            ))}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default AllTopics;

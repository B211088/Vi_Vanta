import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllTopics } from "../../../services/topic.service";
import { Link } from "react-router-dom";

const TopicFavorite = () => {
  const dispatch = useDispatch();
  const { loading, topics } = useSelector((state) => state.topic);
  useEffect(() => {
    dispatch(fetchAllTopics({ page: 1, limit: 5 }));
  }, []);

  return (
    <div className="w-full flex justify-center items-center  py-2 px-5 ">
      <div className=" flex items-center gap-2 py-2 overflow-x-auto">
        <Link
          to="/topics"
          className="flex items-center gap-1  rounded-md px-2 py-1 cursor-pointer bg-dark-900 shadow-sm"
        >
          <i className="fa-solid fa-list-ul"></i>
          <span className="mt-[2px] text-sm text-dark-300 text-nowrap">
            Tất cả chuyên mục
          </span>
        </Link>
        {!loading && topics?.length > 0 ? (
          topics?.map((topic) => (
            <Link
              to={`/topic?name=${topic?.name}&id=${topic?._id}`}
              key={topic._id}
              className="w-fit flex items-center gap-1 text-nowrap  rounded-md px-2 py-1 cursor-pointer bg-dark-900 shadow-sm"
            >
              <img
                className="w-5 h-5 aspect-square rounded-sm"
                src={topic?.image.url}
                alt=""
              />
              <span className="mt-[2px] text-sm text-dark-300 ">
                {topic?.name}
              </span>
            </Link>
          ))
        ) : (
          <div className=""></div>
        )}
      </div>
    </div>
  );
};

export default TopicFavorite;

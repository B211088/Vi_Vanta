import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, Outlet, useLocation, useSearchParams } from "react-router-dom";
import { getDetailCollection } from "../../../../services/collection.service";
import { formatDateDDMMYYHHMMSS } from "../../../../utils/formatDate";

const Collection = () => {
  const { laoding, collection } = useSelector((state) => state.collection);
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const id = searchParams.get("id");
  useEffect(() => {
    dispatch(getDetailCollection(id));
  }, [id, dispatch]);

  console.log({ collection });
  return (
    <div className="flex-1 flex flex-col  overflow-hidden ">
      <div className="w-full  flex items-center border-b-[1px]  border-dark-700  gap-[10px]  px-[20px] py-[12px] text-[1.2rem]">
        <h1>Data Collections</h1>
      </div>
      <div className="w-full  flex items-center  gap-[10px]  px-[20px] py-[5px]  text-[1.2rem]">
        {routes.map((item) => (
          <Link
            key={item.id}
            to={`/ai-manager/collection/${item.path}?id=${id}`}
            className={`px-[15px] py-[6px] flex items-center gap-[10px]  rounded-md border-1  cursor-pointer ${
              location.pathname.includes(item.path)
                ? "border-blue-500 text-blue-500 font-bold"
                : "text-dark-400  border-dark-800"
            }
            )}`}
          >
            {item.icon ? <i className={`${item.icon} text-md`}></i> : ""}
            <span className="text-sm truncate">{item.name}</span>
          </Link>
        ))}
      </div>
      <Outlet />
    </div>
  );
};

export default Collection;

const routes = [
  {
    id: "data",
    icon: "fa-solid fa-book",
    path: "data",
    name: "Dữ liệu",
  },
  {
    id: "detail",
    icon: null,
    path: "detail",
    name: "Chi tiết",
  },
];

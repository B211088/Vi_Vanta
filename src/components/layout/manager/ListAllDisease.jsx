import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, Outlet } from "react-router-dom";
import { getAllDiseasesHandle } from "../../../services/disease.service";

const ListAllDisease = () => {
  const isDarkMode = true;
  const dispatch = useDispatch();
  const { diseases } = useSelector((state) => state.disease);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  console.log({ diseases });

  useEffect(() => {
    dispatch(getAllDiseasesHandle(page, limit));
  }, [page, limit]);

  const pagination = diseases.pagination || { currentPage: 1, totalPages: 1 };

  return (
    <div className="w-full h-full flex  gap-[10px] overflow-hidden   ">
      <div className="w-7/12  flex flex-col gap-[10px] border-[1px] border-dark-800 rounded-lg p-[10px]">
        <div className="w-full h-fit flex items-center justify-end gap-[10px]  ">
          <div
            className={`w-5/12 flex items-center border-[1px] ${
              isDarkMode
                ? " border-dark-700 "
                : "bg-dark-400 border-transparent"
            }  rounded-sm`}
          >
            <input
              className="flex-1  text-sm px-[5px] py-[8px] outline-none "
              placeholder="Tìm kiếm"
              name="password"
            />
            <div className="px-[8px] flex justify-center items-center cursor-pointer">
              <i className="fa-solid fa-magnifying-glass"></i>
            </div>
          </div>
          <select
            className={`w-2/12 h-fit flex items-center border-[1px] py-[7px] outline-none text-sm ${
              isDarkMode ? "border-dark-700" : "bg-dark-400 border-transparent"
            } rounded-sm`}
            name="gender"
          >
            <option value="" disabled>
              Phân loại
            </option>
            <option value="female">Nữ</option>
          </select>
        </div>
        <ul
          style={{ maxHeight: "calc(100vh - 272px)" }}
          className="w-full h-full overflow-y-auto flex flex-col gap-[10px] p-[10px]  border-[1px] border-dark-800 rounded-md "
        >
          {diseases.diseases ? (
            diseases.diseases?.map((disease) => (
              <Link
                to={disease._id}
                key={disease._id}
                className="w-full flex items-center gap-[20px] justify-between border-[1px] border-dark-800 rounded-md px-[8px] py-[8px] cursor-pointer text-sm"
              >
                <img
                  className="w-[30px] h-[30px] object-cover aspect-square rounded-sm"
                  src={disease.thumbnail?.url}
                  alt=""
                />
                <div className="w-4/12">
                  <span>{disease.name ? disease.name : ""}</span>
                </div>
                <div className="w-4/12 truncate">
                  <span>
                    {disease.scientificName ? disease.scientificName : ""}
                  </span>
                </div>

                <div className="w-4/12 truncate flex justify-end">
                  <span> {disease.isActive ? "Đã duyệt" : "Chờ duyệt"}</span>
                </div>
              </Link>
            ))
          ) : (
            <div className=""></div>
          )}
        </ul>
        {/* Pagination controls */}
        <div className="flex justify-center items-center   gap-2 ">
          <button
            disabled={pagination.currentPage === 1}
            onClick={() => setPage(page - 1)}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Trang trước
          </button>
          {[...Array(pagination.totalPages)].map((_, idx) => (
            <button
              key={idx}
              onClick={() => setPage(idx + 1)}
              className={`px-3 py-1 border rounded ${
                page === idx + 1 ? "bg-blue-500 text-white" : ""
              }`}
            >
              {idx + 1}
            </button>
          ))}
          <button
            disabled={pagination.currentPage === pagination.totalPages}
            onClick={() => setPage(page + 1)}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Trang sau
          </button>
        </div>
      </div>
      <div
        style={{ maxHeight: "calc(100vh - 160px)" }}
        className="w-5/12  overflow-y-auto flex border-[1px] border-dark-800 rounded-lg p-[15px]"
      >
        <Outlet />
      </div>
    </div>
  );
};

export default ListAllDisease;

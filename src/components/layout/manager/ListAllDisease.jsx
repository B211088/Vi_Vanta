import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, Outlet, useParams } from "react-router-dom";
import { getAllDiseasesHandle } from "../../../services/disease.service";
import { formatDateDDMMYY } from "../../../utils/formatDate";
import Pagination from "../../features/Pagination";

const ListAllDisease = () => {
  const isDarkMode = true;
  const dispatch = useDispatch();
  const { diseases } = useSelector((state) => state.disease);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [status, setStatus] = useState("all");
  const params = useParams();
  console.log({ params });

  useEffect(() => {
    dispatch(getAllDiseasesHandle(page, limit, status));
  }, [page, limit, status]);

  const diseaseFilterByStatusHandle = (status) => {
    setStatus(status);
  };

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
            onChange={(e) => diseaseFilterByStatusHandle(e.target.value)}
            name="gender"
          >
            <option value="" disabled>
              Trạng thái
            </option>
            <option value="all">Tất cả</option>
            <option value="active">Hiển thị</option>
            <option value="nonActive">Đã ẩn</option>
          </select>
        </div>
        <div className="w-full h-full flex flex-col gap-[10px]   border-[1px] border-dark-800 rounded-md ">
          <div className="w-full flex items-center gap-[20px] justify-between border-b-[1px] pl-[18px] pr-[34px] border-dark-800 font-bold  py-[10px] cursor-pointer text-sm">
            <div className="w-1/12 text-nowrap ">
              <span>Mã ICD10</span>
            </div>
            <div className="w-4/12 text-nowrap truncate">
              <span>Tên bệnh</span>
            </div>
            <div className="w-3/12 text-nowrap truncate">
              <span>Tên khoa học</span>
            </div>
            <div className="w-2/12 text-nowrap truncate">
              <span>Thời gian tạo</span>
            </div>
            <div className="w-2/12 text-nowrap  flex justify-end">
              <span>Trạng thái</span>
            </div>
          </div>
          <ul
            style={{ maxHeight: "calc(100vh - 330px)" }}
            className="w-full flex flex-col gap-[10px]  overflow-y-auto p-[10px]"
          >
            {diseases.diseases ? (
              diseases.diseases?.map((disease) => (
                <Link
                  to={`${disease._id}?name=${encodeURIComponent(
                    disease.name
                  )}?icd10code=${encodeURIComponent(disease.icd10Code)}`}
                  key={`disease._id`}
                  className={`w-full flex items-center gap-[20px] justify-between border-[1px] border-dark-800 rounded-md px-[8px] py-[10px] cursor-pointer text-sm ${
                    params.id === disease._id ? "bg-dark-800 font-bold" : ""
                  }`}
                >
                  <div className="w-1/12 text-nowrap truncate ">
                    <span>{disease.icd10Code ? disease.icd10Code : ""}</span>
                  </div>
                  <div className="w-4/12 ">
                    <span>{disease.name ? disease.name : ""}</span>
                  </div>
                  <div className="w-3/12 text-nowrap truncate">
                    <span>
                      {disease.scientificName ? disease.scientificName : ""}
                    </span>
                  </div>
                  <div className=" w-2/12 text-nowrap truncate">
                    <span>
                      {disease.createdAt
                        ? formatDateDDMMYY(disease.createdAt)
                        : ""}
                    </span>
                  </div>
                  <div className="w-2/12 truncate flex justify-end">
                    <span> {disease.isActive ? "Hiển thị" : "Đã ẩn"}</span>
                  </div>
                </Link>
              ))
            ) : (
              <div className=""></div>
            )}
          </ul>
        </div>
        <Pagination
          currentPage={page}
          totalPages={pagination.totalPages}
          onPageChange={setPage}
        />
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

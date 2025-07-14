import React from "react";

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;
  const pages = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
  } else {
    if (currentPage <= 4) {
      pages.push(1, 2, 3, 4, 5, "...", totalPages);
    } else if (currentPage >= totalPages - 3) {
      pages.push(
        1,
        "...",
        totalPages - 4,
        totalPages - 3,
        totalPages - 2,
        totalPages - 1,
        totalPages
      );
    } else {
      pages.push(
        1,
        "...",
        currentPage - 1,
        currentPage,
        currentPage + 1,
        "...",
        totalPages
      );
    }
  }
  return (
    <div className="flex justify-center items-center gap-2 ">
      <button
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
        className="w-[33px] h-[33px] flex items-center justify-center aspect-square border rounded cursor-pointer disabled:opacity-50"
      >
        <i className="fa-solid fa-caret-left"></i>
      </button>
      {pages.map((p, idx) =>
        p === "..." ? (
          <span key={"ellipsis-" + idx} className="px-2">
            ...
          </span>
        ) : (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className={`w-[33px] h-[33px] flex items-center justify-center aspect-square border rounded cursor-pointer  ${
              currentPage === p ? "bg-blue-500 text-white" : ""
            }`}
          >
            {p}
          </button>
        )
      )}
      <button
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        className="w-[33px] h-[33px] flex items-center justify-center aspect-square border rounded cursor-pointer disabled:opacity-50"
      >
        <i className="fa-solid fa-caret-right"></i>
      </button>
    </div>
  );
};

export default Pagination;

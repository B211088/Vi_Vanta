import React from "react";

const SelectListBox = ({
  title,
  items,
  onSelect,
  loading,
  selectedText,
  emptyText,
}) => (
  <div className="w-full flex flex-col">
    <div
      className={`w-full flex flex-col items-center border-primary outline-none text-sm rounded-sm`}
    >
      <div className="w-full flex justify-between py-[5px] px-[10px] ">
        <span className="text-sm font-bold pb-[5px]">{title}</span>
        <span
          className="text-sm text-blue-500 cursor-pointer"
          onClick={loading ? undefined : onSelect}
          style={loading ? { pointerEvents: "none", opacity: 0.5 } : {}}
        >
          {selectedText || "Chọn"}
        </span>
      </div>
      <div className="w-full min-h-[110px] max-h-[200px] overflow-y-auto flex flex-col gap-[5px] border-t-[1px] border-dashed border-dark-800 p-[5px]">
        {items.length > 0 ? (
          items.map((item) => (
            <div
              key={item._id}
              className="w-full flex flex-col border-[1px] border-dark-800 p-[5px] rounded-md"
            >
              <div className="w-full flex items-center">{item.name}</div>
            </div>
          ))
        ) : (
          <div className="w-full flex justify-center">
            <span>{emptyText}</span>
          </div>
        )}
      </div>
    </div>
  </div>
);

export default SelectListBox;

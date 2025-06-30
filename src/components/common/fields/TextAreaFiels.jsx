import React from "react";
import { useTheme } from "../../../hook/useTheme";

const TextAreaFiels = ({
  name,
  label,
  type,
  placeholder,
  onChange,
  disabled,
  height,
  value,
}) => {
  const { isDarkMode } = useTheme();
  return (
    <div className="w-full flex flex-col">
      <div
        className={`w-full flex flex-col  border-primary ${
          isDarkMode ? " border-dark-600 " : "bg-dark-400 border-transparent"
        }  rounded-sm`}
      >
        <div className="w-full flex justify-between py-[5px] px-[10px] ">
          <span className="text-sm font-bold pb-[5px]">{label}</span>
        </div>
        <textarea
          style={{
            minHeight: `${height}px`,
            maxHeight: `${height + 120}px`,
          }}
          className={`flex-1 text-[0.84rem] px-[10px] py-[8px] text-justify outline-none border-t-[1px] border-dashed border-dark-800`}
          name={name}
          type={type}
          placeholder={placeholder}
          onChange={onChange}
          disabled={disabled}
          value={value}
        />
      </div>
    </div>
  );
};

export default TextAreaFiels;

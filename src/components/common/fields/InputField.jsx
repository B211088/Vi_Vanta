import React from "react";
import { useTheme } from "../../../hook/useTheme";

const InputField = ({
  label,
  name,
  type,
  placeholder,
  onChange,
  disabled,
  value,
}) => {
  const { isDarkMode } = useTheme();
  return (
    <div className="w-full flex flex-col">
      <div
        className={`w-full flex flex-col border-primary ${
          isDarkMode ? " border-dark-600 " : "bg-dark-400 border-transparent"
        }  rounded-sm`}
      >
        <div className="w-full flex justify-between py-[5px] px-[10px] border-b-[1px] border-dashed border-dark-800 ">
          <span className="text-sm font-bold ">{label}</span>
        </div>
        <input
          className="flex-1  text-[0.84rem] px-[10px] py-[8px] outline-none"
          name={name}
          type={type}
          value={value}
          placeholder={placeholder}
          onChange={onChange}
          disabled={disabled}
        />
      </div>
    </div>
  );
};

export default InputField;

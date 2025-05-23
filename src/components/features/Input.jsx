import React from "react";

const Input = ({
  label,
  placeholder,
  name,
  type = "text",
  value,
  onChange,
  isDarkMode = false,
  required = false,
  disabled = false,
  readOnly = false,
  error = false,
  helperText = "",
  maxLength,
  icon, // optional JSX icon
}) => {
  const borderStyle = error
    ? "border-red-500"
    : isDarkMode
    ? "border-dark-600"
    : "bg-dark-400 border-transparent";

  return (
    <div className="w-full flex flex-col gap-1">
      {label && <span className="text-sm font-bold">{label}</span>}

      <div
        className={`w-full flex items-center border-[1px] ${borderStyle} rounded-sm px-2 ${
          disabled ? "opacity-50 cursor-not-allowed" : ""
        }`}
      >
        {icon && <div className="mr-2">{icon}</div>}

        <input
          className={`flex-1 text-sm py-[8px] outline-none bg-transparent ${
            disabled || readOnly ? "cursor-not-allowed" : ""
          }`}
          placeholder={placeholder}
          type={type}
          name={name}
          value={value}
          required={required}
          onChange={onChange}
          disabled={disabled}
          readOnly={readOnly}
          maxLength={maxLength}
        />
      </div>

      {helperText && (
        <span className={`text-xs ${error ? "text-red-500" : "text-gray-500"}`}>
          {helperText}
        </span>
      )}
    </div>
  );
};

export default Input;

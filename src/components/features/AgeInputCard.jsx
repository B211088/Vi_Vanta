import React, { useState } from "react";
import { Calendar } from "lucide-react";

const AgeInputCard = ({ onAgeChange }) => {
  const [age, setAge] = useState("");

  const handleChange = (e) => {
    const value = e.target.value;
    if (/^\d{0,3}$/.test(value)) {
      setAge(value);
      if (onAgeChange && value) {
        const num = parseInt(value);
        if (num >= 1 && num <= 120) {
          onAgeChange(num);
        }
      }
    }
  };

  return (
    <div className="relative w-full max-w-sm mx-auto mt-16">
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-600 blur-xl rounded-2xl opacity-30 animate-pulse z-0"></div>

      <div className="relative z-10 bg-white/90 backdrop-blur-lg border border-blue-100 shadow-2xl rounded-2xl px-6 py-8 transition-all duration-300">
        <div className="flex items-center mb-6">
          <div className="bg-blue-100 p-2 rounded-full mr-3 shadow-inner">
            <Calendar className="h-5 w-5 text-blue-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-700 tracking-wide">
            Tuổi của bạn
          </h2>
        </div>

        <div className="relative">
          <input
            type="text"
            id="age"
            value={age}
            onChange={handleChange}
            placeholder=" "
            className="peer w-full text-center text-3xl font-bold text-gray-900 bg-transparent border-b-2 border-blue-400 focus:outline-none focus:border-indigo-500 transition-all tracking-widest"
          />
          <label
            htmlFor="age"
            className="absolute top-1/2 left-0 transform -translate-y-1/2 text-gray-400 text-base peer-focus:top-0 peer-focus:text-sm peer-focus:text-indigo-500 peer-placeholder-shown:top-1/2 peer-placeholder-shown:text-base transition-all px-1"
          >
            Nhập tuổi (1 - 120)
          </label>
        </div>
      </div>
    </div>
  );
};

export default AgeInputCard;

import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  createBMI,
  createEMM,
  createBodyFat,
  createWHR,
} from "../../services/bodyIndex.service";

const BodyIndexCalculator = () => {
  const dispatch = useDispatch();
  const { loading, error, bmiRecord, emmRecord, bodyFatRecord, whrRecord } =
    useSelector((state) => state.bodyIndex);

  // State cho từng form
  const [bmiInput, setBmiInput] = useState({ weight: "", height: "" });
  const [emmInput, setEmmInput] = useState({
    weight: "",
    height: "",
    age: "",
    gender: "male",
    activityLevel: "sedentary",
  });
  const [bodyFatInput, setBodyFatInput] = useState({
    gender: "male",
    waist: "",
    neck: "",
    hip: "",
    height: "",
    weight: "",
  });
  const [whrInput, setWhrInput] = useState({ waist: "", hip: "" });

  // State cho lỗi nhập liệu
  const [inputError, setInputError] = useState("");

  // Validate helpers
  const isPositive = (v) => v !== "" && !isNaN(v) && Number(v) > 0;
  const isGender = (v) => v === "male" || v === "female";
  const isActivity = (v) =>
    ["sedentary", "light", "moderate", "active", "very_active"].includes(v);

  // Handlers cho từng form
  const handleBMI = (e) => {
    e.preventDefault();
    setInputError("");
    if (!isPositive(bmiInput.weight) || !isPositive(bmiInput.height)) {
      setInputError("Cân nặng và chiều cao phải là số dương.");
      return;
    }
    dispatch(
      createBMI({
        weight: Number(bmiInput.weight),
        height: Number(bmiInput.height),
      })
    );
  };
  const handleEMM = (e) => {
    e.preventDefault();
    setInputError("");
    if (
      !isPositive(emmInput.weight) ||
      !isPositive(emmInput.height) ||
      !isPositive(emmInput.age) ||
      !isGender(emmInput.gender) ||
      !isActivity(emmInput.activityLevel)
    ) {
      setInputError("Vui lòng nhập đầy đủ và hợp lệ các trường EMM.");
      return;
    }
    dispatch(
      createEMM({
        weight: Number(emmInput.weight),
        height: Number(emmInput.height),
        age: Number(emmInput.age),
        gender: emmInput.gender,
        activityLevel: emmInput.activityLevel,
      })
    );
  };
  const handleBodyFat = (e) => {
    e.preventDefault();
    setInputError("");
    if (
      !isGender(bodyFatInput.gender) ||
      !isPositive(bodyFatInput.waist) ||
      !isPositive(bodyFatInput.neck) ||
      !isPositive(bodyFatInput.height) ||
      !isPositive(bodyFatInput.weight) ||
      (bodyFatInput.gender === "female" && !isPositive(bodyFatInput.hip))
    ) {
      setInputError("Vui lòng nhập đầy đủ và hợp lệ các trường Body Fat.");
      return;
    }
    dispatch(
      createBodyFat({
        gender: bodyFatInput.gender,
        waist: Number(bodyFatInput.waist),
        neck: Number(bodyFatInput.neck),
        hip: bodyFatInput.hip ? Number(bodyFatInput.hip) : undefined,
        height: Number(bodyFatInput.height),
        weight: Number(bodyFatInput.weight),
      })
    );
  };
  const handleWHR = (e) => {
    e.preventDefault();
    setInputError("");
    if (!isPositive(whrInput.waist) || !isPositive(whrInput.hip)) {
      setInputError("Vòng eo và vòng mông phải là số dương.");
      return;
    }
    dispatch(
      createWHR({
        waist: Number(whrInput.waist),
        hip: Number(whrInput.hip),
      })
    );
  };

  // UI helper
  const inputClass =
    "border rounded px-3 py-2 mb-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-400";
  const labelClass = "block mb-1 font-medium";
  const sectionClass =
    "bg-white shadow-md rounded-lg p-6 mb-6 border border-gray-200 max-w-md w-full mx-auto";
  const buttonClass =
    "bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded mt-2 disabled:opacity-60";

  return (
    <div className="flex flex-col gap-6 items-center w-full">
      <h2 className="text-2xl font-bold mb-2 text-blue-700">
        Tính toán các chỉ số cơ thể
      </h2>
      {(inputError || error) && (
        <div className="text-red-600 font-semibold mb-2">
          {inputError || error}
        </div>
      )}
      {/* BMI */}
      <form onSubmit={handleBMI} className={sectionClass}>
        <h3 className="text-lg font-semibold mb-3 text-blue-600">BMI</h3>
        <label className={labelClass}>Cân nặng (kg)</label>
        <input
          type="number"
          className={inputClass}
          value={bmiInput.weight}
          onChange={(e) => setBmiInput({ ...bmiInput, weight: e.target.value })}
          min={1}
          required
        />
        <label className={labelClass}>Chiều cao (cm)</label>
        <input
          type="number"
          className={inputClass}
          value={bmiInput.height}
          onChange={(e) => setBmiInput({ ...bmiInput, height: e.target.value })}
          min={1}
          required
        />
        <button type="submit" className={buttonClass} disabled={loading}>
          Tính BMI
        </button>
        {bmiRecord && (
          <div className="mt-2">
            Kết quả BMI: <b>{bmiRecord.bmi}</b>
          </div>
        )}
      </form>
      {/* EMM */}
      <form onSubmit={handleEMM} className={sectionClass}>
        <h3 className="text-lg font-semibold mb-3 text-blue-600">
          EMM (BMR/TDEE)
        </h3>
        <label className={labelClass}>Cân nặng (kg)</label>
        <input
          type="number"
          className={inputClass}
          value={emmInput.weight}
          onChange={(e) => setEmmInput({ ...emmInput, weight: e.target.value })}
          min={1}
          required
        />
        <label className={labelClass}>Chiều cao (cm)</label>
        <input
          type="number"
          className={inputClass}
          value={emmInput.height}
          onChange={(e) => setEmmInput({ ...emmInput, height: e.target.value })}
          min={1}
          required
        />
        <label className={labelClass}>Tuổi</label>
        <input
          type="number"
          className={inputClass}
          value={emmInput.age}
          onChange={(e) => setEmmInput({ ...emmInput, age: e.target.value })}
          min={1}
          required
        />
        <label className={labelClass}>Giới tính</label>
        <select
          className={inputClass}
          value={emmInput.gender}
          onChange={(e) => setEmmInput({ ...emmInput, gender: e.target.value })}
        >
          <option value="male">Nam</option>
          <option value="female">Nữ</option>
        </select>
        <label className={labelClass}>Mức độ vận động</label>
        <select
          className={inputClass}
          value={emmInput.activityLevel}
          onChange={(e) =>
            setEmmInput({ ...emmInput, activityLevel: e.target.value })
          }
        >
          <option value="sedentary">Ít vận động</option>
          <option value="light">Vận động nhẹ</option>
          <option value="moderate">Vận động vừa</option>
          <option value="active">Vận động nhiều</option>
          <option value="very_active">Rất nhiều</option>
        </select>
        <button type="submit" className={buttonClass} disabled={loading}>
          Tính EMM
        </button>
        {emmRecord && (
          <div className="mt-2">
            <div>
              BMR: <b>{emmRecord.bmr}</b>
            </div>
            <div>
              TDEE: <b>{emmRecord.tdee}</b>
            </div>
          </div>
        )}
      </form>
      {/* Body Fat */}
      <form onSubmit={handleBodyFat} className={sectionClass}>
        <h3 className="text-lg font-semibold mb-3 text-blue-600">Body Fat</h3>
        <label className={labelClass}>Giới tính</label>
        <select
          className={inputClass}
          value={bodyFatInput.gender}
          onChange={(e) =>
            setBodyFatInput({ ...bodyFatInput, gender: e.target.value })
          }
        >
          <option value="male">Nam</option>
          <option value="female">Nữ</option>
        </select>
        <label className={labelClass}>Vòng eo (cm)</label>
        <input
          type="number"
          className={inputClass}
          value={bodyFatInput.waist}
          onChange={(e) =>
            setBodyFatInput({ ...bodyFatInput, waist: e.target.value })
          }
          min={1}
          required
        />
        <label className={labelClass}>Vòng cổ (cm)</label>
        <input
          type="number"
          className={inputClass}
          value={bodyFatInput.neck}
          onChange={(e) =>
            setBodyFatInput({ ...bodyFatInput, neck: e.target.value })
          }
          min={1}
          required
        />
        <label className={labelClass}>Vòng mông (cm) (nữ)</label>
        <input
          type="number"
          className={inputClass}
          value={bodyFatInput.hip}
          onChange={(e) =>
            setBodyFatInput({ ...bodyFatInput, hip: e.target.value })
          }
          min={bodyFatInput.gender === "female" ? 1 : undefined}
          required={bodyFatInput.gender === "female"}
        />
        <label className={labelClass}>Chiều cao (cm)</label>
        <input
          type="number"
          className={inputClass}
          value={bodyFatInput.height}
          onChange={(e) =>
            setBodyFatInput({ ...bodyFatInput, height: e.target.value })
          }
          min={1}
          required
        />
        <label className={labelClass}>Cân nặng (kg)</label>
        <input
          type="number"
          className={inputClass}
          value={bodyFatInput.weight}
          onChange={(e) =>
            setBodyFatInput({ ...bodyFatInput, weight: e.target.value })
          }
          min={1}
          required
        />
        <button type="submit" className={buttonClass} disabled={loading}>
          Tính Body Fat
        </button>
        {bodyFatRecord && (
          <div className="mt-2">
            <div>
              Tỉ lệ mỡ cơ thể: <b>{bodyFatRecord.bodyFatPercent}%</b>
            </div>
            <div>
              Khối lượng mỡ: <b>{bodyFatRecord.bodyFatMass} kg</b>
            </div>
          </div>
        )}
      </form>
      {/* WHR */}
      <form onSubmit={handleWHR} className={sectionClass}>
        <h3 className="text-lg font-semibold mb-3 text-blue-600">
          WHR (Tỉ số eo/mông)
        </h3>
        <label className={labelClass}>Vòng eo (cm)</label>
        <input
          type="number"
          className={inputClass}
          value={whrInput.waist}
          onChange={(e) => setWhrInput({ ...whrInput, waist: e.target.value })}
          min={1}
          required
        />
        <label className={labelClass}>Vòng mông (cm)</label>
        <input
          type="number"
          className={inputClass}
          value={whrInput.hip}
          onChange={(e) => setWhrInput({ ...whrInput, hip: e.target.value })}
          min={1}
          required
        />
        <button type="submit" className={buttonClass} disabled={loading}>
          Tính WHR
        </button>
        {whrRecord && (
          <div className="mt-2">
            WHR: <b>{whrRecord.whr}</b>
          </div>
        )}
      </form>
    </div>
  );
};

export default BodyIndexCalculator;

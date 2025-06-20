import React from "react";

const DiagnosisList = ({
  diagnosis,
  loading,
  addDiagnosis,
  handleDiagnosisChange,
  removeDiagnosis,
  isDarkMode,
}) => (
  <div className="w-full flex gap-[10px]">
    <div className="w-full flex flex-col">
      <div
        className={`w-full flex flex-col items-center border-primary outline-none text-sm ${
          isDarkMode ? "border-dark-600" : "bg-dark-400 border-transparent"
        } rounded-sm`}
      >
        <div className="w-full flex justify-between py-[5px] px-[10px] ">
          <span className="text-sm font-bold pb-[5px]">
            Chuẩn đoán (diagnosis)
          </span>
          <div
            className="text-sm text-blue-500 cursor-pointer"
            onClick={loading ? undefined : addDiagnosis}
            style={loading ? { pointerEvents: "none", opacity: 0.5 } : {}}
          >
            <span>Thêm chuẩn đoán </span>
          </div>
        </div>
        <div className="w-full flex flex-col gap-[10px] p-[10px]">
          {diagnosis?.map((item, idx) => (
            <div
              key={idx}
              className="w-full overflow-y-auto flex flex-col gap-2 rounded-md border-[1px] border-dark-800 p-[10px]"
            >
              <div className="w-full flex items-center justify-between">
                <h1 className="font-bold pl-[5px]">
                  Cách chuẩn đoán {idx + 1}
                </h1>
                {diagnosis?.length > 1 && (
                  <div
                    className="cursor-pointer"
                    onClick={() => removeDiagnosis(idx)}
                  >
                    xóa
                  </div>
                )}
              </div>
              <div className="w-full h-fit flex flex-col gap-[5px] rounded-md border-[1px] border-dark-800 p-[5px]">
                <input
                  className="flex-1 text-sm px-2 py-1 outline-none"
                  name="title"
                  type="text"
                  value={item.title}
                  placeholder="Tiêu đề cách chuẩn đoán"
                  onChange={(e) =>
                    handleDiagnosisChange(idx, "title", e.target.value)
                  }
                  disabled={loading}
                />
              </div>
              <div className="w-full flex flex-col gap-[5px] rounded-md border-[1px] border-dark-800 p-[5px]">
                <textarea
                  className="flex-1 min-h-[200px] max-h-[500px] text-sm px-2 py-1 outline-none"
                  name="description"
                  type="text"
                  value={item.description}
                  placeholder="Mô tả cách chuẩn đoán "
                  onChange={(e) =>
                    handleDiagnosisChange(idx, "description", e.target.value)
                  }
                  disabled={loading}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

export default DiagnosisList;

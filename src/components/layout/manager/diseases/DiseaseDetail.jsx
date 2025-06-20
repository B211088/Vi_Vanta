import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { getDiseaseByIdHandle } from "../../../../services/disease.service";

const riskLevelVN = (level) => {
  switch (level) {
    case "low":
      return "Thấp";
    case "medium":
      return "Trung bình";
    case "high":
      return "Cao";
    default:
      return level;
  }
};

const DiseaseDetail = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { loading, error, disease } = useSelector((state) => state.disease);

  useEffect(() => {
    if (id) dispatch(getDiseaseByIdHandle(id));
  }, [id, dispatch]);

  if (loading)
    return <div className="w-full text-center py-8">Đang tải...</div>;
  if (error)
    return <div className="w-full text-center py-8 text-red-500">{error}</div>;
  if (!disease || !disease._id)
    return (
      <div className="w-full text-center py-8">
        Không tìm thấy thông tin bệnh.
      </div>
    );

  return (
    <div className="w-full  flex flex-col gap-4  bg-white rounded  text-gray-800 text-sm text-justify">
      {disease.images && disease.images.length > 0 && (
        <div className="mb-4">
          <div className="font-semibold mb-2">Hình ảnh:</div>
          <div className="flex gap-3 flex-wrap mt-2">
            {disease.images.map((img) => (
              <img
                key={img._id || img.url}
                src={img.url}
                alt={disease.name}
                className="w-40 h-28 object-cover rounded border border-gray-200 shadow-sm"
              />
            ))}
          </div>
        </div>
      )}
      <h1 className="text-2xl font-bold mb-1 text-primary-700">
        {disease.name || "(Không có tên)"}
      </h1>
      {disease.scientificName && (
        <h3 className="text-base text-gray-500 mb-2 italic">
          {disease.scientificName}
        </h3>
      )}
      {disease.icd10Code && (
        <div className="mb-1">
          <span className="font-semibold">Mã ICD-10:</span> {disease.icd10Code}
        </div>
      )}
      {disease.riskLevel && (
        <div className="mb-2">
          <span className="font-semibold">Mức độ nguy cơ:</span>{" "}
          {riskLevelVN(disease.riskLevel)}
        </div>
      )}
      {disease.definition && (
        <div className="mb-2">
          <span className="font-semibold">Định nghĩa bệnh:</span>{" "}
          {disease.definition}
        </div>
      )}
      {disease.detailedArticle && (
        <div className="mb-2">
          <div className="font-semibold">Bài viết chi tiết:</div>
          <div className="whitespace-pre-line mt-1 text-gray-700">
            {disease.detailedArticle}
          </div>
        </div>
      )}
      {disease.category && disease.category.length > 0 && (
        <div className="mb-2">
          <span className="font-semibold">Danh mục:</span>{" "}
          {disease.category.map((cat) => (
            <span
              key={cat._id}
              className="inline-block bg-blue-100 text-blue-700 px-2 py-0.5 rounded mr-2 text-xs font-medium"
            >
              {cat.name}
            </span>
          ))}
        </div>
      )}
      <Section title="Triệu chứng" items={disease.symptoms} />
      <Section title="Nguyên nhân" items={disease.causes} />
      <Section title="Phương pháp điều trị" items={disease.treatments} />
      <Section title="Phòng ngừa" items={disease.preventions} />
      <Section title="Biến chứng" items={disease.complications} isStringArray />
      <Section
        title="Đối tượng  nguy cơ"
        items={disease.riskFactors}
        isStringArray
      />
      {disease.prognosis && (
        <div className="mb-2">
          <span className="font-semibold">Tiên lượng:</span>{" "}
          <span>{disease.prognosis}</span>
        </div>
      )}
      {disease.diagnosis && (
        <div className="mb-2">
          <span className="font-semibold">Chẩn đoán:</span>{" "}
          <span>{disease.diagnosis}</span>
        </div>
      )}
      {disease.references && disease.references.length > 0 && (
        <div className="mb-2">
          <div className="font-semibold">Tài liệu tham khảo:</div>
          <ul className="list-disc list-inside mt-1">
            {disease.references.map((ref, idx) => (
              <li key={idx}>{ref}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

const Section = ({ title, items, isStringArray }) => {
  if (!items || items.length === 0) return null;
  return (
    <div className="mb-2">
      <div className="font-semibold">{title}:</div>
      <ul className="list-disc list-inside mt-1 ">
        {isStringArray
          ? items.map((item, idx) => <li key={idx}>{item}</li>)
          : items.map((item) => (
              <li className="" key={item._id || item.name}>
                <span className="font-medium">{item.name}</span>
                {item.description ? `: ${item.description}` : ""}
              </li>
            ))}
      </ul>
    </div>
  );
};

export default DiseaseDetail;

// Model khởi tạo cho form tạo bệnh

import React, { useState, useRef } from "react";
import { useTheme } from "../../../hook/useTheme";
import SelectPreventionModal from "../../modals/librarymanager/SelectPreventionModal";
import SelectSymptomModal from "../../modals/librarymanager/SelectSymptomModal";
import SelectTreatmentModal from "../../modals/librarymanager/SelectTreatmentModal";
import SelectCauseModal from "../../modals/librarymanager/SelectCauseModal";
import SelectDiseaseCategoryModal from "../../modals/librarymanager/SelectDiseaseCategoryModal";
import SelectRelatedDiseasesModal from "../../modals/librarymanager/SelectRelatedDiseasesModal";
import CropImageModal from "../../../components/modals/CropImageModal";
import { useDispatch, useSelector } from "react-redux";
import { createDiseaseHandle } from "../../../services/disease.service";
import SubmitButton from "../../common/buttons/SubmitButton";
import { useNotify } from "../../../hook/useNotify";

const CreateDisease = () => {
  const { isDarkMode } = useTheme();
  const { notifySuccess, notifyError, notifyLoading, notifyWarning } =
    useNotify();
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.disease);
  const [selectPreventionModal, setSelectPreventionModal] = useState(false);
  const [selectedPreventions, setSelectedPreventions] = useState([]);
  const [selectSymptomModal, setSelectSymptomModal] = useState(false);
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [selectTreatmentModal, setSelectTreatmentModal] = useState(false);
  const [selectedTreatments, setSelectedTreatments] = useState([]);
  const [selectCauseModal, setSelectCauseModal] = useState(false);
  const [selectedCauses, setSelectedCauses] = useState([]);
  const [selectedDiseaseCategoryModal, setSelectedDiseaseCategoryModal] =
    useState(false);
  const [selectedDiseaseCategories, setSelectedDiseaseCategories] = useState(
    []
  );

  const [riskFactors, setRiskFactors] = useState([""]);
  const [complications, setComplications] = useState([""]);

  const [form, setForm] = useState({
    name: "",
    scientificName: "",
    icd10Code: "",
    definition: "",
    category: [],
    medications: [],
    symptoms: [],
    causes: [],
    treatments: [],
    preventions: [],
    riskFactors: [],
    complications: [],
    prognosis: "",
    diagnosis: "",
    riskLevel: "medium",
    relatedDiseases: [],
    references: [],
    images: [],
    isActive: false,
    version: 1,
  });

  const [selectRelatedDiseasesModal, setSelectRelatedDiseasesModal] =
    useState(false);
  const [selectedRelatedDiseases, setSelectedRelatedDiseases] = useState([]);

  const [showCropImageModal, setShowCropImageModal] = useState(false);
  const [imageToCropMulti, setImageToCropMulti] = useState(null);
  const [pendingImages, setPendingImages] = useState([]);
  const imagesInputRef = useRef();

  const [showCropThumbnailModal, setShowCropThumbnailModal] = useState(false);
  const [thumbnailToCrop, setThumbnailToCrop] = useState(null);
  const thumbnailInputRef = useRef();

  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [imagesPreview, setImagesPreview] = useState([]);

  const addRiskFators = () => {
    setRiskFactors([...riskFactors, ""]);
  };

  const addComplication = () => {
    setComplications([...complications, ""]);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleRiskFactorChange = (index, value) => {
    setRiskFactors((prev) => {
      const updated = [...prev];
      updated[index] = value;
      return updated;
    });
  };

  const handleComplicationChange = (index, value) => {
    setComplications((prev) => {
      const updated = [...prev];
      updated[index] = value;
      return updated;
    });
  };

  const handleImagesChange = (e) => {
    const files = Array.from(e.target.files);
    const allowed = Math.max(0, 5 - form.images.length);
    const filesToCrop = files.slice(0, allowed);
    if (filesToCrop.length > 0) {
      setPendingImages(filesToCrop);
      const reader = new FileReader();
      reader.onload = (ev) => {
        setImageToCropMulti(ev.target.result);
        setShowCropImageModal(true);
      };
      reader.readAsDataURL(filesToCrop[0]);
    }
  };

  const handleCropImageDone = async (croppedBlob) => {
    const blob = await fetch(croppedBlob).then((res) => res.blob());

    const uniqueName = `image-${Date.now()}-${form.images.length + 1}.jpg`;
    const file = new File([blob], uniqueName, { type: "image/jpeg" });
    setForm((prev) => ({
      ...prev,
      images: [...prev.images, file],
    }));
    setImagesPreview((prev) => [...prev, URL.createObjectURL(file)]);
    if (pendingImages.length > 1) {
      const nextImages = pendingImages.slice(1);
      setPendingImages(nextImages);
      const reader = new FileReader();
      reader.onload = (ev) => {
        setImageToCropMulti(ev.target.result);
        setShowCropImageModal(true);
      };
      reader.readAsDataURL(nextImages[0]);
    } else {
      setPendingImages([]);
      setShowCropImageModal(false);
      setImageToCropMulti(null);
    }
  };

  const handleRemoveImage = (index) => {
    setForm((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
    setImagesPreview((prev) => prev.filter((_, i) => i !== index));
    if (imagesInputRef.current) {
      imagesInputRef.current.value = "";
    }
  };

  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setThumbnailToCrop(ev.target.result);
        setShowCropThumbnailModal(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCropThumbnailDone = async (croppedBlob) => {
    console.log({ croppedBlob });
    const blob = await fetch(croppedBlob).then((res) => res.blob());
    const file = new File([blob], "thumbnail.jpg", {
      type: "image/jpeg",
    });
    setForm((prev) => ({
      ...prev,
      thumbnail: file,
    }));
    const objectURL = URL.createObjectURL(file);
    setThumbnailPreview(objectURL);
    setShowCropThumbnailModal(false);
    setThumbnailToCrop(null);
  };

  const handleRemoveThumbnail = () => {
    setForm((prev) => ({ ...prev, thumbnail: null }));
    setThumbnailPreview(null);
    if (thumbnailInputRef.current) {
      thumbnailInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate các trường bắt buộc
    if (!form.name.trim()) {
      notifyWarning("Vui lòng nhập tên bệnh!");
      return;
    }
    // Tên bệnh không chứa ký tự đặc biệt
    if (!/^[\p{L}\d\s\-]+$/u.test(form.name.trim())) {
      notifyWarning("Tên bệnh không được chứa ký tự đặc biệt!");
      return;
    }
    if (!form.scientificName.trim()) {
      notifyWarning("Vui lòng nhập tên khoa học!");
      return;
    }
    if (!form.icd10Code.trim()) {
      notifyWarning("Vui lòng nhập mã ICD10!");
      return;
    }
    // ICD10: 1 chữ cái + 2 số, có thể có dấu chấm và số phía sau (ví dụ: A00, B20.1)
    if (!/^[A-Z]\d{2}(\.\d+)?$/i.test(form.icd10Code.trim())) {
      notifyWarning("Mã ICD10 không đúng định dạng (ví dụ: A00, B20.1)!");
      return;
    }
    if (!form.definition.trim()) {
      notifyWarning("Vui lòng nhập định nghĩa bệnh!");
      return;
    }
    if (selectedDiseaseCategories.length === 0) {
      notifyWarning("Vui lòng chọn ít nhất một phân loại bệnh!");
      return;
    }

    if (!form.thumbnail) {
      notifyWarning("Vui lòng chọn ảnh thumbnail!");
      return;
    }
    if (!form.images || form.images.length === 0) {
      notifyWarning("Vui lòng chọn ít nhất một ảnh mô tả!");
      return;
    }
    if (form.images.length > 5) {
      notifyWarning("Chỉ được chọn tối đa 5 ảnh mô tả!");
      return;
    }
    if (selectedPreventions.length === 0) {
      notifyWarning("Vui lòng chọn ít nhất một nguyên nhân gây bệnh!");
      return;
    }
    if (selectedSymptoms.length === 0) {
      notifyWarning("Vui lòng chọn ít nhất một triệu chứng!");
      return;
    }
    if (selectedTreatments.length === 0) {
      notifyWarning("Vui lòng chọn ít nhất một phương pháp phòng ngừa!");
      return;
    }
    if (selectedCauses.length === 0) {
      notifyWarning("Vui lòng chọn ít nhất một phương pháp điều trị!");
      return;
    }
    // Validate riskFactors
    if (!riskFactors.length || riskFactors.some((r) => !r.trim())) {
      notifyWarning("Vui lòng nhập đầy đủ các đối tượng dễ mắc bệnh!");
      return;
    }
    // Validate complications
    if (!complications.length || complications.some((c) => !c.trim())) {
      notifyWarning("Vui lòng nhập đầy đủ các biến chứng!");
      return;
    }
    // Validate prognosis
    if (!form.prognosis.trim()) {
      notifyWarning("Vui lòng nhập tiên lượng bệnh!");
      return;
    }
    // Validate diagnosis
    if (!form.diagnosis.trim()) {
      notifyWarning("Vui lòng nhập chẩn đoán bệnh!");
      return;
    }

    const data = { ...form };
    data.category = selectedDiseaseCategories.map((cat) => cat._id);
    data.preventions = selectedPreventions.map((item) => item._id);
    data.symptoms = selectedSymptoms.map((item) => item._id);
    data.treatments = selectedTreatments.map((item) => item._id);
    data.causes = selectedCauses.map((item) => item._id);
    data.relatedDiseases = selectedRelatedDiseases.map((item) => item._id);
    data.riskFactors = riskFactors;
    data.complications = complications;

    const formData = new FormData();

    Object.entries(data).forEach(([key, value]) => {
      if (key === "images" || key === "thumbnail") return;
      if (Array.isArray(value)) {
        value.forEach((v) => formData.append(key, v));
      } else {
        formData.append(key, value);
      }
    });

    if (form.thumbnail) {
      formData.append("thumbnail", form.thumbnail);
    }

    if (form.images && form.images.length > 0) {
      form.images.forEach((img) => {
        formData.append("images", img);
      });
    }

    try {
      await dispatch(createDiseaseHandle(formData));
      notifySuccess("Tạo bệnh thành công!");
    } catch (error) {
      console.error(error);
      notifyError(error);
    }
  };

  return (
    <div className="w-full">
      {selectPreventionModal && (
        <SelectPreventionModal
          selectedPreventionsHandle={(preventions) =>
            setSelectedPreventions(preventions)
          }
          closeModal={() => setSelectPreventionModal(false)}
          currentSelected={selectedPreventions}
        />
      )}
      {selectSymptomModal && (
        <SelectSymptomModal
          closeModal={() => setSelectSymptomModal(false)}
          selectedSymptomsHandle={(symptom) => setSelectedSymptoms(symptom)}
          currentSelected={selectedSymptoms}
        />
      )}
      {selectTreatmentModal && (
        <SelectTreatmentModal
          selectedTreatmentsHandle={setSelectedTreatments}
          closeModal={() => setSelectTreatmentModal(false)}
          currentSelected={selectedTreatments}
        />
      )}
      {selectCauseModal && (
        <SelectCauseModal
          selectedCausesHandle={setSelectedCauses}
          closeModal={() => setSelectCauseModal(false)}
          currentSelected={selectedCauses}
        />
      )}
      {selectedDiseaseCategoryModal && (
        <SelectDiseaseCategoryModal
          selectedDiseaseCategoryHandle={(category) =>
            setSelectedDiseaseCategories(category)
          }
          closeModal={() => setSelectedDiseaseCategoryModal(false)}
          currentSelected={selectedDiseaseCategories}
        />
      )}
      {selectRelatedDiseasesModal && (
        <SelectRelatedDiseasesModal
          selectedRelatedDiseasesHandle={setSelectedRelatedDiseases}
          closeModal={() => setSelectRelatedDiseasesModal(false)}
          currentSelected={selectedRelatedDiseases}
        />
      )}
      <div className="w-full overflow-y-auto bg-light-50 p-[5px] rounded-lg flex flex-col gap-4">
        <div className="w-full flex items-center ">
          <h1 className="font-bold text-lg">Tạo bệnh mới</h1>
        </div>
        <form className="w-full flex flex-col gap-4 " onSubmit={handleSubmit}>
          <div className="w-full flex items-center gap-[20px]">
            <div className="w-full flex flex-col">
              <div
                className={`w-full flex flex-col border-primary ${
                  isDarkMode
                    ? " border-dark-600 "
                    : "bg-dark-400 border-transparent"
                }  rounded-sm`}
              >
                <div className="w-full flex justify-between py-[5px] px-[10px] border-b-[1px] border-dashed border-dark-800 ">
                  <span className="text-sm font-bold pb-[5px]">Tên bệnh</span>
                </div>
                <input
                  className="flex-1  text-sm px-[10px] py-[8px] outline-none"
                  name="name"
                  type="text"
                  placeholder="Thêm tên bệnh"
                  onChange={handleChange}
                  disabled={loading}
                />
              </div>
            </div>
            <div className="w-full flex flex-col">
              <div
                className={`w-full flex flex-col border-primary ${
                  isDarkMode
                    ? " border-dark-600 "
                    : "bg-dark-400 border-transparent"
                }  rounded-sm`}
              >
                <div className="w-full flex justify-between py-[5px] px-[10px] border-b-[1px] border-dashed border-dark-800 ">
                  <span className="text-sm font-bold pb-[5px]">
                    Tên khoa học
                  </span>
                </div>
                <input
                  className="flex-1  text-sm px-[10px] py-[8px] outline-none"
                  name="scientificName"
                  type="text"
                  placeholder="Thêm tên khoa học của bệnh"
                  onChange={handleChange}
                  disabled={loading}
                />
              </div>
            </div>
            <div className="w-full flex flex-col">
              <div
                className={`w-full flex flex-col border-primary ${
                  isDarkMode
                    ? " border-dark-600 "
                    : "bg-dark-400 border-transparent"
                }  rounded-sm`}
              >
                <div className="w-full flex justify-between py-[5px] px-[10px] border-b-[1px] border-dashed border-dark-800 ">
                  <span className="text-sm font-bold pb-[5px]">Mã ICD10</span>
                </div>
                <input
                  className="flex-1  text-sm px-[10px] py-[8px] outline-none"
                  name="icd10Code"
                  type="text"
                  placeholder="Thêm mã ICD10"
                  onChange={handleChange}
                  disabled={loading}
                />
              </div>
            </div>
          </div>
          <div className="w-full flex gap-[20px]">
            <div className="w-full flex flex-col">
              <div
                className={`w-full flex flex-col  border-primary ${
                  isDarkMode
                    ? " border-dark-600 "
                    : "bg-dark-400 border-transparent"
                }  rounded-sm`}
              >
                <div className="w-full flex justify-between py-[5px] px-[10px] ">
                  <span className="text-sm font-bold pb-[5px]">
                    Đinh nghĩa bệnh
                  </span>
                </div>
                <textarea
                  className="flex-1 min-h-[110px] max-h-[200px]  text-sm px-[10px] py-[8px] outline-none border-t-[1px] border-dashed border-dark-800"
                  name="definition"
                  type="text"
                  placeholder="Thêm định nghĩa về bệnh"
                  onChange={handleChange}
                  disabled={loading}
                />
              </div>
            </div>
            <div className="w-full flex gap-[10px]">
              <div className="w-full flex flex-col">
                <div
                  className={`w-full flex flex-col items-center border-primary  outline-none text-sm ${
                    isDarkMode
                      ? "border-dark-600"
                      : "bg-dark-400 border-transparent"
                  } rounded-sm`}
                >
                  <div className="w-full flex justify-between py-[5px] px-[10px] ">
                    <span className="text-sm font-bold pb-[5px]">
                      Phân loại bệnh
                    </span>
                    <span
                      className="text-sm text-blue-500 cursor-pointer"
                      onClick={
                        loading
                          ? undefined
                          : () => setSelectedDiseaseCategoryModal(true)
                      }
                      style={
                        loading ? { pointerEvents: "none", opacity: 0.5 } : {}
                      }
                    >
                      Chọn
                    </span>
                  </div>
                  <div className="w-full min-h-[110px] max-h-[200px] overflow-y-auto  flex flex-col gap-[5px] border-t-[1px] border-dashed border-dark-800  p-[5px]">
                    {selectedDiseaseCategories.length > 0 ? (
                      selectedDiseaseCategories?.map((category) => (
                        <div
                          key={category._id}
                          className="w-full flex flex-col border-[1px] border-dark-800 p-[5px] rounded-md"
                        >
                          <div className="w-full flex items-center">
                            {category.name}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="w-full flex justify-center">
                        <span>Chọn phân loại cho bệnh</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="w-full flex gap-[20px]">
            {" "}
            <div className="w-full flex flex-col items-center gap-2 border border-dashed border-blue-400 rounded-lg p-4 bg-blue-50/30 shadow-sm mt-4">
              <span className="text-base font-semibold text-blue-700 mb-2">
                Ảnh mô tả (tối đa 5 ảnh, 16:9)
              </span>
              <div className="flex flex-wrap gap-4 w-full">
                {imagesPreview.map((url, idx) => (
                  <div key={idx} className="relative group">
                    <img
                      src={url}
                      alt="disease-img"
                      className="w-[160px] h-[90px] object-cover rounded-lg border border-blue-300 shadow"
                    />
                    <button
                      type="button"
                      className="absolute top-2 right-2 bg-white/80 hover:bg-red-500 hover:text-white text-red-500 rounded-full p-1 shadow transition"
                      onClick={() => handleRemoveImage(idx)}
                      title="Xóa ảnh"
                    >
                      <i className="fa-solid fa-xmark"></i>
                    </button>
                  </div>
                ))}
                {imagesPreview.length < 5 && (
                  <label
                    htmlFor="images-upload"
                    className="flex flex-col items-center justify-center w-[160px] h-[90px] border-2 border-dashed border-blue-300 rounded-lg bg-white/60 hover:bg-blue-100 transition cursor-pointer"
                  >
                    <i className="fa-solid fa-image text-2xl text-blue-300 mb-1"></i>
                    <span className="text-blue-400 text-xs mb-1">Thêm ảnh</span>
                    <span className="text-xs text-gray-400">Tối đa 5 ảnh</span>
                  </label>
                )}
                <input
                  type="file"
                  accept="image/"
                  className="hidden"
                  id="images-upload"
                  multiple
                  onChange={handleImagesChange}
                  ref={imagesInputRef}
                  disabled={form.images.length >= 5 || loading}
                />
              </div>
            </div>
            <div className="w-full flex flex-col items-center gap-2 border border-dashed border-blue-400 rounded-lg p-4 bg-blue-50/30 shadow-sm mt-4">
              <span className="text-base font-semibold text-blue-700 mb-2">
                Ảnh thumbnail (1:1)
              </span>
              <div className="relative w-full flex flex-col items-center">
                {thumbnailPreview ? (
                  <div className="relative group">
                    <img
                      src={thumbnailPreview}
                      alt="thumbnail"
                      className="w-[220px] aspect-square object-cover rounded-lg border border-blue-300 shadow"
                    />
                    <button
                      type="button"
                      className="absolute top-2 right-2 bg-white/80 hover:bg-red-500 hover:text-white text-red-500 rounded-full p-1 shadow transition"
                      onClick={handleRemoveThumbnail}
                      title="Xóa ảnh"
                    >
                      <i className="fa-solid fa-xmark"></i>
                    </button>
                    <button
                      type="button"
                      className="absolute bottom-2 right-2 bg-white/80 hover:bg-blue-500 hover:text-white text-blue-500 rounded-full p-1 shadow transition"
                      onClick={() => setShowCropThumbnailModal(true)}
                      title="Đổi ảnh"
                    >
                      <i className="fa-solid fa-pen"></i>
                    </button>
                  </div>
                ) : (
                  <label
                    htmlFor="thumbnail-upload"
                    className="flex flex-col items-center justify-center w-[220px] aspect-square  border-2 border-dashed border-blue-300 rounded-lg bg-white/60 hover:bg-blue-100 transition cursor-pointer"
                  >
                    <i className="fa-solid fa-image text-4xl text-blue-300 mb-2"></i>
                    <span className="text-blue-400 text-sm mb-1">
                      Chưa có ảnh
                    </span>
                    <span className="text-xs text-gray-400">
                      Chọn ảnh để crop 1:1
                    </span>
                  </label>
                )}
                <input
                  type="file"
                  accept="image/"
                  className="hidden"
                  onChange={handleThumbnailChange}
                  id="thumbnail-upload"
                  ref={thumbnailInputRef}
                  disabled={loading}
                />
              </div>
            </div>
          </div>

          <div className="w-full flex  gap-[20px]">
            <div className="w-full flex gap-[10px]">
              <div className="w-full flex flex-col">
                <div
                  className={`w-full flex flex-col items-center border-primary  outline-none text-sm ${
                    isDarkMode
                      ? "border-dark-600"
                      : "bg-dark-400 border-transparent"
                  } rounded-sm`}
                >
                  <div className="w-full flex justify-between py-[5px] px-[10px] ">
                    <span className="text-sm font-bold pb-[5px]">
                      Nguyên nhân gây bệnh (cause)
                    </span>
                    <span
                      className="text-sm text-blue-500 cursor-pointer"
                      onClick={
                        loading ? undefined : () => setSelectCauseModal(true)
                      }
                      style={
                        loading ? { pointerEvents: "none", opacity: 0.5 } : {}
                      }
                    >
                      Chọn
                    </span>
                  </div>
                  <div className="w-full min-h-[110px] max-h-[200px] overflow-y-auto  flex flex-col gap-[5px] border-t-[1px] border-dashed border-dark-800  p-[5px]">
                    {selectedCauses.length > 0 ? (
                      selectedCauses.map((cause) => (
                        <div
                          key={cause._id}
                          className="w-full flex flex-col border-[1px] border-dark-800 p-[5px] rounded-md"
                        >
                          <div className="w-full flex items-center">
                            {cause.name}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="w-full flex justify-center">
                        <span>Chọn các nguyên nhân gây bệnh</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="w-full flex gap-[10px]">
              <div className="w-full flex flex-col">
                <div
                  className={`w-full flex flex-col items-center border-primary  outline-none text-sm ${
                    isDarkMode
                      ? "border-dark-600"
                      : "bg-dark-400 border-transparent"
                  } rounded-sm`}
                >
                  <div className="w-full flex justify-between py-[5px] px-[10px] ">
                    <span className="text-sm font-bold pb-[5px]">
                      Triệu chứng (symptom)
                    </span>
                    <span
                      className="text-sm text-blue-500 cursor-pointer"
                      onClick={
                        loading ? undefined : () => setSelectSymptomModal(true)
                      }
                      style={
                        loading ? { pointerEvents: "none", opacity: 0.5 } : {}
                      }
                    >
                      Chọn
                    </span>
                  </div>
                  <div className="w-full min-h-[110px] max-h-[200px] overflow-y-auto  flex flex-col gap-[5px] border-t-[1px] border-dashed border-dark-800  p-[5px]">
                    {selectedSymptoms.length > 0 ? (
                      selectedSymptoms.map((symptom) => (
                        <div
                          key={symptom._id}
                          className="w-full flex flex-col border-[1px] border-dark-800 p-[5px] rounded-md"
                        >
                          <div className="w-full flex items-center">
                            {symptom.name}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="w-full flex justify-center">
                        <span>Chọn các triệu chứng</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="w-full flex  gap-[20px]">
            <div className="w-full flex gap-[10px]">
              <div className="w-full flex flex-col">
                <div
                  className={`w-full flex flex-col items-center border-primary  outline-none text-sm ${
                    isDarkMode
                      ? "border-dark-600"
                      : "bg-dark-400 border-transparent"
                  } rounded-sm`}
                >
                  <div className="w-full flex justify-between py-[5px] px-[10px] ">
                    <span className="text-sm font-bold pb-[5px]">
                      Phòng ngừa (prevention)
                    </span>
                    <span
                      className="text-sm text-blue-500 cursor-pointer"
                      onClick={
                        loading
                          ? undefined
                          : () => setSelectPreventionModal(true)
                      }
                      style={
                        loading ? { pointerEvents: "none", opacity: 0.5 } : {}
                      }
                    >
                      Chọn
                    </span>
                  </div>
                  <div className="w-full min-h-[110px] max-h-[200px] overflow-y-auto  flex flex-col gap-[5px] border-t-[1px] border-dashed border-dark-800  p-[5px]">
                    {selectedPreventions.length > 0 ? (
                      selectedPreventions.map((prevention) => (
                        <div
                          key={prevention._id}
                          className="w-full flex flex-col border-[1px] border-dark-800 p-[5px] rounded-md"
                        >
                          <div className="w-full flex items-center">
                            {prevention.name}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="w-full flex justify-center">
                        <span>Chọn các biện pháp phòng ngừa</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="w-full flex gap-[10px]">
              <div className="w-full flex flex-col">
                <div
                  className={`w-full flex flex-col items-center border-primary  outline-none text-sm ${
                    isDarkMode
                      ? "border-dark-600"
                      : "bg-dark-400 border-transparent"
                  } rounded-sm`}
                >
                  <div className="w-full flex justify-between py-[5px] px-[10px] ">
                    <span className="text-sm font-bold pb-[5px]">
                      Phương pháp điều trị (treatment)
                    </span>
                    <span
                      className="text-sm text-blue-500 cursor-pointer"
                      onClick={
                        loading
                          ? undefined
                          : () => setSelectTreatmentModal(true)
                      }
                      style={
                        loading ? { pointerEvents: "none", opacity: 0.5 } : {}
                      }
                    >
                      Chọn
                    </span>
                  </div>
                  <div className="w-full min-h-[110px] max-h-[200px] overflow-y-auto  flex flex-col gap-[5px] border-t-[1px] border-dashed border-dark-800  p-[5px]">
                    {selectedTreatments.length > 0 ? (
                      selectedTreatments.map((treatment) => (
                        <div
                          key={treatment._id}
                          className="w-full flex flex-col border-[1px] border-dark-800 p-[5px] rounded-md"
                        >
                          <div className="w-full flex items-center">
                            {treatment.name}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="w-full flex justify-center">
                        <span>Chọn các phương pháp điều trị</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="w-full flex  gap-[20px]">
            <div className="w-full flex gap-[10px]">
              <div className="w-full flex flex-col">
                <div
                  className={`w-full flex flex-col items-center border-primary  outline-none text-sm ${
                    isDarkMode
                      ? "border-dark-600"
                      : "bg-dark-400 border-transparent"
                  } rounded-sm`}
                >
                  <div className="w-full flex justify-between py-[5px] px-[10px] ">
                    <span className="text-sm font-bold pb-[5px]">
                      Các đối tương nguy cơ (risk fators)
                    </span>
                    <div
                      className="text-sm text-blue-500 cursor-pointer"
                      onClick={loading ? undefined : addRiskFators}
                      style={
                        loading ? { pointerEvents: "none", opacity: 0.5 } : {}
                      }
                    >
                      <span>Thêm đối tướng</span>
                    </div>
                  </div>
                  <div className="w-full min-h-[110px] max-h-[200px] overflow-y-auto  flex flex-col gap-[5px] border-t-[1px] border-dashed border-dark-800  p-[5px]">
                    {riskFactors.length > 0 &&
                      riskFactors.map((riskFactor, index) => (
                        <div
                          key={index}
                          className={`w-full flex items-center  pr-[10px] border-primary ${
                            isDarkMode
                              ? " border-dark-600 "
                              : "bg-dark-400 border-transparent"
                          }  rounded-sm`}
                        >
                          <input
                            className="flex-1  text-sm px-[10px] py-[8px] outline-none"
                            name="riskFactor"
                            type="text"
                            value={riskFactor}
                            placeholder="Nhập đối tượng dễ mắc bệnh"
                            onChange={(e) =>
                              handleRiskFactorChange(index, e.target.value)
                            }
                            disabled={loading}
                          />{" "}
                          {riskFactors.length > 1 && (
                            <div
                              className="cursor-pointer"
                              onClick={() =>
                                setRiskFactors(
                                  riskFactors.filter((_, i) => i !== index)
                                )
                              }
                            >
                              xóa
                            </div>
                          )}
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="w-full flex gap-[10px]">
            <div className="w-full flex flex-col">
              <div
                className={`w-full flex flex-col items-center border-primary  outline-none text-sm ${
                  isDarkMode
                    ? "border-dark-600"
                    : "bg-dark-400 border-transparent"
                } rounded-sm`}
              >
                <div className="w-full flex justify-between py-[5px] px-[10px] ">
                  <span className="text-sm font-bold pb-[5px]">
                    Biến chứng (complications)
                  </span>
                  <div
                    className="text-sm text-blue-500 cursor-pointer"
                    onClick={loading ? undefined : addComplication}
                    style={
                      loading ? { pointerEvents: "none", opacity: 0.5 } : {}
                    }
                  >
                    <span>Thêm biến chứng </span>
                  </div>
                </div>
                <div className="w-full min-h-[110px] max-h-[200px] overflow-y-auto  flex flex-col gap-[5px] border-t-[1px] border-dashed border-dark-800  p-[5px]">
                  {complications.length > 0 &&
                    complications.map((complication, index) => (
                      <div
                        key={index}
                        className={`w-full flex items-center pr-[10px] border-primary ${
                          isDarkMode
                            ? " border-dark-600 "
                            : "bg-dark-400 border-transparent"
                        }  rounded-sm`}
                      >
                        <input
                          className="flex-1  text-sm px-[10px] py-[8px] outline-none"
                          name="complication"
                          type="text"
                          value={complication}
                          placeholder="Nhập biến chứng"
                          onChange={(e) =>
                            handleComplicationChange(index, e.target.value)
                          }
                          disabled={loading}
                        />
                        {complications.length > 1 && (
                          <div
                            className="cursor-pointer"
                            onClick={() =>
                              setComplications(
                                complications.filter((_, i) => i !== index)
                              )
                            }
                          >
                            xóa
                          </div>
                        )}
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
          <div className="w-full flex  gap-[20px]">
            <div className="w-full flex gap-[10px]">
              <div className="w-full flex flex-col">
                <div
                  className={`w-full flex flex-col items-center border-primary  outline-none text-sm ${
                    isDarkMode
                      ? "border-dark-600"
                      : "bg-dark-400 border-transparent"
                  } rounded-sm`}
                >
                  <div className="w-full flex justify-between py-[5px] px-[10px] ">
                    <span className="text-sm font-bold pb-[5px]">
                      Tiên lượng (prognosis)
                    </span>
                  </div>
                  <div className="w-full flex  flex-col gap-[5px] border-t-[1px] border-dashed border-dark-800  p-[5px]">
                    <input
                      className="flex-1  text-sm px-[10px] py-[8px] outline-none"
                      name="prognosis"
                      type="text"
                      value={form.prognosis}
                      placeholder="Nhập tiên lượng bệnh (prognosis)"
                      onChange={handleChange}
                      disabled={loading}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="w-full flex  gap-[20px]">
            <div className="w-full flex gap-[10px]">
              <div className="w-full flex flex-col">
                <div
                  className={`w-full flex flex-col items-center border-primary  outline-none text-sm ${
                    isDarkMode
                      ? "border-dark-600"
                      : "bg-dark-400 border-transparent"
                  } rounded-sm`}
                >
                  <div className="w-full flex justify-between py-[5px] px-[10px] ">
                    <span className="text-sm font-bold pb-[5px]">
                      Chẩn đoán (diagnosis)
                    </span>
                  </div>
                  <div className="w-full flex flex-col gap-[5px] border-t-[1px] border-dashed border-dark-800  p-[5px]">
                    <input
                      className="flex-1  text-sm px-[10px] py-[8px] outline-none"
                      name="diagnosis"
                      type="text"
                      value={form.diagnosis}
                      placeholder="Nhập chẩn đoán bệnh (diagnosis)"
                      onChange={handleChange}
                      disabled={loading}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="w-full flex flex-col border-primary rounded-md">
            <div className="w-full flex justify-between  py-[5px] px-[10px]">
              <span className="text-sm font-bold pb-[5px]">Bệnh liên quan</span>
              <span
                className="text-sm text-blue-500 cursor-pointer"
                onClick={
                  loading
                    ? undefined
                    : () => setSelectRelatedDiseasesModal(true)
                }
                style={loading ? { pointerEvents: "none", opacity: 0.5 } : {}}
              >
                Chọn
              </span>
            </div>
            <div className="w-full min-h-[60px] max-h-[200px] overflow-y-auto flex flex-col gap-[5px] border-t-[1px] border-dashed border-dark-800 p-[5px]">
              {selectedRelatedDiseases.length > 0 ? (
                selectedRelatedDiseases.map((disease) => (
                  <div
                    key={disease._id}
                    className="w-full flex flex-col border-[1px] border-dark-800 p-[5px] rounded-md"
                  >
                    <div className="w-full flex items-center">
                      {disease.name}
                    </div>
                  </div>
                ))
              ) : (
                <div className="w-full flex justify-center">
                  <span>Chọn các bệnh liên quan</span>
                </div>
              )}
            </div>
          </div>

          <SubmitButton loading={loading} disabled={loading} />
        </form>
      </div>
      {showCropImageModal && imageToCropMulti && (
        <CropImageModal
          image={imageToCropMulti}
          aspectRatio={16 / 9}
          onClose={() => {
            setShowCropImageModal(false);
            setPendingImages([]);
            setImageToCropMulti(null);
          }}
          onCropDone={handleCropImageDone}
        />
      )}
      {showCropThumbnailModal && thumbnailToCrop && (
        <CropImageModal
          image={thumbnailToCrop}
          aspectRatio={1 / 1}
          onClose={() => setShowCropThumbnailModal(false)}
          onCropDone={handleCropThumbnailDone}
        />
      )}
    </div>
  );
};

export default CreateDisease;

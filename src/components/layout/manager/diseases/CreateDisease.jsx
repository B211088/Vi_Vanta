import { useState, useRef } from "react";
import { useTheme } from "../../../../hook/useTheme";
import SelectPreventionModal from "../../../modals/librarymanager/SelectPreventionModal";
import SelectSymptomModal from "../../../modals/librarymanager/SelectSymptomModal";
import SelectTreatmentModal from "../../../modals/librarymanager/SelectTreatmentModal";
import SelectCauseModal from "../../../modals/librarymanager/SelectCauseModal";
import SelectDiseaseCategoryModal from "../../../modals/librarymanager/SelectDiseaseCategoryModal";
import SelectRelatedDiseasesModal from "../../../modals/librarymanager/SelectRelatedDiseasesModal";
import CropImageModal from "../../../modals/CropImageModal";
import { useDispatch, useSelector } from "react-redux";
import { createDiseaseHandle } from "../../../../services/disease.service";
import SubmitButton from "../../../common/buttons/SubmitButton";
import { useNotify } from "../../../../hook/useNotify";
import InputField from "../../../common/fields/InputField";
import TextAreaFiels from "../../../common/fields/TextAreaFiels";
import SelectListBox from "../../../common/fields/SelectListBox";
import DiagnosisList from "../../../common/lists/DiagnosisList";
import PrognosisList from "../../../common/lists/PrognosisList";
import TiptapEditor from "../../SlateEditor";

const CreateDisease = () => {
  const { isDarkMode } = useTheme();
  const { notifySuccess, notifyError, notifyWarning } = useNotify();
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
  const [selectRelatedDiseasesModal, setSelectRelatedDiseasesModal] =
    useState(false);
  const [selectedRelatedDiseases, setSelectedRelatedDiseases] = useState([]);
  const [riskFactors, setRiskFactors] = useState([""]);
  const [complications, setComplications] = useState([""]);
  const [form, setForm] = useState({
    name: "",
    scientificName: "",
    slug: "",
    tags: [],
    keywords: [],
    icd10Code: "",
    definition: "",
    category: [],
    symptoms: [],
    causes: [],
    treatments: [],
    preventions: [],
    specialty: [],
    riskFactors: [],
    complications: [],
    epidemiology: {
      prevalence: "",
      incidence: "",
      mortality: "",
      ageDistribution: "",
      region: "",
      riskGroups: "",
      trends: "",
      seasonality: "",
    },
    prognosis: [
      {
        title: "",
        description: "",
      },
    ],
    diagnosis: [
      {
        title: "",
        description: "",
      },
    ],
    riskLevel: "medium",
    relatedDiseases: [],
    references: [],
    guidelines: [],
    thumbnail: null,
    images: [],
  });

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

  const addPrognosis = () => {
    setForm((prev) => ({
      ...prev,
      prognosis: [...prev.prognosis, { title: "", description: "" }],
    }));
  };

  const addDiagnosis = () => {
    setForm((prev) => ({
      ...prev,
      diagnosis: [...prev.diagnosis, { title: "", description: "" }],
    }));
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

  const handleEpidemiologyChange = (e) => {
    const { name, value } = e.target;
    const field = name.split(".")[1];
    setForm((prev) => ({
      ...prev,
      epidemiology: {
        ...prev.epidemiology,
        [field]: value,
      },
    }));
  };

  // Thay vì dùng handleChange chung, tạo hàm riêng cho prognosis:
  const handlePrognosisChange = (index, field, value) => {
    setForm((prev) => {
      const updated = [...prev.prognosis];
      updated[index][field] = value;
      return { ...prev, prognosis: updated };
    });
  };

  const handleDiagnosisChange = (index, field, value) => {
    setForm((prev) => {
      const updated = [...prev.diagnosis];
      updated[index][field] = value;
      return { ...prev, diagnosis: updated };
    });
  };

  console.log(form);

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

  const [content, setContent] = useState("");

  const handleUpdate = ({ html, text, json }) => {
    setContent(html);
    // Lưu vào database, localStorage, etc.
    console.log("Nội dung mới:", { html, text, json });
  };

  console.log({ content });

  const handleSubmit = async (e) => {
    e.preventDefault();

    // if (!form.name.trim()) {
    //   notifyWarning("Vui lòng nhập tên bệnh!");
    //   return;
    // }

    // if (!/^[\p{L}\d\s\-]+$/u.test(form.name.trim())) {
    //   notifyWarning("Tên bệnh không được chứa ký tự đặc biệt!");
    //   return;
    // }
    // if (!form.scientificName.trim()) {
    //   notifyWarning("Vui lòng nhập tên khoa học!");
    //   return;
    // }
    // if (!form.icd10Code.trim()) {
    //   notifyWarning("Vui lòng nhập mã ICD10!");
    //   return;
    // }

    // if (!/^[A-Z]\d{2}(\.\d+)?$/i.test(form.icd10Code.trim())) {
    //   notifyWarning("Mã ICD10 không đúng định dạng (ví dụ: A00, B20.1)!");
    //   return;
    // }
    // if (!form.definition.trim()) {
    //   notifyWarning("Vui lòng nhập định nghĩa bệnh!");
    //   return;
    // }
    // if (selectedDiseaseCategories.length === 0) {
    //   notifyWarning("Vui lòng chọn ít nhất một phân loại bệnh!");
    //   return;
    // }

    // if (!form.thumbnail) {
    //   notifyWarning("Vui lòng chọn ảnh thumbnail!");
    //   return;
    // }
    // if (!form.images || form.images.length === 0) {
    //   notifyWarning("Vui lòng chọn ít nhất một ảnh mô tả!");
    //   return;
    // }
    // if (form.images.length > 5) {
    //   notifyWarning("Chỉ được chọn tối đa 5 ảnh mô tả!");
    //   return;
    // }
    // if (selectedPreventions.length === 0) {
    //   notifyWarning("Vui lòng chọn ít nhất một nguyên nhân gây bệnh!");
    //   return;
    // }
    // if (selectedSymptoms.length === 0) {
    //   notifyWarning("Vui lòng chọn ít nhất một triệu chứng!");
    //   return;
    // }
    // if (selectedTreatments.length === 0) {
    //   notifyWarning("Vui lòng chọn ít nhất một phương pháp phòng ngừa!");
    //   return;
    // }
    // if (selectedCauses.length === 0) {
    //   notifyWarning("Vui lòng chọn ít nhất một phương pháp điều trị!");
    //   return;
    // }
    // // Validate riskFactors
    // if (!riskFactors.length || riskFactors.some((r) => !r.trim())) {
    //   notifyWarning("Vui lòng nhập đầy đủ các đối tượng dễ mắc bệnh!");
    //   return;
    // }
    // // Validate complications
    // if (!complications.length || complications.some((c) => !c.trim())) {
    //   notifyWarning("Vui lòng nhập đầy đủ các biến chứng!");
    //   return;
    // }
    // // Validate prognosis
    // if (!form.prognosis.trim()) {
    //   notifyWarning("Vui lòng nhập tiên lượng bệnh!");
    //   return;
    // }
    // // Validate diagnosis
    // if (!form.diagnosis.trim()) {
    //   notifyWarning("Vui lòng nhập chẩn đoán bệnh!");
    //   return;
    // }

    const data = { ...form };
    data.category = selectedDiseaseCategories?.map((cat) => cat._id) || [];
    data.preventions = selectedPreventions?.map((item) => item._id) || [];
    data.symptoms = selectedSymptoms?.map((item) => item._id) || [];
    data.treatments = selectedTreatments?.map((item) => item._id) || [];
    data.causes = selectedCauses?.map((item) => item._id) || [];
    data.relatedDiseases =
      selectedRelatedDiseases?.map((item) => item._id) || [];
    data.riskFactors = riskFactors || [];
    data.complications = complications || [];

    const formData = new FormData();

    Object.entries(data).forEach(([key, value]) => {
      if (key === "images" || key === "thumbnail") return;

      if (key === "diagnosis") {
        formData.append("diagnosis", JSON.stringify(value));
        return;
      }
      if (key === "prognosis") {
        formData.append("prognosis", JSON.stringify(value));
        return;
      }
      if (key === "epidemiology") {
        formData.append("epidemiology", JSON.stringify(value));
        return;
      }

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
          selectedTreatmentsHandle={(treatments) =>
            setSelectedTreatments(treatments)
          }
          closeModal={() => setSelectTreatmentModal(false)}
          currentSelected={selectedTreatments}
        />
      )}
      {selectCauseModal && (
        <SelectCauseModal
          selectedCausesHandle={(causes) => setSelectedCauses(causes)}
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
          selectedRelatedDiseasesHandle={(diseases) =>
            setSelectedRelatedDiseases(diseases)
          }
          closeModal={setSelectRelatedDiseasesModal(false)}
          currentSelected={selectedRelatedDiseases}
        />
      )}
      <div className="w-full overflow-y-auto bg-light-50 p-[5px] rounded-lg flex flex-col gap-4">
        <div className="w-full flex items-center ">
          <h1 className="font-bold text-lg">Tạo bệnh mới</h1>
        </div>
        <form className="w-full flex flex-col gap-4 " onSubmit={handleSubmit}>
          <div className="w-full">
            <TiptapEditor
              content={content}
              onUpdate={(content) => handleUpdate(content)}
            />
          </div>
          <div className="w-full  flex items-center gap-[20px]">
            <InputField
              label={"Tên bệnh"}
              name={"name"}
              type={"text"}
              placeholder={"Nhập tên bệnh"}
              onChange={handleChange}
              disabled={loading}
            />
            <InputField
              label={"Tên khoa học "}
              name={"scientificName"}
              type={"text"}
              placeholder={"Nhập tên khoa học của bệnh"}
              onChange={handleChange}
              disabled={loading}
            />
            <InputField
              label={"Mã ICD10"}
              name={"scientificName"}
              type={"text"}
              placeholder={"Nhập mã ICD10"}
              onChange={handleChange}
              disabled={loading}
            />
          </div>{" "}
          <TextAreaFiels
            label={"Định nghĩa bệnh"}
            name={"definition"}
            type={"text"}
            placeholder={"Thêm định nghĩa về bệnh"}
            onChange={handleChange}
            disabled={loading}
          />
          <div className="w-full flex gap-[20px]">
            <SelectListBox
              title="Phân loại bệnh "
              items={selectedDiseaseCategories}
              onSelect={() => setSelectedDiseaseCategoryModal(true)}
              loading={loading}
              emptyText="Chọn các phân loại bệnh"
            />
          </div>
          <div className="w-full flex gap-[20px]">
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
            <SelectListBox
              title="Nguyên nhân gây bệnh (cause)"
              items={selectedCauses}
              onSelect={() => setSelectCauseModal(true)}
              loading={loading}
              emptyText="Chọn các nguyên nhân gây bệnh"
            />
            <SelectListBox
              title="Triệu chứng của bệnh (symptom)"
              items={selectedSymptoms}
              onSelect={() => setSelectSymptomModal(true)}
              loading={loading}
              emptyText="Chọn các triệu chứng"
            />
          </div>
          <div className="w-full flex  gap-[20px]">
            <SelectListBox
              title="Biện pháp phòng ngừa (prevention)"
              items={selectedPreventions}
              onSelect={() => setSelectPreventionModal(true)}
              loading={loading}
              emptyText="Chọn các biện pháp phòng ngừa"
            />
            <SelectListBox
              title="Phương pháp điều trị (treatment)"
              items={selectedTreatments}
              onSelect={() => setSelectTreatmentModal(true)}
              loading={loading}
              emptyText="Chọn các phương pháp điều trị"
            />
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
          <PrognosisList
            prognosis={form.prognosis}
            loading={loading}
            addPrognosis={addPrognosis}
            handlePrognosisChange={handlePrognosisChange}
            removePrognosis={(idx) =>
              setForm((prev) => ({
                ...prev,
                prognosis: prev.prognosis.filter((_, i) => i !== idx),
              }))
            }
            isDarkMode={isDarkMode}
          />
          <DiagnosisList
            diagnosis={form.diagnosis}
            loading={loading}
            addDiagnosis={addDiagnosis}
            handleDiagnosisChange={handleDiagnosisChange}
            removeDiagnosis={(idx) =>
              setForm((prev) => ({
                ...prev,
                diagnosis: prev.diagnosis.filter((_, i) => i !== idx),
              }))
            }
            isDarkMode={isDarkMode}
          />
          <SelectListBox
            title="Các bệnh liên quan"
            items={selectedRelatedDiseases}
            onSelect={() => setSelectRelatedDiseasesModal(true)}
            loading={loading}
            emptyText="Chọn các bệnh liên quan"
          />
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

import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { registerDoctor } from "../../../services/doctor.service";
import Header from "../../layout/Header";
import GetAddressForm from "../../common/forms/GetAddressForm";
import {
  Plus,
  Minus,
  MapPin,
  Phone,
  Building,
  User,
  Award,
  BookOpen,
  Globe,
  CreditCard,
  Stethoscope,
  Upload,
  Camera,
} from "lucide-react";
import Footer from "../../../pages/user/Footer";

const DoctorRegistration = () => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);

  // Options for select fields
  const specialtyOptions = [
    "Nội khoa",
    "Ngoại khoa",
    "Sản phụ khoa",
    "Nhi khoa",
    "Mắt",
    "Tai mũi họng",
    "Da liễu",
    "Tâm thần",
    "Thần kinh",
    "Tim mạch",
    "Tiêu hóa",
    "Hô hấp",
    "Nội tiết",
    "Thận - Tiết niệu",
    "Xương khớp",
    "Ung bướu",
    "Hồi sức tích cực",
    "Gây mê hồi sức",
    "Chẩn đoán hình ảnh",
    "Xét nghiệm",
    "Răng hàm mặt",
    "Phục hồi chức năng",
    "Y học cổ truyền",
    "Dinh dưỡng",
    "Khác",
  ];

  const targetPatientOptions = [
    "Trẻ em (0-15 tuổi)",
    "Thanh thiếu niên (16-25 tuổi)",
    "Người trưởng thành (26-60 tuổi)",
    "Người cao tuổi (60+ tuổi)",
    "Phụ nữ mang thai",
    "Phụ nữ sau sinh",
    "Bệnh nhân mãn tính",
    "Bệnh nhân cấp tính",
    "Tất cả các lứa tuổi",
  ];

  const languageOptions = [
    "Tiếng Việt",
    "Tiếng Anh",
    "Tiếng Trung",
    "Tiếng Nhật",
    "Tiếng Hàn",
    "Tiếng Pháp",
    "Tiếng Đức",
    "Tiếng Nga",
    "Tiếng Thái",
    "Tiếng Khmer",
  ];

  const [formData, setFormData] = useState({
    title: "",
    name: "",
    specialty: [""],
    targetPatients: [""],
    highlights: "",
    info: "",
    strengths: [""],
    experiences: [""],
    educations: [""],
    languages: [""],
    paymentMethods: ["cash"],
    infoClinic: {
      clinicName: "",
      address: {
        wardId: "",
        districtId: "",
        provinceId: "",
        specificAddress: "",
      },
      phone: "",
      location: {
        coordinates: [0, 0],
      },
    },
  });

  console.log({ formData });

  const handleAddressChange = (address) => {
    setSelectedAddress(address);
    setFormData((prev) => ({
      ...prev,
      infoClinic: {
        ...prev.infoClinic,
        address: {
          ...prev.infoClinic.address,
          wardId: address.ward,
          districtId: address.district,
          provinceId: address.province,
        },
      },
    }));
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.includes(".")) {
      const keys = name.split(".");
      setFormData((prev) => {
        let newData = { ...prev };
        let current = newData;

        for (let i = 0; i < keys.length - 1; i++) {
          current[keys[i]] = { ...current[keys[i]] };
          current = current[keys[i]];
        }

        current[keys[keys.length - 1]] = value;
        return newData;
      });
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleArrayChange = (field, index, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].map((item, i) => (i === index ? value : item)),
    }));
  };

  const addArrayField = (field) => {
    setFormData((prev) => ({
      ...prev,
      [field]: [...prev[field], ""],
    }));
  };

  const removeArrayField = (field, index) => {
    if (formData[field].length > 1) {
      setFormData((prev) => ({
        ...prev,
        [field]: prev[field].filter((_, i) => i !== index),
      }));
    }
  };

  const handlePaymentMethodChange = (method) => {
    setFormData((prev) => ({
      ...prev,
      paymentMethods: prev.paymentMethods.includes(method)
        ? prev.paymentMethods.filter((m) => m !== method)
        : [...prev.paymentMethods, method],
    }));
  };

  const handleLocationChange = (type, value) => {
    const numValue = parseFloat(value) || 0;
    setFormData((prev) => ({
      ...prev,
      infoClinic: {
        ...prev.infoClinic,
        location: {
          coordinates:
            type === "longitude"
              ? [numValue, prev.infoClinic.location.coordinates[1]]
              : [prev.infoClinic.location.coordinates[0], numValue],
        },
      },
    }));
  };
  const handleSubmit = async () => {
    setLoading(true);
    setError("");

    try {
      // Check if required fields are filled
      const missingFields = [];

      if (!formData.title?.trim()) {
        missingFields.push("Chức danh");
      }

      if (!formData.name?.trim()) {
        missingFields.push("Tên bác sĩ");
      }

      if (!formData.info?.trim()) {
        missingFields.push("Thông tin bổ sung");
      }

      if (!formData.highlights?.trim()) {
        missingFields.push("Điểm nổi bật");
      }

      // Check specialty array
      if (
        !formData.specialty ||
        !Array.isArray(formData.specialty) ||
        formData.specialty.length === 0 ||
        !formData.specialty.some((s) => s && s.trim())
      ) {
        missingFields.push("Chuyên khoa");
      }

      if (!formData.infoClinic?.clinicName?.trim()) {
        missingFields.push("Tên phòng khám");
      }

      if (!formData.infoClinic?.phone?.trim()) {
        missingFields.push("Số điện thoại phòng khám");
      }

      if (!formData.infoClinic?.address?.specificAddress?.trim()) {
        missingFields.push("Địa chỉ cụ thể");
      }

      if (!formData.infoClinic?.address?.provinceId) {
        missingFields.push("Tỉnh/Thành phố");
      }

      if (!formData.infoClinic?.address?.districtId) {
        missingFields.push("Quận/Huyện");
      }

      if (!formData.infoClinic?.address?.wardId) {
        missingFields.push("Phường/Xã");
      }

      // Check avatar file
      if (!avatarFile) {
        missingFields.push("Ảnh đại diện");
      }

      if (missingFields.length > 0) {
        setError(`Vui lòng điền đầy đủ thông tin: ${missingFields.join(", ")}`);
        setLoading(false);
        return;
      }

      const submitData = new FormData();

      // Attach avatar
      if (avatarFile) {
        submitData.append("avatar", avatarFile);
      }

      // Prepare infoClinic data
      const infoClinic = {
        clinicName: formData.infoClinic.clinicName.trim(),
        phone: formData.infoClinic.phone.trim(),
        address: {
          specificAddress: formData.infoClinic.address.specificAddress.trim(),
          provinceId: formData.infoClinic.address.provinceId,
          districtId: formData.infoClinic.address.districtId,
          wardId: formData.infoClinic.address.wardId,
          ...(formData.infoClinic.address.province && {
            province: formData.infoClinic.address.province,
          }),
          ...(formData.infoClinic.address.district && {
            district: formData.infoClinic.address.district,
          }),
          ...(formData.infoClinic.address.ward && {
            ward: formData.infoClinic.address.ward,
          }),
        },
        ...(formData.infoClinic.description && {
          description: formData.infoClinic.description,
        }),
        ...(formData.infoClinic.website && {
          website: formData.infoClinic.website,
        }),
      };

      submitData.append("infoClinic", JSON.stringify(infoClinic));

      // Add required string fields
      submitData.append("title", formData.title.trim());
      submitData.append("name", formData.name.trim());
      submitData.append("info", formData.info.trim());
      submitData.append("highlights", formData.highlights.trim());

      // Helper function to add array fields
      const addArrayField = (fieldName, arrayData) => {
        if (arrayData && Array.isArray(arrayData)) {
          arrayData
            .filter((item) => item && item.trim())
            .forEach((item) => submitData.append(fieldName, item.trim()));
        }
      };

      // Add array fields
      addArrayField("specialty", formData.specialty);
      addArrayField("targetPatients", formData.targetPatients);
      addArrayField("strengths", formData.strengths);
      addArrayField("experiences", formData.experiences);
      addArrayField("educations", formData.educations);
      addArrayField("languages", formData.languages);
      addArrayField("paymentMethods", formData.paymentMethods);

      // Add remaining fields (skip already processed ones)
      const processedFields = [
        "infoClinic",
        "title",
        "name",
        "info",
        "highlights",
        "specialty",
        "targetPatients",
        "strengths",
        "experiences",
        "educations",
        "languages",
        "paymentMethods",
      ];

      Object.entries(formData).forEach(([key, value]) => {
        if (!processedFields.includes(key)) {
          if (value !== null && value !== undefined && value !== "") {
            if (
              typeof value === "string" ||
              typeof value === "number" ||
              typeof value === "boolean"
            ) {
              submitData.append(key, value);
            }
          }
        }
      });

      // Debug: Log FormData contents
      console.log("FormData contents:");
      for (let [key, value] of submitData.entries()) {
        console.log(key, value);
      }

      await dispatch(registerDoctor(submitData));

      setSuccess(true);
      setError("");
    } catch (err) {
      console.error("Submit error:", err);
      setError(err.message || "Có lỗi xảy ra khi đăng ký");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen w-full">
        <Header />
        <div className="max-w-4xl mx-auto p-6 bg-green-50 border border-green-200 rounded-lg my-20">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Award className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-green-800 mb-2">
              Đăng ký thành công!
            </h2>
            <p className="text-green-600">
              Thông tin đăng ký của bạn đã được gửi và đang chờ xét duyệt. Chúng
              tôi sẽ liên hệ với bạn sớm nhất có thể.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-gray-50">
      <Header />
      <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg my-20">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Stethoscope className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Đăng Ký Trở Thành Bác Sĩ
          </h1>
          <p className="text-gray-600">
            Vui lòng điền đầy đủ thông tin để đăng ký
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        <div className="space-y-8">
          {/* Thông tin cá nhân */}
          <div className="p-6 rounded-lg border border-blue-100">
            <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
              <User className="w-5 h-5 mr-2 text-blue-600" />
              Thông Tin Cá Nhân
            </h2>

            <div className="space-y-6">
              {/* Avatar Upload */}
              <div className="flex flex-col items-center space-y-4">
                <div className="relative">
                  <div className="w-24 h-24 bg-gray-200 rounded-full overflow-hidden border-4 border-white shadow-lg">
                    {avatarPreview ? (
                      <img
                        src={avatarPreview}
                        alt="Avatar preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <Camera className="w-8 h-8" />
                      </div>
                    )}
                  </div>
                  <label className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-700 transition-colors shadow-lg">
                    <Upload className="w-4 h-4" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="hidden"
                    />
                  </label>
                </div>
                <p className="text-sm text-gray-600">Tải lên ảnh đại diện</p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Học hàm/Học vị
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Ví dụ: Tiến sĩ, Thạc sĩ, Bác sĩ..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Họ và tên *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Nhập họ và tên"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Chuyên khoa *
                </label>
                {formData.specialty.map((spec, index) => (
                  <div key={index} className="flex gap-2 mb-3">
                    <select
                      value={spec}
                      onChange={(e) =>
                        handleArrayChange("specialty", index, e.target.value)
                      }
                      required
                      className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
                    >
                      <option value="">Chọn chuyên khoa</option>
                      {specialtyOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => removeArrayField("specialty", index)}
                      className="p-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      disabled={formData.specialty.length === 1}
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addArrayField("specialty")}
                  className="flex items-center text-blue-600 hover:text-blue-800 font-medium transition-colors"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Thêm chuyên khoa
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Đối tượng bệnh nhân
                </label>
                {formData.targetPatients.map((target, index) => (
                  <div key={index} className="flex gap-2 mb-3">
                    <select
                      value={target}
                      onChange={(e) =>
                        handleArrayChange(
                          "targetPatients",
                          index,
                          e.target.value
                        )
                      }
                      className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
                    >
                      <option value="">Chọn đối tượng bệnh nhân</option>
                      {targetPatientOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => removeArrayField("targetPatients", index)}
                      className="p-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      disabled={formData.targetPatients.length === 1}
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addArrayField("targetPatients")}
                  className="flex items-center text-blue-600 hover:text-blue-800 font-medium transition-colors"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Thêm đối tượng
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Điểm nổi bật
                </label>
                <textarea
                  name="highlights"
                  value={formData.highlights}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                  placeholder="Mô tả những điểm nổi bật của bạn..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Thông tin bổ sung
                </label>
                <textarea
                  name="info"
                  value={formData.info}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                  placeholder="Thông tin thêm về bản thân và kinh nghiệm..."
                />
              </div>
            </div>
          </div>

          {/* Năng lực và kinh nghiệm */}
          <div className=" p-6 rounded-lg border border-green-100">
            <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
              <Award className="w-5 h-5 mr-2 text-green-600" />
              Năng Lực & Kinh Nghiệm
            </h2>

            <div className="grid md:grid-cols-1 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Điểm mạnh
                </label>
                {formData.strengths.map((strength, index) => (
                  <div key={index} className="flex gap-2 mb-3">
                    <input
                      type="text"
                      value={strength}
                      onChange={(e) =>
                        handleArrayChange("strengths", index, e.target.value)
                      }
                      className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                      placeholder="Điểm mạnh của bạn"
                    />
                    <button
                      type="button"
                      onClick={() => removeArrayField("strengths", index)}
                      className="p-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      disabled={formData.strengths.length === 1}
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addArrayField("strengths")}
                  className="flex items-center text-green-600 hover:text-green-800 font-medium transition-colors"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Thêm điểm mạnh
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kinh nghiệm làm việc
                </label>
                {formData.experiences.map((exp, index) => (
                  <div key={index} className="flex gap-2 mb-3">
                    <input
                      type="text"
                      value={exp}
                      onChange={(e) =>
                        handleArrayChange("experiences", index, e.target.value)
                      }
                      className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                      placeholder="Kinh nghiệm làm việc"
                    />
                    <button
                      type="button"
                      onClick={() => removeArrayField("experiences", index)}
                      className="p-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      disabled={formData.experiences.length === 1}
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addArrayField("experiences")}
                  className="flex items-center text-green-600 hover:text-green-800 font-medium transition-colors"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Thêm kinh nghiệm
                </button>
              </div>
            </div>

            <div className="mt-6 grid md:grid-cols-1 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Học vấn
                </label>
                {formData.educations.map((edu, index) => (
                  <div key={index} className="flex gap-2 mb-3">
                    <input
                      type="text"
                      value={edu}
                      onChange={(e) =>
                        handleArrayChange("educations", index, e.target.value)
                      }
                      className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                      placeholder="Bằng cấp, trường học"
                    />
                    <button
                      type="button"
                      onClick={() => removeArrayField("educations", index)}
                      className="p-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      disabled={formData.educations.length === 1}
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addArrayField("educations")}
                  className="flex items-center text-green-600 hover:text-green-800 font-medium transition-colors"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Thêm học vấn
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ngôn ngữ
                </label>
                {formData.languages.map((lang, index) => (
                  <div key={index} className="flex gap-2 mb-3">
                    <select
                      value={lang}
                      onChange={(e) =>
                        handleArrayChange("languages", index, e.target.value)
                      }
                      className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all bg-white"
                    >
                      <option value="">Chọn ngôn ngữ</option>
                      {languageOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => removeArrayField("languages", index)}
                      className="p-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      disabled={formData.languages.length === 1}
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addArrayField("languages")}
                  className="flex items-center text-green-600 hover:text-green-800 font-medium transition-colors"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Thêm ngôn ngữ
                </button>
              </div>
            </div>
          </div>

          {/* Thông tin phòng khám */}
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
              <Building className="w-5 h-5 mr-2 text-purple-600" />
              Thông Tin Phòng Khám
            </h2>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tên phòng khám *
                </label>
                <input
                  type="text"
                  name="infoClinic.clinicName"
                  value={formData.infoClinic.clinicName}
                  onChange={handleInputChange}
                  required
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  placeholder="Tên phòng khám"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Địa chỉ phòng khám *
                </label>
                <div className="space-y-4">
                  <GetAddressForm onChangeAddress={handleAddressChange} />
                  <input
                    type="text"
                    name="infoClinic.address.specificAddress"
                    value={formData.infoClinic.address.specificAddress}
                    onChange={handleInputChange}
                    required
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    placeholder="Địa chỉ cụ thể (số nhà, tên đường...)"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Số điện thoại *
                </label>
                <input
                  type="tel"
                  name="infoClinic.phone"
                  value={formData.infoClinic.phone}
                  onChange={handleInputChange}
                  required
                  pattern="[0-9]{9,11}"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  placeholder="Số điện thoại (9-11 chữ số)"
                />
              </div>
            </div>
          </div>

          {/* Phương thức thanh toán */}
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
              <CreditCard className="w-5 h-5 mr-2 text-orange-600" />
              Phương Thức Thanh Toán
            </h2>

            <div className="grid md:grid-cols-2 gap-4">
              {["cash", "transfer"].map((method) => (
                <label
                  key={method}
                  className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-white transition-colors cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={formData.paymentMethods.includes(method)}
                    onChange={() => handlePaymentMethodChange(method)}
                    className="w-4 h-4 text-orange-600 bg-gray-100 border-gray-300 rounded focus:ring-orange-500 focus:ring-2"
                  />
                  <span className="ml-3 text-sm font-medium text-gray-700 flex items-center">
                    {method === "cash" ? (
                      <>
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-2">
                          💵
                        </div>
                        Tiền mặt
                      </>
                    ) : (
                      <>
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-2">
                          🏦
                        </div>
                        Chuyển khoản
                      </>
                    )}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-center pt-6">
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="px-12 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105 shadow-lg"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Đang đăng ký...
                </div>
              ) : (
                "Đăng Ký Trở Thành Bác Sĩ"
              )}
            </button>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default DoctorRegistration;

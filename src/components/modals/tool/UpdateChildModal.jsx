import { Baby, Calendar, User } from "lucide-react";
import React, { useState } from "react";
import { createChild, updateChild } from "../../../services/children.service";
import { useDispatch, useSelector } from "react-redux";
import { useNotify } from "../../../hook/useNotify";
const ValueInput = ({
  label,
  value,
  onChange,
  type = "text",
  name,
  placeholder,
  icon: Icon,
  required = false,
}) => (
  <div className="flex flex-col">
    <label className="text-xs pb-1 text-gray-700">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <div className="w-full flex items-center gap-2 py-2 px-3 text-sm border border-gray-300 rounded-md hover:border-blue-500 focus-within:border-blue-500">
      {Icon && <Icon className="text-blue-500 h-5 w-5" />}
      <input
        type={type}
        value={value}
        name={name}
        onChange={onChange}
        placeholder={placeholder}
        className="flex-1 outline-none"
        required={required}
      />
    </div>
  </div>
);

// Select component
const SelectInput = ({
  label,
  value,
  onChange,
  options,
  name,
  icon: Icon,
  required = false,
}) => (
  <div className="flex flex-col">
    <label className="text-xs pb-1 text-gray-700">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <div className="w-full flex items-center gap-2 py-2 px-3 text-sm border border-gray-300 rounded-md hover:border-blue-500 focus-within:border-blue-500">
      {Icon && <Icon className="text-blue-500 h-5 w-5" />}
      <select
        value={value}
        onChange={onChange}
        name={name}
        className="w-full outline-none cursor-pointer"
        required={required}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  </div>
);

const formatDate = (dateStr) => {
  if (!dateStr) return "";
  return new Date(dateStr).toISOString().split("T")[0];
};

const UpdateChildModal = ({ closeModal, child }) => {
  const dispatch = useDispatch();
  const { notifyWarning, notifySuccess, notifyError } = useNotify();
  const [childForm, setChildForm] = useState({
    name: child.name,
    birthDate: formatDate(child.birthDate),
    gender: child.gender,
    notes: child.notes,
  });
  const handleChange = (e) => {
    const { name, value } = e.target;
    setChildForm((prev) => ({ ...prev, [name]: value }));
  };

  // Update child
  const updateChildHandle = async (e) => {
    e.preventDefault();
    if (new Date(childForm.birthDate) > new Date()) {
      notifyWarning("Ngày lớn hơn ngày hiện tại!");
      return;
    }
    if (!childForm.name || !childForm.birthDate || !childForm.gender) {
      notifyWarning("Vui lòng điền đầy đủ thông tin bắt buộc!");

      return;
    }

    try {
      await dispatch(updateChild(childForm, child._id));
      setChildForm({ name: "", birthDate: "", gender: "", notes: "" });
      notifySuccess("Cập nhật hồ sơ bé thành công!");
      closeModal();
      closeModal;
    } catch (error) {
      notifyError(error.response.data.message || "Đã xảy ra lỗi");
    }
  };

  return (
    <div className="fixed inset-0 bg-[#00000015] bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Cập nhật hồ sơ bé
        </h3>

        <form onSubmit={updateChildHandle} className="space-y-4">
          <ValueInput
            label="Tên bé"
            name="name"
            value={childForm.name}
            onChange={handleChange}
            placeholder="Nhập tên bé"
            icon={Baby}
            required
          />

          <ValueInput
            label="Ngày sinh"
            type="date"
            name="birthDate"
            value={childForm.birthDate}
            onChange={handleChange}
            icon={Calendar}
            required
          />

          <SelectInput
            label="Giới tính"
            value={childForm.gender}
            name="gender"
            onChange={handleChange}
            options={[
              { value: "", label: "Chọn giới tính" },
              { value: "male", label: "Bé trai" },
              { value: "female", label: "Bé gái" },
            ]}
            icon={User}
            required
          />

          <div className="flex flex-col">
            <label className="text-xs pb-1 text-gray-700">Ghi chú</label>
            <textarea
              value={childForm.notes}
              name="notes"
              onChange={handleChange}
              placeholder="Ghi chú thêm về bé (không bắt buộc)"
              className="w-full p-3 text-sm border border-gray-300 rounded-md hover:border-blue-500 focus:border-blue-500 outline-none resize-none"
              rows={3}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={closeModal}
              type="button"
              className="flex-1 px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Cập nhật
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateChildModal;

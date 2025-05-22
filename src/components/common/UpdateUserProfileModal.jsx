import Modal from "../layout/Modal";
import { useTheme } from "../../hook/useTheme";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { useNotify } from "../../hook/useNotify";
import { updateUserProfile } from "../../services/auth.service";
import { formatDateYYYYMMDD } from "../../utils/formatDate";

const UpdateUserProfileModal = ({ closeModal, currentData }) => {
  const dispatch = useDispatch();
  const { isDarkMode } = useTheme();
  const { notifySuccess, notifyError, notifyWarning } = useNotify();
  const { loading, error } = useSelector((state) => state.auth);
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    dateOfBirth: "",
    gender: "",
  });

  useEffect(() => {
    if (currentData) {
      setFormData({
        fullName: currentData.fullName || "",
        phone: currentData.phone || "",
        dateOfBirth: formatDateYYYYMMDD(currentData.dateOfBirth) || "",
        gender: currentData.gender || "",
      });
    }
  }, [currentData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.fullName ||
      !formData.phone ||
      !formData.dateOfBirth ||
      !formData.gender
    ) {
      notifyWarning("Vui lòng nhập đầy đủ thông tin!");
    }

    const hasChanges =
      formData.fullName !== currentData.fullName ||
      formData.phone !== currentData.phone ||
      formatDateYYYYMMDD(currentData.dateOfBirth) !== formData.dateOfBirth ||
      formData.gender !== currentData.gender;

    if (!hasChanges) {
      closeModal();
      return notifyWarning("Không có thông tin nào thay đổi!");
    }

    try {
      const userData = {
        fullName: formData.fullName,
        phone: formData.phone,
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender,
      };

      const result = await dispatch(updateUserProfile(userData));
      if (result.success) {
        notifySuccess(result.message);
      }
    } catch (error) {
      notifyError(error.message);
    }
  };

  return (
    <Modal closeModal={closeModal}>
      <div
        className="w-[500px] flex flex-col bg-light-50 p-[26px] rounded-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <h1 className="font-bold text-2xl pb-[20px]">
          Cập nhật thông tin tài khoản
        </h1>
        <form
          onSubmit={handleSubmit}
          className="w-full flex flex-col gap-[25px]"
        >
          <div className="w-full flex flex-col">
            <span className="text-sm font-bold pb-[5px]">Tên đầy đủ</span>
            <div
              className={`w-full flex items-center border-[1px] ${
                isDarkMode
                  ? " border-dark-600 "
                  : "bg-dark-400 border-transparent"
              }  rounded-sm`}
            >
              <input
                className="flex-1  text-sm px-[5px] py-[8px] outline-none"
                placeholder="Nhập tên đầy đủ của bạn"
                type="text"
                name="fullName"
                value={formData.fullName}
                required
                onChange={handleChange}
              />
            </div>
          </div>
          <div className="w-full flex flex-col">
            <span className="text-sm font-bold pb-[5px]">Số điện thoại</span>
            <div
              className={`w-full flex items-center border-[1px] ${
                isDarkMode
                  ? " border-dark-600 "
                  : "bg-dark-400 border-transparent"
              }  rounded-sm`}
            >
              <input
                className="flex-1  text-sm px-[5px] py-[8px] outline-none"
                placeholder="Nhập tên đầy đủ của bạn"
                type="phone"
                name="phone"
                value={formData.phone}
                required
                onChange={handleChange}
              />
            </div>
          </div>
          <div className="w-full flex items-center gap-[10px]">
            <div className="w-6/12 flex flex-col">
              <span className="text-sm font-bold pb-[5px]">Giới tính</span>
              <select
                className={`w-full flex items-center border-[1px] py-[6px] outline-none ${
                  isDarkMode
                    ? "border-dark-600"
                    : "bg-dark-400 border-transparent"
                } rounded-sm`}
                name="gender"
                value={formData.gender}
                onChange={handleChange}
              >
                <option value="" disabled>
                  Chọn giới tính
                </option>
                <option value="male">Nam</option>
                <option value="female">Nữ</option>
              </select>
            </div>{" "}
            <div className="w-6/12 flex flex-col">
              <span className="text-sm font-bold pb-[5px]">Ngày sinh</span>
              <div
                className={`w-full flex items-center border-[1px] ${
                  isDarkMode
                    ? " border-dark-600 "
                    : "bg-dark-400 border-transparent"
                }  rounded-sm`}
              >
                <input
                  className="flex-1  text-sm px-[5px] py-[8px] outline-none"
                  placeholder="Nhập tên đầy đủ của bạn"
                  type="Date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  required
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>
          <div className="w-full flex flex-col gap-[15px]">
            {" "}
            <button
              type="submit"
              disabled={loading}
              className={`w-full flex justify-center items-center rounded-sm py-[8px] text-sm text-light-50 font-bold 
          ${loading ? "bg-gray-400" : "bg-green-500 hover:bg-dark-600"} 
          transition-colors cursor-pointer`}
            >
              <span>{loading ? "Đang xử lý..." : "Xác nhận"}</span>
            </button>
            <button
              disabled={loading}
              onClick={closeModal}
              className={`w-full flex justify-center items-center rounded-sm py-[8px] text-sm border-[1px] border-dark-600 font-bold cursor-pointer `}
            >
              <span>Quay lại</span>
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default UpdateUserProfileModal;

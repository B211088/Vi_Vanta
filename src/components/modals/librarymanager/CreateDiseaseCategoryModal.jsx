import React, { useState } from "react";
import Modal from "../../layout/Modal";
import { useTheme } from "../../../hook/useTheme";
import { useDispatch, useSelector } from "react-redux";
import SubmitButton from "../../common/buttons/SubmitButton";
import CancelButton from "../../common/buttons/CancelButton";
import { createDiseaseCategoryHandle } from "../../../services/disease.service";
import { useNotify } from "../../../hook/useNotify";

const CreateDiseaseCategoryModal = ({ closeModal, parent }) => {
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.disease);
  const { isDarkMode } = useTheme();
  const { notifySuccess, notifyWarning, notifyError } = useNotify();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    parent: parent?._id ? parent?._id : "",
  });
  console.log({ formData });
  console.log({ parent });
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { name, description } = formData;
      if (!name) {
        notifyWarning("Chưa có tên phân loại!");
        return;
      }
      if (!description) {
        notifyWarning("Chưa có mô tả phân loại!");
        return;
      }
      const data = await dispatch(createDiseaseCategoryHandle(formData));
      if (data) {
        notifySuccess("Tạo phân loại mới thành công!");
        closeModal();
      }
    } catch (error) {
      notifyError(
        error.response?.data?.message || "Không thể tạo phân loại mới!"
      );
    }
  };
  return (
    <Modal closeModal={closeModal}>
      <div
        className="w-6/12 max-w-[600px] flex flex-col bg-light-50 p-[26px] rounded-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <h1 className="font-bold text-2xl pb-[20px]">
          {parent?.name ? (
            <span>Thêm phân loại cho: {parent.name}</span>
          ) : (
            <span>Thêm phân loại gốc</span>
          )}
        </h1>
        <form
          onSubmit={handleSubmit}
          className="w-full flex flex-col gap-[25px]"
        >
          <div className="w-full flex flex-col">
            <span className="text-sm font-bold pb-[5px]">Tên phần loại</span>
            <div
              className={`w-full flex items-center border-[1px] ${
                isDarkMode
                  ? " border-dark-600 "
                  : "bg-dark-400 border-transparent"
              }  rounded-sm`}
            >
              <input
                className="flex-1  text-sm px-[5px] py-[8px] outline-none"
                placeholder="Nhập phân loại"
                type="text"
                name="name"
                value={formData.name}
                required
                onChange={handleChange}
              />
            </div>
          </div>
          <div className="w-full flex flex-col">
            <span className="text-sm font-bold pb-[5px]">Mô tả phân loại</span>
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
                name="description"
                value={formData.description}
                required
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="w-full flex flex-col gap-[15px]">
            <SubmitButton loading={loading} />
            <CancelButton loading={loading} closeModal={closeModal} />
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default CreateDiseaseCategoryModal;

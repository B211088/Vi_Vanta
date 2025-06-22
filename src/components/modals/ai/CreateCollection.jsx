import React, { useEffect, useState } from "react";
import Modal from "../../layout/Modal";
import { useTheme } from "../../../hook/useTheme";
import SubmitButton from "../../common/buttons/SubmitButton";
import CancelButton from "../../common/buttons/CancelButton";
import { useDispatch, useSelector } from "react-redux";
import { getAllAIModel } from "../../../services/chatbot.service";
import { createCollection } from "../../../services/collection.service";
import { useNotify } from "../../../hook/useNotify";

const CreateCollection = ({ closeModal }) => {
  const dispatch = useDispatch();
  const { isDarkMode } = useTheme();
  const { loading, collection } = useSelector((state) => state.collection);
  const { models } = useSelector((state) => state.chatbot);
  const { notifySuccess, notifyWarning, notifyError, notifyConfirm } =
    useNotify();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    embeddingTemplate: "",
  });
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await dispatch(createCollection(formData));
      if (response.success) {
        notifySuccess(`Tạo bộ dữ liệu ${formData.name} thành công!`);
        closeModal();
      }
    } catch (error) {
      console.error("Error:", error);
      notifyWarning(
        error.response?.data?.message || "Không thể tạo bộ dữ liệu!"
      );
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  useEffect(() => {
    dispatch(getAllAIModel());
  }, []);

  console.log({ formData });

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
            <span className="text-sm font-bold pb-[5px]">Tên bộ dữ liệu</span>
            <div
              className={`w-full flex items-center border-[1px] ${
                isDarkMode
                  ? " border-dark-600 "
                  : "bg-dark-400 border-transparent"
              }  rounded-sm`}
            >
              <input
                className="flex-1  text-sm px-[5px] py-[8px] outline-none"
                placeholder="Nhập tên bộ dữ liệu"
                type="text"
                name="name"
                required
                onChange={handleChange}
              />
            </div>
          </div>
          <div className="w-full flex flex-col">
            <span className="text-sm font-bold pb-[5px]">Mô tả bộ dữ liệu</span>
            <div
              className={`w-full flex items-center border-[1px] ${
                isDarkMode
                  ? " border-dark-600 "
                  : "bg-dark-400 border-transparent"
              }  rounded-sm`}
            >
              <input
                className="flex-1  text-sm px-[5px] py-[8px] outline-none"
                placeholder="Nhập mô tả bộ dữ liệu"
                type="text"
                name="description"
                required
                onChange={handleChange}
              />
            </div>
          </div>
          <div className="w-full flex flex-col">
            <span className="text-sm font-bold pb-[5px]">
              Modal AI Embedding
            </span>
            <select
              className={`w-full flex items-center border-[1px] py-[6px] text-sm outline-none ${
                isDarkMode
                  ? "border-dark-600 text-dark-400"
                  : "bg-dark-400 border-transparent"
              } rounded-sm`}
              name="embeddingTemplate"
              value={formData.embeddingTemplate || ""}
              onChange={handleChange}
            >
              <option value="" disabled>
                Chọn model embedding
              </option>
              {models?.map((modal) => (
                <option key={modal._id} value={modal._id}>
                  {modal?.name}
                </option>
              ))}
            </select>
          </div>{" "}
          <div className="w-full flex flex-col gap-[15px]">
            <SubmitButton loading={loading} />
            <CancelButton loading={loading} closeModal={closeModal} />
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default CreateCollection;

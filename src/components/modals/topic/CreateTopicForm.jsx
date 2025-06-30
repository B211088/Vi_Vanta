import { useCallback, useState } from "react";
import Modal from "../../layout/Modal";
import InputField from "../../common/fields/InputField";
import TextAreaFiels from "../../common/fields/TextAreaFiels";
import { useDispatch, useSelector } from "react-redux";
import { useNotify } from "../../../hook/useNotify";

import { createImage } from "../../../utils/createImage";
import Cropper from "react-easy-crop";
import { createTopic } from "../../../services/topic.service";

const CreateTopicForm = ({ closeModal, parent }) => {
  const dispatch = useDispatch();
  const { loading, error, topics } = useSelector((state) => state.topic);
  const { notifySuccess, notifyWarning, notifyError } = useNotify();
  const [status, setStatus] = useState(null);
  const [parentId, setParentId] = useState(parent?._id || null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    status: "",
    parent: parentId || "",
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [imageAfterCrop, setImageAfterCrop] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const getCroppedImg = async (imageSrc, pixelCrop) => {
    const image = await createImage(imageSrc);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;

    ctx.drawImage(
      image,
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height,
      0,
      0,
      pixelCrop.width,
      pixelCrop.height
    );

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        resolve(blob);
      }, "image/jpeg");
    });
  };

  const onCropComplete = useCallback(
    async (_, croppedAreaPixels) => {
      const croppedImageBlob = await getCroppedImg(
        imagePreview,
        croppedAreaPixels
      );
      setImageAfterCrop(croppedImageBlob);
    },
    [imagePreview]
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    try {
      e.preventDefault();
      if (!formData.name) {
        notifyWarning("Vui lòng nhập tên chuyên mục!");
        return;
      }
      if (!formData.description) {
        notifyWarning("Vui lòng nhập mô tả chuyên mục!");
        return;
      }
      if (!formData.status) {
        notifyWarning("Vui lòng chọn trạng thái chuyên mục!");
        return;
      }
      if (!imageAfterCrop) {
        notifyWarning("Vui lòng nhập tên chuyên mục!");
        return;
      }
      const data = new FormData();

      data.append("name", formData.name);
      data.append("description", formData.description);
      data.append("status", formData.status || "pending");
      if (parent) {
        data.append("parent", formData.parent);
      }

      if (imageAfterCrop) {
        const file = new File([imageAfterCrop], "avatar.jpg", {
          type: imageAfterCrop.type || "image/jpeg",
        });
        data.append("image", file);
      }

      // Gửi dữ liệu
      const response = await dispatch(createTopic(data));
      notifySuccess(response.message);
      closeModal();
    } catch (error) {
      console.log(error);
      notifyError("Lõi khi tạo chuyên mục:", error.message);
    }
  };

  return (
    <Modal closeModal={closeModal}>
      <form
        onSubmit={handleSubmit}
        className="w-8/12 flex flex-col bg-light-50 rounded-md overflow-hidden"
      >
        {parent ? (
          <h1 className="px-4 py-4 font-bold text-md ">
            Tạo chuyên con cho: {parent?.name}
          </h1>
        ) : (
          <h1 className="px-4 py-4 font-bold text-md ">Tạo chuyên mục mới</h1>
        )}
        <div className="w-full flex ">
          <div className="w-6/12 ">
            <div className="w-full px-4 py-2 flex flex-col gap-3">
              <InputField
                label={"Tên chuyên mục"}
                placeholder={"Nhập tên chuyên mục"}
                name={"name"}
                type={"text"}
                disabled={loading}
                onChange={handleChange}
              />
              <TextAreaFiels
                label={"Mô tả chuyên mục"}
                placeholder={"Nhập mô tả chuyên mục chuyên mục"}
                name={"description"}
                type={"text"}
                height={210}
                disabled={loading}
                onChange={handleChange}
              />
            </div>
          </div>
          <div className="w-6/12">
            <div className="w-full px-4 py-2 flex flex-col gap-3">
              <div className="w-full flex items-center gap-[5px] border-1 rounded-md border-dark-600 px-[5px] py-[8px]">
                <i className="fa-regular fa-chart-bar"></i>
                <select
                  disabled={loading}
                  className="flex-1 outline-none border-none text-[0.8rem] cursor-pointer"
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value })
                  }
                  value={formData.status}
                >
                  <option id="" value="" disabled>
                    Chọn trạng thái
                  </option>
                  <option id="pending" value="pending">
                    Chờ duyệt
                  </option>
                  <option id="active" value="active">
                    Hoạt động
                  </option>
                  <option id="deleted" value="deleted">
                    Đã xóa
                  </option>
                </select>
              </div>
            </div>
            <div className="w-full flex flex-col  bg-light-50 px-4 pt-4 rounded-lg">
              <label
                htmlFor="file-upload"
                className="w-full flex items-center justify-center py-[10px] rounded-lg border-[1px] border-dashed border-dark-700 cursor-pointer hover:border-green-500 hover:text-green-500"
              >
                <span>
                  {!imagePreview ? "Chọn ảnh cho chuyên mục" : "Chọn ảnh khác"}
                </span>
                <input
                  disabled={loading}
                  id="file-upload"
                  type="file"
                  accept="images/*"
                  className="hidden"
                  onChange={handleImageChange}
                />
              </label>
              {imagePreview && (
                <div className="w-full relative mt-[10px] flex items-center justify-center  rounded-lg border-[1px] border-dashed border-dark-700 cursor-pointer">
                  <div className="relative w-full h-[210px] rounded-[5px] overflow-hidden p-[10px] ">
                    <Cropper
                      image={imagePreview}
                      crop={crop}
                      zoom={zoom}
                      aspect={1 / 1}
                      onCropChange={setCrop}
                      onCropComplete={onCropComplete}
                      onZoomChange={setZoom}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="w-full p-4 flex items-center gap-2">
          <button
            disabled={loading}
            onClick={closeModal}
            className="w-6/12 px-5 py-1 border-1 border-dark-700 rounded-sm cursor-pointer"
          >
            Hủy
          </button>
          <button
            disabled={loading}
            type="submit"
            className={`w-6/12 px-5 py-1 border-1 border-transparent ${
              loading ? "bg-dark-500" : " bg-blue-500"
            } text-light-50 rounded-sm cursor-pointer`}
          >
            {loading ? "Đang tạo vui lòng chờ" : "Tạo"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default CreateTopicForm;

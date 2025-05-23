import React, { useCallback, useState } from "react";
import Modal from "../layout/Modal";
import { useDispatch, useSelector } from "react-redux";
import Cropper from "react-easy-crop";
import { createImage } from "../../utils/createImage";
import { uploadUserAvatar } from "../../services/auth.service";
import { useNotify } from "../../hook/useNotify";

const UploadUserAvatarModal = ({ closeModal }) => {
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.auth);
  const { notifySuccess, notifyError, notifyWarning } = useNotify();
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarAfterCrop, setAvatarAfterCrop] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarPreview(URL.createObjectURL(file));
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
        avatarPreview,
        croppedAreaPixels
      );
      setAvatarAfterCrop(croppedImageBlob);
    },
    [avatarPreview]
  );

  const handleUploadAvatar = async () => {
    if (!avatarPreview) {
      notifyWarning("Vui lòng chọn ảnh");
      return;
    }
    try {
      const response = await dispatch(uploadUserAvatar(avatarAfterCrop));
      if (response.success) {
        notifySuccess(response.message);
        closeModal();
      }
    } catch (error) {
      notifyError(error.message);
    }
  };

  return (
    <Modal closeModal={loading ? null : closeModal}>
      <div
        className="w-6/12 flex flex-col  bg-light-50 p-[26px] rounded-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-full flex  justify-center font-bold text-xl pb-[20px]">
          <h1> Cập nhật ảnh đại diện người dùng</h1>
        </div>
        <label
          htmlFor="file-upload"
          className="w-full flex items-center justify-center py-[10px] rounded-lg border-[1px] border-dashed border-dark-700 cursor-pointer hover:border-green-500 hover:text-green-500"
        >
          <span>
            {!avatarPreview ? "Chọn ảnh từ thiết bị" : "Chọn ảnh khác"}
          </span>
          <input
            id="file-upload"
            type="file"
            accept="images/*"
            className="hidden"
            onChange={handleImageChange}
          />
        </label>
        {avatarPreview && (
          <div className="w-full relative mt-[10px] flex items-center justify-center  rounded-lg border-[1px] border-dashed border-dark-700 cursor-pointer">
            <div className="relative w-full h-[400px] rounded-[5px] overflow-hidden p-[10px] ">
              <Cropper
                image={avatarPreview}
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

        <div className="w-full flex flex-col gap-[15px] mt-[20px]">
          <button
            disabled={loading}
            onClick={handleUploadAvatar}
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
      </div>
    </Modal>
  );
};

export default UploadUserAvatarModal;

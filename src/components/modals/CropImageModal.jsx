import { useState } from "react";
import Cropper from "react-easy-crop";
import Modal from "../layout/Modal";

const CropImageModal = ({ image, onClose, onCropDone, aspectRatio }) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedArea, setCroppedArea] = useState(null);

  const onCropComplete = (croppedAreaPercentage, croppedAreaPixels) => {
    setCroppedArea(croppedAreaPixels);
  };

  const handleCropDone = async () => {
    const croppedImage = await getCroppedImg(image, croppedArea);
    onCropDone(croppedImage);
    onClose();
  };

  return (
    <Modal onClose={onClose}>
      <div className="w-full flex flex-col items-center justify-center ">
        <div className="w-6/12 p-[20px] rounded-lg bg-light-50">
          <div className="relative w-full h-[400px] rounded-[5px] overflow-hidden p-[10px] ">
            <Cropper
              image={image}
              crop={crop}
              zoom={zoom}
              aspect={aspectRatio}
              onCropChange={setCrop}
              onCropComplete={onCropComplete}
              onZoomChange={setZoom}
            />
          </div>
          <div className="w-full  flex flex-col gap-[8px] mt-4 ">
            <button
              onClick={handleCropDone}
              className="px-4 py-2 bg-blue-500 text-white rounded"
            >
              Cắt ảnh
            </button>{" "}
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-400 text-white rounded"
            >
              Hủy
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default CropImageModal;

const getCroppedImg = async (imageSrc, cropArea) => {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  canvas.width = cropArea.width;
  canvas.height = cropArea.height;

  ctx.drawImage(
    image,
    cropArea.x,
    cropArea.y,
    cropArea.width,
    cropArea.height,
    0,
    0,
    cropArea.width,
    cropArea.height
  );

  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(URL.createObjectURL(blob)), "image/jpeg");
  });
};

const createImage = (url) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = url;
    img.onload = () => resolve(img);
    img.onerror = (error) => reject(error);
  });
};

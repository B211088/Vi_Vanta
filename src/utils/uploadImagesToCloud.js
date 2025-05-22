import cloudinary from "../config/cloudinaryConfig.js";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";

export const uploads = async (file, userId, imageName) => {
  try {
    const result = await cloudinary.uploader.upload(file.path, {
      folder: imageName,
      public_id: `${imageName}_${userId}_${uuidv4()}`,
      resource_type: "auto",
    });

    fs.unlinkSync(file.path); // Xóa file tạm sau khi upload

    return {
      url: result.secure_url,
    };
  } catch (error) {
    console.error("Có lỗi xảy ra trong quá trình upload ảnh", error);
    throw new Error("Có lỗi xảy ra trong quá trình upload ảnh");
  }
};

export const deleteFromCloudinary = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error("Lỗi khi xóa ảnh từ Cloudinary:", error);
    throw new Error("Không thể xóa ảnh từ Cloudinary");
  }
};

export const extractPublicIdFromUrl = (url) => {
  const parts = url.split("/");
  const fileWithExtension = parts[parts.length - 1];
  const publicIdWithFolder = parts
    .slice(parts.indexOf("upload") + 1)
    .join("/")
    .replace(/\.[^/.]+$/, "");
  return publicIdWithFolder;
};

export const extractPublicId = (url) => {
  try {
    if (!url) return null;

    // Match the pattern after /upload/
    const regex = /\/upload\/(?:v\d+\/)?(.+)\.(?:jpg|jpeg|png|gif)/i;
    const matches = url.match(regex);

    if (!matches || matches.length < 2) return null;

    return matches[1];
  } catch (error) {
    console.error("Error extracting public_id:", error);
    return null;
  }
};

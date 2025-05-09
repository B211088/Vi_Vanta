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

    const pictureDocument = result.secure_url;

    fs.unlinkSync(file.path);

    return pictureDocument;
  } catch (error) {
    console.error("Có lỗi xảy ra trong quá trình upload ảnh", error);
    throw new Error("Có lỗi xảy ra trong quá trình upload ảnh");
  }
};

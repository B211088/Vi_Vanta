import Prevention from "../models/prevention.model.js";
import {
  deleteFromCloudinary,
  extractPublicIdFromUrl,
} from "../utils/uploadImagesToCloud.js";

// Tạo một biện pháp phòng ngừa mới
export const createPreventionHandle = async (payload) => {
  const { name, description, images } = payload;
  try {
    const newPrevention = new Prevention({
      name,
      description,
      images,
    });
    await newPrevention.save();
    return newPrevention;
  } catch (error) {
    console.error("Lỗi khi tạo biện pháp phòng ngừa:", error.message);
    throw new Error("Lỗi khi tạo biện pháp phòng ngừa");
  }
};

// Lấy danh sách tất cả biện pháp phòng ngừa
export const getAllPreventionsHandle = async () => {
  try {
    const preventions = await Prevention.find().select(
      "-__v -createdAt -updatedAt"
    );
    return preventions;
  } catch (error) {
    console.error("Lỗi khi lấy danh sách biện pháp phòng ngừa:", error.message);
    throw new Error("Lỗi khi lấy danh sách biện pháp phòng ngừa");
  }
};

// Lấy thông tin chi tiết một biện pháp phòng ngừa
export const getPreventionByIdHandle = async (preventionId) => {
  try {
    const prevention = await Prevention.findById(preventionId).select(
      "-__v -createdAt -updatedAt"
    );
    if (!prevention) {
      throw new Error("Không tìm thấy biện pháp phòng ngừa");
    }
    return prevention;
  } catch (error) {
    console.error("Lỗi khi lấy thông tin biện pháp phòng ngừa:", error.message);
    throw new Error("Lỗi khi lấy thông tin biện pháp phòng ngừa");
  }
};

// Cập nhật thông tin biện pháp phòng ngừa
export const updatePreventionHandle = async (preventionId, payload) => {
  const { name, description, images } = payload;

  try {
    // Lấy prevention hiện tại để lấy ảnh cũ
    const current = await Prevention.findById(preventionId);

    if (!current) {
      throw new Error("Không tìm thấy biện pháp phòng ngừa để cập nhật");
    }

    // Trích xuất public_id từ ảnh cũ để xóa
    const publicIdsToDelete = current.images.map((image) => image.public_id);

    // Tiến hành xóa các ảnh cũ
    const deletedResults = await Promise.all(
      publicIdsToDelete.map((publicId) => deleteFromCloudinary(publicId))
    );

    const anyFailed = deletedResults.some((res) => res.result !== "ok");
    if (anyFailed) {
      throw new Error("Lỗi khi xóa một hoặc nhiều ảnh từ Cloudinary");
    }

    // Cập nhật dữ liệu mới
    const updatedPrevention = await Prevention.findByIdAndUpdate(
      preventionId,
      { $set: { name, description, images } },
      { new: true }
    ).select("-__v -createdAt -updatedAt");

    return updatedPrevention;
  } catch (error) {
    console.error("Lỗi khi cập nhật biện pháp phòng ngừa:", error);
    throw new Error("Lỗi khi cập nhật biện pháp phòng ngừa");
  }
};
// Xóa một biện pháp phòng ngừa
export const deletePreventionHandle = async (preventionId) => {
  try {
    const deletedPrevention = await Prevention.findByIdAndDelete(preventionId);

    if (!deletedPrevention) {
      throw new Error("Không tìm thấy biện pháp phòng ngừa để xóa");
    }

    // Xóa các ảnh liên quan từ Cloudinary
    const publicIds = deletedPrevention.images.map(
      (images) => images.public_id
    );
    const deletedResults = await Promise.all(
      publicIds.map((publicId) => deleteFromCloudinary(publicId))
    );

    const anyFailed = deletedResults.some((res) => res.result !== "ok");
    if (anyFailed) {
      throw new Error("Lỗi khi xóa một hoặc nhiều ảnh từ Cloudinary");
    }

    return { message: "Xóa biện pháp phòng ngừa thành công" };
  } catch (error) {
    console.error("Lỗi khi xóa biện pháp phòng ngừa:", error.message);
    throw new Error("Lỗi khi xóa biện pháp phòng ngừa");
  }
};

import Cause from "../models/cause.model.js";
import { deleteFromCloudinary } from "../utils/uploadImagesToCloud.js";

// Tạo một nguyên nhân mới
export const createCauseHandle = async (payload) => {
  try {
    const newCause = new Cause(payload);
    await newCause.save();
    return newCause;
  } catch (error) {
    console.error("Lỗi khi tạo nguyên nhân:", error.message);
    throw new Error("Lỗi khi tạo nguyên nhân");
  }
};

// Lấy danh sách tất cả nguyên nhân
export const getAllCausesHandle = async () => {
  try {
    const causes = await Cause.find().select("-__v -createdAt -updatedAt");
    return causes;
  } catch (error) {
    console.error("Lỗi khi lấy danh sách nguyên nhân:", error.message);
    throw new Error("Lỗi khi lấy danh sách nguyên nhân");
  }
};

// Lấy thông tin chi tiết một nguyên nhân
export const getCauseByIdHandle = async (causeId) => {
  try {
    const cause = await Cause.findById(causeId).select(
      "-__v -createdAt -updatedAt"
    );
    if (!cause) {
      throw new Error("Không tìm thấy nguyên nhân");
    }
    return cause;
  } catch (error) {
    console.error("Lỗi khi lấy thông tin nguyên nhân:", error.message);
    throw new Error("Lỗi khi lấy thông tin nguyên nhân");
  }
};

// Cập nhật nguyên nhân
export const updateCauseHandle = async (causeId, payload) => {
  try {
    // Lấy thông tin nguyên nhân hiện tại
    const currentCause = await Cause.findById(causeId);
    if (!currentCause) {
      throw new Error("Không tìm thấy nguyên nhân để cập nhật");
    }

    // Xóa ảnh cũ nếu có
    if (currentCause.images && currentCause.images.length > 0) {
      const publicIdsToDelete = currentCause.images.map(
        (image) => image.public_id
      );

      // Tiến hành xóa các ảnh cũ
      await Promise.all(
        publicIdsToDelete.map(async (publicId) => {
          try {
            const result = await deleteFromCloudinary(publicId);
            if (result.result !== "ok") {
              console.warn(`Không thể xóa ảnh với public_id: ${publicId}`);
            }
          } catch (error) {
            console.error(`Lỗi khi xóa ảnh với public_id: ${publicId}`, error);
          }
        })
      );
    }

    // Cập nhật thông tin nguyên nhân
    const updatedCause = await Cause.findByIdAndUpdate(
      causeId,
      { $set: payload },
      { new: true }
    ).select("-__v -createdAt -updatedAt");

    if (!updatedCause) {
      throw new Error("Không thể cập nhật nguyên nhân");
    }

    return updatedCause;
  } catch (error) {
    console.error("Lỗi khi cập nhật nguyên nhân:", error.message);
    throw new Error("Lỗi khi cập nhật nguyên nhân");
  }
};

// Xóa nguyên nhân
export const deleteCauseHandle = async (causeId) => {
  try {
    // Lấy thông tin nguyên nhân để lấy danh sách ảnh
    const cause = await Cause.findById(causeId);
    if (!cause) {
      throw new Error("Không tìm thấy nguyên nhân để xóa");
    }

    // Xóa ảnh liên quan nếu có
    if (cause.images && cause.images.length > 0) {
      const publicIdsToDelete = cause.images.map((image) => image.public_id);

      // Tiến hành xóa các ảnh
      await Promise.all(
        publicIdsToDelete.map(async (publicId) => {
          try {
            const result = await deleteFromCloudinary(publicId);
            if (result.result !== "ok") {
              console.warn(`Không thể xóa ảnh với public_id: ${publicId}`);
            }
          } catch (error) {
            console.error(`Lỗi khi xóa ảnh với public_id: ${publicId}`, error);
          }
        })
      );
    }

    // Xóa nguyên nhân khỏi cơ sở dữ liệu
    const deletedCause = await Cause.findByIdAndDelete(causeId);
    if (!deletedCause) {
      throw new Error("Không thể xóa nguyên nhân");
    }

    return { message: "Xóa nguyên nhân thành công" };
  } catch (error) {
    console.error("Lỗi khi xóa nguyên nhân:", error.message);
    throw new Error("Lỗi khi xóa nguyên nhân");
  }
};

import { Treatment } from "../models/index.js";
import { deleteFromCloudinary } from "../utils/uploadImagesToCloud.js";

// Tạo một phương pháp điều trị mới
export const createTreatmentHandle = async (payload) => {
  try {
    const newTreatment = new Treatment(payload);
    await newTreatment.save();
    return newTreatment;
  } catch (error) {
    console.error("Lỗi khi tạo phương pháp điều trị:", error.message);
    throw new Error("Lỗi khi tạo phương pháp điều trị");
  }
};

// Lấy danh sách tất cả phương pháp điều trị
export const getAllTreatmentsHandle = async () => {
  try {
    const treatments = await Treatment.find()
      .populate("medications", "-__v -createdAt -updatedAt ")
      .select("-__v -createdAt -updatedAt");
    return treatments;
  } catch (error) {
    console.error("Lỗi khi lấy danh sách phương pháp điều trị:", error.message);
    throw new Error("Lỗi khi lấy danh sách phương pháp điều trị");
  }
};

// Lấy thông tin chi tiết một phương pháp điều trị
export const getTreatmentByIdHandle = async (treatmentId) => {
  try {
    const treatment = await Treatment.findById(treatmentId)
      .populate("medications", "-__v -createdAt -updatedAt")
      .select("-__v -createdAt -updatedAt");
    if (!treatment) {
      throw new Error("Không tìm thấy phương pháp điều trị");
    }
    return treatment;
  } catch (error) {
    console.error("Lỗi khi lấy thông tin phương pháp điều trị:", error.message);
    throw new Error("Lỗi khi lấy thông tin phương pháp điều trị");
  }
};

// Cập nhật phương pháp điều trị
export const updateTreatmentHandle = async (treatmentId, payload) => {
  try {
    // Lấy phương pháp điều trị hiện tại để lấy ảnh cũ
    const current = await Treatment.findById(treatmentId);
    if (!current) {
      throw new Error("Không tìm thấy phương pháp điều trị để cập nhật");
    }

    // Xóa ảnh cũ nếu có
    if (current.images && current.images.length > 0) {
      const publicIdsToDelete = current.images.map((image) => image.public_id);

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

    // Cập nhật phương pháp điều trị
    const updatedTreatment = await Treatment.findByIdAndUpdate(
      treatmentId,
      { $set: payload },
      { new: true }
    ).populate("medications", "-__v -createdAt -updatedAt");

    if (!updatedTreatment) {
      throw new Error("Không thể cập nhật phương pháp điều trị");
    }

    return updatedTreatment;
  } catch (error) {
    console.error("Lỗi khi cập nhật phương pháp điều trị:", error.message);
    throw new Error("Lỗi khi cập nhật phương pháp điều trị");
  }
};
// Xóa phương pháp điều trị
export const deleteTreatmentHandle = async (treatmentId) => {
  try {
    // Xóa phương pháp điều trị khỏi cơ sở dữ liệu
    const deletedTreatment = await Treatment.findByIdAndDelete(treatmentId);
    if (!deletedTreatment) {
      throw new Error("Không tìm thấy phương pháp điều trị để xóa");
    }

    // Xóa ảnh liên quan nếu có
    if (deletedTreatment.images && deletedTreatment.images.length > 0) {
      const publicIdsToDelete = deletedTreatment.images.map(
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

    // Trả về thông báo thành công
    return { message: "Xóa phương pháp điều trị thành công" };
  } catch (error) {
    console.error("Lỗi khi xóa phương pháp điều trị:", error.message);
    throw new Error("Lỗi khi xóa phương pháp điều trị");
  }
};

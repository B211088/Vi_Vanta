import { Symptom } from "../models/index.js";
import { deleteFromCloudinary } from "../utils/uploadImagesToCloud.js";

// Tạo một triệu chứng mới
export const createSymptomHandle = async (payload) => {
  try {
    const newSymptom = new Symptom(payload);
    await newSymptom.save();
    return newSymptom;
  } catch (error) {
    console.error("Lỗi khi tạo triệu chứng:", error.message);
    throw new Error("Lỗi khi tạo triệu chứng");
  }
};

// Lấy danh sách tất cả triệu chứng
export const getAllSymptomsHandle = async () => {
  try {
    const symptoms = await Symptom.find().select("-__v -createdAt -updatedAt");
    return symptoms;
  } catch (error) {
    console.error("Lỗi khi lấy danh sách triệu chứng:", error.message);
    throw new Error("Lỗi khi lấy danh sách triệu chứng");
  }
};

// Lấy thông tin chi tiết một triệu chứng
export const getSymptomByIdHandle = async (symptomId) => {
  try {
    const symptom = await Symptom.findById(symptomId).select(
      "-__v -createdAt -updatedAt"
    );
    if (!symptom) {
      throw new Error("Không tìm thấy triệu chứng");
    }
    return symptom;
  } catch (error) {
    console.error("Lỗi khi lấy thông tin triệu chứng:", error.message);
    throw new Error("Lỗi khi lấy thông tin triệu chứng");
  }
};

// Cập nhật triệu chứng
export const updateSymptomHandle = async (symptomId, payload) => {
  try {
    // Lấy triệu chứng hiện tại để lấy ảnh cũ
    const current = await Symptom.findById(symptomId);
    if (!current) {
      throw new Error("Không tìm thấy triệu chứng để cập nhật");
    }
    // Xóa ảnh cũ nếu có
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

    const updatedSymptom = await Symptom.findByIdAndUpdate(
      symptomId,
      { $set: payload },
      { new: true }
    ).select("-__v -createdAt -updatedAt");
    if (!updatedSymptom) {
      throw new Error("Không tìm thấy triệu chứng để cập nhật");
    }
    return updatedSymptom;
  } catch (error) {
    console.error("Lỗi khi cập nhật triệu chứng:", error.message);
    throw new Error("Lỗi khi cập nhật triệu chứng");
  }
};

// Xóa triệu chứng
export const deleteSymptomHandle = async (symptomId) => {
  try {
    const deletedSymptom = await Symptom.findByIdAndDelete(symptomId);
    if (!deletedSymptom) {
      throw new Error("Không tìm thấy triệu chứng để xóa");
    }
    // Xóa ảnh liên quan nếu có
    // Trích xuất public_id từ ảnh cũ để xóa
    const publicIdsToDelete = deletedSymptom.images.map(
      (image) => image.public_id
    );

    // Tiến hành xóa các ảnh cũ
    const deletedResults = await Promise.all(
      publicIdsToDelete.map((publicId) => deleteFromCloudinary(publicId))
    );

    const anyFailed = deletedResults.some((res) => res.result !== "ok");
    if (anyFailed) {
      throw new Error("Lỗi khi xóa một hoặc nhiều ảnh từ Cloudinary");
    }
    // Trả về thông báo thành công
    return { message: "Xóa triệu chứng thành công" };
  } catch (error) {
    console.error("Lỗi khi xóa triệu chứng:", error.message);
    throw new Error("Lỗi khi xóa triệu chứng");
  }
};

import { searchDisease } from "../controllers/diseases.controller.js";
import Disease from "../models/disease.model.js";
import Medication from "../models/medication.model.js";
import { deleteFromCloudinary } from "../utils/uploadImagesToCloud.js";

// Tạo một thuốc mới
export const createMedicationHandle = async (payload) => {
  try {
    const newMedication = new Medication(payload);
    await newMedication.save();
    return newMedication;
  } catch (error) {
    console.error("Lỗi khi tạo thuốc:", error.message);
    throw new Error("Lỗi khi tạo thuốc");
  }
};

// Lấy danh sách tất cả thuốc
export const getAllMedicationsHandle = async (page, limit) => {
  try {
    // Tính toán skip và limit cho phân trang
    const skip = (page - 1) * limit;

    // Lấy danh sách thuốc với phân trang
    const medications = await Medication.find()
      .select("name thumbnail description  category") // Chỉ lấy các trường cần thiết
      .populate("category", "name description") // Lấy thông tin danh mục thuốc
      .skip(skip)
      .limit(limit);

    // Đếm tổng số thuốc
    const totalMedications = await Medication.countDocuments();
    const totalPages = Math.ceil(totalMedications / limit);

    return {
      medications,
      pagination: {
        currentPage: page,
        totalPages,
        totalMedications,
      },
    };
  } catch (error) {
    console.error("Lỗi khi lấy danh sách thuốc:", error.message);
    throw new Error("Lỗi khi lấy danh sách thuốc");
  }
};

// Lấy thông tin chi tiết một thuốc
export const getMedicationByIdHandle = async (medicationId) => {
  try {
    const medication = await Medication.findById(medicationId).select(
      "-__v -createdAt -updatedAt"
    );
    if (!medication) {
      throw new Error("Không tìm thấy thuốc");
    }
    return medication;
  } catch (error) {
    console.error("Lỗi khi lấy thông tin thuốc:", error.message);
    throw new Error("Lỗi khi lấy thông tin thuốc");
  }
};

export const searchMedicationHandle = async (query, page = 1, limit = 10) => {
  try {
    const skip = (page - 1) * limit;
    const searchQuery = query
      ? {
          $and: [{ isActive: true }, { $text: { $search: query } }],
        }
      : { isActive: true };

    const [medication, total] = await Promise.all([
      Medication.find(searchQuery)
        .populate("_id name scientificName thumbnail description")
        .skip(skip)
        .limit(limit),
      Medication.countDocuments(searchQuery),
    ]);
    const totalPages = Math.ceil(total / limit);

    return {
      medication,
      pagination: {
        currentPage: page,
        totalPages,
        totalMedications: total,
      },
    };
  } catch (error) {
    console.error("Lỗi khi tìm kiếm bệnh:", error.message);
    throw new Error("Lỗi khi tìm kiếm bệnh");
  }
};

// Lấy danh sách thuốc theo danh mục với phân trang
export const getMedicationsByCategoryHandle = async (
  medicationCategoryId,
  page,
  limit
) => {
  try {
    // Tính toán skip và limit cho phân trang
    const skip = (page - 1) * limit;

    // Lấy danh sách thuốc theo categoryId với phân trang
    const medications = await Medication.find({
      category: medicationCategoryId,
    })
      .select("name thumbnail description  category") // Chỉ lấy các trường cần thiết
      .populate("category", "name description") // Lấy thông tin danh mục thuốc
      .skip(skip)
      .limit(limit);

    // Đếm tổng số thuốc trong danh mục
    const totalMedications = await Medication.countDocuments({
      category: medicationCategoryId,
    });
    const totalPages = Math.ceil(totalMedications / limit);

    return {
      medications,
      pagination: {
        currentPage: page,
        totalPages,
        totalMedications,
      },
    };
  } catch (error) {
    console.error("Lỗi khi lấy danh sách thuốc theo danh mục:", error.message);
    throw new Error("Lỗi khi lấy danh sách thuốc theo danh mục");
  }
};

// Cập nhật thông tin thuốc
export const updateMedicationHandle = async (medicationId, payload) => {
  try {
    // Lấy thông tin thuốc hiện tại
    const currentMedication = await Medication.findById(medicationId);
    if (!currentMedication) {
      throw new Error("Không tìm thấy thuốc để cập nhật");
    }

    // Xóa ảnh thumbnail cũ trên Cloudinary nếu có thumbnail mới
    if (payload.thumbnail && currentMedication.thumbnail) {
      try {
        const result = await deleteFromCloudinary(
          currentMedication.thumbnail.public_id
        );
        if (result.result !== "ok") {
          console.warn(
            `Không thể xóa ảnh thumbnail với public_id: ${currentMedication.thumbnail.public_id}`
          );
        }
      } catch (error) {
        console.error(
          `Lỗi khi xóa ảnh thumbnail với public_id: ${currentMedication.thumbnail.public_id}`,
          error
        );
      }
    }

    // Xóa ảnh cũ trên Cloudinary nếu có ảnh mới
    if (
      payload.images &&
      payload.images.length > 0 &&
      currentMedication.images.length > 0
    ) {
      await Promise.all(
        currentMedication.images.map(async (image) => {
          try {
            const result = await deleteFromCloudinary(image.public_id);
            if (result.result !== "ok") {
              console.warn(
                `Không thể xóa ảnh với public_id: ${image.public_id}`
              );
            }
          } catch (error) {
            console.error(
              `Lỗi khi xóa ảnh với public_id: ${image.public_id}`,
              error
            );
          }
        })
      );
    }

    // Nếu không có ảnh mới, giữ nguyên ảnh cũ
    const updatedImages =
      payload.images && payload.images.length > 0
        ? payload.images
        : currentMedication.images;

    // Cập nhật thuốc
    const updatedMedication = await Medication.findByIdAndUpdate(
      medicationId,
      {
        ...payload,
        images: updatedImages,
        thumbnail: payload.thumbnail || currentMedication.thumbnail,
      },
      { new: true }
    ).select("-__v -createdAt -updatedAt");

    if (!updatedMedication) {
      throw new Error("Không thể cập nhật thuốc");
    }

    return updatedMedication;
  } catch (error) {
    console.error("Lỗi khi cập nhật thuốc:", error.message);
    throw new Error("Lỗi khi cập nhật thuốc");
  }
};

// Xóa một thuốc
export const deleteMedicationHandle = async (medicationId) => {
  try {
    // Lấy thông tin thuốc để lấy danh sách ảnh
    const medication = await Medication.findById(medicationId);
    if (!medication) {
      throw new Error("Không tìm thấy thuốc để xóa");
    }

    // Xóa ảnh thumbnail trên Cloudinary nếu có
    if (medication.thumbnail) {
      try {
        const result = await deleteFromCloudinary(
          medication.thumbnail.public_id
        );
        if (result.result !== "ok") {
          console.warn(
            `Không thể xóa ảnh thumbnail với public_id: ${medication.thumbnail.public_id}`
          );
        }
      } catch (error) {
        console.error(
          `Lỗi khi xóa ảnh thumbnail với public_id: ${medication.thumbnail.public_id}`,
          error
        );
      }
    }

    // Xóa ảnh liên quan nếu có
    if (medication.images && medication.images.length > 0) {
      await Promise.all(
        medication.images.map(async (image) => {
          try {
            const result = await deleteFromCloudinary(image.public_id);
            if (result.result !== "ok") {
              console.warn(
                `Không thể xóa ảnh với public_id: ${image.public_id}`
              );
            }
          } catch (error) {
            console.error(
              `Lỗi khi xóa ảnh với public_id: ${image.public_id}`,
              error
            );
          }
        })
      );
    }

    // Xóa thuốc khỏi cơ sở dữ liệu
    const deletedMedication = await Medication.findByIdAndDelete(medicationId);
    if (!deletedMedication) {
      throw new Error("Không thể xóa thuốc");
    }

    return { message: "Xóa thuốc thành công" };
  } catch (error) {
    console.error("Lỗi khi xóa thuốc:", error.message);
    throw new Error("Lỗi khi xóa thuốc");
  }
};

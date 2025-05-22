import MedicationCategory from "../models/medicationCategory.model.js";

// Tạo một danh mục thuốc mới
export const createMedicationCategoryHandle = async (payload) => {
  try {
    const newCategory = new MedicationCategory(payload);
    await newCategory.save();
    return newCategory;
  } catch (error) {
    console.error("Lỗi khi tạo danh mục thuốc:", error.message);
    throw new Error("Lỗi khi tạo danh mục thuốc");
  }
};

// Lấy danh sách tất cả danh mục thuốc
export const getAllMedicationCategoriesHandle = async () => {
  try {
    const categories = await MedicationCategory.find().select(
      "-__v -createdAt -updatedAt"
    );
    return categories;
  } catch (error) {
    console.error("Lỗi khi lấy danh sách danh mục thuốc:", error.message);
    throw new Error("Lỗi khi lấy danh sách danh mục thuốc");
  }
};

// Lấy thông tin chi tiết một danh mục thuốc
export const getMedicationCategoryByIdHandle = async (categoryId) => {
  try {
    const category = await MedicationCategory.findById(categoryId).select(
      "-__v -createdAt -updatedAt"
    );
    if (!category) {
      throw new Error("Không tìm thấy danh mục thuốc");
    }
    return category;
  } catch (error) {
    console.error("Lỗi khi lấy thông tin danh mục thuốc:", error.message);
    throw new Error("Lỗi khi lấy thông tin danh mục thuốc");
  }
};

// Cập nhật danh mục thuốc
export const updateMedicationCategoryHandle = async (categoryId, payload) => {
  try {
    const updatedCategory = await MedicationCategory.findByIdAndUpdate(
      categoryId,
      { $set: payload },
      { new: true }
    ).select("-__v -createdAt -updatedAt");

    if (!updatedCategory) {
      throw new Error("Không tìm thấy danh mục thuốc để cập nhật");
    }

    return updatedCategory;
  } catch (error) {
    console.error("Lỗi khi cập nhật danh mục thuốc:", error.message);
    throw new Error("Lỗi khi cập nhật danh mục thuốc");
  }
};

// Xóa một danh mục thuốc
export const deleteMedicationCategoryHandle = async (categoryId) => {
  try {
    const deletedCategory = await MedicationCategory.findByIdAndDelete(
      categoryId
    );
    if (!deletedCategory) {
      throw new Error("Không tìm thấy danh mục thuốc để xóa");
    }

    return { message: "Xóa danh mục thuốc thành công" };
  } catch (error) {
    console.error("Lỗi khi xóa danh mục thuốc:", error.message);
    throw new Error("Lỗi khi xóa danh mục thuốc");
  }
};

import DiseaseCategory from "../models/diseaseCategory.model.js";

// Tạo một danh mục bệnh mới
export const createDiseaseCategoryHandle = async (payload) => {
  try {
    const newCategory = new DiseaseCategory(payload);
    await newCategory.save();
    return newCategory;
  } catch (error) {
    console.error("Lỗi khi tạo danh mục bệnh:", error.message);
    throw new Error("Lỗi khi tạo danh mục bệnh");
  }
};

// Lấy danh sách tất cả danh mục bệnh
export const getAllDiseaseCategoriesHandle = async () => {
  try {
    const categories = await DiseaseCategory.find().select(
      "-__v -createdAt -updatedAt"
    );
    return categories;
  } catch (error) {
    console.error("Lỗi khi lấy danh sách danh mục bệnh:", error.message);
    throw new Error("Lỗi khi lấy danh sách danh mục bệnh");
  }
};

// Lấy thông tin chi tiết một danh mục bệnh
export const getDiseaseCategoryByIdHandle = async (categoryId) => {
  try {
    const category = await DiseaseCategory.findById(categoryId).select(
      "-__v -createdAt -updatedAt"
    );
    if (!category) {
      throw new Error("Không tìm thấy danh mục bệnh");
    }
    return category;
  } catch (error) {
    console.error("Lỗi khi lấy thông tin danh mục bệnh:", error.message);
    throw new Error("Lỗi khi lấy thông tin danh mục bệnh");
  }
};

// Cập nhật danh mục bệnh
export const updateDiseaseCategoryHandle = async (categoryId, payload) => {
  try {
    const updatedCategory = await DiseaseCategory.findByIdAndUpdate(
      categoryId,
      { $set: payload },
      { new: true }
    ).select("-__v -createdAt -updatedAt");

    if (!updatedCategory) {
      throw new Error("Không tìm thấy danh mục bệnh để cập nhật");
    }

    return updatedCategory;
  } catch (error) {
    console.error("Lỗi khi cập nhật danh mục bệnh:", error.message);
    throw new Error("Lỗi khi cập nhật danh mục bệnh");
  }
};

// Xóa một danh mục bệnh
export const deleteDiseaseCategoryHandle = async (categoryId) => {
  try {
    const deletedCategory = await DiseaseCategory.findByIdAndDelete(categoryId);
    if (!deletedCategory) {
      throw new Error("Không tìm thấy danh mục bệnh để xóa");
    }

    return { message: "Xóa danh mục bệnh thành công" };
  } catch (error) {
    console.error("Lỗi khi xóa danh mục bệnh:", error.message);
    throw new Error("Lỗi khi xóa danh mục bệnh");
  }
};

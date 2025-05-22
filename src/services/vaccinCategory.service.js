import VaccinCategory from "../models/vaccinCategory.model.js";

// Tạo một danh mục vắc-xin mới
export const createVaccinCategoryHandle = async (payload) => {
  try {
    const newCategory = new VaccinCategory(payload);
    await newCategory.save();
    return newCategory;
  } catch (error) {
    console.error("Lỗi khi tạo danh mục vắc-xin:", error.message);
    throw new Error("Lỗi khi tạo danh mục vắc-xin");
  }
};

// Lấy danh sách tất cả danh mục vắc-xin
export const getAllVaccinCategoriesHandle = async () => {
  try {
    const categories = await VaccinCategory.find().select(
      "-__v -createdAt -updatedAt"
    );
    return categories;
  } catch (error) {
    console.error("Lỗi khi lấy danh sách danh mục vắc-xin:", error.message);
    throw new Error("Lỗi khi lấy danh sách danh mục vắc-xin");
  }
};

// Lấy thông tin chi tiết một danh mục vắc-xin
export const getVaccinCategoryByIdHandle = async (categoryId) => {
  try {
    const category = await VaccinCategory.findById(categoryId).select(
      "-__v -createdAt -updatedAt"
    );
    if (!category) {
      throw new Error("Không tìm thấy danh mục vắc-xin");
    }
    return category;
  } catch (error) {
    console.error("Lỗi khi lấy thông tin danh mục vắc-xin:", error.message);
    throw new Error("Lỗi khi lấy thông tin danh mục vắc-xin");
  }
};

// Cập nhật thông tin danh mục vắc-xin
export const updateVaccinCategoryHandle = async (categoryId, payload) => {
  try {
    const updatedCategory = await VaccinCategory.findByIdAndUpdate(
      categoryId,
      payload,
      { new: true }
    );
    if (!updatedCategory) {
      throw new Error("Không tìm thấy danh mục vắc-xin để cập nhật");
    }
    return updatedCategory;
  } catch (error) {
    console.error("Lỗi khi cập nhật danh mục vắc-xin:", error.message);
    throw new Error("Lỗi khi cập nhật danh mục vắc-xin");
  }
};

// Xóa một danh mục vắc-xin
export const deleteVaccinCategoryHandle = async (categoryId) => {
  try {
    const deletedCategory = await VaccinCategory.findByIdAndDelete(categoryId);
    if (!deletedCategory) {
      throw new Error("Không tìm thấy danh mục vắc-xin để xóa");
    }
    return { message: "Xóa danh mục vắc-xin thành công" };
  } catch (error) {
    console.error("Lỗi khi xóa danh mục vắc-xin:", error.message);
    throw new Error("Lỗi khi xóa danh mục vắc-xin");
  }
};

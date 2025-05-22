import {
  createVaccinCategoryHandle,
  getAllVaccinCategoriesHandle,
  getVaccinCategoryByIdHandle,
  updateVaccinCategoryHandle,
  deleteVaccinCategoryHandle,
} from "../services/vaccinCategory.service.js";

// Tạo một danh mục vắc-xin mới
export const createVaccinCategory = async (req, res) => {
  try {
    const payload = req.body; // Lấy dữ liệu từ body request
    const newCategory = await createVaccinCategoryHandle(payload);
    res.status(201).json({
      message: "Tạo danh mục vắc-xin thành công!",
      data: newCategory,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Lấy danh sách tất cả danh mục vắc-xin
export const getAllVaccinCategories = async (req, res) => {
  try {
    const categories = await getAllVaccinCategoriesHandle();
    res.status(200).json({
      message: "Lấy danh sách danh mục vắc-xin thành công!",
      data: categories,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Lấy thông tin chi tiết một danh mục vắc-xin
export const getVaccinCategoryById = async (req, res) => {
  try {
    const { categoryId } = req.params; // Lấy categoryId từ params
    const category = await getVaccinCategoryByIdHandle(categoryId);
    res.status(200).json({
      message: "Lấy thông tin danh mục vắc-xin thành công!",
      data: category,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Cập nhật thông tin danh mục vắc-xin
export const updateVaccinCategory = async (req, res) => {
  try {
    const { categoryId } = req.params; // Lấy categoryId từ params
    const payload = req.body; // Lấy dữ liệu từ body request
    const updatedCategory = await updateVaccinCategoryHandle(
      categoryId,
      payload
    );
    res.status(200).json({
      message: "Cập nhật danh mục vắc-xin thành công!",
      data: updatedCategory,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Xóa một danh mục vắc-xin
export const deleteVaccinCategory = async (req, res) => {
  try {
    const { categoryId } = req.params; // Lấy categoryId từ params
    const result = await deleteVaccinCategoryHandle(categoryId);
    res.status(200).json({
      message: result.message,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

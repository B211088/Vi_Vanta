import {
  createDiseaseCategoryHandle,
  getAllDiseaseCategoriesHandle,
  getDiseaseCategoryByIdHandle,
  updateDiseaseCategoryHandle,
  deleteDiseaseCategoryHandle,
} from "../services/diseaseCategory.service.js";

// Tạo một danh mục bệnh mới
export const createDiseaseCategory = async (req, res) => {
  try {
    const payload = req.body;

    if (!payload || !payload.name) {
      return res.status(400).json({ message: "Vui lòng nhập tên danh mục!" });
    }

    const newCategory = await createDiseaseCategoryHandle(payload);
    res.status(201).json({
      message: "Tạo danh mục bệnh thành công!",
      category: newCategory,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Lấy danh sách tất cả danh mục bệnh
export const getAllDiseaseCategories = async (req, res) => {
  try {
    const categories = await getAllDiseaseCategoriesHandle();
    res.status(200).json({
      message: "Lấy danh sách danh mục bệnh thành công!",
      categories,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Lấy thông tin chi tiết một danh mục bệnh
export const getDiseaseCategoryById = async (req, res) => {
  try {
    const { categoryId } = req.params;

    const category = await getDiseaseCategoryByIdHandle(categoryId);
    res.status(200).json({
      message: "Lấy thông tin danh mục bệnh thành công!",
      category,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Cập nhật danh mục bệnh
export const updateDiseaseCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const payload = req.body;

    if (!payload || !payload.name) {
      return res.status(400).json({ message: "Vui lòng nhập tên danh mục!" });
    }

    const updatedCategory = await updateDiseaseCategoryHandle(
      categoryId,
      payload
    );
    res.status(200).json({
      message: "Cập nhật danh mục bệnh thành công!",
      category: updatedCategory,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Xóa một danh mục bệnh
export const deleteDiseaseCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;

    const result = await deleteDiseaseCategoryHandle(categoryId);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

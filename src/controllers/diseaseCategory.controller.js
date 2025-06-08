import {
  createDiseaseCategoryHandle,
  getAllDiseaseCategoriesHandle,
  getDiseaseCategoryByIdHandle,
  updateDiseaseCategoryHandle,
  deleteDiseaseCategoryHandle,
  getChildrenDiseaseCategoriesHandle,
} from "../services/diseaseCategory.service.js";

function validateDiseaseCategoryPayload(payload, res) {
  const { name, description } = payload;
  if (!name) {
    res.status(400).json({ message: "Vui lòng nhập đầy đủ thông tin!" });
    return false;
  }
  if (!description) {
    res.status(400).json({ message: "Vui lòng nhập mô tả!" });
    return false;
  }
  return true;
}

// Tạo danh mục bệnh mới
export const createDiseaseCategory = async (req, res) => {
  try {
    const payload = req.body;
    const userId = req.user.userId;
    if (!validateDiseaseCategoryPayload(payload, res)) return;
    payload.createdBy = userId;
    payload.updatedBy = userId;
    // Nếu có parent, kiểm tra hợp lệ
    if (
      payload.parent === "" ||
      payload.parent === undefined ||
      payload.parent === null
    ) {
      payload.parent = null;
    }
    const newDiseaseCategory = await createDiseaseCategoryHandle(payload);
    res.status(201).json({
      message: "Tạo danh mục bệnh thành công!",
      diseaseCategory: newDiseaseCategory,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Lấy tất cả danh mục bệnh (có phân trang, populate parent)
export const getAllDiseaseCategories = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const result = await getAllDiseaseCategoriesHandle(
      Number(page),
      Number(limit)
    );

    res.status(200).json({
      message: "Lấy danh sách danh mục bệnh thành công!",
      categories: result,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Lấy chi tiết một danh mục bệnh
export const getDiseaseCategoryById = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await getDiseaseCategoryByIdHandle(id);

    res.status(200).json({
      message: "Lấy chi tiết danh mục bệnh thành công!",
      category,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getChildrenDiseaseCategories = async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const categories = await getChildrenDiseaseCategoriesHandle(
      id,
      Number(page),
      Number(limit)
    );
    res.status(200).json({
      message: "Lấy danh sách danh mục bệnh con thành công!",
      categories,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Cập nhật danh mục bệnh
export const updateDiseaseCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const payload = req.body;
    payload.updatedBy = req.user.userId;
    // Nếu có parent, kiểm tra hợp lệ
    if (payload.parent === "" || payload.parent === undefined) {
      payload.parent = null;
    }
    const updatedCategory = await updateDiseaseCategoryHandle(id, payload);
    res.status(200).json({
      message: "Cập nhật danh mục bệnh thành công!",
      category: updatedCategory,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Xóa danh mục bệnh
export const deleteDiseaseCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await deleteDiseaseCategoryHandle(id);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

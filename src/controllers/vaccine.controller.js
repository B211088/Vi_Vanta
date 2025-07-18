import {
  createVaccineHandle,
  getAllVaccinesHandle,
  getVaccineByIdHandle,
  updateVaccineHandle,
  deleteVaccineHandle,
  getVaccinesByCategoryHandle,
} from "../services/vaccine.service.js";
import {
  createVaccinCategoryHandle,
  getAllVaccinCategoriesHandle,
  getVaccinCategoryByIdHandle,
  updateVaccinCategoryHandle,
  deleteVaccinCategoryHandle,
} from "../services/vaccinCategory.service.js";

import { uploads } from "../utils/uploadImagesToCloud.js";

// Tạo một vắc-xin mới
export const createVaccine = async (req, res) => {
  try {
    const payload = req.body;
    const newVaccine = await createVaccineHandle(payload);
    res.status(201).json({
      message: "Tạo vắc-xin thành công!",
      data: newVaccine,
    });
  } catch (error) {
    console.error("Lỗi khi tạo vắc-xin:", error.message);
    res.status(500).json({ message: error.message });
  }
};

// Lấy danh sách tất cả vắc-xin
export const getAllVaccines = async (req, res) => {
  try {
    // Lấy page và limit từ query params
    const { page = 1, limit = 10 } = req.query;
    const result = await getAllVaccinesHandle(Number(page), Number(limit));
    res.status(200).json({
      message: "Lấy danh sách vắc-xin thành công!",
      data: result,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Lấy thông tin chi tiết một vắc-xin
export const getVaccineById = async (req, res) => {
  try {
    const { vaccineId } = req.params; // Lấy vaccineId từ params
    const vaccine = await getVaccineByIdHandle(vaccineId);
    res.status(200).json({
      message: "Lấy thông tin vắc-xin thành công!",
      data: vaccine,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Cập nhật thông tin vắc-xin
export const updateVaccine = async (req, res) => {
  try {
    const { vaccineId } = req.params; // Lấy vaccineId từ params
    const payload = req.body; // Lấy dữ liệu từ body request

    const updatedVaccine = await updateVaccineHandle(vaccineId, payload);
    res.status(200).json({
      message: "Cập nhật thông tin vắc-xin thành công!",
      data: updatedVaccine,
    });
  } catch (error) {
    console.error("Lỗi khi cập nhật vắc-xin:", error.message);
    res.status(500).json({ message: error.message });
  }
};
// Xóa một vắc-xin
export const deleteVaccine = async (req, res) => {
  try {
    const { vaccineId } = req.params; // Lấy vaccineId từ params
    const result = await deleteVaccineHandle(vaccineId);
    res.status(200).json({
      message: result.message,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Lấy danh sách vắc-xin theo loại (category)
export const getVaccinesByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params; // Lấy categoryId từ params
    const { page = 1, limit = 10 } = req.query; // Lấy page và limit từ query params
    const result = await getVaccinesByCategoryHandle(
      categoryId,
      Number(page),
      Number(limit)
    );
    res.status(200).json({
      message: "Lấy danh sách vắc-xin theo loại thành công!",
      data: result,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

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

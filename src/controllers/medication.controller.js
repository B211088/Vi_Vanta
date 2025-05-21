import {
  createMedicationHandle,
  getAllMedicationsHandle,
  getMedicationByIdHandle,
  updateMedicationHandle,
  deleteMedicationHandle,
  getMedicationsByCategoryHandle,
} from "../services/medication.service.js";
import {
  createMedicationCategoryHandle,
  getAllMedicationCategoriesHandle,
  getMedicationCategoryByIdHandle,
  updateMedicationCategoryHandle,
  deleteMedicationCategoryHandle,
} from "../services/medicationCategory.service.js";
import { uploads } from "../utils/uploadImagesToCloud.js";

// Tạo một thuốc mới
export const createMedication = async (req, res) => {
  try {
    const payload = req.body;
    const userId = req.user.userId; // Lấy userId từ token đã xác thực
    const { images, thumbnail } = req.files;

    if (!payload) {
      return res
        .status(400)
        .json({ message: "Vui lòng nhập đầy đủ thông tin!" });
    }
    if (!images || images.length === 0) {
      return res.status(400).json({ message: "Vui lòng thêm ảnh!" });
    }

    if (!thumbnail || thumbnail.length === 0) {
      return res.status(400).json({ message: "Vui lòng thêm ảnh đại diện!" });
    }
    // Upload thumbnail lên Cloudinary
    const uploadedThumbnail = await uploads(thumbnail[0], userId, "Medication");
    payload.thumbnail = uploadedThumbnail;

    const imagesUrl = await Promise.all(
      images.map((file) => uploads(file, userId, "Medication"))
    );

    payload.images = imagesUrl;

    const newMedication = await createMedicationHandle(payload);
    res.status(201).json({
      message: "Tạo thuốc thành công!",
      medication: newMedication,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Lấy danh sách tất cả thuốc
export const getAllMedications = async (req, res) => {
  const { page = 1, limit = 10 } = req.query; // Lấy page và limit từ query params
  try {
    const medications = await getAllMedicationsHandle(page, limit);
    res.status(200).json({
      message: "Lấy danh sách thuốc thành công!",
      medications,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Lấy danh sách thuốc theo danh mục với phân trang
export const getMedicationsByCategory = async (req, res) => {
  try {
    const { medicationCategoryId } = req.params; // Lấy categoryId từ params
    const { page = 1, limit = 10 } = req.query; // Lấy page và limit từ query params

    // Gọi service để lấy danh sách thuốc theo danh mục
    const result = await getMedicationsByCategoryHandle(
      medicationCategoryId,
      Number(page),
      Number(limit)
    );

    res.status(200).json({
      message: "Lấy danh sách thuốc theo danh mục thành công!",
      data: result,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Lấy thông tin chi tiết một thuốc
export const getMedicationById = async (req, res) => {
  try {
    const { medicationId } = req.params;
    const medication = await getMedicationByIdHandle(medicationId);
    res.status(200).json({
      message: "Lấy thông tin thuốc thành công!",
      medication,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Cập nhật thông tin thuốc
export const updateMedication = async (req, res) => {
  try {
    const { medicationId } = req.params;
    const payload = req.body;
    const userId = req.user.userId;
    const images = req.files.images;
    const thumbnail = req.files.thumbnail;

    if (!payload) {
      return res
        .status(400)
        .json({ message: "Vui lòng nhập đầy đủ thông tin!" });
    }
    if (!thumbnail || thumbnail.length === 0) {
      return res.status(400).json({ message: "Vui lòng thêm ảnh đại diện!" });
    }
    if (!images || images.length === 0) {
      return res.status(400).json({ message: "Vui lòng thêm ảnh!" });
    }
    // Upload thumbnail lên Cloudinary
    const uploadedThumbnail = await uploads(thumbnail[0], userId, "Medication");

    payload.thumbnail = uploadedThumbnail;

    const imagesUploads = await Promise.all(
      images.map((image) => uploads(image, userId, "Medication"))
    );
    payload.images = imagesUploads;

    const updatedMedication = await updateMedicationHandle(
      medicationId,
      payload
    );
    res.status(200).json({
      message: "Cập nhật thuốc thành công!",
      medication: updatedMedication,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Xóa một thuốc
export const deleteMedication = async (req, res) => {
  try {
    const { medicationId } = req.params;
    const result = await deleteMedicationHandle(medicationId);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Tạo một danh mục thuốc mới
export const createMedicationCategory = async (req, res) => {
  try {
    const payload = req.body;

    if (!payload || !payload.name) {
      return res.status(400).json({ message: "Vui lòng nhập tên danh mục!" });
    }

    const newCategory = await createMedicationCategoryHandle(payload);
    res.status(201).json({
      message: "Tạo danh mục thuốc thành công!",
      category: newCategory,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Lấy danh sách tất cả danh mục thuốc
export const getAllMedicationCategories = async (req, res) => {
  try {
    const categories = await getAllMedicationCategoriesHandle();
    res.status(200).json({
      message: "Lấy danh sách danh mục thuốc thành công!",
      categories,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Lấy thông tin chi tiết một danh mục thuốc
export const getMedicationCategoryById = async (req, res) => {
  try {
    const { categoryId } = req.params;

    const category = await getMedicationCategoryByIdHandle(categoryId);
    res.status(200).json({
      message: "Lấy thông tin danh mục thuốc thành công!",
      category,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Cập nhật danh mục thuốc
export const updateMedicationCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const payload = req.body;

    if (!payload || !payload.name) {
      return res.status(400).json({ message: "Vui lòng nhập tên danh mục!" });
    }

    const updatedCategory = await updateMedicationCategoryHandle(
      categoryId,
      payload
    );
    res.status(200).json({
      message: "Cập nhật danh mục thuốc thành công!",
      category: updatedCategory,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Xóa một danh mục thuốc
export const deleteMedicationCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;

    const result = await deleteMedicationCategoryHandle(categoryId);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

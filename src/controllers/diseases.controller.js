import {
  createDiseaseHandle,
  getAllDiseasesHandle,
  getDiseaseByIdHandle,
  updateDiseaseHandle,
  deleteDiseaseHandle,
  getDiseasesByCategoryHandle,
  searchDiseasesHandle,
  toggleDiseaseActiveHandle,
  searchDiseasesActiveHandle,
} from "../services/disease.service.js";

import { uploads } from "../utils/uploadImagesToCloud.js";
import { parseArrayFields } from "../helpers/parseFields.js";

function validateDiseasePayload(payload, images, thumbnail, res) {
  if (!payload) {
    res.status(400).json({ message: "Vui lòng nhập đầy đủ thông tin!" });
    return false;
  }
  if (!images || images.length === 0) {
    res.status(400).json({ message: "Vui lòng thêm ảnh!" });
    return false;
  }
  if (!thumbnail || thumbnail.length === 0) {
    res.status(400).json({ message: "Vui lòng thêm ảnh đại diện!" });
    return false;
  }
  return true;
}

// Tạo một bệnh mới
export const createDisease = async (req, res) => {
  try {
    const payload = req.body;
    const userId = req.user.userId;
    const { images, thumbnail } = req.files;

    if (!validateDiseasePayload(payload, images, thumbnail, res)) return;

    const uploadedThumbnail = await uploads(thumbnail[0], userId, "Disease");
    payload.thumbnail = uploadedThumbnail;

    payload.images = await Promise.all(
      images.map((file) => uploads(file, userId, "Disease"))
    );

    // Parse array and nested fields if needed
    parseArrayFields(payload, [
      "category",
      "specialty",
      "tags",
      "keywords",
      "complications",
      "riskFactors",
      "symptoms",
      "causes",
      "treatments",
      "preventions",
      "relatedDiseases",
      "references",
      "guidelines",
    ]);
    parseArrayFields(payload, ["prognosis", "diagnosis", "history"]);

    // Set user info
    payload.createdBy = userId;
    payload.updatedBy = userId;

    // Create disease
    const disease = await createDiseaseHandle(payload);
    res.status(200).json({
      success: true,
      message: "Tạo bệnh thành công!",
      disease,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Lấy danh sách tất cả các bệnh
export const getAllDiseases = async (req, res) => {
  try {
    const { page = 1, limit = 10, status = "all" } = req.query;
    const diseases = await getAllDiseasesHandle(
      Number(page),
      Number(limit),
      status
    );
    res.status(200).json({
      message: "Lấy danh sách bệnh thành công!",
      diseases,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllDiseasesActive = async (req, res) => {
  try {
    const { isActive } = req.query;
    const { page = 1, limit = 10 } = req.query;
    const result = await getAllDiseasesActiveHandle(
      Number(page),
      Number(limit),
      isActive
    );
    res.status(200).json({
      message: "Lấy danh sách bệnh thành công!",
      data: result,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Lấy danh sách bệnh theo danh mục (DiseaseCategory)
export const getDiseasesByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const result = await getDiseasesByCategoryHandle(
      categoryId,
      Number(page),
      Number(limit)
    );

    res.status(200).json({
      message: "Lấy danh sách bệnh theo danh mục thành công!",
      data: result,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Lấy thông tin chi tiết một bệnh
export const getDiseaseById = async (req, res) => {
  try {
    const { diseaseId } = req.params;
    const disease = await getDiseaseByIdHandle(diseaseId);
    res.status(200).json({
      message: "Lấy thông tin bệnh thành công!",
      disease,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// tìm kiếm bệnh theo tên
export const searchDisease = async (req, res) => {
  try {
    const { name = "", page = 1, limit = 10 } = req.query;
    if (!name) {
      res.status(400).json({ message: "Không có tên bệnh!" });
    }
    const diseases = await searchDiseasesHandle(
      name,
      Number(page),
      Number(limit)
    );
    res.status(200).json({
      message: "Tìm kiếm bệnh thành công!",
      diseases,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// tìm kiếm bệnh theo tên
export const searchDiseaseActive = async (req, res) => {
  try {
    const { name = "", page = 1, limit = 10 } = req.query;
    if (!name) {
      res.status(400).json({ message: "Không có tên bệnh!" });
    }
    const diseases = await searchDiseasesActiveHandle(
      name,
      Number(page),
      Number(limit)
    );
    res.status(200).json({
      message: "Tìm kiếm bệnh thành công!",
      diseases,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Cập nhật thông tin bệnh
export const updateDisease = async (req, res) => {
  try {
    const { diseaseId } = req.params;
    const payload = req.body;
    const { images, thumbnail } = req.files;
    const userId = req.user.userId; // Lấy userId từ token đã xác thực
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

    const uploadedThumbnail = await uploads(thumbnail[0], userId, "Disease");
    payload.thumbnail = uploadedThumbnail;

    const imagesUrl = await Promise.all(
      images.map((file) => uploads(file, userId, "Disease"))
    );

    payload.images = imagesUrl;

    const updatedDisease = await updateDiseaseHandle(diseaseId, payload);
    res.status(200).json({
      message: "Cập nhật bệnh thành công!",
      disease: updatedDisease,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Public/Unpublic một bệnh (chuyển trạng thái isActive)
export const toggleDiseaseActive = async (req, res) => {
  try {
    const { diseaseId } = req.params;
    const { isActive } = req.body;

    console.log({ isActive });

    if (typeof isActive !== "boolean") {
      return res
        .status(400)
        .json({ message: "Trường isActive phải là true hoặc false!" });
    }

    const updatedDisease = await toggleDiseaseActiveHandle(diseaseId, isActive);
    res.status(200).json({
      message: `Đã cập nhật trạng thái bệnh thành ${
        isActive ? "public" : "private"
      } thành công!`,
      disease: updatedDisease,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Xóa một bệnh
export const deleteDisease = async (req, res) => {
  try {
    const { diseaseId } = req.params;
    const result = await deleteDiseaseHandle(diseaseId);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

import {
  createSymptomHandle,
  deleteSymptomHandle,
  getAllSymptomsHandle,
  getSymptomByIdHandle,
  updateSymptomHandle,
} from "../services/symptom.service";
import { uploads } from "../utils/uploadImagesToCloud";

// Tạo một triệu chứng mới
export const createSymptom = async (req, res) => {
  try {
    const payload = req.body;
    const images = req.files;
    if (!payload) {
      return res
        .status(400)
        .json({ message: "Vui lòng nhập đầy đủ thông tin!" });
    }
    if (!images || images.length === 0) {
      return res.status(400).json({ message: "Vui lòng thêm ảnh!" });
    }
    const imagesUrl = await Promise.all(
      images.map((file) => uploads(file, req.user.userId, "Symptom"))
    );
    payload.images = imagesUrl;
    const newSymptom = await createSymptomHandle(payload);
    res.status(201).json({
      message: "Tạo triệu chứng thành công!",
      symptom: newSymptom,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Lấy danh sách tất cả triệu chứng
export const getAllSymptoms = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const symptoms = await getAllSymptomsHandle(Number(page), Number(limit));
    res.status(200).json({
      message: "Lấy danh sách triệu chứng thành công!",
      symptoms,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Lấy thông tin chi tiết một triệu chứng
export const getSymptomById = async (req, res) => {
  try {
    const { symptomId } = req.params;
    const symptom = await getSymptomByIdHandle(symptomId);
    res.status(200).json({
      message: "Lấy thông tin triệu chứng thành công!",
      symptom,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Cập nhật triệu chứng
export const updateSymptom = async (req, res) => {
  try {
    const { symptomId } = req.params;
    const payload = req.body;
    const images = req.files;
    if (!payload) {
      return res
        .status(400)
        .json({ message: "Vui lòng nhập đầy đủ thông tin!" });
    }
    if (!images || images.length === 0) {
      return res.status(400).json({ message: "Vui lòng thêm ảnh!" });
    }
    const imagesUrl = await Promise.all(
      images.map((file) => uploads(file, req.user.userId, "Symptom"))
    );
    payload.images = imagesUrl;
    const updatedSymptom = await updateSymptomHandle(symptomId, payload);
    res.status(200).json({
      message: "Cập nhật triệu chứng thành công!",
      symptom: updatedSymptom,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Xóa triệu chứng
export const deleteSymptom = async (req, res) => {
  try {
    const { symptomId } = req.params;
    const result = await deleteSymptomHandle(symptomId);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

import {
  createTreatmentHandle,
  deleteTreatmentHandle,
  getAllTreatmentsHandle,
  getTreatmentByIdHandle,
  updateTreatmentHandle,
} from "../services/treatment.service";
import { uploads } from "../utils/uploadImagesToCloud";

// Tạo một phương pháp điều trị mới
export const createTreatment = async (req, res) => {
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
      images.map((file) => uploads(file, req.user.userId, "Treatment"))
    );

    payload.images = imagesUrl;

    const newTreatment = await createTreatmentHandle(payload);
    res.status(201).json({
      message: "Tạo phương pháp điều trị thành công!",
      treatment: newTreatment,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Lấy danh sách tất cả phương pháp điều trị
export const getAllTreatments = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const treatments = await getAllTreatmentsHandle(
      Number(page),
      Number(limit)
    );
    res.status(200).json({
      message: "Lấy danh sách phương pháp điều trị thành công!",
      treatments,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Lấy thông tin chi tiết một phương pháp điều trị
export const getTreatmentById = async (req, res) => {
  try {
    const { treatmentId } = req.params;
    const treatment = await getTreatmentByIdHandle(treatmentId);
    res.status(200).json({
      message: "Lấy thông tin phương pháp điều trị thành công!",
      treatment,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Cập nhật phương pháp điều trị
export const updateTreatment = async (req, res) => {
  try {
    const { treatmentId } = req.params;
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
      images.map((file) => uploads(file, req.user.userId, "Treatment"))
    );

    payload.images = imagesUrl;

    const updatedTreatment = await updateTreatmentHandle(treatmentId, payload);
    res.status(200).json({
      message: "Cập nhật phương pháp điều trị thành công!",
      treatment: updatedTreatment,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Xóa phương pháp điều trị
export const deleteTreatment = async (req, res) => {
  try {
    const { treatmentId } = req.params;
    const result = await deleteTreatmentHandle(treatmentId);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

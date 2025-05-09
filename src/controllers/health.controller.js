import {
  getAllHealthInfoHandle,
  getHealthInfoByIdHandle,
  createHealthInfoHandle,
  updateHealthInfoHandle,
  deleteHealthInfoHandle,
} from "../services/health.service.js";
import { caculateBMI, classifyBMI } from "../utils/health.utils.js";

// Lấy danh sách tất cả thông tin sức khỏe
export const getAllHealth = async (req, res) => {
  try {
    const healthInfo = await getAllHealthInfoHandle();
    res.status(200).json({
      message: "Lấy danh sách thông tin sức khỏe thành công!",
      healthInfo,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Lấy thông tin sức khỏe theo ID
export const getHealthById = async (req, res) => {
  const { userId } = req.params;

  if (!userId) {
    return res
      .status(400)
      .json({ message: "Không xác định được ID sức khỏe!" });
  }

  try {
    const healthInfo = await getHealthInfoByIdHandle(userId);

    if (!healthInfo) {
      return res
        .status(404)
        .json({ message: "Không tìm thấy thông tin sức khỏe!" });
    }

    let bmi = null;
    let bmiStatus = null;

    if (
      typeof healthInfo.weight === "number" &&
      typeof healthInfo.height === "number" &&
      healthInfo.weight > 0 &&
      healthInfo.height > 0
    ) {
      bmi = caculateBMI(healthInfo.weight, healthInfo.height);
      bmiStatus = classifyBMI(bmi);
    }

    res.status(200).json({
      message: "Lấy thông tin sức khỏe thành công!",
      healthInfo,
      bmi,
      bmiStatus,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Tạo thông tin sức khỏe mới
export const createHealth = async (req, res) => {
  const payload = req.body;
  const userId = req.user.userId;

  if (!payload) {
    return res.status(400).json({ message: "Vui lòng nhập đầy đủ thông tin!" });
  }

  try {
    payload.userId = userId;

    // Kiểm tra dữ liệu đầu vào
    if (
      payload.weight &&
      (typeof payload.weight !== "number" || payload.weight <= 0)
    ) {
      return res.status(400).json({ message: "Cân nặng không hợp lệ!" });
    }

    if (
      payload.height &&
      (typeof payload.height !== "number" || payload.height <= 0)
    ) {
      return res.status(400).json({ message: "Chiều cao không hợp lệ!" });
    }

    const newHealthInfo = await createHealthInfoHandle(payload);

    res.status(201).json({
      message: "Tạo thông tin sức khỏe thành công!",
      newHealthInfo,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Cập nhật thông tin sức khỏe
export const updateHealth = async (req, res) => {
  const { healthId } = req.params;
  const payload = req.body;

  if (!healthId) {
    return res
      .status(400)
      .json({ message: "Không xác định được ID sức khỏe!" });
  }

  if (!payload) {
    return res.status(400).json({ message: "Vui lòng nhập đầy đủ thông tin!" });
  }

  try {
    // Kiểm tra dữ liệu đầu vào
    if (
      payload.weight &&
      (typeof payload.weight !== "number" || payload.weight <= 0)
    ) {
      return res.status(400).json({ message: "Cân nặng không hợp lệ!" });
    }

    if (
      payload.height &&
      (typeof payload.height !== "number" || payload.height <= 0)
    ) {
      return res.status(400).json({ message: "Chiều cao không hợp lệ!" });
    }

    const updatedHealthInfo = await updateHealthInfoHandle(healthId, payload);

    if (!updatedHealthInfo) {
      return res.status(404).json({ message: "Không tìm thấy thông tin sức khỏe để cập nhật!" });
    }

    res.status(200).json({
      message: "Cập nhật thông tin sức khỏe thành công!",
      updatedHealthInfo,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// Xóa thông tin sức khỏe
export const deleteHealth = async (req, res) => {
  const { healthId } = req.params;

  if (!healthId) {
    return res
      .status(400)
      .json({ message: "Không xác định được ID sức khỏe!" });
  }

  try {
    const result = await deleteHealthInfoHandle(healthId);

    if (!result) {
      return res.status(404).json({ message: "Không tìm thấy thông tin sức khỏe để xóa!" });
    }

    res.status(200).json({
      message: "Xóa thông tin sức khỏe thành công!",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
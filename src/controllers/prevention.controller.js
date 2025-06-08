import {
  createPreventionHandle,
  deletePreventionHandle,
  getAllPreventionsHandle,
  getPreventionByIdHandle,
  updatePreventionHandle,
} from "../services/prevention.service";

export const createPrevention = async (req, res) => {
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
      images.map((file) => uploads(file, req.user.userId, "Prevention"))
    );

    payload.images = imagesUrl;

    const newPrevention = await createPreventionHandle(payload);
    res.status(201).json({
      message: "Tạo biện pháp phòng ngừa thành công!",
      prevention: newPrevention,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Lấy danh sách tất cả biện pháp phòng ngừa
export const getAllPreventions = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const preventions = await getAllPreventionsHandle(
      Number(page),
      Number(limit)
    );

    res.status(200).json({
      message: "Lấy danh sách biện pháp phòng ngừa thành công!",
      preventions,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Lấy thông tin chi tiết một biện pháp phòng ngừa
export const getPreventionById = async (req, res) => {
  try {
    const { preventionId } = req.params;
    const prevention = await getPreventionByIdHandle(preventionId);
    res.status(200).json({
      message: "Lấy thông tin biện pháp phòng ngừa thành công!",
      prevention,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Cập nhật thông tin biện pháp phòng ngừa
export const updatePrevention = async (req, res) => {
  try {
    const { preventionId } = req.params;
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
      images.map((file) => uploads(file, req.user.userId, "Prevention"))
    );

    payload.images = imagesUrl;

    const updatedPrevention = await updatePreventionHandle(
      preventionId,
      payload
    );
    res.status(200).json({
      message: "Cập nhật biện pháp phòng ngừa thành công!",
      prevention: updatedPrevention,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Xóa một biện pháp phòng ngừa
export const deletePrevention = async (req, res) => {
  try {
    const { preventionId } = req.params;
    const result = await deletePreventionHandle(preventionId);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

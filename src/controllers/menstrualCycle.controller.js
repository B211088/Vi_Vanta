import {
  createMenstrualCycleHandle,
  getMenstrualCyclesByUserHandle,
  getMenstrualCycleByIdHandle,
  updateMenstrualCycleHandle,
  deleteMenstrualCycleHandle,
} from "../services/menstrualCycle.service.js";

// Tạo một chu kỳ kinh nguyệt mới
export const createMenstrualCycle = async (req, res) => {
  try {
    const payload = { ...req.body, userId: req.user.userId };
    const newCycle = await createMenstrualCycleHandle(payload);
    res.status(201).json({
      message: "Tạo chu kỳ kinh nguyệt thành công!",
      cycle: newCycle,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Lấy danh sách chu kỳ kinh nguyệt của người dùng
export const getMenstrualCyclesByUser = async (req, res) => {
  try {
    const userId = req.user.userId; // Lấy userId từ token
    const cycles = await getMenstrualCyclesByUserHandle(userId);
    res.status(200).json({
      message: "Lấy danh sách chu kỳ kinh nguyệt thành công!",
      cycles,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Lấy thông tin chi tiết một chu kỳ kinh nguyệt
export const getMenstrualCycleById = async (req, res) => {
  try {
    const { cycleId } = req.params;
    const cycle = await getMenstrualCycleByIdHandle(cycleId);
    res.status(200).json({
      message: "Lấy thông tin chu kỳ kinh nguyệt thành công!",
      cycle,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Cập nhật chu kỳ kinh nguyệt
export const updateMenstrualCycle = async (req, res) => {
  try {
    const { cycleId } = req.params;
    const payload = req.body;
    const updatedCycle = await updateMenstrualCycleHandle(cycleId, payload);
    res.status(200).json({
      message: "Cập nhật chu kỳ kinh nguyệt thành công!",
      cycle: updatedCycle,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Xóa chu kỳ kinh nguyệt
export const deleteMenstrualCycle = async (req, res) => {
  try {
    const { cycleId } = req.params;
    const result = await deleteMenstrualCycleHandle(cycleId);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

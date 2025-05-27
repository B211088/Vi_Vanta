import {
  calculateBMIHandle,
  getBasicIndexHandle,
} from "../services/bodyIndex.service.js";

export const getBasicIndex = async (req, res) => {
  try {
    const userId = req.user.userId;
    if (!userId) {
      return res.status(404).json({ message: "Không tìm thấy đối tượng!" });
    }
    const bodyIndex = await getBasicIndexHandle(userId);
    res.status(200).json({
      message: "Lấy chỉ số cơ thể thành công!",
      bodyIndex,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const calculateBMI = async (req, res) => {
  try {
    const userId = req.user.userId;
    const payload = req.body;
    if (!userId) {
      return res.status(404).json({ message: "Không tìm thấy đối tượng!" });
    }
    payload.userId = userId;
    const bodyIndex = await calculateBMIHandle(payload);
    res.status(200).json({
      success: true,
      message: "Tính toán chỉ số BMI",
      bodyIndex,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

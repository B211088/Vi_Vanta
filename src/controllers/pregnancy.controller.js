import {
  createInfoPregnancyHandle,
  deleteInfoPregnancyHandle,
  getAllInfoPregnanciesHandle,
  getInfoPregnancyHandle,
  updateInfoPregnancyHandle,
} from "../services/pregnancy.service.js";

export const getAllInfoPregnancies = async (req, res) => {
  const userId = req.user.userId;

  if (!userId) {
    res
      .status(400)
      .json({ message: "Không thể xác định được đối tượng thông tin!" });
  }
  try {
    const infoPregnancys = await getAllInfoPregnanciesHandle(userId);
    res.status(200).json({
      message: "Lấy tất cả thông tin thai kì thành công!",
      data: infoPregnancys,
    });
  } catch (error) {
    res.status(500).json({ message: Error.message });
  }
};

export const getInfoPregnancy = async (req, res) => {
  const pregnancyId = req.params.id;

  if (!pregnancyId) {
    res
      .status(400)
      .json({ message: "Không thể xác định được đối tượng thông tin!" });
  }
  try {
    const infoPregnancy = await getInfoPregnancyHandle(pregnancyId);
    res.status(200).json({
      message: "Lấy thông tin thai kì thành công!",
      data: infoPregnancy,
    });
  } catch (error) {
    res.status(500).json({ message: Error.message });
  }
};

export const createInfoPregnancy = async (req, res) => {
  const userId = req.user.userId;
  const payload = req.body;
  if (!payload) {
    res.status(400).json({ message: "Vui lòng nhập thông tin thai kỳ!" });
  }
  try {
    const infoPregnancy = await createInfoPregnancyHandle(userId, payload);
    res.status(200).json({
      message: "Thêm thông tin thai kì thành công!",
      data: infoPregnancy,
    });
  } catch (error) {
    res.status(500).json({ message: Error.message });
  }
};

export const updateInfoPregnancy = async (req, res) => {
  const pregnancyId = req.params.id;
  const payload = req.body;
  if (!payload) {
    res.status(400).json({ message: "Vui lòng nhập thông tin thai kỳ!" });
  }
  try {
    const infoPregnancy = await updateInfoPregnancyHandle(pregnancyId, payload);
    res.status(200).json({
      message: "Đổi thông tin thai kì thành công!",
      data: infoPregnancy,
    });
  } catch (error) {
    res.status(500).json({ message: Error.message });
  }
};

export const deletePregnancy = async (req, res) => {
  try {
    const result = await deleteInfoPregnancyHandle(req.params.id);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

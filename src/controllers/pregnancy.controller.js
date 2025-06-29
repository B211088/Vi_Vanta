import {
  createInfoPregnancyHandle,
  deleteInfoPregnancyHandle,
  getAllInfoPregnanciesHandle,
  getInfoPregnancyHandle,
  updateInfoPregnancyHandle,
  getPregnancyWeeksHandle,
  getPregnancyWeekHandle,
  createPregnancyWeekHandle,
  updatePregnancyWeekHandle,
  deletePregnancyWeekHandle,
} from "../services/pregnancy.service.js";

import { uploads } from "../utils/uploadImagesToCloud.js";

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
      infoPregnancys,
    });
  } catch (error) {
    res.status(500).json({ message: Error.message });
  }
};

// Lấy thông tin thai kỳ
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
      infoPregnancy,
    });
  } catch (error) {
    res.status(500).json({ message: Error.message });
  }
};

// Tạo thông tin thai kỳ
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
      infoPregnancy,
    });
  } catch (error) {
    res.status(500).json({ message: Error.message });
  }
};

// Cập nhật thông tin thai kỳ
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
      infoPregnancy,
    });
  } catch (error) {
    res.status(500).json({ message: Error.message });
  }
};

// Xóa thông tin thai kỳ
export const deletePregnancy = async (req, res) => {
  try {
    const result = await deleteInfoPregnancyHandle(req.params.id);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Lấy danh sách các tuần thai kỳ
export const getPregnancyWeeks = async (req, res) => {
  try {
    let weeks = await getPregnancyWeeksHandle();
    weeks = weeks.sort((a, b) => a.weekNumber - b.weekNumber);
    res.status(200).json({
      message: "Lấy danh sách các tuần thai kỳ thành công!",
      weeks,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Lấy thông tin tuần thai kỳ theo số tuần
export const getPregnancyWeek = async (req, res) => {
  const { weekNumber } = req.params;

  if (!weekNumber) {
    return res.status(400).json({ message: "Không xác định được số tuần!" });
  }

  try {
    const week = await getPregnancyWeekHandle(weekNumber);
    res.status(200).json({
      message: "Lấy thông tin tuần thai kỳ thành công!",
      week,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Tạo một tuần thai kỳ mới
export const createPregnancyWeek = async (req, res) => {
  const payload = req.body;
  const userId = req.user.userId;
  const file = req.file;

  if (!payload) {
    return res.status(400).json({ message: "Vui lòng nhập đầy đủ thông tin!" });
  }

  try {
    const imageUrl = await uploads(file, userId, "PregnancyWeeks");
    payload.imageUrl = imageUrl;
    const newWeek = await createPregnancyWeekHandle(payload);
    res.status(201).json({
      message: "Tạo tuần thai kỳ thành công!",
      newWeek,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Cập nhật thông tin một tuần thai kỳ
export const updatePregnancyWeek = async (req, res) => {
  const { weekId } = req.params;
  const payload = req.body;
  const userId = req.user.userId;
  const file = req.file;

  if (!weekId) {
    return res
      .status(400)
      .json({ message: "Không xác định được tuần thai kỳ!" });
  }

  if (!payload) {
    return res.status(400).json({ message: "Vui lòng nhập đầy đủ thông tin!" });
  }

  try {
    const imageUrl = await uploads(file, userId, "PregnancyWeeks");
    payload.imageUrl = imageUrl;
    const updatedWeek = await updatePregnancyWeekHandle(weekId, payload);
    res.status(200).json({
      message: "Cập nhật tuần thai kỳ thành công!",
      updatedWeek,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Xóa một tuần thai kỳ
export const deletePregnancyWeek = async (req, res) => {
  const { weekId } = req.params;

  if (!weekId) {
    return res
      .status(400)
      .json({ message: "Không xác định được tuần thai kỳ!" });
  }

  try {
    await deletePregnancyWeekHandle(weekId);
    res.status(200).json({
      message: "Xóa tuần thai kỳ thành công!",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

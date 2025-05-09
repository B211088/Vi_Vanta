import {
  createInfoPregnancyHandle,
  createVisitTypeHandle,
  deletedVisitTypesHandle,
  deleteInfoPregnancyHandle,
  getAllInfoPregnanciesHandle,
  getInfoPregnancyHandle,
  getVisitTypesHandle,
  updateInfoPregnancyHandle,
  updateVisitTypeHandle,
  getPregnancyVisitsHandle,
  createPregnancyVisitHandle,
  updatePregnancyVisitHandle,
  deletePregnancyVisitHandle,
  getPregnancyWeeksHandle,
  getPregnancyWeekHandle,
  createPregnancyWeekHandle,
  updatePregnancyWeekHandle,
  deletePregnancyWeekHandle,
} from "../services/pregnancy.service.js";

import { uploads } from "../utils/uploadImagesToCloud.js";

// Lấy tất cả thông tin thai kỳ
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

// Lấy danh sách các kỳ khám
export const getVisitTypes = async (req, res) => {
  try {
    const visitTypes = await getVisitTypesHandle();
    console.log("visitTypes: ", visitTypes);
    res
      .status(200)
      .json({ message: "Lấy các thông tin khám thành công", visitTypes });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Tạo một kỳ khám mới
export const createVisitType = async (req, res) => {
  const payload = req.body;
  if (!payload) {
    res.status(400).json("Vui lòng nhập đầy đủ thông tin!");
  }
  try {
    const visitTypes = await createVisitTypeHandle(payload);
    res.status(200).json({ message: "Tạo kỳ khám thành công!", visitTypes });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Cập nhật thông tin một kỳ khám
export const updateVisitType = async (req, res) => {
  const visitTypeId = req.params.id;
  const payload = req.body;
  if (!payload) {
    res.status(400).json("Vui lòng nhập đầy đủ thông tin!");
  }
  try {
    const visitTypes = await updateVisitTypeHandle(visitTypeId, payload);
    res
      .status(200)
      .json({ message: "Cập nhật kỳ khám thành công!", visitTypes });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Xóa một kỳ khám
export const deleteVisitType = async (req, res) => {
  const visitTypeId = req.params.id;
  if (!visitTypeId) {
    res.status(400).json("không xác định được kỳ khám!");
  }
  try {
    const visitTypes = await deletedVisitTypesHandle(visitTypeId);
    res.status(200).json({ message: visitTypes.message, visitTypes });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Lấy danh sách các lần khám thai
export const getPregnancyVisits = async (req, res) => {
  const { pregnancyId } = req.params;

  if (!pregnancyId) {
    return res.status(400).json({ message: "Không xác định được thai kỳ!" });
  }

  try {
    const visits = await getPregnancyVisitsHandle(pregnancyId);
    res.status(200).json({
      message: "Lấy danh sách lần khám thai thành công!",
      visits,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Tạo một lần khám thai mới
export const createPregnancyVisit = async (req, res) => {
  const userId = req.user.userId;
  const payload = req.body;
  const files = req.files;

  if (!payload) {
    return res.status(400).json({ message: "Vui lòng nhập đầy đủ thông tin!" });
  }

  const imageUrls = await Promise.all(
    files.map((file) => uploads(file, userId, "PregnancyVisits"))
  );

  payload.imageUrls = imageUrls;

  try {
    const newVisit = await createPregnancyVisitHandle(payload);
    res.status(201).json({
      message: "Tạo lần khám thai thành công!",
      newVisit,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Cập nhật thông tin một lần khám thai
export const updatePregnancyVisit = async (req, res) => {
  const userId = req.user.userId;
  const { visitId } = req.params;
  const payload = req.body;
  const files = req.files;

  if (!visitId) {
    return res
      .status(400)
      .json({ message: "Không xác định được lần khám thai!" });
  }

  if (!payload) {
    return res.status(400).json({ message: "Vui lòng nhập đầy đủ thông tin!" });
  }

  const imageUrls = await Promise.all(
    files.map((file) => uploads(file, userId, "PregnancyVisits"))
  );

  payload.imageUrls = imageUrls;

  try {
    const updatedVisit = await updatePregnancyVisitHandle(visitId, payload);
    res.status(200).json({
      message: "Cập nhật lần khám thai thành công!",
      updatedVisit,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Xóa một lần khám thai
export const deletePregnancyVisit = async (req, res) => {
  const { visitId } = req.params;

  if (!visitId) {
    return res
      .status(400)
      .json({ message: "Không xác định được lần khám thai!" });
  }

  try {
    await deletePregnancyVisitHandle(visitId);
    res.status(200).json({
      message: "Xóa lần khám thai thành công!",
    });
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

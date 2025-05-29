import {
  getAllExercisesHandle,
  getExerciseByIdHandle,
  createExerciseHandle,
  updateExerciseHandle,
  deleteExerciseHandle,
} from "../services/exercises.service.js";
import { uploads } from "../utils/uploadImagesToCloud.js";
import {
  getAllExerciseCategoriesHandle,
  getExerciseCategoryByIdHandle,
  createExerciseCategoryHandle,
  updateExerciseCategoryHandle,
  deleteExerciseCategoryHandle,
} from "../services/exerciseCategory.service.js";

// Validate
const validateCategory = (payload) => {
  if (!payload.name || typeof payload.name !== "string") {
    return "Tên nhóm bài tập là bắt buộc và phải là chuỗi!";
  }
  return null;
};
// Validate dữ liệu đầu vào
const validateExercise = (payload) => {
  if (!payload.name || typeof payload.name !== "string") {
    return "Tên bài tập là bắt buộc và phải là chuỗi!";
  }
  // Thêm các validate khác nếu cần
  return null;
};

// Lấy danh sách bài tập
export const getAllExercises = async (req, res) => {
  try {
    const { page = 1, limit = 10, category, level, muscles } = req.query;
    const filter = {};
    if (category) filter.category = category;
    if (level) filter.level = level;
    if (muscles) filter.muscles = { $in: muscles.split(",") };

    const result = await getAllExercisesHandle(
      Number(page),
      Number(limit),
      filter
    );
    res.status(200).json({
      message: "Lấy danh sách bài tập thành công!",
      data: result,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Lấy chi tiết 1 bài tập
export const getExerciseById = async (req, res) => {
  try {
    const exercise = await getExerciseByIdHandle(req.params.id);
    if (!exercise)
      return res.status(404).json({ message: "Không tìm thấy bài tập" });
    res.status(200).json({
      message: "Lấy chi tiết bài tập thành công!",
      exercise,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Tạo mới bài tập
export const createExercise = async (req, res) => {
  try {
    const payload = req.body;
    // Validate dữ liệu
    const errorMsg = validateExercise(payload);
    if (errorMsg) return res.status(400).json({ message: errorMsg });

    // Xử lý upload ảnh
    if (!req.files || !req.files.thumbnail || !req.files.images) {
      return res
        .status(400)
        .json({ message: "Vui lòng thêm ảnh đại diện và ảnh chi tiết!" });
    }
    const thumbnailUpload = await uploads(
      req.files.thumbnail[0],
      req.user?.userId || "system",
      "Exercise"
    );
    const imagesUpload = await Promise.all(
      req.files.images.map((file) =>
        uploads(file, req.user?.userId || "system", "Exercise")
      )
    );
    payload.thumbnail = thumbnailUpload;
    payload.images = imagesUpload;

    const exercise = await createExerciseHandle(payload);
    res.status(201).json({
      message: "Tạo bài tập thành công!",
      exercise,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Cập nhật bài tập
export const updateExercise = async (req, res) => {
  try {
    const payload = req.body;
    // Validate dữ liệu
    const errorMsg = validateExercise(payload);
    if (errorMsg) return res.status(400).json({ message: errorMsg });

    // Xử lý upload ảnh nếu có
    if (req.files && req.files.thumbnail) {
      payload.thumbnail = await uploads(
        req.files.thumbnail[0],
        req.user?.userId || "system",
        "Exercise"
      );
    }
    if (req.files && req.files.images) {
      payload.images = await Promise.all(
        req.files.images.map((file) =>
          uploads(file, req.user?.userId || "system", "Exercise")
        )
      );
    }

    const exercise = await updateExerciseHandle(req.params.id, payload);
    if (!exercise)
      return res.status(404).json({ message: "Không tìm thấy bài tập" });
    res.status(200).json({
      message: "Cập nhật bài tập thành công!",
      exercise,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Xóa bài tập
export const deleteExercise = async (req, res) => {
  try {
    const exercise = await deleteExerciseHandle(req.params.id);
    if (!exercise)
      return res.status(404).json({ message: "Không tìm thấy bài tập" });
    res.status(200).json({ message: "Xóa bài tập thành công!" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Lấy tất cả category
export const getAllExerciseCategories = async (req, res) => {
  try {
    const categories = await getAllExerciseCategoriesHandle();
    res.status(200).json({
      message: "Lấy danh sách nhóm bài tập thành công!",
      categories,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Lấy chi tiết 1 category
export const getExerciseCategoryById = async (req, res) => {
  try {
    const category = await getExerciseCategoryByIdHandle(req.params.id);
    if (!category)
      return res.status(404).json({ message: "Không tìm thấy nhóm bài tập" });
    res.status(200).json({
      message: "Lấy chi tiết nhóm bài tập thành công!",
      category,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Tạo mới category
export const createExerciseCategory = async (req, res) => {
  try {
    const payload = req.body;
    const errorMsg = validateCategory(payload);
    if (errorMsg) return res.status(400).json({ message: errorMsg });

    const category = await createExerciseCategoryHandle(payload);
    res.status(201).json({
      message: "Tạo nhóm bài tập thành công!",
      category,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Cập nhật category
export const updateExerciseCategory = async (req, res) => {
  try {
    const payload = req.body;
    const errorMsg = validateCategory(payload);
    if (errorMsg) return res.status(400).json({ message: errorMsg });

    const category = await updateExerciseCategoryHandle(req.params.id, payload);
    if (!category)
      return res.status(404).json({ message: "Không tìm thấy nhóm bài tập" });
    res.status(200).json({
      message: "Cập nhật nhóm bài tập thành công!",
      category,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Xóa category
export const deleteExerciseCategory = async (req, res) => {
  try {
    const category = await deleteExerciseCategoryHandle(req.params.id);
    if (!category)
      return res.status(404).json({ message: "Không tìm thấy nhóm bài tập" });
    res.status(200).json({ message: "Xóa nhóm bài tập thành công!" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

import { ExerciseCategory } from "../models/index.js";

// Lấy tất cả category
export const getAllExerciseCategoriesHandle = async () => {
  try {
    return await ExerciseCategory.find().populate("parentCategoryId", "name");
  } catch (error) {
    throw new Error("Lỗi khi lấy danh sách nhóm bài tập: " + error.message);
  }
};

// Lấy chi tiết 1 category
export const getExerciseCategoryByIdHandle = async (id) => {
  try {
    return await ExerciseCategory.findById(id).populate(
      "parentCategoryId",
      "name"
    );
  } catch (error) {
    throw new Error("Lỗi khi lấy chi tiết nhóm bài tập: " + error.message);
  }
};

// Tạo mới category
export const createExerciseCategoryHandle = async (payload) => {
  try {
    const category = new ExerciseCategory(payload);
    await category.save();
    return category;
  } catch (error) {
    throw new Error("Lỗi khi tạo nhóm bài tập: " + error.message);
  }
};

// Cập nhật category
export const updateExerciseCategoryHandle = async (id, payload) => {
  try {
    return await ExerciseCategory.findByIdAndUpdate(id, payload, { new: true });
  } catch (error) {
    throw new Error("Lỗi khi cập nhật nhóm bài tập: " + error.message);
  }
};

// Xóa category
export const deleteExerciseCategoryHandle = async (id) => {
  try {
    return await ExerciseCategory.findByIdAndDelete(id);
  } catch (error) {
    throw new Error("Lỗi khi xóa nhóm bài tập: " + error.message);
  }
};

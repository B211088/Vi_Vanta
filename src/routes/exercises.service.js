import Exercise from "../models/exercises.model.js";

// Lấy danh sách bài tập (có phân trang, lọc)
export const getAllExercisesHandle = async (
  page = 1,
  limit = 10,
  filter = {}
) => {
  try {
    const skip = (page - 1) * limit;
    const exercises = await Exercise.find(filter)
      .select("name thumbnail category level muscles equipment")
      .populate("category", "name")
      .skip(skip)
      .limit(limit);
    const total = await Exercise.countDocuments(filter);
    return {
      exercises,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalExercises: total,
      },
    };
  } catch (error) {
    throw new Error("Lỗi khi lấy danh sách bài tập: " + error.message);
  }
};

// Lấy chi tiết 1 bài tập
export const getExerciseByIdHandle = async (id) => {
  try {
    return await Exercise.findById(id).populate("category", "name");
  } catch (error) {
    throw new Error("Lỗi khi lấy chi tiết bài tập: " + error.message);
  }
};

// Tạo mới bài tập
export const createExerciseHandle = async (payload) => {
  try {
    const exercise = new Exercise(payload);
    await exercise.save();
    return exercise;
  } catch (error) {
    throw new Error("Lỗi khi tạo bài tập: " + error.message);
  }
};

// Cập nhật bài tập
export const updateExerciseHandle = async (id, payload) => {
  try {
    return await Exercise.findByIdAndUpdate(id, payload, { new: true });
  } catch (error) {
    throw new Error("Lỗi khi cập nhật bài tập: " + error.message);
  }
};

// Xóa bài tập
export const deleteExerciseHandle = async (id) => {
  try {
    return await Exercise.findByIdAndDelete(id);
  } catch (error) {
    throw new Error("Lỗi khi xóa bài tập: " + error.message);
  }
};

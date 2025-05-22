import { MenstrualCycle } from "../models/index.js";

// Tạo một chu kỳ kinh nguyệt mới
export const createMenstrualCycleHandle = async (payload) => {
  try {
    const newCycle = new MenstrualCycle(payload);
    await newCycle.save();
    return newCycle;
  } catch (error) {
    console.error("Lỗi khi tạo chu kỳ kinh nguyệt:", error.message);
    throw new Error("Lỗi khi tạo chu kỳ kinh nguyệt");
  }
};

// Lấy danh sách chu kỳ kinh nguyệt của người dùng
export const getMenstrualCyclesByUserHandle = async (userId) => {
  try {
    const cycles = await MenstrualCycle.find({ userId })
      .sort({
        startDate: -1,
      })
      .select("-__v -createdAt -updatedAt");
    return cycles;
  } catch (error) {
    console.error("Lỗi khi lấy danh sách chu kỳ kinh nguyệt:", error.message);
    throw new Error("Lỗi khi lấy danh sách chu kỳ kinh nguyệt");
  }
};

// Lấy thông tin chi tiết một chu kỳ kinh nguyệt
export const getMenstrualCycleByIdHandle = async (cycleId) => {
  try {
    const cycle = await MenstrualCycle.findById(cycleId).select(
      "-__v -createdAt -updatedAt"
    );
    if (!cycle) {
      throw new Error("Không tìm thấy chu kỳ kinh nguyệt");
    }
    return cycle;
  } catch (error) {
    console.error("Lỗi khi lấy thông tin chu kỳ kinh nguyệt:", error.message);
    throw new Error("Lỗi khi lấy thông tin chu kỳ kinh nguyệt");
  }
};

// Cập nhật chu kỳ kinh nguyệt
export const updateMenstrualCycleHandle = async (cycleId, payload) => {
  try {
    const updatedCycle = await MenstrualCycle.findByIdAndUpdate(
      cycleId,
      { $set: payload },
      { new: true }
    ).select("-__v -createdAt -updatedAt");
    if (!updatedCycle) {
      throw new Error("Không tìm thấy chu kỳ kinh nguyệt để cập nhật");
    }
    return updatedCycle;
  } catch (error) {
    console.error("Lỗi khi cập nhật chu kỳ kinh nguyệt:", error.message);
    throw new Error("Lỗi khi cập nhật chu kỳ kinh nguyệt");
  }
};

// Xóa chu kỳ kinh nguyệt
export const deleteMenstrualCycleHandle = async (cycleId) => {
  try {
    const deletedCycle = await MenstrualCycle.findByIdAndDelete(cycleId);
    if (!deletedCycle) {
      throw new Error("Không tìm thấy chu kỳ kinh nguyệt để xóa");
    }
    return { message: "Xóa chu kỳ kinh nguyệt thành công" };
  } catch (error) {
    console.error("Lỗi khi xóa chu kỳ kinh nguyệt:", error.message);
    throw new Error("Lỗi khi xóa chu kỳ kinh nguyệt");
  }
};

import { Health } from "../models/index.js";
import { caculateBMI } from "../utils/health.utils.js";

// Lấy danh sách tất cả thông tin sức khỏe
export const getAllHealthInfoHandle = async () => {
  try {
    const healthInfo = await Health.find().select("-__v -createdAt -updatedAt");
    return healthInfo;
  } catch (error) {
    console.error("Lỗi khi lấy danh sách thông tin sức khỏe:", error.message);
    throw new Error("Lỗi khi lấy danh sách thông tin sức khỏe");
  }
};

// Lấy thông tin sức khỏe theo ID
export const getHealthInfoByIdHandle = async (userId) => {
  try {
    const healthInfo = await Health.findOne({ userId }).select(
      "-__v -createdAt -updatedAt"
    );
    if (!healthInfo) {
      throw new Error("Không tìm thấy thông tin sức khỏe");
    }
    return healthInfo;
  } catch (error) {
    console.error("Lỗi khi lấy thông tin sức khỏe:", error.message);
    throw new Error("Lỗi khi lấy thông tin sức khỏe");
  }
};

// Tạo thông tin sức khỏe mới
export const createHealthInfoHandle = async (payload) => {
  try {
    const newHealthInfo = new Health(payload);
    await newHealthInfo.save();
    return newHealthInfo;
  } catch (error) {
    console.error("Lỗi khi tạo thông tin sức khỏe:", error.message);
    throw new Error("Lỗi khi tạo thông tin sức khỏe");
  }
};

// Cập nhật thông tin sức khỏe
export const updateHealthInfoHandle = async (healthId, payload) => {
  try {
    const updatedHealthInfo = await Health.findByIdAndUpdate(
      healthId,
      { $set: payload },
      { new: true }
    ).select("-__v -createdAt -updatedAt");

    if (!updatedHealthInfo) {
      throw new Error("Không tìm thấy thông tin sức khỏe để cập nhật");
    }

    return updatedHealthInfo;
  } catch (error) {
    console.error("Lỗi khi cập nhật thông tin sức khỏe:", error.message);
    throw new Error("Lỗi khi cập nhật thông tin sức khỏe");
  }
};

// Xóa thông tin sức khỏe
export const deleteHealthInfoHandle = async (healthId) => {
  try {
    const deletedHealthInfo = await Health.findByIdAndDelete(healthId);

    if (!deletedHealthInfo) {
      throw new Error("Không tìm thấy thông tin sức khỏe để xóa");
    }

    return { message: "Xóa thông tin sức khỏe thành công" };
  } catch (error) {
    console.error("Lỗi khi xóa thông tin sức khỏe:", error.message);
    throw new Error("Lỗi khi xóa thông tin sức khỏe");
  }
};

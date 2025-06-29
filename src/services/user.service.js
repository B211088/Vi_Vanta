import { User } from "../models/index.js";

// Tạo user mới
export const createUserHandle = async (payload) => {
  try {
    const user = new User(payload);
    await user.save();
    return user;
  } catch (error) {
    console.error("Lỗi khi tạo user:", error.message);
    throw error;
  }
};

// Lấy tất cả user (có thể filter)
export const getAllUsersHandle = async (filter = {}) => {
  try {
    return await User.find(filter).select("-passwordHash -__v");
  } catch (error) {
    console.error("Lỗi khi lấy danh sách user:", error.message);
    throw error;
  }
};

// Lấy user theo id
export const getUserByIdHandle = async (id) => {
  try {
    return await User.findById(id).select("-passwordHash -__v");
  } catch (error) {
    console.error("Lỗi khi lấy user theo id:", error.message);
    throw error;
  }
};

// Cập nhật user
export const updateUserHandle = async (id, payload) => {
  try {
    const updated = await User.findByIdAndUpdate(id, payload, {
      new: true,
    }).select("-passwordHash -__v");
    if (!updated) throw new Error("Không tìm thấy user để cập nhật");
    return updated;
  } catch (error) {
    console.error("Lỗi khi cập nhật user:", error.message);
    throw error;
  }
};

// Xóa user
export const deleteUserHandle = async (id) => {
  try {
    const deleted = await User.findByIdAndDelete(id);
    if (!deleted) throw new Error("Không tìm thấy user để xóa");
    return { message: "Xóa user thành công" };
  } catch (error) {
    console.error("Lỗi khi xóa user:", error.message);
    throw error;
  }
};

// Tìm user theo email
export const getUserByEmailHandle = async (email) => {
  try {
    return await User.findOne({ email }).select("-passwordHash -__v");
  } catch (error) {
    console.error("Lỗi khi lấy user theo email:", error.message);
    throw error;
  }
};

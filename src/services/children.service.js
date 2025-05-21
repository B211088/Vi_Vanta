import Children from "../models/children.model.js";

// Tạo thông tin trẻ mới
export const createChildHandle = async (userId, payload) => {
  try {
    const newChild = new Children({
      userId,
      ...payload,
    });
    await newChild.save();
    return newChild;
  } catch (error) {
    console.error("Lỗi khi tạo thông tin trẻ:", error.message);
    throw new Error("Lỗi khi tạo thông tin trẻ");
  }
};

// Lấy danh sách tất cả trẻ thuộc tài khoản người dùng
export const getAllChildrenHandle = async (userId) => {
  try {
    const children = await Children.find({ userId })
      .select("fullName dateOfBirth gender userId")
      .select("-__v -updatedAt");

    return {
      children,
    };
  } catch (error) {
    console.error("Lỗi khi lấy danh sách trẻ:", error.message);
    throw new Error("Lỗi khi lấy danh sách trẻ");
  }
};

// Lấy thông tin chi tiết một trẻ
export const getChildByIdHandle = async (childId) => {
  try {
    const child = await Children.findById(childId).select(
      "-__v -createdAt -updatedAt"
    );
    if (!child) {
      throw new Error("Không tìm thấy thông tin trẻ");
    }
    return child;
  } catch (error) {
    console.error("Lỗi khi lấy thông tin trẻ:", error.message);
    throw new Error("Lỗi khi lấy thông tin trẻ");
  }
};

// Cập nhật thông tin trẻ
export const updateChildHandle = async (childId, payload) => {
  try {
    const updatedChild = await Children.findByIdAndUpdate(childId, payload, {
      new: true,
    });
    if (!updatedChild) {
      throw new Error("Không tìm thấy thông tin trẻ để cập nhật");
    }
    return updatedChild;
  } catch (error) {
    console.error("Lỗi khi cập nhật thông tin trẻ:", error.message);
    throw new Error("Lỗi khi cập nhật thông tin trẻ");
  }
};

// Xóa thông tin trẻ
export const deleteChildHandle = async (childId) => {
  try {
    const deletedChild = await Children.findByIdAndDelete(childId);
    if (!deletedChild) {
      throw new Error("Không tìm thấy thông tin trẻ để xóa");
    }
    return { message: "Xóa thông tin trẻ thành công" };
  } catch (error) {
    console.error("Lỗi khi xóa thông tin trẻ:", error.message);
    throw new Error("Lỗi khi xóa thông tin trẻ");
  }
};

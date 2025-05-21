import {
  createChildHandle,
  getAllChildrenHandle,
  getChildByIdHandle,
  updateChildHandle,
  deleteChildHandle,
} from "../services/children.service.js";

// Tạo thông tin trẻ mới
export const createChild = async (req, res) => {
  try {
    const userId = req.user.userId; // Lấy userId từ token
    const payload = req.body; // Lấy dữ liệu từ body request
    const newChild = await createChildHandle(userId, payload);
    res.status(201).json({
      message: "Tạo thông tin trẻ thành công!",
      data: newChild,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Lấy danh sách tất cả trẻ thuộc tài khoản người dùng
export const getAllChildren = async (req, res) => {
  try {
    const userId = req.user.userId; // Lấy userId từ token

    const result = await getAllChildrenHandle(userId);
    res.status(200).json({
      message: "Lấy danh sách trẻ thành công!",
      data: result,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Lấy thông tin chi tiết một trẻ
export const getChildById = async (req, res) => {
  try {
    const { childId } = req.params; // Lấy childId từ params
    const child = await getChildByIdHandle(childId);
    res.status(200).json({
      message: "Lấy thông tin trẻ thành công!",
      data: child,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Cập nhật thông tin trẻ
export const updateChild = async (req, res) => {
  try {
    const { childId } = req.params; // Lấy childId từ params
    const payload = req.body; // Lấy dữ liệu từ body request
    const updatedChild = await updateChildHandle(childId, payload);
    res.status(200).json({
      message: "Cập nhật thông tin trẻ thành công!",
      data: updatedChild,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Xóa thông tin trẻ
export const deleteChild = async (req, res) => {
  try {
    const { childId } = req.params; // Lấy childId từ params
    const result = await deleteChildHandle(childId);
    res.status(200).json({
      message: result.message,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



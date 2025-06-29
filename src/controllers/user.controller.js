import {
  createUserHandle,
  getAllUsersHandle,
  getUserByIdHandle,
  updateUserHandle,
  deleteUserHandle,
  getUserByEmailHandle,
} from "../services/user.service.js";

// Tạo user mới
export const createUserController = async (req, res) => {
  try {
    const user = await createUserHandle(req.body);
    res.status(201).json({ success: true, data: user });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Lấy tất cả user
export const getAllUsersController = async (req, res) => {
  try {
    const users = await getAllUsersHandle();
    res.status(200).json({ success: true, data: users });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Lấy user theo id
export const getUserByIdController = async (req, res) => {
  try {
    const user = await getUserByIdHandle(req.params.id);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy user" });
    }
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Cập nhật user
export const updateUserController = async (req, res) => {
  try {
    const updated = await updateUserHandle(req.params.id, req.body);
    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Xóa user
export const deleteUserController = async (req, res) => {
  try {
    const result = await deleteUserHandle(req.params.id);
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Lấy user theo email (nếu cần)
export const getUserByEmailController = async (req, res) => {
  try {
    const user = await getUserByEmailHandle(req.query.email);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy user" });
    }
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

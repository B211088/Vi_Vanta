import { uploads } from "../utils/uploadImagesToCloud.js";
import {
  registerUser,
  loginUser,
  getUserProfile,
  setUserProfile,
  updateUserAvatar,
  handleGetUserAddressByUserId,
  hanldeUpdateUserAddress,
  setRoles,
  setDoctorProfileHandle,
  removeRoles,
  getDoctorProfileHandle,
  updateDoctorProfileHandle,
  updateUserPassword,
} from "../services/auth.service.js";
import {
  confirmationCodeHandle,
  sendConfirmationCodeHandle,
} from "../services/email.service.js";
import { createCode } from "../utils/confirnEmail.js";

export const register = async (req, res) => {
  try {
    const user = await registerUser(req.body);
    res
      .status(201)
      .json({ success: true, message: "Đăng ký thành công!", user });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const token = await loginUser(email, password);
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Lax",
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });
    res.status(200).json({ success: true, message: "Đăng nhập thành công!" });
  } catch (error) {
    if (error.message === "Chưa xác nhận email") {
      return res.status(400).json({
        success: false,
        active: false,
        message: error.message,
      });
    }
    // Các lỗi khác
    res.status(400).json({
      success: false,
      message: error.message || "Đăng nhập thất bại",
    });
  }
};

export const logout = async (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Lax",
    });
    res.status(200).json({ success: true, message: "Đăng xuất thành công" });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const profile = async (req, res) => {
  try {
    const user = await getUserProfile(req.user.userId);
    res
      .status(200)
      .json({ success: true, message: "Thông tin người dùng", user });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const setProfile = async (req, res) => {
  try {
    if (!req.body) {
      return res.status(400).json({ message: "Dữ liệu không hợp lệ!" });
    }
    const user = await setUserProfile(req.body, req.user.userId);
    res
      .status(200)
      .json({ success: true, message: "Thông tin người dùng", user });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const sendConfirmCodeByForgotPassword = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ message: "Email không hợp lệ" });
  }
  try {
    const code = createCode();
    await sendConfirmationCodeHandle(email, code);

    res.status(200).json({ success: true, message: "Đã gửi mã xác nhận" });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: "Không gửi được email",
      error: err.message,
    });
  }
};

export const confirmCodeByForgotPassword = async (req, res) => {
  const { email, code, password } = req.body;

  if (!email || !code) {
    return res
      .status(400)
      .json({ message: "Email và mã xác nhận không hợp lệ" });
  }
  try {
    const confirm = await confirmationCodeHandle(email, code);
    if (confirm) {
      await updateUserPassword(req.user.userId, password);
      res
        .status(200)
        .json({ success: true, message: "Đổi mật khẩu thành công!" });
    } else {
      res
        .status(400)
        .json({ success: false, message: "Mã xác nhận không hợp lệ" });
    }
  } catch (err) {
    res.status(400).json({
      message: "Có lỗi xảy ra trong quá trình xác nhận mã",
      error: err.message,
    });
  }
};

export const uploadAvatar = async (req, res) => {
  try {
    const userId = req.user.userId;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ message: "Vui lòng chọn ảnh!" });
    }

    const avatar = await uploads(file, userId, "avatars");

    const updatedUser = await updateUserAvatar(userId, avatar);

    res.status(200).json({
      success: true,
      message: "Cập nhật avatar thành công",
      user: updatedUser,
    });
  } catch (error) {
    console.error(error);
    res.status(400).json({ success: false, message: error.message });
  }
};

export const sendConfirmCodeByRegister = async (req, res) => {
  const { email } = req.body;

  const code = createCode();

  try {
    await sendConfirmationCodeHandle(email, code);
    res.status(200).json({ success: true, message: "Đã gửi mã xác nhận" });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: "Không gửi được email",
      error: err.message,
    });
  }
};

export const confirmCodeByRegister = async (req, res) => {
  const { email, code } = req.body;
  console.log({ email });
  console.log({ code });
  try {
    await confirmationCodeHandle(email, code);
    res.status(200).json({ success: true, message: "Xác nhận thành công!" });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: "Không xác nhận được mail",
      error: err.message,
    });
  }
};

export const getUserAddress = async (req, res) => {
  try {
    const userAddress = await handleGetUserAddressByUserId(req.user.userId);
    res.status(200).json({ userAddress });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const updateUserAddress = async (req, res) => {
  try {
    const userAddress = await hanldeUpdateUserAddress(
      req.user.userId,
      req.body
    );
    res.status(200).json({ userAddress });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const addUserRole = async (req, res) => {
  try {
    const { roles } = req.body;

    if (!Array.isArray(roles) || roles.length === 0) {
      return res
        .status(400)
        .json({ message: "Danh sách vai trò không hợp lệ" });
    }
    const userRole = await setRoles(req.user.userId, roles);
    res.status(200).json({ userRole });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const removeUserRole = async (req, res) => {
  try {
    const { roles } = req.body;

    if (!Array.isArray(roles) || roles.length === 0) {
      return res
        .status(400)
        .json({ message: "Danh sách vai trò không hợp lệ" });
    }

    const updatedUser = await removeRoles(req.user.userId, roles);
    res
      .status(200)
      .json({ message: "Xóa vai trò thành công", user: updatedUser });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getDoctorProfile = async (req, res) => {
  const userId = req.user.userId;
  if (!userId) {
    res.status(401).json("Không thể xác định người dùng!");
  }

  try {
    const doctorProfile = await getDoctorProfileHandle(userId);
    res
      .status(200)
      .json({ message: "Lấy hồ sơ bác sĩ thành công", doctorProfile });
  } catch (error) {
    res.status(501).json({ message: error.message });
  }
};

export const createDoctorProfile = async (req, res) => {
  const userId = req.user.userId;
  const payload = req.body;
  if (!userId) {
    res.status(401).json("Không thể xác định người dùng!");
  }
  if (!payload) {
    res.status(401).json("Vui lòng thêm dữ liệu");
  }
  try {
    const doctorProfile = await setDoctorProfileHandle(userId, payload);
    await setRoles(userId, ["doctor"]);
    res.status(200).json({
      message: "Tạo hồ sơ bác sĩ thành công",
      doctorProfile,
    });
  } catch (error) {
    res.status(501).json({ message: error.message });
  }
};

export const updateDoctorProfile = async (req, res) => {
  const userId = req.params.id;
  const payload = req.body;
  if (!userId) {
    res.status(401).json("Không thể xác định người dùng!");
  }
  if (!payload) {
    res.status(401).json("Vui lòng thêm dữ liệu");
  }
  try {
    const doctorProfile = await updateDoctorProfileHandle(userId, payload);
    res.status(200).json({
      message: "Cập nhật hồ sơ bác sĩ thành công",
      doctorProfile,
    });
  } catch (error) {
    res.status(501).json("Cập nhật hồ sơ bác sĩ thất bại");
  }
};

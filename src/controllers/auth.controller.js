import {
  registerUser,
  loginUser,
  getUserProfile,
  setUserProfile,
  uploadAvatarToCloudinary,
  updateUserAvatar,
  handleGetUserAddressByUserId,
  hanldeUpdateUserAddress,
  setRoles,
} from "../services/auth.service.js";
import {
  ConfirmationCodeByRegister,
  sendConfirmationCode,
} from "../services/email.service.js";

export const register = async (req, res) => {
  try {
    const user = await registerUser(req.body);
    res.status(201).json({ message: "Đăng ký thành công!", user });
  } catch (error) {
    res.status(400).json({ message: error.message });
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
    res.status(200).json({ message: "Đăng nhập thành công!" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const profile = async (req, res) => {
  try {
    const user = await getUserProfile(req.user.userId);
    res.status(200).json({ message: "Thông tin người dùng", user });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const setProfile = async (req, res) => {
  try {
    if (!req.body) {
      return res.status(400).json({ message: "Dữ liệu không hợp lệ!" });
    }
    const user = await setUserProfile(req.body, req.user.userId);
    res.status(200).json({ message: "Thông tin người dùng", user });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const uploadAvatar = async (req, res) => {
  try {
    const userId = req.user.userId;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ message: "Vui lòng chọn ảnh!" });
    }

    const avatarUrl = await uploadAvatarToCloudinary(file, userId);

    const updatedUser = await updateUserAvatar(userId, avatarUrl);

    res.status(200).json({
      message: "Cập nhật avatar thành công",
      avatarUrl,
      user: updatedUser,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

export const sendConfirmCodeByRegister = async (req, res) => {
  const { email } = req.body;

  const code = Math.floor(100000 + Math.random() * 900000);

  try {
    await sendConfirmationCode(email, code);
    res.status(200).json({ message: "Đã gửi mã xác nhận" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Không gửi được email", error: err.message });
  }
};

export const confirmCodeByRegister = async (req, res) => {
  const { email, code } = req.body;

  try {
    await ConfirmationCodeByRegister(email, code);
    res.status(200).json({ message: "Xác nhận thành công!" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Không xác nhận được mail", error: err.message });
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
    const userRole = await setRoles(req.user.userId, req.body.roles);
    res.status(200).json({ userRole });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

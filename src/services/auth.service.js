import jwt from "jsonwebtoken";
import {
  User,
  Address,
  Ward,
  Province,
  District,
  Doctor,
} from "../models/index.js";
import cloudinary from "../config/cloudinaryConfig.js";
import { JWT_SECRET, JWT_EXPIRATION } from "../config/auth.config.js";
import fs from "fs";

export const registerUser = async (payload) => {
  const { email, password } = payload;
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new Error("Email đã tồn tại!");
  }

  const user = new User({
    email,
    passwordHash: password,
  });

  await user.save();
};

export const loginUser = async (email, password) => {
  const user = await User.findOne({ email });

  if (!user) {
    throw new Error("Người dùng không tồn tại!");
  }

  if (!user.active) {
    throw new Error("Chưa xác nhận email");
  }

  const isValidPassword = await user.isValidPassword(password);
  if (!isValidPassword) {
    throw new Error("Mật khẩu sai!");
  }

  const token = jwt.sign({ userId: user._id, roles: user.roles }, JWT_SECRET, {
    expiresIn: JWT_EXPIRATION,
  });

  return token;
};

export const setRoles = async (userId, newRoles) => {
  try {
    const validRoles = ["user", "admin", "doctor"];

    const isValid = newRoles.every((role) => validRoles.includes(role));
    if (!isValid) throw new Error("Invalid role in newRoles");

    const user = await User.findById(userId);
    if (!user) throw new Error("Không tìm thấy người dùng");

    user.roles = [...new Set([...user.roles, ...newRoles])];

    await user.save();

    return user;
  } catch (error) {
    console.error("Error setting roles:", error.message);
    throw error;
  }
};

export const removeRoles = async (userId, rolesRemove) => {
  try {
    const validRoles = ["user", "admin", "doctor"];

    const isValid = rolesRemove.every((role) => validRoles.includes(role));
    if (!isValid) throw new Error("Invalid role in rolesRemove");

    const user = await User.findById(userId);
    if (!user) throw new Error("Không tìm thấy người dùng");

    user.roles = user.roles.filter((role) => !rolesRemove.includes(role));

    await user.save();

    return user;
  } catch (error) {
    console.error("Error removing roles:", error.message);
    throw error;
  }
};

export const getUserProfile = async (userId) => {
  const userProfile = await User.findById(userId).select("-__v -passwordHash");
  if (!userProfile) {
    throw new Error("Không tìm thấy người dùng!");
  }

  return userProfile;
};

export const setUserProfile = async (payload, userId) => {
  const { fullName, phone, gender, dateOfBirth } = payload;

  const user = await User.findById(userId);

  if (!user) {
    throw new Error("Người dùng không tồn tại!");
  }
  const updateData = {};

  if (fullName) updateData.fullName = fullName;
  if (phone) updateData.phone = phone;
  if (gender) updateData.gender = gender;
  if (dateOfBirth) updateData.dateOfBirth = dateOfBirth;

  const updatedUser = await User.findByIdAndUpdate(
    userId,
    { $set: updateData },
    { new: true }
  );

  if (updatedUser.modifiedCount === 0) {
    throw new Error("Không có thay đổi nào được thực hiện.");
  }

  return updatedUser;
};

export const uploadAvatarToCloudinary = async (file, userId) => {
  try {
    const result = await cloudinary.uploader.upload(file.path, {
      folder: "avatars",
      public_id: `avatar_${userId}`,
      resource_type: "auto",
    });

    const avatarUrl = result.secure_url;

    fs.unlinkSync(file.path);

    return avatarUrl;
  } catch (error) {
    console.error("Error uploading avatar:", error);
    throw new Error("Có lỗi xảy ra trong quá trình upload ảnh");
  }
};

export const updateUserAvatar = async (userId, avatarUrl) => {
  try {
    const user = await User.findByIdAndUpdate(
      userId,
      { avatarUrl },
      { new: true }
    );
    return user;
  } catch (error) {
    console.error("Error updating user avatar:", error);
    throw new Error("Có lỗi xảy ra trong quá trình cập nhật avatar");
  }
};

export const handleGetUserAddressByUserId = async (userId) => {
  try {
    const userAddress = await Address.findOne({ userId }).select(
      "-__v -createAt -updateAt"
    );
    if (!userAddress) {
      throw new Error("Địa chỉ người dùng không tồn tại");
    }

    const userProvince = await Province.findById(userAddress.provinceId).select(
      "-__v -createdAt -updatedAt"
    );
    const userDistrict = await District.findById(userAddress.districtId).select(
      "-__v -createdAt -updatedAt"
    );
    const userWard = await Ward.findById(userAddress.wardId).select(
      "-__v -createdAt -updatedAt"
    );

    return {
      province: userProvince,
      district: userDistrict,
      ward: userWard,
      specificAddress: userAddress.specificAddress,
    };
  } catch (error) {
    throw new Error(
      "Có lỗi xảy ra trong quá trình lấy địa chỉ người dùng: " + error.message
    );
  }
};

export const hanldeUpdateUserAddress = async (userId, payload) => {
  try {
    const { provinceId, districtId, wardId, specificAddress } = payload;

    const updatedAddress = await Address.findOneAndUpdate(
      { userId },
      {
        $set: {
          provinceId,
          districtId,
          wardId,
          specificAddress,
        },
      },
      {
        new: true,
        upsert: true,
      }
    ).select("-__v -createdAt -updatedAt");

    return updatedAddress;
  } catch (error) {
    throw new Error(
      "Có lỗi xảy ra trong quá trình cập nhật/thêm địa chỉ người dùng"
    );
  }
};

export const getDoctorProfileHandle = async (userId) => {
  try {
    const doctorProfile = await Doctor.find({ userId }).select(
      "-__v -createdAt -updatedAt"
    );
    return doctorProfile;
  } catch (error) {
    throw new Error("Có lỗi trong quá trình lấy hồ sơ bác sĩ");
  }
};

export const setDoctorProfileHandle = async (userId, payload) => {
  try {
    const { specialty, hospital, licenseNumber, education, experienceYears } =
      payload;
    const doctorExisting = await Doctor.findById(userId);
    if (doctorExisting) {
      throw new Error("Đã có thông tin bác sĩ không thẻ tạo mới");
    }
    const doctorProfile = new Doctor({
      userId,
      specialty,
      hospital,
      licenseNumber,
      education,
      experienceYears,
    });

    const doctorData = doctorProfile.save();
    return doctorData;
  } catch (error) {
    throw new Error("Có lỗi trong quá trình tạo hồ sơ bác sĩ");
  }
};

export const updateDoctorProfileHandle = async (userId, payload) => {
  try {
    const { specialty, hospital, licenseNumber, education, experienceYears } =
      payload;

    const doctorProfile = {
      userId,
      specialty,
      hospital,
      licenseNumber,
      education,
      experienceYears,
    };

    const doctorData = await Doctor.findByIdAndUpdate(
      userId,
      {
        $set: doctorProfile,
      },
      {
        new: true,
      }
    ).select("-__v ");
    return doctorData;
  } catch (error) {
    throw new Error("Có lỗi trong quá trình tạo hồ sơ bác sĩ");
  }
};

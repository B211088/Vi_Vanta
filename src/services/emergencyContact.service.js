import { EmergencyContact } from "../models/index.js";

export const getEmergencyContactHandle = async (userId) => {
  try {
    const emergencyContact = await EmergencyContact.find({ userId }).select(
      "-__v -createdAt -updatedAt -userId"
    );
    return emergencyContact;
  } catch (error) {
    throw new Error("Có lỗi khi lấy liên lạc khẩn cấp");
  }
};

export const createEmergencyContactHandle = async (userId, payload) => {
  try {
    const { emergencyContactName, emergencyContactPhone } = payload;
    const emergencyContact = new EmergencyContact({
      userId,
      emergencyContactName,
      emergencyContactPhone,
    });

    const emergencyContactCreate = await emergencyContact.save();
    return emergencyContactCreate;
  } catch (error) {
    throw new Error("Có lỗi khi thêm liên lạc khẩn cấp");
  }
};

export const updateEmergencyContactHandle = async (
  emergencyContactId,
  payload
) => {
  try {
    const { emergencyContactName, emergencyContactPhone } = payload;
    const emergencyContact = {
      emergencyContactName,
      emergencyContactPhone,
    };

    const emergencyContactUpdate = await EmergencyContact.findByIdAndUpdate(
      { _id: emergencyContactId },
      { $set: emergencyContact },
      { new: true }
    ).select("-__v -createdAt -updatedAt");
    return emergencyContactUpdate;
  } catch (error) {
    throw new Error("Có lỗi khi sửa liên lạc khẩn cấp");
  }
};

export const removeEmergencyContactHandle = async (emergencyContactId) => {
  try {
    await EmergencyContact.findByIdAndDelete({
      _id: emergencyContactId,
    });
    return { succes: true, message: "Xóa liên hệ khẩn cấp thành công!" };
  } catch (error) {
    throw new Error("Có lỗi khi xóa liên lạc khẩn cấp");
  }
};

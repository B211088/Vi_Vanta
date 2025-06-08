import { MedicationPrescription } from "../models/index.js";

export const createMedicationPrescriptionHandle = async (payload) => {
  try {
    const prescription = new MedicationPrescription(payload);
    await prescription.save();
    return prescription;
  } catch (error) {
    throw new Error(error.message || "Lỗi khi tạo toa thuốc");
  }
};

export const getMedicationPrescriptionsHandle = async (filter = {}) => {
  try {
    const query = {};
    if (filter.userId) query.userId = filter.userId;
    const prescriptions = await MedicationPrescription.find(query)
      .select("-__v -updatedAt -createdAt")
      .sort({ createdAt: -1 })
      .populate({
        path: "medicationReminderItem",
        populate: {
          path: "medicationId",
          select: "_id name scientificName",
        },
      })

      .lean();
    return prescriptions;
  } catch (error) {
    throw new Error(error.message || "Lỗi khi lấy danh sách toa thuốc");
  }
};

export const getMedicationPrescriptionByIdHandle = async (id) => {
  try {
    const prescription = await MedicationPrescription.findById(id)
      .populate({
        path: "medicationReminderItem",
        populate: {
          path: "medicationId",
          select: "_id name scientificName",
        },
      })
      .lean();
    if (!prescription) throw new Error("Không tìm thấy toa thuốc!");
    return prescription;
  } catch (error) {
    throw new Error(error.message || "Lỗi khi lấy chi tiết toa thuốc");
  }
};

export const updateMedicationPrescriptionHandle = async (id, payload) => {
  try {
    const updated = await MedicationPrescription.findByIdAndUpdate(
      id,
      payload,
      { new: true }
    ).lean();
    if (!updated) throw new Error("Không tìm thấy toa thuốc để cập nhật!");
    return updated;
  } catch (error) {
    throw new Error(error.message || "Lỗi khi cập nhật toa thuốc");
  }
};

export const deleteMedicationPrescriptionHandle = async (id) => {
  try {
    const deleted = await MedicationPrescription.findByIdAndDelete(id).lean();
    if (!deleted) throw new Error("Không tìm thấy toa thuốc để xóa!");
    return deleted;
  } catch (error) {
    throw new Error(error.message || "Lỗi khi xóa toa thuốc");
  }
};

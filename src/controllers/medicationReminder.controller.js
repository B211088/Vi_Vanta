import {
  createMedicationReminderHandle,
  getMedicationRemindersHandle,
  getMedicationReminderByIdHandle,
  updateMedicationReminderHandle,
  deleteMedicationReminderHandle,
  updateMedicationReminderStatusHandle,
} from "../services/medicationReminderItem.service.js";
import {
  createMedicationPrescriptionHandle,
  getMedicationPrescriptionsHandle,
  getMedicationPrescriptionByIdHandle,
  updateMedicationPrescriptionHandle,
  deleteMedicationPrescriptionHandle,
} from "../services/medicationPrescription.service.js";

// Tạo nhắc nhở uống thuốc
export const createMedicationReminder = async (req, res) => {
  try {
    const payload = req.body;
    const userId = req.user.userId;
    payload.userId = userId;
    const reminder = await createMedicationReminderHandle(payload);
    res.status(201).json({ message: "Tạo nhắc nhở thành công!", reminder });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Lấy danh sách nhắc nhở uống thuốc
export const getMedicationReminders = async (req, res) => {
  try {
    const filter = req.query;
    const userId = req.user.userId;
    filter.userId = userId;
    const reminders = await getMedicationRemindersHandle(filter);
    res.status(200).json({ reminders });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Lấy chi tiết một nhắc nhở
export const getMedicationReminderById = async (req, res) => {
  try {
    const { id } = req.params;
    const reminder = await getMedicationReminderByIdHandle(id);
    res.status(200).json({ reminder });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

// Cập nhật nhắc nhở
export const updateMedicationReminder = async (req, res) => {
  try {
    const { id } = req.params;
    const payload = req.body;
    const updated = await updateMedicationReminderHandle(id, payload);
    res
      .status(200)
      .json({ message: "Cập nhật thành công!", reminder: updated });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Xóa nhắc nhở
export const deleteMedicationReminder = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await deleteMedicationReminderHandle(id);
    res.status(200).json({ message: "Xóa thành công!", reminder: deleted });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Cập nhật trạng thái nhắc nhở
export const updateMedicationReminderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const updated = await updateMedicationReminderStatusHandle(id, status);
    res
      .status(200)
      .json({ message: "Cập nhật trạng thái thành công!", reminder: updated });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// ================= TOA THUỐC =================

// Tạo toa thuốc
export const createMedicationPrescription = async (req, res) => {
  try {
    const payload = req.body;
    const userId = req.user.userId;
    payload.userId = userId;

    // 1. Tạo từng MedicationReminderItem
    const itemIds = [];
    if (Array.isArray(payload.items)) {
      for (const item of payload.items) {
        item.userId = userId;
        const created = await createMedicationReminderHandle(item);
        itemIds.push(created._id);
      }
    }

    // 2. Tạo prescription với các itemIds
    const prescriptionPayload = {
      userId,
      medicationReminderItem: itemIds,
      name: payload.name,
      hospitalName: payload.hospitalName,
      doctorName: payload.doctorName,
      appointmentDate: payload.appointmentDate,
      followUpDate: payload.followUpDate,
      note: payload.note,
    };
    const prescription = await createMedicationPrescriptionHandle(
      prescriptionPayload
    );

    res
      .status(201)
      .json({ message: "Tạo toa thuốc thành công!", prescription });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Lấy danh sách toa thuốc
export const getMedicationPrescriptions = async (req, res) => {
  try {
    const filter = req.query;
    const userId = req.user.userId;
    filter.userId = userId;
    const prescriptions = await getMedicationPrescriptionsHandle(filter);
    res.status(200).json({ prescriptions });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Lấy chi tiết toa thuốc
export const getMedicationPrescriptionById = async (req, res) => {
  try {
    const { id } = req.params;
    const prescription = await getMedicationPrescriptionByIdHandle(id);
    res.status(200).json({ prescription });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

// Cập nhật toa thuốc
export const updateMedicationPrescription = async (req, res) => {
  try {
    const { id } = req.params;
    const payload = req.body;
    const updated = await updateMedicationPrescriptionHandle(id, payload);
    res.status(200).json({
      message: "Cập nhật toa thuốc thành công!",
      prescription: updated,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Xóa toa thuốc
export const deleteMedicationPrescription = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await deleteMedicationPrescriptionHandle(id);
    res
      .status(200)
      .json({ message: "Xóa toa thuốc thành công!", prescription: deleted });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

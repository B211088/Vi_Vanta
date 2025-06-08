import { MedicationReminderItem } from "../models/index.js";

export const getMedicationRemindersHandle = async (filter = {}) => {
  try {
    // Hỗ trợ filter: userId, status, isActive, medicationId
    const query = {};
    if (filter.userId) query.userId = filter.userId;
    if (filter.status) query.status = filter.status;
    if (filter.isActive !== undefined) query.isActive = filter.isActive;
    if (filter.medicationId)
      query.medicationId = { $in: [filter.medicationId] };

    // Lấy danh sách nhắc nhở, sort mới nhất lên đầu
    const reminders = await MedicationReminderItem.find(query)
      .sort({ createdAt: -1 })
      .lean();
    return reminders;
  } catch (error) {
    throw new Error(
      error.message || "Lỗi khi lấy danh sách nhắc nhở uống thuốc"
    );
  }
};

export const updateMedicationReminderStatusHandle = async (id, status) => {
  try {
    if (!["pending", "completed", "skipped"].includes(status)) {
      throw new Error("Trạng thái không hợp lệ!");
    }
    const updated = await MedicationReminderItem.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    ).lean();
    if (!updated)
      throw new Error("Không tìm thấy nhắc nhở để cập nhật trạng thái!");
    return updated;
  } catch (error) {
    throw new Error(error.message || "Lỗi khi cập nhật trạng thái nhắc nhở");
  }
};

export const createMedicationReminderHandle = async (payload) => {
  try {
    const {
      userId,
      medicationId,
      dosageAmount,
      dosageUnit,
      note,
      repeat,
      daysOfWeek,
      intervalDays,
      startDate,
      remindAt,
    } = payload;

    // Validate các trường bắt buộc
    if (!userId || !medicationId || !dosageAmount || !dosageUnit || !remindAt) {
      throw new Error("Thiếu thông tin bắt buộc!");
    }

    if (repeat === "day_of_weekly") {
      if (
        !daysOfWeek ||
        !Array.isArray(daysOfWeek) ||
        daysOfWeek.length === 0
      ) {
        throw new Error("Vui lòng chọn ít nhất một ngày trong tuần!");
      }
    }

    if (repeat === "specific_date") {
      if (!intervalDays || intervalDays < 1) {
        throw new Error(
          "Vui lòng nhập số ngày cách nhau giữa các lần uống (intervalDays > 0)!"
        );
      }
      if (!startDate) {
        throw new Error("Vui lòng nhập ngày bắt đầu uống thuốc (startDate)!");
      }
    }

    // Tạo mới MedicationReminderItem
    const newReminder = new MedicationReminderItem({
      userId,
      medicationId,
      dosageAmount,
      dosageUnit,
      note,
      repeat,
      daysOfWeek: repeat === "day_of_weekly" ? daysOfWeek : [],
      intervalDays: repeat === "specific_date" ? intervalDays : undefined,
      startDate: repeat === "specific_date" ? startDate : undefined,
      remindAt,
      status: "pending",
    });
    await newReminder.save();
    return newReminder;
  } catch (error) {
    throw new Error(error.message || "Lỗi khi tạo nhắc nhở uống thuốc");
  }
};

export const getMedicationReminderByIdHandle = async (id) => {
  try {
    const reminder = await MedicationReminderItem.findById(id)
      .select("-__v")
      .populate("medicationId", "_id name scientificName ")
      .lean();
    if (!reminder) throw new Error("Không tìm thấy nhắc nhở!");
    return reminder;
  } catch (error) {
    throw new Error(
      error.message || "Lỗi khi lấy chi tiết nhắc nhở uống thuốc"
    );
  }
};

export const updateMedicationReminderHandle = async (id, payload) => {
  try {
    const updated = await MedicationReminderItem.findByIdAndUpdate(
      id,
      payload,
      { new: true }
    ).lean();
    if (!updated) throw new Error("Không tìm thấy nhắc nhở để cập nhật!");
    return updated;
  } catch (error) {
    throw new Error(error.message || "Lỗi khi cập nhật nhắc nhở uống thuốc");
  }
};

export const deleteMedicationReminderHandle = async (id) => {
  try {
    const deleted = await MedicationReminderItem.findByIdAndDelete(id).lean();
    if (!deleted) throw new Error("Không tìm thấy nhắc nhở để xóa!");
    return deleted;
  } catch (error) {
    throw new Error(error.message || "Lỗi khi xóa nhắc nhở uống thuốc");
  }
};

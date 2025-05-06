import { Pregnancy } from "../models/index.js";

const calculatePregnancyDates = (payload) => {
  const {
    lastMenstrualCyclesDate,
    menstrualCycleLength,
    conceptionDate,
    transferDate,
    embryoDay,
  } = payload;

  let calculatedDueDate = null;
  let calculatedConceptionDate = null;

  // Xử lý trường hợp IVF (phương pháp thụ tinh ống nghiệm)
  if (transferDate && embryoDay !== undefined) {
    const transferDateObj = new Date(transferDate);
    // Tính ngày dự sinh: ngày chuyển phôi + (266 - số ngày phôi phát triển)
    calculatedDueDate = new Date(transferDateObj);
    calculatedDueDate.setDate(calculatedDueDate.getDate() + (266 - embryoDay));

    // Tính ngày thụ thai: ngày chuyển phôi - số ngày phôi phát triển
    calculatedConceptionDate = new Date(transferDateObj);
    calculatedConceptionDate.setDate(
      calculatedConceptionDate.getDate() - embryoDay
    );
  }
  // Xử lý trường hợp biết ngày thụ thai
  else if (conceptionDate) {
    calculatedConceptionDate = new Date(conceptionDate);
    // Tính ngày dự sinh: ngày thụ thai + 266 ngày
    calculatedDueDate = new Date(calculatedConceptionDate);
    calculatedDueDate.setDate(calculatedDueDate.getDate() + 266);
  }
  // Xử lý trường hợp biết ngày kinh cuối cùng
  else if (lastMenstrualCyclesDate) {
    const lmpDate = new Date(lastMenstrualCyclesDate);
    // Sử dụng chu kỳ 28 ngày nếu người dùng không nhập giá trị
    const cycleLength = menstrualCycleLength
      ? parseInt(menstrualCycleLength)
      : 28;
    // Tính ngày rụng trứng (ngày thụ thai dự kiến): LMP + (cycle length - 14)
    const ovulationOffset = cycleLength - 14;

    calculatedConceptionDate = new Date(lmpDate);
    calculatedConceptionDate.setDate(
      calculatedConceptionDate.getDate() + ovulationOffset
    );

    // Tính ngày dự sinh: LMP + 280 ngày (cách tính Naegele)
    calculatedDueDate = new Date(lmpDate);
    calculatedDueDate.setDate(calculatedDueDate.getDate() + 280);
  } else {
    throw new Error("Không đủ dữ liệu để tính ngày dự sinh và ngày thụ thai");
  }

  return {
    dueDate: calculatedDueDate,
    conceptionDate: calculatedConceptionDate,
  };
};

export const createInfoPregnancyHandle = async (userId, payload) => {
  try {
    const {
      weightBeforePregnant,
      conceptionDate,
      lastMenstrualCyclesDate,
      menstrualCycleLength,
      transferDate,
      embryoDay,
    } = payload;

    // Tính toán ngày dự sinh và ngày thụ thai
    const { dueDate, conceptionDate: calculatedConceptionDate } =
      calculatePregnancyDates({
        lastMenstrualCyclesDate,
        menstrualCycleLength,
        conceptionDate,
        transferDate,
        embryoDay,
      });

    // Tạo đối tượng thông tin thai kỳ với đầy đủ dữ liệu
    const pregnancyInfo = new Pregnancy({
      userId,
      weightBeforePregnant,
      dueDate,
      // Sử dụng ngày thụ thai đã nhập hoặc đã tính toán
      conceptionDate: conceptionDate || calculatedConceptionDate,
      lastMenstrualCyclesDate,
      menstrualCycleLength,
      transferDate,
      embryoDay,
    });

    await pregnancyInfo.save();
    return pregnancyInfo;
  } catch (error) {
    console.error("Lỗi khi tạo thông tin thai kỳ:", error.message);
    throw error;
  }
};
export const getAllInfoPregnanciesHandle = async (userId) => {
  try {
    const infoPregnancys = await Pregnancy.find({ userId }).select(
      "_id weightBeforePregnant dueDate conceptionDate"
    );
    return infoPregnancys;
  } catch (error) {}
};

export const getInfoPregnancyHandle = async (pregnancyId) => {
  try {
    const infoPregnancy = await Pregnancy.findById(pregnancyId).select(
      "-__v -createdAt -updatedAt"
    );
    return infoPregnancy;
  } catch (error) {}
};

export const updateInfoPregnancyHandle = async (pregnancyId, payload) => {
  try {
    const {
      weightBeforePregnant,
      conceptionDate,
      lastMenstrualCyclesDate,
      menstrualCycleLength,
      transferDate,
      embryoDay,
    } = payload;

    const dueDate = calculateDueDateFromInputs({
      lastMenstrualCyclesDate,
      cycle_length: menstrualCycleLength,
      conception_date: conceptionDate,
      transfer_date: transferDate,
      embryo_day: embryoDay,
    });

    const existing = await Pregnancy.findOne({ _id: pregnancyId });
    if (!existing) {
      throw new Error("Không tìm thấy thông tin thai kỳ để cập nhật");
    }

    const pregnancyInfo = {
      weightBeforePregnant,
      dueDate,
      conceptionDate,
      lastMenstrualCyclesDate,
      menstrualCycleLength,
      transferDate,
      embryoDay,
    };

    const pregnancyInfoUpdateUpdate = await Pregnancy.findByIdAndUpdate(
      pregnancyId,
      { $set: pregnancyInfo },
      { new: true }
    ).select("-__v -createdAt -updatedAt");
    return pregnancyInfoUpdateUpdate;
  } catch (error) {
    console.error("Lỗi khi cập nhật thông tin thai kỳ:", error.message);
    throw error;
  }
};

export const deleteInfoPregnancyHandle = async (pregnancyId) => {
  try {
    const deleted = await Pregnancy.findByIdAndDelete(pregnancyId);
    if (!deleted) {
      throw new Error("Không tìm thấy thông tin thai kỳ để xóa");
    }
    return { message: "Xóa thông tin thai kỳ thành công" };
  } catch (error) {
    console.error("Lỗi khi xóa thông tin thai kỳ:", error.message);
    throw error;
  }
};

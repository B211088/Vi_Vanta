import Children from "../models/children.model.js";
import ChildVaccinationRecord from "../models/childVaccinationRecord.model.js";
import VACCINE_SCHEDULE from "../constants/vaccineSchedule.js";
// Tạo thông tin trẻ mới
export const createChildHandle = async (userId, payload) => {
  try {
    const newChild = new Children({
      userId,
      ...payload,
    });
    await newChild.save();
    return newChild;
  } catch (error) {
    console.error("Lỗi khi tạo thông tin trẻ:", error.message);
    throw new Error("Lỗi khi tạo thông tin trẻ");
  }
};

// Lấy danh sách tất cả trẻ thuộc tài khoản người dùng
// Import nếu bạn có file này

export const getAllChildrenHandle = async (userId) => {
  try {
    const children = await Children.find({ userId })
      .select("name birthDate gender notes createdAt updatedAt")
      .select("-__v -updatedAt");

    // Lấy tất cả record tiêm chủng của các bé
    const childIds = children.map((c) => c._id);
    const allRecords = await ChildVaccinationRecord.find({
      childId: { $in: childIds },
    });

    // Hàm tính process cho từng bé
    const getProcess = (child) => {
      const records = allRecords.filter(
        (r) => r.childId.toString() === child._id.toString()
      );
      const completedCodes = records
        .filter((r) => r.status === "completed")
        .map((r) => r.code);

      // Đếm tổng số vaccine cần tiêm
      let totalVaccines = 0;
      Object.values(VACCINE_SCHEDULE).forEach((vaccines) => {
        totalVaccines += vaccines.length;
      });

      // Đếm số đã tiêm
      const completedCount = completedCodes.length;

      // Lấy danh sách code vaccine bắt buộc, đã đến hạn
      const ageInMonths = Math.floor(
        (Date.now() - new Date(child.birthDate).getTime()) /
          (1000 * 60 * 60 * 24 * 30.44)
      );
      const overdueVaccineCodes = [];
      Object.values(VACCINE_SCHEDULE).forEach((vaccines) => {
        vaccines.forEach((vaccine) => {
          if (vaccine.required && vaccine.ageMonths <= ageInMonths) {
            overdueVaccineCodes.push(vaccine.code);
          }
        });
      });

      // Số vaccine quá hạn là những vaccine bắt buộc, đã đến hạn mà chưa tiêm
      const overdueCount = overdueVaccineCodes.filter(
        (code) => !completedCodes.includes(code)
      ).length;

      return {
        completedCount,
        totalVaccines,
        overdueCount,
      };
    };
    // Gắn process vào từng bé
    const childrenWithProcess = children.map((child) => ({
      ...child.toObject(),
      ...getProcess(child),
    }));

    return {
      children: childrenWithProcess,
    };
  } catch (error) {
    console.error("Lỗi khi lấy danh sách trẻ:", error.message);
    throw new Error("Lỗi khi lấy danh sách trẻ");
  }
};
// Lấy thông tin chi tiết một trẻ
export const getChildByIdHandle = async (childId) => {
  try {
    const child = await Children.findById(childId).select(
      "-__v -createdAt -updatedAt"
    );
    if (!child) {
      throw new Error("Không tìm thấy thông tin trẻ");
    }

    // Lấy tất cả record tiêm chủng của bé này
    const records = await ChildVaccinationRecord.find({ childId });
    const completedCodes = records
      .filter((r) => r.status === "completed")
      .map((r) => r.code);

    // Đếm tổng số vaccine cần tiêm
    let totalVaccines = 0;
    Object.values(VACCINE_SCHEDULE).forEach((vaccines) => {
      totalVaccines += vaccines.length;
    });

    // Đếm số đã tiêm
    const completedCount = completedCodes.length;

    // Đếm số quá hạn
    const ageInMonths = Math.floor(
      (Date.now() - new Date(child.birthDate).getTime()) /
        (1000 * 60 * 60 * 24 * 30.44)
    );
    let overdueCount = 0;
    Object.values(VACCINE_SCHEDULE).forEach((vaccines) => {
      vaccines.forEach((vaccine) => {
        if (
          vaccine.ageMonths < ageInMonths &&
          !completedCodes.includes(vaccine.code)
        ) {
          overdueCount++;
        }
      });
    });

    return {
      ...child.toObject(),
      completedCount,
      totalVaccines,
      overdueCount,
    };
  } catch (error) {
    console.error("Lỗi khi lấy thông tin trẻ:", error.message);
    throw new Error("Lỗi khi lấy thông tin trẻ");
  }
};
// Cập nhật thông tin trẻ
export const updateChildHandle = async (childId, payload) => {
  try {
    const updatedChild = await Children.findByIdAndUpdate(childId, payload, {
      new: true,
    });
    if (!updatedChild) {
      throw new Error("Không tìm thấy thông tin trẻ để cập nhật");
    }

    // Lấy tất cả record tiêm chủng của bé này
    const records = await ChildVaccinationRecord.find({ childId });
    const completedCodes = records
      .filter((r) => r.status === "completed")
      .map((r) => r.code);

    // Đếm tổng số vaccine cần tiêm
    let totalVaccines = 0;
    Object.values(VACCINE_SCHEDULE).forEach((vaccines) => {
      totalVaccines += vaccines.length;
    });

    // Đếm số đã tiêm
    const completedCount = completedCodes.length;

    // Đếm số quá hạn
    const ageInMonths = Math.floor(
      (Date.now() - new Date(updatedChild.birthDate).getTime()) /
        (1000 * 60 * 60 * 24 * 30.44)
    );
    let overdueCount = 0;
    Object.values(VACCINE_SCHEDULE).forEach((vaccines) => {
      vaccines.forEach((vaccine) => {
        if (
          vaccine.required &&
          vaccine.ageMonths <= ageInMonths &&
          !completedCodes.includes(vaccine.code)
        ) {
          overdueCount++;
        }
      });
    });

    return {
      ...updatedChild.toObject(),
      completedCount,
      totalVaccines,
      overdueCount,
    };
  } catch (error) {
    console.error("Lỗi khi cập nhật thông tin trẻ:", error.message);
    throw new Error("Lỗi khi cập nhật thông tin trẻ");
  }
};

// Xóa thông tin trẻ
export const deleteChildHandle = async (childId) => {
  try {
    // Xóa tất cả record tiêm chủng của bé này
    await ChildVaccinationRecord.deleteMany({ childId });

    // Xóa hồ sơ trẻ
    const deletedChild = await Children.findByIdAndDelete(childId);
    if (!deletedChild) {
      throw new Error("Không tìm thấy thông tin trẻ để xóa");
    }
    return deletedChild;
  } catch (error) {
    console.error("Lỗi khi xóa thông tin trẻ:", error.message);
    throw new Error("Lỗi khi xóa thông tin trẻ");
  }
};

export const getVaccinationRecordsByChildId = async (childId) => {
  try {
    const records = await ChildVaccinationRecord.find({ childId });
    return records;
  } catch (error) {
    console.error(
      "Lỗi khi lấy danh sách record tiêm chủng của bé:",
      error.message
    );
    throw new Error("Lỗi khi lấy danh sách record tiêm chủng của bé!");
  }
};

export const checkingVaccinacationRecordHandle = async (childId, payload) => {
  try {
    // Tìm bản ghi đã tiêm vaccine này cho bé chưa
    const existingRecord = await ChildVaccinationRecord.findOne({
      childId,
      code: payload.code,
    });

    if (existingRecord) {
      // Nếu đã có, cập nhật status và date
      existingRecord.status = payload.status;
      existingRecord.date = payload.date;
      await existingRecord.save();
      return existingRecord;
    } else {
      // Nếu chưa có, tạo mới
      const newVaccinacationRecord = new ChildVaccinationRecord({
        childId,
        code: payload.code,
        date: payload.date,
        status: payload.status,
      });
      await newVaccinacationRecord.save();
      return newVaccinacationRecord;
    }
  } catch (error) {
    console.error(
      "Lỗi khi cập nhật thông tin tiêm chủng của bé:",
      error.message
    );
    throw new Error("Lỗi khi cập nhật thông tin tiêm chủng của bé!");
  }
};

import { CREATE_CALCULATION_LIMIT } from "../config/contants.config.js";
import {
  BMIRecord,
  EMMRecord,
  BodyFatRecord,
  WHRRecord,
} from "../models/index.js";

import {
  calculateBMI,
  calculateBMRForFemale,
  calculateBMRForMale,
  calculateBodyFatPercent,
  calculateTDEE,
  calculateWHR,
} from "../utils/health.utils.js";

export const getBMIRecordsHandle = async (userId) => {
  try {
    const bmiRecords = await BMIRecord.find({ userId })
      .sort({ createdAt: -1 })
      .select("-__v -updatedAt ");
    return bmiRecords;
  } catch (error) {
    throw new Error("Lỗi khi lấy hồ sơ BMI: " + error.message);
  }
};

export const getBMIRecordByIdHandle = async (recordId) => {
  try {
    const bmiRecord = await BMIRecord.findById(recordId).select(
      "-__v  -updatedAt"
    );
    if (!bmiRecord) throw new Error("Hồ sơ BMI không tồn tại");
    return bmiRecord;
  } catch (error) {
    throw new Error("Lỗi khi lấy hồ sơ BMI: " + error.message);
  }
};

export const calculateBMIHandle = async (payload) => {
  try {
    const { userId, weight, height } = payload;
    if (!userId) throw new Error("Thiếu thông tin người dùng");
    if (!weight || !height) throw new Error("Thiếu chiều cao hoặc cân nặng");

    const bmi = calculateBMI(weight, height);
    const count = await BMIRecord.countDocuments({ userId });
    if (count >= CREATE_CALCULATION_LIMIT) {
      throw new Error(
        `Bạn chỉ được tạo tối đa ${CREATE_CALCULATION_LIMIT} chỉ số BMI!`
      );
    }

    const bmiRecord = new BMIRecord({
      userId,
      weight,
      height,
      bmi: bmi,
    });

    await bmiRecord.save();
    return bmiRecord;
  } catch (error) {
    throw new Error("Lỗi khi tính toán chỉ số BMI: " + error.message);
  }
};

export const deleteBMIRecordHandle = async (recordId) => {
  try {
    const bmiRecord = await BMIRecord.findByIdAndDelete(recordId);
    if (!bmiRecord) throw new Error("Hồ sơ BMI không tồn tại");
    return { success: true, message: "Xóa hồ sơ BMI thành công" };
  } catch (error) {
    throw new Error("Lỗi khi xóa hồ sơ BMI: " + error.message);
  }
};

export const getEMMRecordsHandle = async (userId) => {
  try {
    const emmRecords = await EMMRecord.find({ userId })
      .sort({ createdAt: -1 })
      .select("-__v -updatedAt ");
    return emmRecords;
  } catch (error) {
    throw new Error("Lỗi khi lấy hồ sơ EMM: " + error.message);
  }
};

export const getEMMRecordByIdHandle = async (recordId) => {
  try {
    const emmRecord = await EMMRecord.findById(recordId).select(
      "-__v  -updatedAt"
    );
    if (!emmRecord) throw new Error("Hồ sơ EMM không tồn tại");
    return emmRecord;
  } catch (error) {
    throw new Error("Lỗi khi lấy hồ sơ BMI: " + error.message);
  }
};

export const calculateEMMHandle = async (payload) => {
  try {
    const { userId, weight, height, age, gender, activityLevel } = payload;
    if (!weight || !height || !age || gender === undefined) {
      throw new Error("Thiếu dữ liệu cần thiết");
    }
    const count = await EMMRecord.countDocuments({ userId });
    if (count >= CREATE_CALCULATION_LIMIT) {
      throw new Error(
        `Bạn chỉ được tạo tối đa ${CREATE_CALCULATION_LIMIT} chỉ số BMR!`
      );
    }
    const bmr =
      gender === "male"
        ? calculateBMRForMale(weight, height, age)
        : calculateBMRForFemale(weight, height, age);
    const tdee = calculateTDEE(bmr, activityLevel || "sedentary");
    const emmRecord = new EMMRecord({
      ...payload,
      bmr: bmr,
      tdee: tdee,
    });

    await emmRecord.save();
    return emmRecord;
  } catch (error) {
    throw new Error("Lỗi khi tính toán chỉ số EMM: " + error.message);
  }
};

export const deleteEMMRecordHandle = async (recordId) => {
  try {
    const bmiRecord = await EMMRecord.findByIdAndDelete(recordId);
    if (!bmiRecord) throw new Error("Hồ sơ BMI không tồn tại");
    return { success: true, message: "Xóa hồ sơ BMI thành công" };
  } catch (error) {
    throw new Error("Lỗi khi xóa hồ sơ BMI: " + error.message);
  }
};

export const getBodyFatRecordsHandle = async (userId) => {
  try {
    const bodyFats = await BodyFatRecord.find({ userId })
      .sort({ createdAt: -1 })
      .select("-__v -updatedAt ");
    return bodyFats;
  } catch (error) {
    throw new Error("Lỗi khi lấy Body Fat: " + error.message);
  }
};

export const getBodyFatRecordByIdHandle = async (recordId) => {
  try {
    const bodyFat = await BodyFatRecord.findById(recordId).select(
      "-__v  -updatedAt"
    );
    if (!bodyFat) throw new Error("Hồ sơ BMI không tồn tại");
    return bodyFat;
  } catch (error) {
    throw new Error("Lỗi khi lấy Body Fat: " + error.message);
  }
};

export const calculateBodyFatHandle = async (payload) => {
  try {
    const { userId, gender, waist, neck, hip, height, weight } = payload;

    const bodyFatPercent = calculateBodyFatPercent(
      gender,
      waist,
      neck,
      hip,
      height
    );
    const count = await BodyFatRecord.countDocuments({ userId });
    if (count >= CREATE_CALCULATION_LIMIT) {
      throw new Error(
        `Bạn chỉ được tạo tối đa ${CREATE_CALCULATION_LIMIT} chỉ số Body Fat!`
      );
    }

    if (bodyFatPercent < 0) {
      throw new Error("Lỗi khi tính tỉ lệ mỡ");
    }
    const bodyFatMass = weight * (bodyFatPercent / 100);
    const bodyFat = new BodyFatRecord({
      userId,
      gender,
      waist,
      neck,
      hip,
      height,
      weight,
      bodyFatPercent: Number(bodyFatPercent),
      bodyFatMass: Number(bodyFatMass),
    });

    await bodyFat.save();
    return bodyFat;
  } catch (error) {
    throw new Error("Lỗi khi tính toán phần trăm mỡ cơ thể: " + error.message);
  }
};

export const deleteBodyFatRecordHandle = async (recordId) => {
  try {
    const bmiRecord = await BodyFatRecord.findByIdAndDelete(recordId);
    if (!bmiRecord) throw new Error("Hồ sơ Body Fat không tồn tại");
    return { success: true, message: "Xóa hồ sơ Body Fat thành công" };
  } catch (error) {
    throw new Error("Lỗi khi xóa hồ sơ Body Fat: " + error.message);
  }
};

export const getWHRRecordsHandle = async (userId) => {
  try {
    const whrRecords = await WHRRecord.find({ userId })
      .sort({ createdAt: -1 })
      .select("-__v -updatedAt ");
    return whrRecords;
  } catch (error) {
    throw new Error("Lỗi khi lấy hồ sơ WHR: " + error.message);
  }
};

export const getWHRRecordByIdHandle = async (recordId) => {
  try {
    const whrRecord = await WHRRecord.findById(recordId).select(
      "-__v  -updatedAt"
    );
    if (!whrRecord) throw new Error("Hồ sơ WHR không tồn tại");
    return whrRecord;
  } catch (error) {
    throw new Error("Lỗi khi lấy hồ sơ WHR: " + error.message);
  }
};

export const calculateWHRHandle = async (payload) => {
  try {
    const { userId, waist, hip, gender } = payload;
    if (!userId) throw new Error("Thiếu thông tin người dùng");
    if (!waist || !hip) throw new Error("Thiếu số đo vòng eo hoặc vòng mông");
    const count = await WHRRecord.countDocuments({ userId });
    if (count >= CREATE_CALCULATION_LIMIT) {
      throw new Error(
        `Bạn chỉ được tạo tối đa ${CREATE_CALCULATION_LIMIT} chỉ số WHR!`
      );
    }
    const whr = calculateWHR(waist, hip);

    const whrRecord = new WHRRecord({
      userId,
      waist,
      hip,
      gender,
      whr: whr,
    });

    await whrRecord.save();
    return whrRecord;
  } catch (error) {
    throw new Error("Lỗi khi tính toán chỉ số WHR: " + error.message);
  }
};

export const deleteWHRRecordHandle = async (recordId) => {
  try {
    const whrRecord = await WHRRecord.findByIdAndDelete(recordId);
    if (!whrRecord) throw new Error("Hồ sơ WHR không tồn tại");
    return { success: true, message: "Xóa hồ sơ WHR thành công" };
  } catch (error) {
    throw new Error("Lỗi khi xóa hồ sơ WHR: " + error.message);
  }
};

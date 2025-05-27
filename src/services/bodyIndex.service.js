import { BodyIndex, User } from "../models/index.js";

export const getBasicIndexHandle = async (userId) => {
  try {
    const bodyIndex = await BodyIndex.find({ userId });
    return basicIndex;
  } catch (error) {
    throw new Error("Lỗi khi lấy chỉ số cơ thể cơ bản: " + error.message);
  }
};

export const calculateBMIHandle = async (payload) => {
  try {
    const { userId, weight, height } = payload;
    if (!userId) throw new Error("Thiếu thông tin người dùng");
    if (!weight || !height) throw new Error("Thiếu chiều cao hoặc cân nặng");

    const bmi = weight / (height / 100) ** 2;

    const bmiIndex = new BodyIndex({
      weight,
      height,
      bmi: Number(bmi.toFixed(2)),
    });

    await bmiIndex.save();
    return bmiIndex;
  } catch (error) {
    throw new Error("Lỗi khi tính toán chỉ số BMI: " + error.message);
  }
};

export const calculateBMRHandle = async (payload) => {
  try {
    if (!payload) throw new Error("Payload không được cung cấp");
    const { userId, weight, height, age, gender } = payload;
    if (!userId) throw new Error("Thiếu thông tin người dùng");
    if (!weight || !height || !age || gender === undefined) {
      throw new Error("Thiếu dữ liệu cần thiết");
    }

    let bmr =
      gender === "male"
        ? 10 * weight + 6.25 * height - 5 * age + 5
        : 10 * weight + 6.25 * height - 5 * age - 161;
  } catch (error) {
    throw new Error("Lỗi khi tính toán chỉ số BMR: " + error.message);
  }
};

export const calculateTDEE = async ({ userId, activityLevel }) => {
  try {
    const bodyIndex = await BodyIndex.findOne({ userId });
    if (!bodyIndex) throw new Error("Chỉ số cơ thể không tồn tại");
    const { bmr } = bodyIndex;
    const activityFactors = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      active: 1.725,
      very_active: 1.9,
    };
    const factor = activityFactors[activityLevel] || 1.2;
    return { tdee: bmr * factor };
  } catch (error) {
    throw new Error("Lỗi khi tính toán TDEE: " + error.message);
  }
};

export const calculateBodyFat = async ({
  userId,
  height,
  neck,
  waist,
  hip,
}) => {
  try {
    const user = await User.findById(userId);
    if (!user) throw new Error("Người dùng không tồn tại");
    const { gender, weight } = user;
    let bfp = 0;
    if (gender === "male") {
      bfp =
        495 /
          (1.0324 -
            0.19077 * Math.log10(waist - neck) +
            0.15456 * Math.log10(height)) -
        450;
    } else {
      bfp =
        495 /
          (1.29579 -
            0.35004 * Math.log10(waist + hip - neck) +
            0.221 * Math.log10(height)) -
        450;
    }
    const leanBodyMass = weight * (1 - bfp / 100);
    const bodyFatMass = weight * (bfp / 100);
    return { bodyFatPercent: bfp, leanBodyMass, bodyFatMass };
  } catch (error) {
    throw new Error("Lỗi khi tính toán phần trăm mỡ cơ thể: " + error.message);
  }
};

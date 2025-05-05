import mongoose from "mongoose";
import dotenv from "dotenv";
import { Ward, District, Province } from "./models/index.js";

dotenv.config();

export const createSampleData = async () => {
  // Tạo các tỉnh/thành phố mẫu
  const province = await Province.create({ name: "Hà Nội" });

  // Tạo các quận/huyện mẫu
  const district = await District.create({
    name: "Hoàn Kiếm",
    provinceId: province._id,
  });

  // Tạo các phường/xã mẫu
  const ward = await Ward.create({
    name: "Phan Chu Trinh",
    districtId: district._id,
  });

  console.log("Sample data created:", address);
};

export const connectDB = async () => {
  try {
    await mongoose.connect(process.env.DATABASE_URL);
    console.log("Kết nối MongoDB thành công");
  } catch (error) {
    console.error("Lỗi kết nối MongoDB:", error);
    process.exit(1);
  }
};

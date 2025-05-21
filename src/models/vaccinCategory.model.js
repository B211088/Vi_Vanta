import mongoose from "mongoose";
const { Schema } = mongoose;

const vaccinCategorySchema = new Schema(
  {
    name: {
      type: String,
      required: true, // Tên danh mục vắc-xin (bắt buộc)
      unique: true, // Đảm bảo tên danh mục là duy nhất
      trim: true, // Loại bỏ khoảng trắng thừa
    },
    description: {
      type: String, // Mô tả chi tiết về danh mục
      default: "",
    },
  },
  {
    timestamps: true, // Tự động thêm createdAt và updatedAt
  }
);

const VaccinCategory = mongoose.model("VaccinCategory", vaccinCategorySchema);

export default VaccinCategory;

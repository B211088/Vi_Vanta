import mongoose from "mongoose";
const { Schema } = mongoose;

const diseaseCategorySchema = new Schema(
  {
    name: {
      type: String,
      required: true, // Tên danh mục bệnh (bắt buộc)
      unique: true, // Đảm bảo tên danh mục là duy nhất
      trim: true, // Loại bỏ khoảng trắng thừa
    },
    description: {
      type: String, // Mô tả danh mục bệnh
      default: "",
    },
  },
  {
    timestamps: true, // Tự động thêm createdAt và updatedAt
  }
);

const DiseaseCategory = mongoose.model(
  "DiseaseCategory",
  diseaseCategorySchema
);

export default DiseaseCategory;

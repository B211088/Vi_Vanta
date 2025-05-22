import mongoose from "mongoose";
const { Schema } = mongoose;

const childVaccinationSchema = new Schema(
  {
    vaccineId: {
      type: Schema.Types.ObjectId, // ID của vắc-xin
      ref: "Vaccine", // Tham chiếu đến mô hình vắc-xin
      required: true, // ID của vắc-xin (bắt buộc)
      trim: true,
    },
    recommendedAgeInMonths: {
      type: Number, // Tháng tuổi nên tiêm vắc-xin
      required: true,
    },
    dosesRequired: {
      type: Number, // Số liều cần tiêm
      required: true,
    },
  },
  {
    timestamps: true, // Tự động thêm createdAt và updatedAt
  }
);

const ChildVaccination = mongoose.model(
  "ChildVaccination",
  childVaccinationSchema
);

export default ChildVaccination;

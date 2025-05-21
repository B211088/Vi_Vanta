import mongoose from "mongoose";
const { Schema } = mongoose;

const childVaccinationRecordSchema = new Schema(
  {
    childId: {
      type: Schema.Types.ObjectId, // Liên kết với thông tin trẻ
      ref: "Children", // Giả sử thông tin trẻ được lưu trong schema "Child"
      required: true,
    },
    vaccinationId: {
      type: Schema.Types.ObjectId, // ID của bản ghi tiêm chủng
      ref: "ChildVaccination", // Tham chiếu đến mô hình bản ghi tiêm chủng
      required: true,
    },
    date: {
      type: Date, // Ngày tiêm chủng
      required: true,
    },
    status: {
      type: String, // Trạng thái tiêm chủng (đã tiêm, chưa tiêm, hoãn)
      enum: ["completed", "not completed", "missed"], // Các giá trị hợp lệ
      default: "not completed", // Giá trị mặc định
    },
  },
  {
    timestamps: true, // Tự động thêm createdAt và updatedAt
  }
);

const ChildVaccinationRecord = mongoose.model(
  "ChildVaccinationRecord",
  childVaccinationRecordSchema
);

export default ChildVaccinationRecord;

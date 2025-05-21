import mongoose from "mongoose";
const { Schema } = mongoose;

const notificationSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User" }, // Người nhận (user hoặc staff hoặc clinic)
    clinicId: { type: Schema.Types.ObjectId, ref: "Clinic" },
    staffId: { type: Schema.Types.ObjectId, ref: "ClinicStaff" },
    type: {
      type: String,
      enum: [
        "appointment", // Lịch khám
        "payment", // Thanh toán
        "system", // Thông báo hệ thống
        "review", // Đánh giá
        "other",
      ],
      default: "other",
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    data: { type: Object }, // Thông tin bổ sung (ví dụ: id lịch khám, id thanh toán,...)
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Notification = mongoose.model("Notification", notificationSchema);
export default Notification;

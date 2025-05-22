import mongoose from "mongoose";
const { Schema } = mongoose;

const pregnancyVisitSchema = new Schema(
  {
    pregnancyId: {
      type: Schema.Types.ObjectId,
      ref: "Pregnancy",
      required: true,
    },
    visitTypeId: {
      type: Schema.Types.ObjectId,
      ref: "VisitType",
      required: true,
    },
    clinicId: {
      // Thêm liên kết phòng khám
      type: Schema.Types.ObjectId,
      ref: "Clinic",
    },
    staffId: {
      // Thêm liên kết bác sĩ/nhân viên
      type: Schema.Types.ObjectId,
      ref: "ClinicStaff",
    },
    title: String,
    date: { type: Date, required: true },
    result: String,
    note: String,
    images: [
      // Đổi imageUrls thành images để lưu cả url và public_id
      {
        url: String,
        public_id: String,
      },
    ],
    status: {
      type: String,
      enum: ["scheduled", "completed", "canceled"],
      default: "scheduled",
    },
    paymentId: {
      // Liên kết đến bảng thanh toán nếu có
      type: Schema.Types.ObjectId,
      ref: "Payment",
    },
  },
  { timestamps: true }
);

const PregnancyVisit = mongoose.model("PregnancyVisit", pregnancyVisitSchema);

export default PregnancyVisit;

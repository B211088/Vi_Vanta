import mongoose from "mongoose";
const { Schema } = mongoose;

const appointmentSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true }, // Người đặt lịch
    clinicId: { type: Schema.Types.ObjectId, ref: "Clinic", required: true }, // Phòng khám
    staffId: { type: Schema.Types.ObjectId, ref: "ClinicStaff" }, // Bác sĩ hoặc nhân viên phụ trách (nếu có)
    visitTypeIds: [{ type: Schema.Types.ObjectId, ref: "VisitType" }],
    date: { type: Date, required: true },
    time: { type: String }, // VD: "09:00"
    status: {
      type: String,
      enum: ["pending", "confirmed", "completed", "canceled"],
      default: "pending",
    },
    paymentStatus: {
      type: String,
      enum: ["unpaid", "paid", "refunded"],
      default: "unpaid",
    },
    paymentMethod: {
      type: String,
      enum: ["cash", "momo", "banking"],
      default: "cash",
    },
    totalFee: { type: Number, default: 0 },
    note: String,
    result: String, // Kết quả khám
    images: [
      {
        url: String,
        public_id: String,
      },
    ],
  },
  { timestamps: true }
);

const Appointment = mongoose.model("Appointment", appointmentSchema);
export default Appointment;

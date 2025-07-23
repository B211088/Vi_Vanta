import mongoose from "mongoose";
const { Schema } = mongoose;

const appointmentSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true }, // Người đặt lịch
    doctorId: { type: Schema.Types.ObjectId, ref: "Doctor", required: true }, // Phòng khám
    date: { type: Date, required: true },
    timeSlot: {
      startTime: { type: String, required: true }, // "08:00"
      endTime: { type: String, required: true }, // "08:15"
    },
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
    services: [
      { type: Schema.Types.ObjectId, ref: "BooingService", required: true },
    ],
    paymentMethod: {
      type: String,
      enum: ["cash", "momo", "banking"],
      default: "cash",
    },
    totalFee: { type: Number, default: 0 },
    note: String,
    result: String,
  },
  { timestamps: true }
);

const Appointment = mongoose.model("Appointment", appointmentSchema);
export default Appointment;

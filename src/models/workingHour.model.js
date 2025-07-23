import mongoose from "mongoose";

const { Schema } = mongoose;
const workingHourSchema = new Schema(
  {
    doctorId: {
      type: Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
    },
    dayOfWeek: {
      type: Number, // 0: Chủ nhật, 1: Thứ 2, ..., 6: Thứ 7
      required: true,
      min: 0,
      max: 6,
    },
    timeSlots: [
      {
        startTime: { type: String, required: true }, // "08:00"
        endTime: { type: String, required: true }, // "08:15"
        isAvailable: { type: Boolean, default: true },
      },
    ],
    date: { type: Date }, // Cho trường hợp lịch làm việc theo ngày cụ thể
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const WorkingHour = mongoose.model("workingHour", workingHourSchema);
export default WorkingHour;

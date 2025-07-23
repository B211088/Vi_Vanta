import mongoose from "mongoose";
const { Schema } = mongoose;

const timeSlotSchema = new Schema(
  {
    doctorId: {
      type: Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
    },
    date: { type: Date, required: true },
    timeSlots: [
      {
        time: { type: String, required: true }, // "08:00"
        isBooked: { type: Boolean, default: false },
        appointmentId: {
          type: Schema.Types.ObjectId,
          ref: "Appointment",
        },
      },
    ],
  },
  { timestamps: true }
);

// Index để query nhanh
timeSlotSchema.index({ doctorId: 1, date: 1 });

const TimeSlot = mongoose.model("TimeSlot", timeSlotSchema);
export default TimeSlot;

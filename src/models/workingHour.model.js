import mongoose from "mongoose";

const { Schema } = mongoose;

const workingHourSchema = new Schema(
  {
    dayOfWeek: { type: Number, min: 0, max: 6, required: true },
    startTime: { type: String, required: true }, // "08:00"
    endTime: { type: String, required: true }, // "17:00"
  },
  { _id: false }
);

const WorkingHour = mongoose.model("workingHour", workingHourSchema);
export default WorkingHour;

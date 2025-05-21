import mongoose from "mongoose";
const { Schema } = mongoose;

const menstrualCycleSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    cycleLength: {
      type: Number,
      default: 28,
    },
    periodLength: {
      type: Number,
      default: 5,
    },
    symptoms: {
      type: [String],
      default: [],
    },
    painLevel: {
      type: Number,
      min: 1,
      max: 10,
      default: 1,
    },
    notes: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

const MenstrualCycle = mongoose.model("MenstrualCycle", menstrualCycleSchema);

export default MenstrualCycle;

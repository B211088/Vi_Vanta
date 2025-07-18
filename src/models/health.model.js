import mongoose from "mongoose";
const { Schema } = mongoose;

const healthSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    height: {
      type: Number,
      default: 0,
      min: 0,
      max: 500,
    },
    weight: {
      type: Number,
      default: 0,
      min: 0,
      max: 500,
    },
    waist: { type: Number, default: 0, min: 0, max: 200 },
    hip: { type: Number, default: 0, min: 0, max: 200 },
    neck: { type: Number, default: 0, min: 0, max: 200 },
    activityLevel: {
      type: String,
      enum: ["sedentary", "light", "moderate", "active", "very_active"],
      default: "moderate",
    },
    goal: { type: String, enum: ["lose", "maintain", "gain"] },
    gender: {
      type: String,
      enum: ["male", "female"],
    },
    age: { type: Number, default: 0 },
    bloodType: {
      type: String,
      enum: ["A", "B", "AB", "O", "unknown"],
      default: "unknown",
    },
    chronicDiseases: {
      type: [String],
      default: [],
    },
    heartRate: {
      type: Number,
      default: 0,
    },
    allergies: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

const Health = mongoose.model("Health", healthSchema);
export default Health;

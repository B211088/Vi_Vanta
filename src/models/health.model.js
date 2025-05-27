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
      max: 200,
    },
    weight: {
      type: Number,
      default: 0,
      min: 0,
      max: 200,
    },
    waist: { type: Number, default: 0, min: 0, max: 200 },
    hip: { type: Number, default: 0, min: 0, max: 200 },
    neck: { type: Number, default: 0, min: 0, max: 200 },
    bloodType: {
      type: String,
      enum: ["A", "B", "AB", "O", "unknown"],
      default: "unknown",
    },
    chronicDiseases: {
      type: [String],
      default: [],
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

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
      min: 30,
      max: 400,
    },
    weight: {
      type: Number,
      min: 1,
      max: 1000,
    },
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

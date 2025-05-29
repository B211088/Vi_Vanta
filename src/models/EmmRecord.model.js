import mongoose from "mongoose";

const { Schema } = mongoose;

const EMMRecordSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    weight: {
      type: Number,
      required: true,
      min: 0,
      max: 1000,
    },
    height: {
      type: Number,
      required: true,
      min: 0,
      max: 300,
    },
    age: {
      type: Number,
      required: true,
      min: 0,
      max: 150,
    },
    gender: {
      type: String,
      required: true,
      enum: ["male", "female"],
    },
    bmr: {
      type: Number,
      required: true,
      min: 0,
    },
    tdee: {
      type: Number,
      required: true,
      min: 0,
    },
    activityLevel: {
      type: String,
      enum: ["sedentary", "light", "moderate", "active", "very_active"],
      default: "sedentary",
    },
  },
  {
    timestamps: true, // Ghi thời gian tạo & cập nhật
  }
);

const EMMRecord = mongoose.model("EmmRecord", EMMRecordSchema);

export default EMMRecord;

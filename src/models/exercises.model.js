import mongoose from "mongoose";
const { Schema } = mongoose;

// models/Exercise.js

const exerciseSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String },
    category: { type: Schema.Types.ObjectId, ref: "ExerciseCategory" },
    level: { type: String, enum: ["beginner", "intermediate", "advanced"] },
    equipment: { type: [String] },
    muscles: { type: [String] },
    thumbnail: {
      url: { type: String, required: true, trim: true },
      public_id: { type: String, required: true, trim: true },
    },
    images: [
      {
        url: { type: String, required: true, trim: true },
        public_id: { type: String, required: true, trim: true },
      },
    ],
    videos: [
      {
        url: { type: String, required: true, trim: true },
        public_id: { type: String, required: true, trim: true },
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Exercise = mongoose.model("Exercise", exerciseSchema);
export default Exercise;

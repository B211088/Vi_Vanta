import mongoose from "mongoose";
const { Schema } = mongoose;

// models/Exercise.js

const exerciseCategorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    parentCategoryId: { type: Schema.Types.ObjectId, ref: "ExerciseCategory" },
  },
  {
    timestamps: true,
  }
);

const ExerciseCategory = mongoose.model(
  "ExerciseCategory",
  exerciseCategorySchema
);
export default ExerciseCategory;

import mongoose from "mongoose";
const { Schema } = mongoose;

const pregnancyWeekSchema = new Schema(
  {
    weekNumber: {
      type: Number,
      unique: true,
      required: true,
      min: 1,
      max: 42,
    },
    fetalDevelopment: {
      type: String,
      trim: true,
      maxlength: 2000,
    },
    motherChanges: {
      type: String,
      trim: true,
      maxlength: 2000,
    },
    advice: {
      type: String,
      trim: true,
      maxlength: 2000,
    },
    imageUrl: {
      type: String,
    },
  },
  { timestamps: true }
);

const PregnancyWeek = mongoose.model("PregnancyWeek", pregnancyWeekSchema);
export default PregnancyWeek;

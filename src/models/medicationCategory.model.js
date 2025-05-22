import mongoose from "mongoose";
const { Schema } = mongoose;

const medicationCategorySchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

const MedicationCategory = mongoose.model(
  "MedicationCategory",
  medicationCategorySchema
);

export default MedicationCategory;

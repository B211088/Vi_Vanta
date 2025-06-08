import mongoose from "mongoose";
const { Schema } = mongoose;

const diseaseCategorySchema = new Schema(
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
    parent: {
      type: Schema.Types.ObjectId,
      ref: "DiseaseCategory",
      default: null,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    deleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const DiseaseCategory = mongoose.model(
  "DiseaseCategory",
  diseaseCategorySchema
);

export default DiseaseCategory;

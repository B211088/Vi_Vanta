import mongoose from "mongoose";

const { Schema } = mongoose;

const visitTypeSchema = new Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      maxlength: 50,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    week: {
      type: Number,
      min: 1,
      max: 42,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    color: {
      type: String,
      trim: true,
      match: /^#([0-9a-fA-F]{3}){1,2}$/,
    },
    iconUrl: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

const VisitType = mongoose.model("VisitType", visitTypeSchema);
export default VisitType;

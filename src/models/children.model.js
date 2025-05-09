import mongoose from "mongoose";
const { Schema } = mongoose;

const childInfoSchema = new Schema(
  {
    parentId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    gender: {
      type: String,
      enum: ["male", "female", "other"],
      required: true,
    },
    dateOfBirth: {
      type: Date,
      required: true,
    },
    birthWeight: {
      type: Number,
    },
    birthHeight: {
      type: Number,
    },
    bloodType: {
      type: String,
      enum: ["A", "B", "AB", "O", "unknown"],
      default: "unknown",
    },
    deliveryMethod: {
      type: String,
      enum: ["vaginal", "cesarean", "other"],
    },
  },
  { timestamps: true }
);

const Children = mongoose.model("children", childInfoSchema);
export default Children;

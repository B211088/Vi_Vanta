import mongoose from "mongoose";

const { Schema } = mongoose;

const WHRRecordSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    gender: { type: String, enum: ["male", "female"], default: "male" },
    waist: {
      type: Number,
      required: true,
      min: 0,
    },
    hip: {
      type: Number,
      required: true,
      min: 0,
    },
    whr: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

const WHRRecord = mongoose.model("WHRRecord", WHRRecordSchema);

export default WHRRecord;

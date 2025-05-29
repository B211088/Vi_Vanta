import mongoose from "mongoose";

const { Schema } = mongoose;

const BodyFatRecordSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    gender: {
      type: String,
      enum: ["male", "female"],
      required: true,
    },
    waist: {
      type: Number,
      required: true,
      min: 0,
    },
    neck: {
      type: Number,
      required: true,
      min: 0,
    },
    hip: {
      type: Number,
      min: 0,
    },
    height: {
      type: Number,
      required: true,
      min: 0,
    },
    weight: {
      type: Number,
      required: true,
      min: 0,
    },
    bodyFatPercent: {
      type: Number,
      required: true,
      min: 0,
    },
    bodyFatMass: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

const BodyFatRecord = mongoose.model("BodyFatRecord", BodyFatRecordSchema);

export default BodyFatRecord;

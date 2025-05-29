import mongoose from "mongoose";

const { Schema } = mongoose;

const BMIRecordSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    weight: { type: Number, required: true, min: 0, max: 1000 },
    height: { type: Number, required: true, min: 0, max: 300 },
    bmi: { type: Number, required: true, min: 0, max: 100 },
  },
  {
    timestamps: true,
  }
);

const BMIRecord = mongoose.model("BMIRecord", BMIRecordSchema);

export default BMIRecord;

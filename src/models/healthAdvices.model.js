// models/HealthAdvice.js
import mongoose from "mongoose";
const { Schema } = mongoose;

const healthAdviceSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      required: true,
      enum: [
        "metabolism",
        "bmi",
        "bmr",
        "tdee",
        "water",
        "sleep",
        "meals",
        "heartRate",
        "bloodPressure",
        "exercise",
        "nutrition",
        "custom",
      ],
    },
    value: {
      type: String,
      required: true,
    },
    source: {
      type: String,
      enum: ["system", "ai", "user"],
      default: "system",
    },
  },
  { timestamps: true }
);

const HealthAdvice = mongoose.model("HealthAdvice", healthAdviceSchema);
export default HealthAdvice;

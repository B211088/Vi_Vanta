import mongoose from "mongoose";

const { Schema } = mongoose;

const BodyIndexSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    weight: { type: Number, required: true, default: 0, min: 0, max: 1000 },
    height: { type: Number, required: true, default: 0, min: 0, max: 300 },
    age: { type: Number, required: true, default: 0, min: 0, max: 150 },
    gender: {
      type: String,
      enum: ["male", "female"],
      default: "male",
    },

    waist: { type: Number, default: 0, min: 0, max: 200 },
    hip: { type: Number, default: 0, min: 0, max: 200 },
    neck: { type: Number, default: 0, min: 0, max: 200 },

    activityLevel: {
      type: String,
      enum: ["sedentary", "light", "moderate", "active", "very_active"],
      default: "sedentary",
    },

    bmi: { type: Number },
    bmr: { type: Number },
    tdee: { type: Number },
    whr: { type: Number },
    bodyFatPercent: { type: Number },
    leanBodyMass: { type: Number },
    bodyFatMass: { type: Number },
  },
  {
    timestamps: true,
  }
);

const BodyIndex = mongoose.model("BodyIndex", BodyIndexSchema);

export default BodyIndex;

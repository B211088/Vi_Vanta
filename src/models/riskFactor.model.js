import mongoose from "mongoose";
const { Schema } = mongoose;

const riskFactorSchema = new Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    slug: { type: String, unique: true, trim: true },
    description: { type: String, trim: true },
    relatedDiseases: [{ type: Schema.Types.ObjectId, ref: "Disease" }],
    type: {
      type: String,
      enum: ["modifiable", "non-modifiable", "unknown"],
      default: "unknown",
      description:
        "Loại yếu tố nguy cơ: có thể thay đổi, không thể thay đổi, không rõ",
    },
    level: {
      type: String,
      enum: ["low", "medium", "high", "critical", "unknown"],
      default: "unknown",
      description: "Mức độ nguy cơ",
    },
    images: [
      {
        url: { type: String, trim: true },
        public_id: { type: String, trim: true },
        description: { type: String, trim: true },
      },
    ],
    references: [{ type: Schema.Types.ObjectId, ref: "Reference" }],
    tags: [{ type: Schema.Types.ObjectId, ref: "Tag" }],
    status: {
      type: String,
      enum: ["active", "inactive", "draft"],
      default: "active",
    },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

export default mongoose.model("RiskFactor", riskFactorSchema);

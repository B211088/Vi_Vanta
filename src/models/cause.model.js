import mongoose from "mongoose";
const { Schema } = mongoose;

const causeSchema = new Schema(
  {
    parent: { type: Schema.Types.ObjectId, ref: "Cause", default: null },
    name: {
      type: String,
      required: true, // Tên nguyên nhân
      unique: true, // Đảm bảo tên nguyên nhân là duy nhất
      trim: true,
    },
    slug: { type: String, unique: true, trim: true }, // Đường dẫn thân thiện SEO
    type: {
      type: String,
      enum: ["infectious", "genetic", "environmental", "lifestyle", "other"],
      default: "other",
      description:
        "Loại nguyên nhân: nhiễm trùng, di truyền, môi trường, lối sống, khác",
    },
    category: { type: Schema.Types.ObjectId, ref: "CauseCategory" }, // Phân loại nguyên nhân
    description: {
      type: String, // Mô tả nguyên nhân
      default: "",
      trim: true,
    },
    images: [
      {
        url: {
          type: String,
          required: true,
        },
        public_id: {
          type: String,
          required: true,
        },
        description: { type: String, trim: true },
      },
    ],
    relatedDiseases: [{ type: Schema.Types.ObjectId, ref: "Disease" }], // Các bệnh liên quan
    references: [{ type: Schema.Types.ObjectId, ref: "Reference" }], // Nguồn tham khảo
    riskLevel: {
      type: String,
      enum: ["low", "medium", "high", "unknown"],
      default: "unknown",
    },
    notes: { type: String, trim: true },
    tags: [{ type: Schema.Types.ObjectId, ref: "Tag" }],
    status: {
      type: String,
      enum: ["active", "inactive", "draft"],
      default: "active",
    },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  {
    timestamps: true,
  }
);

const Cause = mongoose.model("Cause", causeSchema);

export default Cause;

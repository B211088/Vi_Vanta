import mongoose from "mongoose";
const { Schema } = mongoose;

const causeCategorySchema = new Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    slug: { type: String, unique: true, trim: true }, // Đường dẫn thân thiện SEO
    description: { type: String, trim: true },
    parent: { type: Schema.Types.ObjectId, ref: "CauseCategory" }, // Phân loại cha (nếu có)
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

export default mongoose.model("CauseCategory", causeCategorySchema);

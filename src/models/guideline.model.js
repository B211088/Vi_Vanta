import mongoose from "mongoose";
const { Schema } = mongoose;

const guidelineSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, unique: true, trim: true },
    description: { type: String, trim: true },
    disease: [{ type: Schema.Types.ObjectId, ref: "Disease" }],
    specialty: [{ type: Schema.Types.ObjectId, ref: "Specialty" }],
    content: { type: String, required: true }, // Nội dung chi tiết
    version: { type: Number, default: 1 },
    publishedAt: { type: Date },
    updatedAt: { type: Date },
    references: [{ type: Schema.Types.ObjectId, ref: "Reference" }],
    tags: [{ type: Schema.Types.ObjectId, ref: "Tag" }],
    status: {
      type: String,
      enum: ["draft", "pending", "published", "archived"],
      default: "draft",
    },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User" },
    attachments: [
      {
        url: { type: String, trim: true },
        public_id: { type: String, trim: true },
        description: { type: String, trim: true },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("Guideline", guidelineSchema);

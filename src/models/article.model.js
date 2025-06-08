import mongoose from "mongoose";
const { Schema } = mongoose;

const articleSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, unique: true, trim: true },
    summary: { type: String, trim: true }, // Tóm tắt bài viết
    content: { type: String, required: true }, // Nội dung chi tiết (markdown/html)
    disease: [{ type: Schema.Types.ObjectId, ref: "Disease" }],
    specialty: [{ type: Schema.Types.ObjectId, ref: "Specialty" }],
    tags: [{ type: Schema.Types.ObjectId, ref: "Tag" }],
    references: [{ type: Schema.Types.ObjectId, ref: "Reference" }],
    author: { type: Schema.Types.ObjectId, ref: "User" },
    status: {
      type: String,
      enum: ["draft", "pending", "published", "archived"],
      default: "draft",
    },
    publishedAt: { type: Date },
    updatedAt: { type: Date },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User" },
    images: [
      {
        url: { type: String, trim: true },
        public_id: { type: String, trim: true },
        description: { type: String, trim: true },
      },
    ],
    attachments: [
      {
        url: { type: String, trim: true },
        public_id: { type: String, trim: true },
        description: { type: String, trim: true },
      },
    ],
    views: { type: Number, default: 0 },
    isFeatured: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model("Article", articleSchema);

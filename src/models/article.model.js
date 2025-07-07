import mongoose from "mongoose";
const { Schema } = mongoose;

const articleSchema = new Schema(
  {
    author: { type: Schema.Types.ObjectId, ref: "User" },
    title: { type: String, required: true, trim: true },
    slug: { type: String, unique: true, trim: true },
    thumbnail: {
      url: { type: String, trim: true, default: "" },
      public_id: { type: String, trim: true, default: "" },
    },
    summary: { type: String, trim: true },
    topics: [
      {
        type: Schema.Types.ObjectId,
        ref: "Topic",
      },
    ],
    sections: [
      {
        heading: { type: String, trim: true, required: true },
        content: { type: String, trim: true, required: true },
        image: {
          url: { type: String, trim: true, default: "" },
          public_id: { type: String, trim: true, default: "" },
          description: { type: String, trim: true, default: "" },
        },
      },
    ],
    publishedAt: { type: Date },
    reviewingBy: { type: Schema.Types.ObjectId, ref: "User" },
    publishedBy: { type: Schema.Types.ObjectId, ref: "User" },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User" },
    views: { type: Number, default: 0 },
    isFeatured: { type: Boolean, default: false },
    references: {
      type: [String],
    },
    status: {
      type: String,
      enum: ["draft", "pending", "published", "archived"],
      default: "draft",
    },
  },
  { timestamps: true }
);

articleSchema.index({
  name: "text",
  slug: "text",
  summary: "text",
});

const Article = mongoose.model("Article", articleSchema);
export default Article;

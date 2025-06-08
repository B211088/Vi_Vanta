import mongoose from "mongoose";
const { Schema } = mongoose;

const qnaSchema = new Schema(
  {
    question: { type: String, required: true, trim: true },
    answer: { type: String, trim: true },
    disease: [{ type: Schema.Types.ObjectId, ref: "Disease" }],
    relatedEntities: [{ type: String, trim: true }], // Có thể là triệu chứng, thuốc, guideline, v.v.
    references: [{ type: Schema.Types.ObjectId, ref: "Reference" }],
    tags: [{ type: Schema.Types.ObjectId, ref: "Tag" }],
    status: {
      type: String,
      enum: ["pending", "answered", "reviewed", "archived"],
      default: "pending",
    },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
    answeredBy: { type: Schema.Types.ObjectId, ref: "User" },
    createdAt: { type: Date, default: Date.now },
    answeredAt: { type: Date },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User" },
    attachments: [
      {
        url: { type: String, trim: true },
        public_id: { type: String, trim: true },
        description: { type: String, trim: true },
      },
    ],
    votes: { type: Number, default: 0 },
    views: { type: Number, default: 0 },
    isFeatured: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model("QnA", qnaSchema);

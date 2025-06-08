import mongoose from "mongoose";
const { Schema } = mongoose;

const referenceSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    authors: [{ type: String, trim: true }],
    source: { type: String, trim: true }, // Tên tạp chí, sách, website...
    url: { type: String, trim: true },
    publicationDate: { type: Date },
    doi: { type: String, trim: true }, // Digital Object Identifier
    pmid: { type: String, trim: true }, // PubMed ID
    type: {
      type: String,
      enum: ["journal", "book", "website", "guideline", "report", "other"],
      default: "journal",
    },
    description: { type: String, trim: true },
    tags: [{ type: Schema.Types.ObjectId, ref: "Tag" }],
    status: {
      type: String,
      enum: ["active", "inactive", "draft"],
      default: "active",
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

export default mongoose.model("Reference", referenceSchema);

import mongoose from "mongoose";
const { Schema } = mongoose;

const referenceSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    authors: [{ type: String, trim: true }],
    source: { type: String, trim: true },
    url: { type: String, trim: true },
    publicationDate: { type: Date },
    type: {
      type: String,
      enum: ["journal", "book", "website", "guideline", "report", "other"],
      default: "journal",
    },
    description: { type: String, trim: true },
    status: {
      type: String,
      enum: ["active", "inactive", "draft"],
      default: "active",
    },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User" },
    attachments: [
      {
        attachment: { type: Schema.Types.ObjectId, ref: "Attachment" },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("Reference", referenceSchema);

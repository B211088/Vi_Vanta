import mongoose from "mongoose";
const { Schema } = mongoose;

const attachmentSchema = new Schema(
  {
    filename: { type: String, required: true, trim: true },
    url: { type: String, required: true, trim: true },
    public_id: { type: String, trim: true },
    type: { type: String, trim: true }, // Loại file: pdf, image, video, doc, ...
    size: { type: Number }, // Kích thước file (bytes)
    description: { type: String, trim: true },
    uploadedBy: { type: Schema.Types.ObjectId, ref: "User" },
    status: {
      type: String,
      enum: ["active", "inactive", "archived"],
      default: "active",
    },
    relatedEntities: [
      {
        entityType: { type: String, trim: true }, // Ví dụ: Disease, Guideline, Protocol, ...
        entityId: { type: Schema.Types.ObjectId },
      },
    ],
    uploadedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.model("Attachment", attachmentSchema);

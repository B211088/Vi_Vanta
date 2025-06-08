import mongoose from "mongoose";
const { Schema } = mongoose;

const tagSchema = new Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    slug: { type: String, unique: true, trim: true },
    description: { type: String, trim: true },
    color: { type: String, trim: true, default: "#2196f3" }, // Mã màu hiển thị tag
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

export default mongoose.model("Tag", tagSchema);

import mongoose from "mongoose";
const { Schema } = mongoose;

const aiModelSchema = new Schema(
  {
    name: { type: String, required: true },
    provider: { type: String, required: true },
    isActive: { type: Boolean, default: true },
    type: {
      type: String,
      enum: ["embedding", "retrival"],
      default: "retrival",
    },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

const AIModel = mongoose.model("AIModel", aiModelSchema);

export default AIModel;

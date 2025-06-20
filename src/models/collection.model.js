import mongoose from "mongoose";
const { Schema } = mongoose;

const collectionSchema = new Schema(
  {
    name: { type: String, required: true }, // Tên folde
    description: { type: String },
    owner: { type: Schema.Types.ObjectId, ref: "User" },
    embeddingTemplate: { type: Schema.Types.ObjectId, ref: "AIModel" },
    vectorDatabase: { type: String, default: "ChromaDB" },
    metadata: {
      type: Object,
    },
    status: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const Collection = mongoose.model("Collection", collectionSchema);
export default Collection;

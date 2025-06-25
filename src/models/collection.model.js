import mongoose from "mongoose";
const { Schema } = mongoose;

const collectionSchema = new Schema(
  {
    name: { type: String, required: true },
    collectionId: { type: String },
    description: { type: String },
    owner: { type: Schema.Types.ObjectId, ref: "User" },
    embeddingTemplate: { type: Schema.Types.ObjectId, ref: "AIModel" },
    vectorDatabase: { type: String, default: "ChromaDB" },
    metadata: {
      type: Object,
    },
    chunkLimit: { type: Number },
    status: { type: Boolean, default: true },
    prompt: { type: String },
    maxToken: { type: Number },
    temperature: { type: Number },
    similarityThreshold: { type: Number },
    isActive: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Collection = mongoose.model("Collection", collectionSchema);
export default Collection;

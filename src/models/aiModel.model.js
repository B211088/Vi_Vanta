import mongoose from "mongoose";
const { Schema } = mongoose;

const aiModelSchema = new Schema(
  {
    name: { type: String, required: true }, // Tên model (ví dụ: GPT-4, Llama-3)
    provider: { type: String, required: true }, // Nhà cung cấp (OpenAI, Meta, Google, v.v.)
    isActive: { type: Boolean, default: true }, // Đang sử dụng hay không
  },
  { timestamps: true }
);

const AIModel = mongoose.model("AIModel", aiModelSchema);

export default AIModel;

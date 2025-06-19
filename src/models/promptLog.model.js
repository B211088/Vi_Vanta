import mongoose from "mongoose";
const { Schema } = mongoose;

const promptLogSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    sessionId: { type: String, required: true, trim: true },
    question: { type: String, required: true, trim: true },
    answer: { type: String, required: true, trim: true },
    match_chunk: {
      type: Schema.Types.ObjectId,
      ref: "Chunk",
      required: true,
    },
    model: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

const PromptLog = mongoose.model("PromptLog", promptLogSchema);

export default PromptLog;

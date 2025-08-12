import mongoose from "mongoose";

const { Schema } = mongoose;

const voiceMessageSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    voiceUrl: {
      type: String,
      required: false,
    },
    role: {
      type: String,
      enum: ["user", "assistant", "system"],
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    responseText: {
      type: String,
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

const VoiceMessage = mongoose.model("VoiceMessage", voiceMessageSchema);

export default VoiceMessage;

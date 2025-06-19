import mongoose from "mongoose";
const { Schema } = mongoose;
import { messageSchema } from "./message.model.js";

const sectionSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    messages: [
      {
        type: Schema.Types.ObjectId,
        ref: "Message",
      },
    ],
    context: {
      documentIds: [
        {
          type: String,
          ref: "Document",
        },
      ],
      relevantChunks: [
        {
          content: String,
          metadata: {
            type: Map,
            of: mongoose.Schema.Types.Mixed,
          },
          relevance: Number,
        },
      ],
      additionalContext: {
        type: Map,
        of: mongoose.Schema.Types.Mixed,
      },
    },
    conversationContext: {
      summary: {
        type: String,
        default: "",
      },
      keyPoints: [
        {
          type: String,
        },
      ],
      lastContext: {
        type: String,
        default: "",
      },
      updatedAt: {
        type: Date,
        default: Date.now,
      },
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Tự động cập nhật title của section dựa trên tin nhắn đầu tiên nếu không được cung cấp
sectionSchema.pre("save", function (next) {
  if (!this.title && this.messages.length > 0) {
    // Lấy nội dung tin nhắn đầu tiên và giới hạn độ dài
    const firstMessage = this.messages[0].content;
    this.title =
      firstMessage.length > 50
        ? firstMessage.substring(0, 50) + "..."
        : firstMessage;
  }
  next();
});

// Index để tối ưu tìm kiếm
sectionSchema.index({ title: "text" });

const Section = mongoose.model("Section", sectionSchema);

export { sectionSchema };
export default Section;

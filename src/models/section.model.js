import mongoose from "mongoose";
const { Schema } = mongoose;

const sectionSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: false, // Allow anonymous users
    },
    sessionId: {
      type: String,
      required: true, // For anonymous users
      index: true,
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

// Auto-generate title from first message
sectionSchema.pre("save", function (next) {
  if (!this.title && this.messages.length > 0) {
    const firstMessage = this.messages[0].content;
    this.title =
      firstMessage.length > 50
        ? firstMessage.substring(0, 50) + "..."
        : firstMessage;
  }
  next();
});

// Indexes for performance
sectionSchema.index({ userId: 1, createdAt: -1 });
sectionSchema.index({ sessionId: 1, createdAt: -1 });
sectionSchema.index({ title: "text" });

const Section = mongoose.model("Section", sectionSchema);
export { sectionSchema };
export default Section;

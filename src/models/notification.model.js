import mongoose from "mongoose";
const { Schema } = mongoose;

const notificationSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: {
      type: String,
      enum: ["appointment", "payment", "reminder", "system"],
      default: "system",
    },
    isRead: { type: Boolean, default: false },
    relatedId: Schema.Types.ObjectId, // ID của appointment, payment, etc.
    relatedModel: String, // "Appointment", "Payment", etc.
  },
  { timestamps: true }
);
const Notification = mongoose.model("Notification", notificationSchema);
export default Notification;

import mongoose from "mongoose";
const { Schema } = mongoose;

const medicationReminderItemSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    medicationId: {
      type: Schema.Types.ObjectId,
      ref: "Medication",
      required: true,
    },
    dosageAmount: {
      type: Number,
      required: true,
      min: 0.1,
    },
    dosageUnit: {
      type: String,
      enum: ["viên", "gói", "ống", "ml", "thể tích"],
      required: true,
      trim: true,
    },
    note: {
      type: String,
      default: "",
      trim: true,
    },
    repeat: {
      type: String,
      enum: ["daily", "day_of_weekly", "specific_date"],
      default: "daily",
    },
    daysOfWeek: [
      {
        type: Number,
        min: 0,
        max: 6,
      },
    ],
    intervalDays: {
      type: Number,
      min: 1,
    },
    startDate: {
      type: Date,
    },
    remindAt: [
      {
        time: { type: String, required: true },
        quantity: { type: Number, required: true },
      },
    ],
    status: {
      type: String,
      enum: ["pending", "completed", "skipped"],
      default: "pending",
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

const MedicationReminderItem = mongoose.model(
  "MedicationReminderItem",
  medicationReminderItemSchema
);
export default MedicationReminderItem;

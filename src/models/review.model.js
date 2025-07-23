import mongoose from "mongoose";
const { Schema } = mongoose;

const reviewSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    doctorId: {
      type: Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
    },
    appointmentId: {
      type: Schema.Types.ObjectId,
      ref: "Appointment",
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      maxlength: 1000,
    },
    aspects: {
      professionalism: { type: Number, min: 1, max: 5 },
      communication: { type: Number, min: 1, max: 5 },
      facilities: { type: Number, min: 1, max: 5 },
      waitTime: { type: Number, min: 1, max: 5 },
    },
    isVerified: { type: Boolean, default: false }, // Đánh giá từ appointment thực
    isPublic: { type: Boolean, default: true },
    response: {
      // Phản hồi từ bác sĩ
      content: String,
      respondedAt: Date,
    },
    helpfulCount: { type: Number, default: 0 },
    reportCount: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["active", "hidden", "reported"],
      default: "active",
    },
  },
  { timestamps: true }
);

// Index
reviewSchema.index({ doctorId: 1, createdAt: -1 });
reviewSchema.index({ userId: 1, doctorId: 1 }, { unique: true }); // Một user chỉ review một lần

export const Review = mongoose.model("Review", reviewSchema);

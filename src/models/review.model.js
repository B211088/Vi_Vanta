import mongoose from "mongoose";
const { Schema } = mongoose;

const reviewSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true }, // Người đánh giá
    clinicId: { type: Schema.Types.ObjectId, ref: "Clinic", required: true }, // Phòng khám được đánh giá
    staffId: { type: Schema.Types.ObjectId, ref: "ClinicStaff" }, // Bác sĩ/nhân viên (nếu đánh giá cá nhân)
    appointmentId: { type: Schema.Types.ObjectId, ref: "Appointment" }, // Lịch khám liên quan
    rating: { type: Number, min: 1, max: 5, required: true },
    comment: { type: String },
    images: [
      {
        url: String,
        public_id: String,
      },
    ],
    isVisible: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const Review = mongoose.model("Review", reviewSchema);
export default Review;

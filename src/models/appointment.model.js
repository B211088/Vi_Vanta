// models/appointment.model.js
import mongoose from "mongoose";
const { Schema } = mongoose;

const appointmentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    timeSlots: {
      startTime: { type: String, required: true },
      endTime: { type: String, required: true },
    },
    services: [{ type: Schema.Types.ObjectId, ref: "BookingService" }],
    patientInfo: {
      fullName: {
        type: String,
        required: true,
      },
      phone: {
        type: String,
        required: true,
      },
      email: {
        type: String,
        required: true,
      },
      gender: {
        type: String,
        enum: ["male", "female"],
        required: true,
      },
      dateOfBirth: {
        type: Date,
        required: true,
      },
      address: String,

      patientType: {
        type: String,
        enum: ["benhNhanMoi", "benhNhanCu"],
        default: "benhNhanMoi",
      },
      zalo: String,
      isOtherUser: {
        type: Boolean,
        default: false,
      },
    },
    totalFee: {
      type: Number,
      required: true,
    },
    paymentMethod: {
      type: String,
      enum: ["cash", "vnpay", "momo", "banking"],
      default: "cash",
    },
    paymentStatus: {
      type: String,
      enum: ["unpaid", "pending", "paid", "refunded"],
      default: "unpaid",
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "in-progress", "completed", "canceled"],
      default: "pending",
    },
    paymentExpireAt: { type: Date, require: true },
    note: { type: String },
    cancelReason: String,
    completedAt: Date,
    canceledAt: Date,
    confirmedAt: Date,
  },
  {
    timestamps: true,
  }
);

// Indexes for better performance
appointmentSchema.index({ doctorId: 1, date: 1, time: 1 });
appointmentSchema.index({ userId: 1, date: -1 });
appointmentSchema.index({ status: 1 });
appointmentSchema.index({ paymentStatus: 1 });

// Virtual for appointment datetime
appointmentSchema.virtual("appointmentDateTime").get(function () {
  const [hours, minutes] = this.time.split(":");
  const datetime = new Date(this.date);
  datetime.setHours(parseInt(hours), parseInt(minutes));
  return datetime;
});

// Pre-save middleware
appointmentSchema.pre("save", function (next) {
  if (this.status === "confirmed" && !this.confirmedAt) {
    this.confirmedAt = new Date();
  }
  next();
});

// Static methods
appointmentSchema.statics.getUpcomingAppointments = function (
  doctorId,
  limit = 10
) {
  const now = new Date();
  return this.find({
    doctorId,
    date: { $gte: now },
    status: { $in: ["pending", "confirmed"] },
  })
    .populate("userId", "fullName phone email")
    .sort({ date: 1, time: 1 })
    .limit(limit);
};

appointmentSchema.statics.getTodayAppointments = function (doctorId) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  return this.find({
    doctorId,
    date: {
      $gte: today,
      $lt: tomorrow,
    },
  })
    .populate("userId", "fullName phone email")
    .sort({ time: 1 });
};

// Instance methods
appointmentSchema.methods.canBeCanceled = function () {
  if (this.status === "completed" || this.status === "canceled") {
    return false;
  }

  const appointmentDateTime = new Date(this.date);
  const [hours, minutes] = this.time.split(":");
  appointmentDateTime.setHours(parseInt(hours), parseInt(minutes));

  const now = new Date();
  const timeDiff = appointmentDateTime.getTime() - now.getTime();
  const hoursDiff = timeDiff / (1000 * 3600);

  return hoursDiff >= 2; // Có thể hủy nếu còn ít nhất 2 giờ
};

appointmentSchema.methods.getTimeUntilAppointment = function () {
  const appointmentDateTime = new Date(this.date);
  const [hours, minutes] = this.time.split(":");
  appointmentDateTime.setHours(parseInt(hours), parseInt(minutes));

  const now = new Date();
  const timeDiff = appointmentDateTime.getTime() - now.getTime();

  if (timeDiff <= 0) return "Đã qua";

  const days = Math.floor(timeDiff / (1000 * 3600 * 24));
  const hours_remaining = Math.floor(
    (timeDiff % (1000 * 3600 * 24)) / (1000 * 3600)
  );
  const minutes_remaining = Math.floor(
    (timeDiff % (1000 * 3600)) / (1000 * 60)
  );

  if (days > 0) return `${days} ngày ${hours_remaining} giờ`;
  if (hours_remaining > 0)
    return `${hours_remaining} giờ ${minutes_remaining} phút`;
  return `${minutes_remaining} phút`;
};

const Appointment = mongoose.model("Appointment", appointmentSchema);
export default Appointment;

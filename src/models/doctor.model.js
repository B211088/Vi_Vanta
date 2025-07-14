import mongoose, { Types } from "mongoose";

const { Schema } = mongoose;

const doctorSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: { type: String, required: true, trim: true },
    specialty: [{ type: String, trim: true, required: true }],
    targetPatients: [{ type: String }],
    highlights: { type: String },
    info: { type: String },
    strengths: [{ type: String }],
    experiences: [{ type: String }],
    educations: [{ type: String }],
    languages: [{ type: String }],
    paymentMethods: {
      type: [String],
      enum: ["cash", "transfer"],
      default: "cash",
    },
    services: [
      {
        name: { type: String },
        description: { type: String },
        price: { type: String },
      },
    ],
    wallet: { type: Number, default: 0 },
    workingHours: [
      {
        type: Schema.Types.ObjectId,
        ref: "workingHour",
      },
    ],
    infoClinic: {
      clinicName: { type: String, required: true },
      address: { type: String, required: true },
      phone: { type: String, required: true, match: /^[0-9]{9,11}$/ },
    },
    status: {
      type: String,
      enum: ["pending", "active", "rejected"],
      default: "pending",
    },
    rate: { type: Number, default: 5 },
  },
  { timestamps: true }
);

const Doctor = mongoose.model("Doctor", doctorSchema);
export default Doctor;

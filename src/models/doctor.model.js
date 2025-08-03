import mongoose, { Types } from "mongoose";
import {
  PUBLIC_ID_AVATAR_DEFAULT,
  URL_AVATAR_DEFAULT,
} from "../config/auth.config.js";

const { Schema } = mongoose;

const doctorSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: { type: String, trim: true },
    name: { type: String, required: true, trim: true },
    avatar: {
      url: {
        type: String,
        default: URL_AVATAR_DEFAULT,
      },
      public_id: {
        type: String,
        default: PUBLIC_ID_AVATAR_DEFAULT,
      },
    },
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
      { type: Schema.Types.ObjectId, ref: "BookingService", required: true },
    ],
    wallet: { type: Number, default: 0 },
    infoClinic: {
      clinicName: { type: String, required: true },
      address: {
        wardId: {
          type: Schema.Types.ObjectId,
          ref: "Ward",
          required: true,
        },
        districtId: {
          type: Schema.Types.ObjectId,
          ref: "District",
          required: true,
        },
        provinceId: {
          type: Schema.Types.ObjectId,
          ref: "Province",
          required: true,
        },
        specificAddress: {
          type: String,
          required: true,
        },
      },
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

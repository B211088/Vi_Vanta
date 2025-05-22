import mongoose from "mongoose";
import {
  PUBLIC_ID_AVATAR_DEFAULT,
  URL_AVATAR_DEFAULT,
} from "../config/auth.config.js";
const { Schema } = mongoose;

const clinicSchema = new Schema(
  {
    ownerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true },
    description: String,
    address: {
      wardId: { type: Schema.Types.ObjectId, ref: "Ward", required: true },
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
      specialAddress: { type: String }, // Số nhà, tên đường, tòa nhà, v.v.
    },
    location: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number], default: [0, 0] }, // [longitude, latitude]
    },
    phoneNumber: String,
    email: String,
    workingHours: {
      day: {
        type: String,
        enum: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      },
      open: String,
      close: String,
    },
    specialties: [{ type: String }],
    services: [{ type: String }],
    licenses: [
      {
        name: String,
        url: String,
        public_id: String,
      },
    ],
    isVerified: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ["active", "rejected", "pending"],
      default: "pending",
    },
    averageRating: { type: Number, default: 0 },
    branchCount: { type: Number, default: 1 },
    avatar: {
      url: { type: String, default: URL_AVATAR_DEFAULT },
      public_id: { type: String, default: PUBLIC_ID_AVATAR_DEFAULT },
    },
    images: [
      {
        url: String,
        public_id: String,
      },
    ],
  },
  { timestamps: true }
);

clinicSchema.index({ location: "2dsphere" });

const Clinic = mongoose.model("Clinic", clinicSchema);
export default Clinic;

import mongoose from "mongoose";
const { Schema } = mongoose;

const clinicStaffSchema = new Schema(
  {
    clinicId: { type: Schema.Types.ObjectId, ref: "Clinic", required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    role: {
      type: String,
      enum: ["staff", "manager", "admin", "owner"],
      default: "staff",
      required: true,
    },
    isActive: { type: Boolean, default: true },
    deleted: { type: Boolean, default: false },
    joinedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const ClinicStaff = mongoose.model("ClinicStaff", clinicStaffSchema);
export default ClinicStaff;

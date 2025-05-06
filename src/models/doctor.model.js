import mongoose from "mongoose";

const { Schema } = mongoose;

const doctorSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    specialty: {
      type: String,
      trim: true,
    },
    hospital: {
      type: String,
      trim: true,
    },
    licenseNumber: {
      type: String,
      unique: true,
      required: true,
    },
    education: {
      type: String,
    },
    experienceYears: {
      type: Number,
      min: 0,
    },
  },
  { timestamps: true }
);

const Doctor = mongoose.model("Doctor", doctorSchema);
export default Doctor;

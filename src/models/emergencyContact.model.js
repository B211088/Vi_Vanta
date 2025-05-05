import mongoose from "mongoose";
const { Schema } = mongoose;

const emergencyContactSchema = Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      require: true,
    },
    emergencyContactName: {
      type: String,
    },
    emergencyContactPhone: {
      type: String,
    },
  },
  { timestamps: true }
);

const EmergencyContact = mongoose.model(
  "EmergencyContact",
  emergencyContactSchema
);
export default EmergencyContact;

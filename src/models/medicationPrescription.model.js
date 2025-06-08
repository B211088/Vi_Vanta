import mongoose from "mongoose";
const { Schema } = mongoose;

const medicationPrescriptionSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    medicationReminderItem: [
      {
        type: Schema.Types.ObjectId,
        ref: "MedicationReminderItem",
      },
    ],
    name: { type: String, required: true, trim: true },
    hospitalName: { type: String, trim: true },
    doctorName: { type: String, trim: true },
    appointmentDate: { type: Date },
    followUpDate: { type: Date },
    note: { type: String, default: "", trim: true },
  },
  { timestamps: true }
);

const MedicationPrescription = mongoose.model(
  "medicationPrescription",
  medicationPrescriptionSchema
);
export default MedicationPrescription;

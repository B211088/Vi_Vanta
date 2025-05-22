import mongoose from "mongoose";
const { Schema } = mongoose;

const medicationSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    scientificName: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: "MedicationCategory",
      required: true,
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
    benefits: {
      type: String,
      default: "",
      trim: true,
    },
    contraindications: {
      type: String,
      default: "",
      trim: true,
    },
    dosage: {
      type: String,
      required: true,
      trim: true,
    },
    sideEffects: {
      type: [String],
      default: [],
      trim: true,
    },
    manufacturer: {
      type: String,
      default: "",
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    thumbnail: {
      url: {
        type: String,
        required: true,
      },
      public_id: {
        type: String,
        required: true,
      },
    },
    images: [
      {
        url: {
          type: String,
          required: true,
        },
        public_id: {
          type: String,
          required: true,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

medicationSchema.index({ name: "text", scientificName: "text" });
const Medication = mongoose.model("Medication", medicationSchema);

export default Medication;

import mongoose from "mongoose";
const { Schema } = mongoose;

const symptomSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    description: {
      type: String,
      default: "",
    },
    content: {
      type: String,
      default: "",
    },
    isActive: {
      type: Boolean,
      default: true,
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

const Symptom = mongoose.model("Symptom", symptomSchema);

export default Symptom;

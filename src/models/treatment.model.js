import mongoose from "mongoose";
const { Schema } = mongoose;

const treatmentSchema = new Schema(
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
    medications: [
      {
        type: Schema.Types.ObjectId,
        ref: "Medication",
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Treatment = mongoose.model("Treatment", treatmentSchema);

export default Treatment;

import mongoose from "mongoose";

const confirmationCodeSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
    },
    code: {
      type: String,
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true }
);

const ConfirmationCode = mongoose.model(
  "ConfirmationCode",
  confirmationCodeSchema
);
export default ConfirmationCode;

import mongoose from "mongoose";
const { Schema } = mongoose;

const causeSchema = new Schema(
  {
    name: {
      type: String,
      required: true, // Tên nguyên nhân
      unique: true, // Đảm bảo tên nguyên nhân là duy nhất
    },
    description: {
      type: String, // Mô tả nguyên nhân
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
  },
  {
    timestamps: true,
  }
);

const Cause = mongoose.model("Cause", causeSchema);

export default Cause;

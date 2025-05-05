import mongoose from "mongoose";
const { Schema } = mongoose;

const provinceSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
    },
  },
  { timestamps: true }
);

const Province = mongoose.model("Province", provinceSchema);
export default Province;

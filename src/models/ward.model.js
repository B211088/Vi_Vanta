import mongoose from "mongoose";
const { Schema } = mongoose;
const wardSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    districtId: {
      type: Schema.Types.ObjectId,
      ref: "District",
      required: true,
    },
  },
  { timestamps: true }
);

const Ward = mongoose.model("Ward", wardSchema);
export default Ward;

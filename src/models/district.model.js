import mongoose from "mongoose";
const { Schema } = mongoose;
const districtSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    provinceId: {
      type: Schema.Types.ObjectId,
      ref: "Province", // Tham chiếu tới Province
      required: true,
    },
  },
  { timestamps: true }
);

const District = mongoose.model("District", districtSchema);
export default District;

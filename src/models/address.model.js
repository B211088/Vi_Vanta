import mongoose from "mongoose";
const { Schema } = mongoose;
const addressSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    wardId: {
      type: Schema.Types.ObjectId,
      ref: "Ward",
      required: true,
    },
    districtId: {
      type: Schema.Types.ObjectId,
      ref: "District",
      required: true,
    },
    provinceId: {
      type: Schema.Types.ObjectId,
      ref: "Province",
      required: true,
    },
    specificAddress: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const Address = mongoose.model("Address", addressSchema);
export default Address;

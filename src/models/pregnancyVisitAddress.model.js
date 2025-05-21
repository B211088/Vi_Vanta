import mongoose from "mongoose";
const { Schema } = mongoose;

const pregnancyVisitAddressSchema = new Schema(
  {
    pregnancyVisitId: {
      type: Schema.Types.ObjectId,
      ref: "PregnancyVisit",
      required: true,
    },
    clinicName: {
      type: String,
      default: "",
    },
    phoneNumber: {
      type: String,
      default: "",
    },
    wardId: {
      type: Schema.Types.ObjectId,
      ref: "Ward",
      default: null,
    },
    districtId: {
      type: Schema.Types.ObjectId,
      ref: "District",
      default: null,
    },
    provinceId: {
      type: Schema.Types.ObjectId,
      ref: "Province",
      default: null,
    },
    specificAddress: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

const PregnancVisitAddress = mongoose.model(
  "PregnancVisitAddress",
  pregnancyVisitAddressSchema
);

export default PregnancVisitAddress;

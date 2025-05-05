import mongoose from "mongoose";
const { Schema } = mongoose;

const informationSocietySchema = Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      require: true,
    },
    documentName: {
      type: String,
    },
    pictureDocuments: {
      type: [String],
      default: [],
    },
    notes: {
      type: String,
    },
  },
  { timestamps: true }
);

const InformationSociety = mongoose.model(
  "InformationSociety",
  informationSocietySchema
);
export default InformationSociety;

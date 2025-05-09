import mongoose from "mongoose";
const { Schema } = mongoose;

const pregnancyVisitSchema = new Schema(
  {
    pregnancyId: {
      type: Schema.Types.ObjectId,
      ref: "Pregnancy",
      required: true,
    },
    visitTypeId: {
      type: Schema.Types.ObjectId,
      ref: "VisitType",
      required: true,
    },
    title: String,
    date: { type: Date, required: true },
    result: String,
    note: String,
    imageUrls: [String],
    status: {
      type: String,
      enum: ["scheduled", "completed", "canceled"],
      default: "scheduled",
    },
  },
  { timestamps: true }
);

const PregnancyVisit = mongoose.model("PregnancyVisit", pregnancyVisitSchema);

export default PregnancyVisit;

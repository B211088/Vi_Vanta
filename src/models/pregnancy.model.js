import mongoose from "mongoose";

const { Schema } = mongoose;

const pregnancySchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    weightBeforePregnant: {
      type: Number,
      min: 20,
      max: 500,
    },
    dueDate: {
      type: Date,
    },
    conceptionDate: {
      type: Date,
    },
    lastMenstrualCyclesDate: {
      type: Date,
    },
    menstrualCycleLength: {
      type: Number,
      min: 20,
      max: 30,
    },
    transferDate: {
      type: Date,
    },
    embryoDay: {
      type: Number,
      enum: [3, 5],
    },
  },
  {
    timestamps: true,
  }
);

const Pregnancy = mongoose.model("Pregnancy", pregnancySchema);
export default Pregnancy;

pregnancySchema.pre("findOneAndDelete", async function (next) {
  const pregnancyId = this.getQuery()._id; // Lấy ID của thai kỳ bị xóa
  try {
    await mongoose.model("PregnancyVisit").deleteMany({ pregnancyId });
    next();
  } catch (error) {
    next(error);
  }
});

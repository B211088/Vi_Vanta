import mongoose from "mongoose";
const { Schema } = mongoose;

const childrenSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    gender: {
      type: String,
      enum: ["male", "female", "other"],
      required: true,
    },
    birthDate: {
      type: Date,
      required: true,
    },
    height: {
      type: Number,
    },
    weight: {
      type: Number,
    },
    bloodType: {
      type: String,
      enum: ["A", "B", "AB", "O", "unknown"],
      default: "unknown",
    },
    deliveryMethod: {
      type: String,
      enum: ["vaginal", "cesarean", "unknown"],
      default: "unknown",
    },
    notes: {
      type: String,
    },
  },
  { timestamps: true }
);

// Middleware để xóa các bản ghi liên quan trong ChildVaccinationRecord
childrenSchema.pre("findOneAndDelete", async function (next) {
  const childId = this.getQuery()._id; // Lấy ID của đứa trẻ bị xóa
  try {
    await mongoose.model("ChildVaccinationRecord").deleteMany({ childId });
    next();
  } catch (error) {
    next(error);
  }
});

const Children = mongoose.model("Children", childrenSchema);
export default Children;

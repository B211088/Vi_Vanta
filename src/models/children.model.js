import mongoose from "mongoose";
const { Schema } = mongoose;

const childrenSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    gender: {
      type: String,
      enum: ["male", "female", "other"],
      required: true,
    },
    dateOfBirth: {
      type: Date,
      required: true,
    },
    birthWeight: {
      type: Number,
    },
    birthHeight: {
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

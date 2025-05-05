import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
    },
    gender: {
      type: String,
      enum: ["male", "female", "other"],
      default: "other",
    },
    dateOfBirth: {
      type: Date,
    },
    avatarUrl: {
      type: String,
      default: "user.png",
    },
    roles: {
      type: [String],
      enum: ["user", "admin", "doctor"],
      default: ["user"],
    },
    userType: {
      type: String,
      enum: ["normal", "doctor", "pharmacist", "pregnant"],
      default: "normal",
    },
    active: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("passwordHash")) return next();
  this.passwordHash = await bcrypt.hash(this.passwordHash, 10);
  next();
});
userSchema.methods.isValidPassword = async function (password) {
  return await bcrypt.compare(password, this.passwordHash);
};
userSchema.set("toJSON", {
  transform: (doc, ret, options) => {
    delete ret.passwordHash;
    return ret;
  },
});

const User = mongoose.model("User", userSchema);
export default User;

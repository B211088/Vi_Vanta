import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import {
  PUBLIC_ID_AVATAR_DEFAULT,
  URL_AVATAR_DEFAULT,
} from "../config/auth.config.js";
import AutoIncrementFactory from "mongoose-sequence";

const AutoIncrement = AutoIncrementFactory(mongoose);
const userSchema = new mongoose.Schema(
  {
    ID: { type: Number, unique: true },
    fullName: {
      type: String,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      validate: {
        validator: function (v) {
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
        },
        message: (props) => `${props.value} không phải là một email hợp lệ!`,
      },
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
    avatar: {
      url: {
        type: String,
        default: URL_AVATAR_DEFAULT,
      },
      public_id: {
        type: String,
        default: PUBLIC_ID_AVATAR_DEFAULT,
      },
    },
    roles: {
      type: [String],
      enum: ["user", "admin", "doctor", "clinic"],
      default: ["user"],
    },
    userType: {
      type: String,
      enum: ["normal", "pharmacist", "pregnant"],
      default: "normal",
    },
    active: {
      type: Boolean,
      default: false,
    },
    citizenId: {
      type: String,
      unique: true,
      sparse: true,
    },
    citizenIdFrontImage: [
      {
        public_id: {
          type: String,
        },
        url: {
          type: String,
        },
      },
    ],
    citizenIdBackImage: [
      {
        public_id: {
          type: String,
        },
        url: {
          type: String,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

userSchema.plugin(AutoIncrement, { inc_field: "ID" });

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

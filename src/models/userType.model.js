import mongoose from "mongoose";

const { Schema } = mongoose;

const userTypeSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
});

const UserType = mongoose.model("UserType", userTypeSchema);

export default UserType;

import mongoose from "mongoose";
const { Schema } = mongoose;

const concernSchema = new Schema({
  name: {
    type: String,
  },
  description: {
    type: String,
  },
});
const Concern = mongoose.model("Concern", concernSchema);

export default Concern;

import mongoose from "mongoose";

const authoritySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  city: {          
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  authorityCode: { type: String, required: true }
}, { timestamps: true });

export default mongoose.model("Authority", authoritySchema);

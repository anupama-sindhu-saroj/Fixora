import mongoose from "mongoose";

const solutionSchema = new mongoose.Schema({
  issueId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Issue",
    required: true,
  },
  summary: {
    type: String,
    required: true,
  },
  department: {
    type: String,
    required: true,
  },
  resolvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Authority", // or "User" if authority model not separate
    required: true,
  },
  imageUrl: {
    type: String,
  },
  resolvedAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("Solution", solutionSchema);

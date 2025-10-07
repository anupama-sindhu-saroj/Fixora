import mongoose from "mongoose";

const issueSchema = new mongoose.Schema({
  issueType: { type: String, required: true },
  description: { type: String, required: true },
  location: { type: String, required: true },
  imageUrls: [String],
  status: { type: String, default: "Pending" },
  reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Citizen", required: true },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.Issue || mongoose.model("Issue", issueSchema);

import mongoose from "mongoose";

const issueLocationSchema = new mongoose.Schema({
  issueId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Issue",
    required: true,
  },
  latitude: Number,
  longitude: Number,
});

export default mongoose.model("IssueLocation", issueLocationSchema);

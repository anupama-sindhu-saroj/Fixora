import mongoose from "mongoose";

const citizenprofileSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: String,
  location: String,
  profilePic: { type: String, default: "https://placehold.co/128x128/EBF4FF/3B82F6?text=User" },
  civicPoints: { type: Number, default: 0 },
  rank: { type: Number, default: 0 },
  verified: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});


export default mongoose.models.citizenprofile || mongoose.model("citizenprofile", citizenprofileSchema);

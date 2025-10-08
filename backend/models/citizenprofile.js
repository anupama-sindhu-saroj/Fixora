import mongoose from "mongoose";

const citizenProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Citizen", // ✅ Links to Citizen collection
      required: true,
      unique: true, // each user should have exactly one profile
    },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String },
    location: { type: String },
    profilePic: {
      type: String,
      default: "https://placehold.co/128x128/EBF4FF/3B82F6?text=User",
    },
    civicPoints: { type: Number, default: 0 },
    rank: { type: Number, default: 0 },
    verified: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// ✅ Export safely for both dev and production environments
export default mongoose.models.CitizenProfile ||
  mongoose.model("CitizenProfile", citizenProfileSchema);

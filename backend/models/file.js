import mongoose from "mongoose";

const FileSchema = new mongoose.Schema({
  type: { type: String, default: "other" }, // logo, photo, banner, etc.
  url: { type: String, required: true },     // Cloudinary URL
  userId: { type: String },                  // optional, if you want to track who uploaded
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("File", FileSchema);

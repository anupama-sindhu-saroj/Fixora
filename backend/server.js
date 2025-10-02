import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.js"; 
import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();

const app = express();

// Enable CORS for all origins — must be BEFORE routes
app.use(cors({
    origin:"*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true
}));
// Body parser
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);

// Test route to check backend status
app.get("/", (req, res) => {
    res.send("Fixora backend is running!");
});

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI).then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.error("❌ MongoDB connection error:", err));
  
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

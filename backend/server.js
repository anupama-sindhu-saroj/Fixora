import uploadRoutes from "./routes/upload.js";
import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.js"; 
import authorityAuthRoutes from "./routes/authorityAuth.js";
<<<<<<< HEAD
import issueRoutes from "./routes/issueRoutes.js";
import uploadMultipleRoutes from "./routes/uploadMultiple.js";
=======
>>>>>>> 5458181e8fcf8a0eb83dc9c40187d6181a2daf10
import mongoose from "mongoose";

console.log("EMAIL_USER:", process.env.EMAIL_USER);
console.log("EMAIL_PASS:", process.env.EMAIL_PASS ? "✅ loaded" : "❌ missing");
const app = express();

const allowedOrigins = ["http://127.0.0.1:5500", "http://localhost:5500"];

app.use(cors({
    origin: function (origin, callback) {
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) === -1) {
            return callback(new Error("CORS not allowed"), false);
        }
        return callback(null, true);
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true
}));

app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/authority", authorityAuthRoutes);
app.use("/api/upload", uploadRoutes);
<<<<<<< HEAD
app.use("/api/issues", issueRoutes);
app.use("/api/uploadMultiple", uploadMultipleRoutes);
=======
>>>>>>> 5458181e8fcf8a0eb83dc9c40187d6181a2daf10
app.get("/", (req, res) => {
    res.send("Fixora backend is running!");
});
import fileRoutes from "./routes/fileRoutes.js";
app.use("/api/files", fileRoutes);

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("✅ MongoDB Connected"))
    .catch(err => console.error("❌ MongoDB connection error:", err));

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

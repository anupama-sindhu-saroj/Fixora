import { createServer } from "http";
import { Server } from "socket.io";
import uploadRoutes from "./routes/upload.js";
import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.js"; 
import authorityAuthRoutes from "./routes/authorityAuth.js";
import issueRoutes from "./routes/issueRoutes.js";
import uploadMultipleRoutes from "./routes/uploadMultiple.js";
import mongoose from "mongoose";
import analyticsRouter from "./routes/analytics.js";



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
    methods: ["GET", "POST", "PUT","PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true
}));

app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/authority", authorityAuthRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/issues", issueRoutes);
app.use("/api/uploadMultiple", uploadMultipleRoutes);
app.use("/api/analytics", analyticsRouter);

app.get("/", (req, res) => {
    res.send("Fixora backend is running!");
});
import fileRoutes from "./routes/fileRoutes.js";
app.use("/api/files", fileRoutes);

import authorityIssuesRoutes from "./routes/authorityIssues.js";
app.use("/api/authority/issues", authorityIssuesRoutes);

import solutionRoutes from "./routes/solutionRoutes.js";
app.use("/api/solutions", solutionRoutes);

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("✅ MongoDB Connected"))
    .catch(err => console.error("❌ MongoDB connection error:", err));
// HTTP + Socket.IO
const server = createServer(app);
const io = new Server(server, {
    cors: {
        origin: allowedOrigins,
        methods: ["GET", "POST"]
    }
});

io.on("connection", (socket) => {
    console.log("⚡ New client connected:", socket.id);

    socket.on("disconnect", () => {
        console.log("❌ Client disconnected:", socket.id);
    });
});

// Make io accessible in routes
app.set("io", io);
const PORT = process.env.PORT || 5001;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

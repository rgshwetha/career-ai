import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import aiRoutes from "./routes/ai.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Debug logs
console.log("🚀 Server starting...");

app.use("/api/ai", aiRoutes);

app.get("/", (req, res) => {
  res.send("Backend running 🚀");
});

// 🔥 Keep server alive + catch crashes
process.on("uncaughtException", (err) => {
  console.error("UNCAUGHT ERROR:", err);
});

process.on("unhandledRejection", (err) => {
  console.error("UNHANDLED PROMISE:", err);
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
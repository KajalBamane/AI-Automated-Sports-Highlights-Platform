/**
 * AI Football Highlights Platform - Backend Server
 */

const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
require("dotenv").config();

// Import routes
const uploadRoutes = require("./routes/uploadRoutes");
const detectRoutes = require("./routes/detectRoutes");
const exportRoutes = require("./routes/exportRoutes");

const app = express();
const PORT = process.env.PORT || 10000; // ✅ Render uses 10000

// Middleware
app.use(cors());
app.use(express.json());

// Create folders if they don't exist
const uploadFolder = path.join(
  __dirname,
  process.env.UPLOAD_FOLDER || "uploads"
);
const outputFolder = path.join(
  __dirname,
  process.env.OUTPUT_FOLDER || "outputs"
);

if (!fs.existsSync(uploadFolder)) {
  fs.mkdirSync(uploadFolder, { recursive: true });
}

if (!fs.existsSync(outputFolder)) {
  fs.mkdirSync(outputFolder, { recursive: true });
}

// Serve static files
app.use("/uploads", express.static(uploadFolder));
app.use("/outputs", express.static(outputFolder));

// API Routes
app.use("/api/upload", uploadRoutes);
app.use("/api/highlights", detectRoutes);
app.use("/api/export", exportRoutes);

// ✅ REQUIRED HEALTH CHECK FOR RENDER
app.get("/health", (req, res) => {
  res.status(200).send("OK");
});

// Root route (optional, but helpful)
app.get("/", (req, res) => {
  res.send("Backend is running. Use /api/* endpoints.");
});

// ✅ IMPORTANT: 0.0.0.0 for Render
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Backend running on port ${PORT}`);
});
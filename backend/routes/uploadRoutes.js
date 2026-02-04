/**
 * Video Upload Routes
 * Handles video file uploads and extracts metadata using ffprobe
 */

const express = require("express");
const multer = require("multer");
const path = require("path");
const ffmpeg = require("fluent-ffmpeg");
const { v4: uuidv4 } = require("uuid");

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(
      null,
      path.join(__dirname, "..", process.env.UPLOAD_FOLDER || "uploads"),
    );
  },
  filename: (req, file, cb) => {
    // Generate unique filename: uuid_originalname.mp4
    const uniqueName = `${uuidv4()}_${file.originalname}`;
    cb(null, uniqueName);
  },
});

// Only allow video files
const fileFilter = (req, file, cb) => {
  const allowedTypes = ["video/mp4", "video/quicktime", "video/x-msvideo"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only MP4, MOV, and AVI files are allowed"), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 500 * 1024 * 1024 }, // 500MB max
});

/**
 * POST /api/upload/video
 * Upload a video file and return its metadata
 */
router.post("/video", upload.single("video"), async (req, res) => {
  try {
    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, error: "No video file provided" });
    }

    const filePath = req.file.path;
    const filename = req.file.filename;

    // Get video duration using ffprobe
    ffmpeg.ffprobe(filePath, (err, metadata) => {
      if (err) {
        console.error("FFprobe error:", err);
        return res.status(500).json({
          success: false,
          error: "Failed to read video metadata. Is FFmpeg installed?",
        });
      }

      const duration = metadata.format.duration || 0;

      res.json({
        success: true,
        video: {
          id: uuidv4(),
          filename: filename,
          originalName: req.file.originalname,
          path: `/uploads/${filename}`,
          duration: Math.round(duration),
          size: req.file.size,
          sport: "football",
        },
      });
    });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;

/**
 * Export Routes
 * Handles video clipping and merging using FFmpeg
 *
 * HOW FFMPEG WORKS:
 * - ffmpeg -ss [start] -i [input] -t [duration] -c copy [output]
 *   This cuts a clip from start time with given duration
 * - ffmpeg -f concat -i [list.txt] -c copy [output]
 *   This merges multiple clips into one video
 */

const express = require("express");
const ffmpeg = require("fluent-ffmpeg");
const path = require("path");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");

const router = express.Router();

const uploadFolder = path.join(
  __dirname,
  "..",
  process.env.UPLOAD_FOLDER || "uploads",
);
const outputFolder = path.join(
  __dirname,
  "..",
  process.env.OUTPUT_FOLDER || "outputs",
);

/**
 * POST /api/export/clips
 * Cut highlights and merge into a reel
 *
 * Request body: {
 *   videoFilename: string,
 *   highlights: Array<{ id, start, end, label }>
 * }
 */
router.post("/clips", async (req, res) => {
  try {
    const { videoFilename, highlights } = req.body;

    if (!videoFilename || !highlights || highlights.length === 0) {
      return res.status(400).json({
        success: false,
        error: "Video filename and highlights are required",
      });
    }

    const inputPath = path.join(uploadFolder, videoFilename);

    if (!fs.existsSync(inputPath)) {
      return res.status(404).json({
        success: false,
        error: "Video file not found",
      });
    }

    const clipPaths = [];
    const clipFiles = [];

    // Step 1: Cut each highlight into a separate clip
    console.log(`\n📹 Processing ${highlights.length} highlights...`);

    for (let i = 0; i < highlights.length; i++) {
      const highlight = highlights[i];
      const clipFilename = `clip_${i + 1}_${highlight.label}_${uuidv4().slice(0, 8)}.mp4`;
      const clipPath = path.join(outputFolder, clipFilename);

      clipPaths.push(clipPath);
      clipFiles.push({
        id: highlight.id,
        filename: clipFilename,
        label: highlight.label,
        start: highlight.start,
        end: highlight.end,
      });

      // Cut clip using FFmpeg
      await new Promise((resolve, reject) => {
        const duration = highlight.end - highlight.start;

        ffmpeg(inputPath)
          .setStartTime(highlight.start)
          .setDuration(duration)
          .output(clipPath)
          .outputOptions(["-c", "copy"]) // Fast copy without re-encoding
          .on("start", (cmd) => {
            console.log(
              `  Clip ${i + 1}: ${highlight.label} (${highlight.start}s - ${highlight.end}s)`,
            );
          })
          .on("end", resolve)
          .on("error", reject)
          .run();
      });
    }

    // Step 2: Create a concat file for merging
    const concatFilePath = path.join(
      outputFolder,
      `concat_${uuidv4().slice(0, 8)}.txt`,
    );
    const concatContent = clipPaths.map((p) => `file '${p}'`).join("\n");
    fs.writeFileSync(concatFilePath, concatContent);

    // Step 3: Merge all clips into one highlight reel
    const reelFilename = `highlight_reel_${Date.now()}.mp4`;
    const reelPath = path.join(outputFolder, reelFilename);

    console.log("\n🎬 Merging clips into highlight reel...");

    await new Promise((resolve, reject) => {
      ffmpeg()
        .input(concatFilePath)
        .inputOptions(["-f", "concat", "-safe", "0"])
        .output(reelPath)
        .outputOptions(["-c", "copy"])
        .on("end", resolve)
        .on("error", reject)
        .run();
    });

    // Clean up concat file
    fs.unlinkSync(concatFilePath);

    console.log(`✅ Highlight reel created: ${reelFilename}\n`);

    res.json({
      success: true,
      clips: clipFiles.map((c) => ({
        ...c,
        url: `/outputs/${c.filename}`,
        downloadUrl: `/api/export/download/${c.filename}`,
      })),
      reel: {
        filename: reelFilename,
        url: `/outputs/${reelFilename}`,
        downloadUrl: `/api/export/download/${reelFilename}`,
      },
    });
  } catch (error) {
    console.error("Export error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/export/download/:filename
 * Download an exported video file
 */
router.get("/download/:filename", (req, res) => {
  const { filename } = req.params;
  const filePath = path.join(outputFolder, filename);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ success: false, error: "File not found" });
  }

  // Set headers for download
  res.setHeader("Content-Type", "video/mp4");
  res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);

  // Stream the file
  const fileStream = fs.createReadStream(filePath);
  fileStream.pipe(res);
});

module.exports = router;

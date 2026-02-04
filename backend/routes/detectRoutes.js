/**
 * AI Highlight Detection Routes
 * Currently uses mock AI service - would connect to real ML models in production
 */

const express = require("express");
const aiService = require("../services/aiService");

const router = express.Router();

/**
 * POST /api/highlights/detect
 * Detect highlights in a video (currently mocked)
 *
 * Request body: { videoPath: string, duration: number }
 * Response: { success: true, highlights: Highlight[] }
 */
router.post("/detect", async (req, res) => {
  try {
    const { videoPath, duration } = req.body;

    if (!duration || duration <= 0) {
      return res.status(400).json({
        success: false,
        error: "Valid video duration is required",
      });
    }

    // Simulate processing delay (real AI would take longer)
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Get mock highlights based on video duration
    const highlights = aiService.detectHighlights(duration);

    res.json({
      success: true,
      highlights,
      metadata: {
        videoPath,
        duration,
        processedAt: new Date().toISOString(),
        model: "mock-v1.0", // Would be real model name in production
      },
    });
  } catch (error) {
    console.error("Detection error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;

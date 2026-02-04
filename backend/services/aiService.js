/**
 * AI Highlight Detection Service (MOCKED)
 *
 * WHY AI IS MOCKED:
 * - Real AI detection requires trained ML models (computer vision, audio analysis)
 * - These models need GPU servers and significant processing time
 * - Training data would need thousands of labeled football videos
 * - For POC, we simulate realistic detection results
 *
 * IN PRODUCTION, THIS WOULD:
 * - Use models like YOLO for object detection (ball, players, goal)
 * - Use audio analysis to detect crowd cheering spikes
 * - Use scene change detection for key moments
 * - Run on cloud GPU services (AWS, GCP, Azure)
 */

const { v4: uuidv4 } = require("uuid");

// Highlight types with their relative frequency
const HIGHLIGHT_TYPES = [
  { label: "goal", weight: 15 }, // Less frequent but important
  { label: "foul", weight: 30 }, // More common
  { label: "penalty", weight: 10 }, // Rare
  { label: "crowd", weight: 25 }, // Reaction moments
];

/**
 * Generate mock highlights based on video duration
 * Creates realistic, non-overlapping highlight segments
 *
 * @param {number} duration - Video duration in seconds
 * @returns {Array} Array of highlight objects
 */
function detectHighlights(duration) {
  // Calculate number of highlights based on duration
  // Roughly 1 highlight per 30-60 seconds of video
  const minHighlights = Math.max(3, Math.floor(duration / 60));
  const maxHighlights = Math.min(15, Math.floor(duration / 30));
  const numHighlights =
    Math.floor(Math.random() * (maxHighlights - minHighlights + 1)) +
    minHighlights;

  const highlights = [];
  const usedTimeRanges = [];

  // Helper to check if a time range overlaps with existing highlights
  const isOverlapping = (start, end) => {
    return usedTimeRanges.some(
      (range) =>
        (start >= range.start && start < range.end) ||
        (end > range.start && end <= range.end) ||
        (start <= range.start && end >= range.end),
    );
  };

  // Helper to get random highlight type based on weights
  const getRandomType = () => {
    const totalWeight = HIGHLIGHT_TYPES.reduce((sum, t) => sum + t.weight, 0);
    let random = Math.random() * totalWeight;

    for (const type of HIGHLIGHT_TYPES) {
      random -= type.weight;
      if (random <= 0) return type.label;
    }
    return HIGHLIGHT_TYPES[0].label;
  };

  // Generate highlights
  let attempts = 0;
  const maxAttempts = numHighlights * 10;

  while (highlights.length < numHighlights && attempts < maxAttempts) {
    attempts++;

    // Random start time (leave 5% buffer at start and end)
    const bufferTime = duration * 0.05;
    const start = bufferTime + Math.random() * (duration - bufferTime * 2 - 15);

    // Random duration between 5 and 15 seconds
    const highlightDuration = 5 + Math.random() * 10;
    const end = Math.min(start + highlightDuration, duration - bufferTime);

    // Skip if overlapping
    if (isOverlapping(start, end)) continue;

    // Create highlight
    const highlight = {
      id: uuidv4(),
      start: Math.round(start * 10) / 10, // Round to 1 decimal
      end: Math.round(end * 10) / 10,
      label: getRandomType(),
      confidence: 0.7 + Math.random() * 0.29, // 0.70 to 0.99
      enabled: true,
    };

    highlights.push(highlight);
    usedTimeRanges.push({ start: highlight.start, end: highlight.end });
  }

  // Sort by start time
  highlights.sort((a, b) => a.start - b.start);

  console.log(
    `🤖 AI Detection: Found ${highlights.length} highlights in ${duration}s video`,
  );

  return highlights;
}

module.exports = {
  detectHighlights,
};

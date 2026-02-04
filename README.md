# AI Automated Football Highlights Platform

A production-quality proof-of-concept for AI-powered automatic highlight detection and export from football (soccer) match videos.

## 🎯 Project Overview

This platform enables users to:
1. **Select/Upload** a football match video
2. **Detect** highlights automatically using AI (goals, fouls, penalties, crowd reactions)
3. **Review & Edit** detected highlights with precise timestamp controls
4. **Export** individual clips or a stitched highlight reel

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND (React + Vite)                  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │  Upload     │→ │  AI Detect  │→ │  Review & Export        │  │
│  │  Page       │  │  Page       │  │  Page                   │  │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘  │
│         │                │                      │                │
│         ▼                ▼                      ▼                │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │                    State Management (useState)               ││
│  │  - selectedVideo   - highlights[]   - exportProgress        ││
│  └─────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ HTTP API (Future)
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    BACKEND (Node.js + Express)                   │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │ /api/detect │  │ /api/export │  │  Static Files           │  │
│  │             │  │             │  │  (uploads, exports)     │  │
│  └──────┬──────┘  └──────┬──────┘  └─────────────────────────┘  │
│         │                │                                       │
│         ▼                ▼                                       │
│  ┌─────────────┐  ┌─────────────────────────────────────────────┐│
│  │ AI Client   │  │              FFmpeg Module                  ││
│  │ (Mock/Real) │  │  - trimClip()   - stitchHighlights()       ││
│  └─────────────┘  └─────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
```

---

## 🚀 Quick Start

### Step 1: Add Your Video

Place your `FootballMatch_Demo.mp4` file in the `public/sample-videos/` folder:

```
public/
└── sample-videos/
    └── FootballMatch_Demo.mp4
```

### Step 2: Install & Run

```bash
npm install
npm run dev
```

### Step 3: Use the Platform

1. Click "Use Demo" on the upload page
2. Click "Start AI Detection" to simulate highlight detection
3. Preview each highlight by clicking the play button on cards
4. Edit labels, timestamps, or toggle highlights
5. Export individual clips or the full reel

---

## 💻 Backend Setup (Node.js + Express + FFmpeg)

For real video processing with FFmpeg, create a `/backend` folder locally:

### Prerequisites

- Node.js v18+ LTS
- FFmpeg installed (`brew install ffmpeg` or `apt install ffmpeg`)
- VS Code recommended

### Backend Structure

```
backend/
├── server.js
├── package.json
├── .env
├── routes/
│   ├── detect.js
│   └── export.js
├── lib/
│   ├── aiClient.js
│   └── ffmpeg.js
├── uploads/
└── exports/
```

### backend/package.json

```json
{
  "name": "ai-highlights-backend",
  "version": "1.0.0",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "fluent-ffmpeg": "^2.1.2"
  }
}
```

### backend/.env

```env
PORT=3001
FRONTEND_URL=http://localhost:5173
EXPORT_PATH=./exports
```

### backend/server.js

```javascript
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const detectRoutes = require('./routes/detect');
const exportRoutes = require('./routes/export');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: process.env.FRONTEND_URL }));
app.use(express.json());
app.use('/exports', express.static(path.join(__dirname, 'exports')));

app.use('/api/detect', detectRoutes);
app.use('/api/export', exportRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => console.log(`Backend: http://localhost:${PORT}`));
```

### backend/routes/detect.js

```javascript
const express = require('express');
const router = express.Router();
const { detectHighlights } = require('../lib/aiClient');

router.get('/', async (req, res) => {
  try {
    const highlights = await detectHighlights();
    res.json({ success: true, highlights });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
```

### backend/routes/export.js

```javascript
const express = require('express');
const router = express.Router();
const { trimClip, stitchHighlights } = require('../lib/ffmpeg');
const path = require('path');

router.post('/', async (req, res) => {
  try {
    const { highlights, videoPath } = req.body;
    const clips = [];
    
    for (const h of highlights) {
      const out = path.join(process.env.EXPORT_PATH, `${h.id}_${h.label}.mp4`);
      await trimClip(videoPath, h.start, h.end, out);
      clips.push({ id: h.id, url: `/exports/${path.basename(out)}` });
    }
    
    res.json({ success: true, clips });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
```

### backend/lib/aiClient.js

```javascript
// Mock AI detection - replace with real ML integration
const generateId = () => Math.random().toString(36).substr(2, 9);

async function detectHighlights() {
  await new Promise(r => setTimeout(r, 2000)); // Simulate processing
  
  return [
    { id: generateId(), start: 12, end: 22, label: 'goal', confidence: 0.95, enabled: true },
    { id: generateId(), start: 45, end: 52, label: 'foul', confidence: 0.82, enabled: true },
    { id: generateId(), start: 78, end: 92, label: 'penalty', confidence: 0.91, enabled: true },
    { id: generateId(), start: 120, end: 128, label: 'crowd', confidence: 0.76, enabled: true },
  ];
}

module.exports = { detectHighlights };
```

### backend/lib/ffmpeg.js

```javascript
const ffmpeg = require('fluent-ffmpeg');

async function trimClip(input, start, end, output) {
  return new Promise((resolve, reject) => {
    ffmpeg(input)
      .setStartTime(start)
      .setDuration(end - start)
      .output(output)
      .outputOptions(['-c:v libx264', '-c:a aac', '-preset fast'])
      .on('end', () => resolve(output))
      .on('error', reject)
      .run();
  });
}

async function stitchHighlights(clips, output) {
  // Concatenate clips using FFmpeg concat demuxer
  const fs = require('fs');
  const path = require('path');
  const listPath = path.join(path.dirname(output), 'list.txt');
  fs.writeFileSync(listPath, clips.map(c => `file '${c}'`).join('\n'));
  
  return new Promise((resolve, reject) => {
    ffmpeg()
      .input(listPath)
      .inputOptions(['-f concat', '-safe 0'])
      .output(output)
      .on('end', () => { fs.unlinkSync(listPath); resolve(output); })
      .on('error', reject)
      .run();
  });
}

module.exports = { trimClip, stitchHighlights };
```

---

## 🎬 Key Features

### ✅ Preview Buttons Work
Each highlight card has a preview button that:
- Seeks the video to the highlight's start time
- Plays only the highlight duration
- Stops automatically at the end time

### ✅ Individual Clip Downloads
Export generates separate files for each highlight, not the full video.

### ✅ Edit & Customize
- Change highlight labels (goal/foul/penalty/crowd)
- Adjust start/end timestamps
- Enable/disable individual highlights
- Delete unwanted highlights

---

## 🧠 AI Detection Approach

| Event | Detection Method | Confidence Factors |
|-------|------------------|-------------------|
| Goal | Ball crossing line + celebration | Position, motion, audio |
| Foul | Player collision + whistle | Contact, referee gesture |
| Penalty | Ball placement in box | Field zone, formation |
| Crowd | Audio spike | Decibel level, camera |

---

## ⚖️ Tradeoffs

| Decision | Rationale |
|----------|-----------|
| Mock AI | POC focuses on UX; real AI needs ML infrastructure |
| Client preview | Instant feedback, no server roundtrip |
| FFmpeg re-encode | Consistent output format |

---

## 🎤 Interview Q&A

**Q: Why React + Vite?**
A: Fast HMR, instant builds, component model fits editor pattern.

**Q: How to scale AI detection?**
A: Queue-based processing, distributed GPU workers, keyframe extraction.

**Q: Why client preview + server export?**
A: Client seeking is instant; server handles heavy re-encoding.

---

## 📁 Project Structure

```
src/
├── App.tsx              # Main app with navigation
├── types.ts             # TypeScript interfaces
├── lib/mockData.ts      # Mock AI & utilities
├── components/
│   ├── VideoPlayer.tsx  # HTML5 player with highlight support
│   ├── HighlightCard.tsx # Editable highlight item
│   ├── Timeline.tsx     # Visual timeline
│   └── Navigation.tsx   # Step navigation
└── pages/
    ├── Upload.tsx       # Video selection
    ├── Detect.tsx       # AI detection
    └── Review.tsx       # Review & export
```

---

MIT License - Interview demonstration POC

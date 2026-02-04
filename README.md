# AI Automated Sports Highlights Platform ⚽🎥

The AI Automated Sports Highlights Platform is a full-stack web application that automatically detects and generates highlight moments from football match videos using audio-based analysis. The system is designed to identify key moments such as goals, fouls, penalties, and intense crowd reactions by analyzing audio loudness patterns, enabling faster and more efficient highlight creation without manual video editing.

This project is developed as a proof-of-concept to demonstrate how artificial intelligence techniques combined with multimedia processing can be applied in sports analytics and media automation. Users can upload a football match video, trigger highlight detection, review and modify detected segments through an interactive interface, and export a final highlight reel.

The frontend is built using React with TypeScript and Vite, styled using Tailwind CSS and Shadcn/UI components to provide a modern, responsive, and user-friendly interface. The backend is implemented using Node.js and Express.js, where FFmpeg is used for audio extraction, RMS level analysis, and video clipping. The highlight detection logic is optimized for performance by limiting analysis frequency and removing overlapping segments.

Both frontend and backend are maintained within a single repository. Large generated video files and sample media are excluded from version control using `.gitignore` to ensure smooth Git operations and deployment. The application is cloud-deployment ready and can be hosted on platforms such as Render, with FFmpeg installed on the server environment.

Key Features:
- Upload football match videos for automated analysis
- Fast audio-based highlight detection using FFmpeg
- Detection of crowd noise, goals, fouls, and penalties
- Interactive highlight review and editing interface
- Timeline-based visualization of detected moments
- Export of generated highlight reels
- Optimized backend processing for proof-of-concept usage

Technology Stack:
- Frontend: React, TypeScript, Vite, Tailwind CSS, Shadcn/UI
- Backend: Node.js, Express.js
- Media Processing: FFmpeg
- Version Control: Git and GitHub
- Deployment: Render (or similar cloud platforms)

Project Structure Overview:
- Root directory contains frontend configuration and source files
- `src/` includes React components, pages, hooks, and utilities
- `backend/` contains Express server, routes, services, and FFmpeg logic
- `uploads/` and `outputs/` directories are used at runtime and ignored in Git

Local Setup Instructions:
1. Clone the repository to your local machine
2. Install frontend dependencies using `npm install` in the root directory
3. Navigate to the `backend` folder and install backend dependencies using `npm install`
4. Ensure FFmpeg is installed and available in your system PATH
5. Start the backend server using `npm start` inside the backend folder
6. Start the frontend development server using `npm run dev` from the root directory
7. Open the application in the browser at the provided local URL

Deployment Notes:
- Ensure FFmpeg is available in the deployment environment
- Configure environment variables for backend paths if required
- Build the frontend using `npm run build`
- Deploy backend as a Node.js service
- Serve frontend build files via the hosting platform or a static service

This project is intended for educational and demonstration purposes, showcasing automated sports highlight generation using audio analysis and modern web technologies.

Author: Kajal Bamane

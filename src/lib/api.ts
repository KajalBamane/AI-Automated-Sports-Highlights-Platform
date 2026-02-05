import { Highlight, VideoMetadata } from "@/types";



const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

console.log("API_BASE_URL =", API_BASE_URL);


/* ===================== HEALTH ===================== */
export async function checkBackendHealth(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/upload`);
    return res.ok;
  } catch {
    return false;
  }
}

/* ===================== UPLOAD ===================== */
export async function uploadVideo(
  file: File,
  onProgress?: (percent: number) => void,
): Promise<VideoMetadata> {
  const formData = new FormData();
  formData.append("video", file);

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgress) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    };

    xhr.onload = () => {
      const res = JSON.parse(xhr.responseText);
      if (!res.success) return reject(res.error);

      resolve({
        filename: res.video.filename,
        duration: res.video.duration,
        sport: "football",
        path: res.video.path,
      });
    };

    xhr.onerror = () => reject("Upload failed");

    xhr.open("POST", `${API_BASE_URL}/api/upload`);
    xhr.send(formData);
  });
}

/* ===================== DETECT ===================== */
export async function detectHighlights(
  videoPath: string,
  duration: number,
): Promise<Highlight[]> {
  const res = await fetch(`${API_BASE_URL}/api/highlights/detect`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ videoPath, duration }),
  });

  const data: { success: boolean; highlights: Highlight[]; error?: string } =
    await res.json();

  if (!data.success) throw new Error(data.error || "Detection failed");
  return data.highlights;
}

/* ===================== EXPORT ===================== */
export interface ExportResult {
  clips: {
    id: string;
    filename: string;
    label: string;
    url: string;
    downloadUrl: string;
  }[];
  reel: {
    filename: string;
    url: string;
    downloadUrl: string;
  };
}

export async function exportHighlights(
  videoFilename: string,
  highlights: Pick<Highlight, "id" | "start" | "end" | "label">[],
): Promise<ExportResult> {
  const res = await fetch(`${API_BASE_URL}/api/export/clips`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ videoFilename, highlights }),
  });

  const data: { success: boolean } & ExportResult & { error?: string } =
    await res.json();

  if (!data.success) throw new Error(data.error || "Export failed");

  return data;
}

/* ===================== DOWNLOAD ===================== */
export function downloadFile(url: string, filename: string) {
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
}

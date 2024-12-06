import { FFmpeg } from "@ffmpeg/ffmpeg";

let ffmpeg: FFmpeg | null = null;

async function initFFmpeg() {
  if (!ffmpeg) {
    ffmpeg = new FFmpeg();
    await ffmpeg.load();
  }
}

async function processVideo(videoData: ArrayBuffer) {
  try {
    await initFFmpeg();
    if (!ffmpeg) throw new Error("Failed to initialize FFmpeg");

    const inputName = "input.mp4";
    const outputName = "output.mp4";

    // Write input file
    await ffmpeg.writeFile(inputName, new Uint8Array(videoData));

    // Build filter chain
    const filters: string[] = [];

    // Report progress periodically
    let progress = 0;
    const progressInterval = setInterval(() => {
      progress += 5;
      if (progress <= 95) {
        self.postMessage({ type: "progress", payload: progress });
      }
    }, 100);

    // Process video
    const command = [
      "-i",
      inputName,
      ...(filters.length ? ["-vf", filters.join(",")] : []),
      "-c:a",
      "copy",
      outputName,
    ];

    await ffmpeg.exec(command);
    clearInterval(progressInterval);
    self.postMessage({ type: "progress", payload: 100 });

    // Read output
    const data = await ffmpeg.readFile(outputName);
    return data;
  } catch (error) {
    throw new Error(`Processing failed: ${error}`);
  }
}

// Handle messages from main thread
self.onmessage = async (e) => {
  try {
    const { type, payload } = e.data;

    switch (type) {
      case "process":
        const result = await processVideo(payload.videoData);
        self.postMessage({ type: "complete", payload: result });
        break;
      default:
        throw new Error(`Unknown message type: ${type}`);
    }
  } catch (error) {
    self.postMessage({
      type: "error",
      payload: error instanceof Error ? error.message : String(error),
    });
  }
};

// Ensure TypeScript recognizes this as a module
export {};

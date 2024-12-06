import { FFmpeg } from "@ffmpeg/ffmpeg";
import { initFFmpeg } from "@/lib/services/ffmpeg-init";

// Declare worker scope type
declare const self: Worker;

// Handle preview generation
async function generatePreview(videoData: ArrayBuffer, timestamp: number) {
  try {
    const ffmpeg = await initFFmpeg();
    await ffmpeg.writeFile("input.mp4", new Uint8Array(videoData));

    // Extract frame at timestamp
    await ffmpeg.exec([
      "-ss",
      timestamp.toString(),
      "-i",
      "input.mp4",
      "-vframes",
      "1",
      "-f",
      "image2",
      "preview.jpg",
    ]);

    const data = await ffmpeg.readFile("preview.jpg");
    return data;
  } catch (error) {
    throw new Error(`Preview generation failed: ${error}`);
  }
}

interface PreviewMessage {
  type: "generate-preview";
  payload: {
    videoData: ArrayBuffer;
    timestamp: number;
  };
}

type WorkerMessage = PreviewMessage;

self.onmessage = async (e: MessageEvent<WorkerMessage>) => {
  const { type, payload } = e.data;

  switch (type) {
    case "generate-preview":
      try {
        const preview = await generatePreview(
          payload.videoData,
          payload.timestamp
        );
        self.postMessage({ type: "preview", payload: preview });
      } catch (error: unknown) {
        self.postMessage({
          type: "error",
          payload: error instanceof Error ? error.message : "Unknown error",
        });
      }
      break;
    default:
      self.postMessage({
        type: "error",
        payload: `Unknown message type: ${type}`,
      });
  }
};

// Ensure TypeScript recognizes this as a module
export {};

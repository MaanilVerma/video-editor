import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile } from "@ffmpeg/util";
import type {
  VideoEffect,
  VideoTransition,
} from "@/lib/services/video-effects";

let ffmpeg: FFmpeg | null = null;

async function initFFmpeg() {
  if (!ffmpeg) {
    ffmpeg = new FFmpeg();
    await ffmpeg.load();
  }
}

function getEffectFilter(effect: VideoEffect, intensity = 1): string {
  switch (effect) {
    case "grayscale":
      return "colorchannelmixer=.3:.3:.3:0:.3:.3:.3:0:.3:.3:.3";
    case "sepia":
      return "colorchannelmixer=.393:.769:.189:0:.349:.686:.168:0:.272:.534:.131";
    case "blur":
      return `gblur=sigma=${2 * intensity}`;
    case "sharpen":
      return `unsharp=${3 * intensity}:${3 * intensity}:${intensity}`;
    case "brightness":
      return `eq=brightness=${intensity - 0.5}`;
    case "contrast":
      return `eq=contrast=${intensity}`;
    case "saturation":
      return `eq=saturation=${intensity}`;
    default:
      return "";
  }
}

function getTransitionFilter(
  transition: VideoTransition,
  duration = 1
): string {
  switch (transition) {
    case "fade":
      return `fade=t=in:st=0:d=${duration},fade=t=out:st=${duration - 1}:d=1`;
    case "crossfade":
      return `xfade=transition=fade:duration=${duration}`;
    case "wipe":
      return `wipe=duration=${duration}`;
    case "slide":
      return `xfade=transition=slideright:duration=${duration}`;
    case "zoom":
      return `xfade=transition=zoom:duration=${duration}`;
    default:
      return "";
  }
}

async function processVideo(
  videoData: ArrayBuffer,
  options: {
    effect?: VideoEffect;
    transition?: VideoTransition;
    intensity?: number;
    duration?: number;
  }
) {
  try {
    await initFFmpeg();
    if (!ffmpeg) throw new Error("Failed to initialize FFmpeg");

    const inputName = "input.mp4";
    const outputName = "output.mp4";

    // Write input file
    await ffmpeg.writeFile(inputName, new Uint8Array(videoData));

    // Build filter chain
    const filters: string[] = [];
    if (options.effect && options.effect !== "none") {
      filters.push(getEffectFilter(options.effect, options.intensity));
    }
    if (options.transition && options.transition !== "none") {
      filters.push(getTransitionFilter(options.transition, options.duration));
    }

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
        const result = await processVideo(payload.videoData, payload.options);
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

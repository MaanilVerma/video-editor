import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";
import type { TextOverlayType, ImageOverlayType } from "@/lib/models/overlays";

let ffmpeg: FFmpeg | null = null;

async function initFFmpeg() {
  if (ffmpeg) return ffmpeg;

  ffmpeg = new FFmpeg();

  // Log FFmpeg messages
  ffmpeg.on("log", ({ message }) => {
    console.log("FFmpeg Log:", message);
  });

  try {
    // Load FFmpeg with core files from CDN
    const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd";
    await ffmpeg.load({
      coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
      wasmURL: await toBlobURL(
        `${baseURL}/ffmpeg-core.wasm`,
        "application/wasm"
      ),
    });

    return ffmpeg;
  } catch (error) {
    console.error("Failed to load FFmpeg:", error);
    throw new Error("Failed to initialize video processing");
  }
}

// Helper function to format time in HH:MM:SS format
function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 1000);

  return `${hours.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}:${secs.toString().padStart(2, "0")}.${ms
    .toString()
    .padStart(3, "0")}`;
}

// Basic trim function without overlays
export async function trimVideo(
  videoFile: File,
  startTime: number,
  endTime: number,
  onProgress?: (progress: number) => void
): Promise<File> {
  try {
    console.log("Initializing FFmpeg...");
    const ffmpeg = await initFFmpeg();

    // Write input video
    await ffmpeg.writeFile("input.mp4", await fetchFile(videoFile));

    const formattedStart = formatTime(startTime);
    const formattedEnd = formatTime(endTime);

    console.log("Executing trim command...", { formattedStart, formattedEnd });

    await ffmpeg.exec([
      "-i",
      "input.mp4",
      "-ss",
      formattedStart,
      "-to",
      formattedEnd,
      "-c",
      "copy",
      "-avoid_negative_ts",
      "make_zero",
      "output.mp4",
    ]);

    const data = await ffmpeg.readFile("output.mp4");
    const trimmedFile = new File([data], "trimmed-" + videoFile.name, {
      type: videoFile.type,
    });

    // Cleanup
    await ffmpeg.deleteFile("input.mp4");
    await ffmpeg.deleteFile("output.mp4");

    return trimmedFile;
  } catch (error) {
    console.error("Error in trimVideo:", error);
    throw error;
  }
}

interface ExportOptions {
  textOverlays: TextOverlayType[];
  imageOverlays: ImageOverlayType[];
  trimStart: number;
  trimEnd: number;
  quality?: "low" | "medium" | "high";
  format?: "mp4" | "webm";
  onProgress?: (progress: number) => void;
}

const QUALITY_PRESETS = {
  low: { crf: 28, preset: "veryfast" },
  medium: { crf: 23, preset: "medium" },
  high: { crf: 18, preset: "slow" },
};

export async function exportVideo(
  videoFile: File,
  options: ExportOptions
): Promise<File> {
  try {
    console.log("Initializing FFmpeg for export...", options);
    options.onProgress?.(0);

    const ffmpeg = await initFFmpeg();
    console.log("FFmpeg loaded successfully");
    options.onProgress?.(5);

    // Write input video
    await ffmpeg.writeFile("input.mp4", await fetchFile(videoFile));
    console.log("Input video written successfully");
    options.onProgress?.(10);

    // Write font file for text overlays
    try {
      const fontResponse = await fetch("/fonts/OpenSans-Regular.ttf");
      if (!fontResponse.ok) throw new Error("Failed to load font file");
      const fontData = await fontResponse.arrayBuffer();
      await ffmpeg.writeFile("font.ttf", new Uint8Array(fontData));
      console.log("Font file written successfully");
    } catch (error) {
      console.error("Failed to load font:", error);
      throw new Error("Font is required for text overlays");
    }
    options.onProgress?.(15);

    // Process image overlays
    const successfulOverlays = [];
    for (const overlay of options.imageOverlays) {
      try {
        const response = await fetch(overlay.url);
        if (!response.ok)
          throw new Error(`Failed to fetch image: ${overlay.url}`);
        const blob = await response.blob();
        const arrayBuffer = await blob.arrayBuffer();
        const filename = `overlay_${overlay.id}.png`;
        await ffmpeg.writeFile(filename, new Uint8Array(arrayBuffer));
        successfulOverlays.push(overlay);
        console.log(`Successfully processed overlay: ${filename}`);
      } catch (error) {
        console.error(`Failed to process overlay ${overlay.id}:`, error);
      }
    }
    options.onProgress?.(25);

    // Set up FFmpeg progress tracking
    ffmpeg.on("progress", ({ progress }) => {
      // Map FFmpeg progress (0-1) to our range (25-99)
      const mappedProgress = 25 + progress * 74;
      options.onProgress?.(mappedProgress);
    });

    // Prepare filter complex command
    const filterComplex: string[] = [];

    // 1. Trim video
    filterComplex.push(
      `[0:v]trim=start=${options.trimStart}:end=${options.trimEnd},setpts=PTS-STARTPTS[trimmed_video]`
    );

    // 2. Add image overlays
    let currentVideoLayer = "trimmed_video";
    successfulOverlays.forEach((overlay, index) => {
      const start = Math.max(0, overlay.timestamp - options.trimStart);
      const end = start + overlay.duration;

      filterComplex.push(
        `[${currentVideoLayer}][${index + 1}:v]overlay=x=${Math.round(
          overlay.position.x
        )}:y=${Math.round(
          overlay.position.y
        )}:enable='between(t,${start},${end})'[img${index}]`
      );
      currentVideoLayer = `img${index}`;
    });

    // 3. Add text overlays
    options.textOverlays.forEach((overlay, index) => {
      const start = overlay.timestamp - options.trimStart;
      const end = start + overlay.duration;

      // Escape special characters
      const escapedText = overlay.text.replace(/[\\':]/g, "\\$&");

      filterComplex.push(
        `[${currentVideoLayer}]drawtext=` +
          `fontfile=font.ttf:` +
          `text='${escapedText}':` +
          `x=${Math.round(overlay.position.x)}:` +
          `y=${Math.round(overlay.position.y)}:` +
          `fontsize=${overlay.fontSize}:` +
          `fontcolor=${overlay.color}:` +
          `box=1:boxcolor=black@0.5:` +
          `enable='between(t,${start},${end})'` +
          `[txt${index}]`
      );
      currentVideoLayer = `txt${index}`;
    });

    // Get quality settings
    const quality = QUALITY_PRESETS[options.quality || "medium"];
    const outputFormat = options.format || "mp4";

    // Build FFmpeg command
    const command = [
      "-i",
      "input.mp4",
      ...successfulOverlays.flatMap((overlay) => [
        "-i",
        `overlay_${overlay.id}.png`,
      ]),
      "-filter_complex",
      filterComplex.join(";"),
      "-map",
      `[${currentVideoLayer}]`,
      "-map",
      "0:a?",
      "-c:v",
      outputFormat === "webm" ? "libvpx-vp9" : "libx264",
      "-crf",
      quality.crf.toString(),
      "-preset",
      quality.preset,
      "-c:a",
      outputFormat === "webm" ? "libvorbis" : "aac",
      `output.${outputFormat}`,
    ];

    console.log("FFmpeg Command:", command.join(" "));

    // Execute FFmpeg command
    await ffmpeg.exec(command);

    // Read output file
    const data = await ffmpeg.readFile(`output.${outputFormat}`);
    const outputFile = new File(
      [data],
      `exported-${videoFile.name}.${outputFormat}`,
      {
        type: outputFormat === "webm" ? "video/webm" : "video/mp4",
      }
    );

    // Cleanup
    await ffmpeg.deleteFile("input.mp4");
    await ffmpeg.deleteFile(`output.${outputFormat}`);
    await ffmpeg.deleteFile("font.ttf");
    for (const overlay of successfulOverlays) {
      await ffmpeg.deleteFile(`overlay_${overlay.id}.png`);
    }

    // Final progress update
    options.onProgress?.(100);
    return outputFile;
  } catch (error) {
    console.error("Export failed:", error);
    throw error;
  }
}

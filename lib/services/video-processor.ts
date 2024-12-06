import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile } from "@ffmpeg/util";

export type VideoFilter = "none" | "grayscale" | "sepia" | "blur" | "sharpen";
export type VideoTransition = "none" | "fade" | "wipe" | "dissolve";

export interface ProcessingOptions {
  filter?: VideoFilter;
  transition?: VideoTransition;
  quality?: number;
  codec?: string;
  onProgress?: (progress: number) => void;
}

export class VideoProcessor {
  private ffmpeg: FFmpeg;
  private loaded = false;

  constructor() {
    this.ffmpeg = new FFmpeg();
  }

  async load() {
    if (this.loaded) return;

    await this.ffmpeg.load();
    this.loaded = true;
  }

  private getFilterCommand(filter: VideoFilter): string {
    switch (filter) {
      case "grayscale":
        return "colorchannelmixer=.3:.4:.3:0:.3:.4:.3:0:.3:.4:.3";
      case "sepia":
        return "colorchannelmixer=.393:.769:.189:0:.349:.686:.168:0:.272:.534:.131";
      case "blur":
        return "gblur=sigma=2";
      case "sharpen":
        return "unsharp=5:5:1.5:5:5:0";
      default:
        return "";
    }
  }

  private getTransitionCommand(
    transition: VideoTransition,
    duration: number
  ): string {
    switch (transition) {
      case "fade":
        return `fade=t=in:st=0:d=${duration},fade=t=out:st=${duration - 1}:d=1`;
      case "dissolve":
        return `dissolve=duration=${duration}`;
      case "wipe":
        return `wipe=duration=${duration}`;
      default:
        return "";
    }
  }

  async processVideo(
    inputFile: File,
    options: ProcessingOptions = {}
  ): Promise<Blob> {
    if (!this.loaded) await this.load();

    const inputName = "input.mp4";
    const outputName = "output.mp4";

    // Write input file
    await this.ffmpeg.writeFile(inputName, await fetchFile(inputFile));

    // Build filter chain
    const filters: string[] = [];
    if (options.filter && options.filter !== "none") {
      filters.push(this.getFilterCommand(options.filter));
    }
    if (options.transition && options.transition !== "none") {
      filters.push(this.getTransitionCommand(options.transition, 1));
    }

    // Construct command
    const command = [
      "-i",
      inputName,
      ...(filters.length ? ["-vf", filters.join(",")] : []),
      "-c:v",
      "libx264",
      "-crf",
      `${options.quality || 23}`,
      "-preset",
      "medium",
      "-c:a",
      "aac",
      outputName,
    ];

    // Process video
    await this.ffmpeg.exec(command);

    // Read output
    const data = await this.ffmpeg.readFile(outputName);
    return new Blob([data], { type: "video/mp4" });
  }
}

export const videoProcessor = new VideoProcessor();

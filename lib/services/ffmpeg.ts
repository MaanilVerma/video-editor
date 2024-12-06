import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";

class FFmpegService {
  private ffmpeg: FFmpeg | null = null;
  private loaded = false;

  async load() {
    if (this.loaded) return;

    this.ffmpeg = new FFmpeg();

    // Load FFmpeg
    const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.4/dist/umd";
    await this.ffmpeg.load({
      coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
      wasmURL: await toBlobURL(
        `${baseURL}/ffmpeg-core.wasm`,
        "application/wasm"
      ),
    });

    this.loaded = true;
  }

  async trimVideo(
    videoFile: File,
    start: number,
    end: number,
    onProgress?: (progress: number) => void
  ): Promise<Blob> {
    if (!this.ffmpeg) throw new Error("FFmpeg not loaded");

    const inputFileName = "input.mp4";
    const outputFileName = "output.mp4";

    // Write the input file to FFmpeg's virtual file system
    await this.ffmpeg.writeFile(inputFileName, await fetchFile(videoFile));

    // Construct the FFmpeg command for trimming
    const duration = end - start;
    const command = [
      "-i",
      inputFileName,
      "-ss",
      start.toString(),
      "-t",
      duration.toString(),
      "-c",
      "copy",
      outputFileName,
    ];

    // Execute the command
    await this.ffmpeg.exec(command);

    // Read the output file
    const data = await this.ffmpeg.readFile(outputFileName);
    return new Blob([data], { type: "video/mp4" });
  }

  async addOverlays(
    videoFile: File,
    overlays: Array<{ type: "text" | "image"; data: any }>,
    onProgress?: (progress: number) => void
  ): Promise<Blob> {
    if (!this.ffmpeg) throw new Error("FFmpeg not loaded");

    const inputFileName = "input.mp4";
    const outputFileName = "output.mp4";

    // Write input file
    await this.ffmpeg.writeFile(inputFileName, await fetchFile(videoFile));

    // Prepare filter complex command
    let filterComplex: string[] = [];
    let inputs = ["-i", inputFileName];
    let overlayCount = 0;

    // Process each overlay
    for (const overlay of overlays) {
      if (overlay.type === "text") {
        // Add text overlay
        filterComplex.push(
          `drawtext=text='${overlay.data.text}':` +
            `fontsize=${overlay.data.fontSize}:` +
            `fontcolor=${overlay.data.color}:` +
            `x=${overlay.data.position.x}:` +
            `y=${overlay.data.position.y}:` +
            `enable='between(t,${overlay.data.timestamp},${
              overlay.data.timestamp + 5
            })'`
        );
      } else if (overlay.type === "image") {
        // Add image overlay
        const imgFileName = `image${overlayCount}.png`;
        await this.ffmpeg.writeFile(
          imgFileName,
          await fetchFile(overlay.data.url)
        );

        inputs.push("-i", imgFileName);
        filterComplex.push(
          `[${overlayCount + 1}]scale=${overlay.data.size.width}:${
            overlay.data.size.height
          }[img${overlayCount}];` +
            `[v${overlayCount}][img${overlayCount}]overlay=${overlay.data.position.x}:${overlay.data.position.y}:` +
            `enable='between(t,${overlay.data.timestamp},${
              overlay.data.timestamp + 5
            })'[v${overlayCount + 1}]`
        );
        overlayCount++;
      }
    }

    // Construct final command
    const command = [
      ...inputs,
      "-filter_complex",
      filterComplex.join(";"),
      "-map",
      `[v${overlayCount}]`,
      "-map",
      "0:a?",
      outputFileName,
    ];

    // Execute command
    await this.ffmpeg.exec(command);

    // Read output file
    const data = await this.ffmpeg.readFile(outputFileName);
    return new Blob([data], { type: "video/mp4" });
  }
}

export const ffmpegService = new FFmpegService();

import { FFmpeg } from "@ffmpeg/ffmpeg";

let ffmpeg: FFmpeg | null = null;

export async function initFFmpeg() {
  if (ffmpeg) return ffmpeg;

  ffmpeg = new FFmpeg();
  await ffmpeg.load();
  return ffmpeg;
}

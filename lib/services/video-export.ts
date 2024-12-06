import { TextOverlayType, ImageOverlayType } from "../models";

export async function exportVideoWithOverlays(
  videoFile: File,
  overlays: { text: TextOverlayType[]; image: ImageOverlayType[] },
  duration: number,
  progressCallback: (progress: number) => void,
  trim?: { start: number; end: number }
): Promise<Blob> {
  // Create a canvas
  const canvas = document.createElement("canvas");
  canvas.width = 1920;
  canvas.height = 1080;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Failed to get canvas context");

  // Create video element
  const video = document.createElement("video");
  video.src = URL.createObjectURL(videoFile);
  await new Promise<void>((resolve) => {
    video.onloadedmetadata = () => {
      video.width = canvas.width;
      video.height = canvas.height;
      resolve();
    };
  });

  // Load all images first
  const imageElements = await Promise.all(
    overlays.image.map(async (overlay) => {
      const img = new Image();
      img.src = overlay.url;
      await new Promise<void>((resolve) => {
        img.onload = () => resolve();
      });
      return { img, overlay };
    })
  );

  // Create MediaRecorder with fallback codec options
  let mimeType = "video/webm;codecs=vp9";
  if (!MediaRecorder.isTypeSupported(mimeType)) {
    mimeType = "video/webm;codecs=vp8";
    if (!MediaRecorder.isTypeSupported(mimeType)) {
      mimeType = "video/webm";
    }
  }

  const stream = canvas.captureStream(30);
  const mediaRecorder = new MediaRecorder(stream, {
    mimeType,
    videoBitsPerSecond: 8000000,
  });

  const chunks: Blob[] = [];
  mediaRecorder.ondataavailable = (e) => chunks.push(e.data);

  // Adjust total frames if video is trimmed
  const startFrame = trim ? Math.floor(trim.start * 30) : 0;
  const endFrame = trim ? Math.floor(trim.end * 30) : Math.floor(duration * 30);
  const totalFrames = endFrame - startFrame;

  return new Promise((resolve, reject) => {
    mediaRecorder.onstop = () => {
      const blob = new Blob(chunks, { type: mimeType });
      resolve(blob);
    };

    // Start recording
    mediaRecorder.start();

    // Render frame by frame
    let currentFrame = 0;

    function renderFrame() {
      if (currentFrame >= totalFrames) {
        mediaRecorder.stop();
        return;
      }

      // Adjust current time based on trim points
      const currentTime = trim
        ? trim.start + currentFrame / 30
        : currentFrame / 30;

      video.currentTime = currentTime;

      // Clear canvas
      ctx!.clearRect(0, 0, canvas.width, canvas.height);

      // Draw video frame
      ctx!.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Draw overlays
      overlays.text
        .filter(
          (o) =>
            currentTime >= o.timestamp &&
            currentTime <= o.timestamp + o.duration
        )
        .forEach((overlay) => {
          ctx!.font = `${overlay.fontSize}px ${overlay.fontFamily}`;
          ctx!.fillStyle = overlay.color;
          ctx!.textAlign = "center";
          const x = (overlay.position.x / 100) * canvas.width;
          const y = (overlay.position.y / 100) * canvas.height;
          ctx!.fillText(overlay.text, x, y);
        });

      imageElements
        .filter(
          ({ overlay }) =>
            currentTime >= overlay.timestamp &&
            currentTime <= overlay.timestamp + overlay.duration
        )
        .forEach(({ img, overlay }) => {
          const x = (overlay.position.x / 100) * canvas.width;
          const y = (overlay.position.y / 100) * canvas.height;
          const width = (overlay.size.width / 100) * canvas.width;
          const height = (overlay.size.height / 100) * canvas.height;

          ctx!.drawImage(img, x - width / 2, y - height / 2, width, height);
        });

      currentFrame++;
      progressCallback((currentFrame / totalFrames) * 100);
      requestAnimationFrame(renderFrame);
    }

    // Start rendering
    video
      .play()
      .then(() => {
        video.pause();
        renderFrame();
      })
      .catch(reject);
  });
}

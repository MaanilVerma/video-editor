"use client";
import { useRef, useState, useEffect } from "react";
import { useEditorStore } from "@/lib/store/editor-store";
import { Timeline } from "./timeline/Timeline";
import { VideoOverlays } from "./overlays/VideoOverlays";
import { VideoExport } from "./export/VideoExport";
import { useHotkeys } from "@/hooks/use-hotkeys";
import { toast } from "sonner";
import { Controls } from "./controls/Controls";
import { TimelineMode } from "@/lib/models/timeline";
import { trimVideo } from "@/lib/video-utils";
import { EmptyState } from "./EmptyState";

export function VideoEditor() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [mode, setMode] = useState<TimelineMode>(TimelineMode.SCRUB);

  const {
    videoFile,
    videoUrl,
    setVideoFile,
    setDuration,
    currentTime,
    setCurrentTime,
    textOverlays,
    imageOverlays,
    duration,
    trimStart,
    trimEnd,
    cleanup,
  } = useEditorStore();

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  // Initialize store on mount
  useEffect(() => {
    const initStore = async () => {
      try {
        setIsLoading(true);
        await useEditorStore.getState().initializeStore();
      } catch (error) {
        console.error("Error initializing store:", error);
        toast.error("Failed to restore previous session");
      } finally {
        setIsLoading(false);
      }
    };

    initStore();
  }, []);

  // Handle video playback controls
  const togglePlayPause = () => {
    if (!videoRef.current) return;

    if (isPlaying) {
      videoRef.current.pause();
    } else {
      // Reset to appropriate start point
      if (mode === TimelineMode.TRIM) {
        videoRef.current.currentTime = trimStart;
        setCurrentTime(trimStart);
      } else if (currentTime >= duration) {
        videoRef.current.currentTime = 0;
        setCurrentTime(0);
      }
      videoRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  // Handle keyboard shortcuts
  useHotkeys([
    ["space", togglePlayPause],
    [
      "left",
      () => {
        if (videoRef.current) {
          videoRef.current.currentTime = Math.max(0, currentTime - 5);
        }
      },
    ],
    [
      "right",
      () => {
        if (videoRef.current) {
          videoRef.current.currentTime = Math.min(
            videoRef.current.duration,
            currentTime + 5
          );
        }
      },
    ],
  ]);

  // Handle file upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsLoading(true);

      // Validate file type and size
      if (!file.type.startsWith("video/")) {
        throw new Error("Please upload a valid video file");
      }

      if (file.size > 100 * 1024 * 1024) {
        // 100MB limit
        throw new Error("File size should be less than 100MB");
      }

      setVideoFile(file);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to upload video"
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Handle video metadata loaded
  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      const newDuration = videoRef.current.duration;
      setDuration(newDuration);
      console.log("Video metadata loaded, duration:", newDuration);
    }
  };

  // Handle time updates
  const handleTimeUpdate = () => {
    if (!videoRef.current) return;

    const currentTime = videoRef.current.currentTime;
    const videoDuration = videoRef.current.duration;

    if (mode === TimelineMode.TRIM) {
      console.log("Trim mode time update:", {
        currentTime,
        trimStart,
        trimEnd,
      });

      if (currentTime >= trimEnd) {
        videoRef.current.pause();
        setIsPlaying(false);
        videoRef.current.currentTime = trimStart;
        setCurrentTime(trimStart);
      } else if (currentTime < trimStart) {
        videoRef.current.currentTime = trimStart;
        setCurrentTime(trimStart);
      } else {
        setCurrentTime(currentTime);
      }
    } else {
      // In scrub mode, ensure we stay within video bounds
      if (currentTime >= videoDuration) {
        videoRef.current.pause();
        setIsPlaying(false);
        videoRef.current.currentTime = 0;
        setCurrentTime(0);
      } else {
        console.log("Scrub mode time update:", { currentTime });
        setCurrentTime(currentTime);
      }
    }
  };

  const handleVideoError = (
    e: React.SyntheticEvent<HTMLVideoElement, Event>
  ) => {
    const video = e.currentTarget;
    toast.error(
      video.error?.message || "An error occurred while loading the video"
    );
    setVideoFile(null); // Reset the video file
  };

  const handleVideoEnded = () => {
    setIsPlaying(false);
    if (videoRef.current) {
      // Always reset to start when video ends
      videoRef.current.currentTime = 0;
      setCurrentTime(0);
    }
  };

  const handleTrimApply = async () => {
    if (!videoFile) {
      toast.error("No video file to trim");
      return;
    }

    try {
      setIsPlaying(false); // Ensure playback is stopped
      setIsLoading(true);
      console.log("Starting trim operation:", { trimStart, trimEnd, duration });

      // Trim the video using FFmpeg
      const trimmedFile = await trimVideo(videoFile, trimStart, trimEnd);
      console.log("Video trimmed successfully, new file:", trimmedFile);

      // Reset timeline state before updating video
      setCurrentTime(0);

      // Update the video file in the store
      setVideoFile(trimmedFile);

      // Switch to scrub mode
      setMode(TimelineMode.SCRUB);

      // Ensure video is reset to start
      if (videoRef.current) {
        videoRef.current.currentTime = 0;
      }

      toast.success("Video trimmed successfully");
    } catch (error) {
      console.error("Error trimming video:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to trim video"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-zinc-900 to-zinc-950 rounded-xl">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-zinc-800">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-semibold text-zinc-100">Video Editor</h1>
        </div>
        <VideoExport />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col gap-4 p-4 md:p-6 max-w-7xl mx-auto w-full animate-fade-in">
        {/* Video preview */}
        <div className="relative aspect-video bg-zinc-900 rounded-xl overflow-hidden border border-zinc-800/50 shadow-2xl video-container">
          {isLoading ? (
            <div className="absolute inset-0 flex items-center justify-center animate-fade-in">
              <div className="w-8 h-8 border-2 border-white/20 border-t-white/80 rounded-full animate-spin" />
            </div>
          ) : videoFile && videoUrl ? (
            <>
              <video
                ref={videoRef}
                src={videoUrl}
                className="w-full h-full object-contain animate-fade-in"
                onLoadedMetadata={handleLoadedMetadata}
                onTimeUpdate={handleTimeUpdate}
                onEnded={handleVideoEnded}
                onError={handleVideoError}
              />
              <div className="absolute inset-0 overflow-visible">
                <VideoOverlays
                  textOverlays={textOverlays}
                  imageOverlays={imageOverlays}
                  currentTime={currentTime}
                />
              </div>
            </>
          ) : (
            <EmptyState onUpload={handleFileUpload} isLoading={isLoading} />
          )}
        </div>

        {videoFile && videoUrl && (
          <>
            {/* Timeline section */}
            <div className="bg-zinc-900/50 rounded-xl border border-zinc-800/50 backdrop-blur-sm animate-fade-in">
              <Timeline
                videoRef={videoRef}
                isPlaying={isPlaying}
                mode={mode}
                onModeChange={setMode}
                onTrimApply={handleTrimApply}
              />
            </div>

            {/* Controls */}
            <div className="flex justify-center">
              <Controls
                videoRef={videoRef}
                isPlaying={isPlaying}
                onPlayPause={togglePlayPause}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

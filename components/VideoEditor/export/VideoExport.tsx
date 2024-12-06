import { useState, useCallback } from "react";
import { useEditorStore } from "@/lib/store/editor-store";
import { Button } from "@/components/ui/button";
import { exportVideo } from "@/lib/video-utils";
import { toast } from "sonner";
import { Settings2, Download, FileX, RotateCcw } from "lucide-react";
import { ExportProgress } from "./ExportProgress";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function VideoExport() {
  const [isExporting, setIsExporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [quality, setQuality] = useState<"low" | "medium" | "high">("medium");
  const [format, setFormat] = useState<"mp4" | "webm">("mp4");

  const { videoFile, textOverlays, imageOverlays, trimStart, trimEnd } =
    useEditorStore();

  const handleExport = async () => {
    if (!videoFile) {
      toast.error("No video to export");
      return;
    }

    try {
      setIsExporting(true);
      setProgress(0);

      const exportedFile = await exportVideo(videoFile, {
        textOverlays,
        imageOverlays,
        trimStart,
        trimEnd,
        quality,
        format,
        onProgress: (value) => {
          setProgress(Math.min(value, 99)); // Keep at 99 until complete
          if (value >= 100) {
            toast.success("Processing complete, preparing download...");
            setProgress(100);
          }
        },
      });

      // Create download link
      const url = URL.createObjectURL(exportedFile);
      const a = document.createElement("a");
      a.href = url;
      a.download = exportedFile.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success("Video exported successfully");
    } catch (error) {
      console.error("Export failed:", error);
      toast.error(
        error instanceof Error
          ? `Export failed: ${error.message}`
          : "Failed to export video"
      );
    } finally {
      setIsExporting(false);
      setProgress(0);
    }
  };

  const handleResetVideo = () => {
    try {
      // Reset everything
      useEditorStore.getState().cleanup();

      // Clear any file input
      const fileInput = document.querySelector(
        'input[type="file"]'
      ) as HTMLInputElement;
      if (fileInput) {
        fileInput.value = "";
      }

      // Show success message
      toast.success("Ready for new video");
    } catch (error) {
      console.error("Error resetting editor:", error);
      toast.error("Failed to reset editor");
    }
  };

  return (
    <div className="relative flex items-center gap-2 animate-fade-in">
      <Button
        variant="outline"
        size="icon"
        className="h-8 w-8"
        onClick={handleResetVideo}
        title="Reset"
      >
        <RotateCcw className="h-4 w-4" />
      </Button>

      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="icon" className="h-8 w-8">
            <Settings2 className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-56" align="end">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Quality</label>
              <Select value={quality} onValueChange={(v: any) => setQuality(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Fast (Lower Quality)</SelectItem>
                  <SelectItem value="medium">Balanced</SelectItem>
                  <SelectItem value="high">High Quality</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Format</label>
              <Select value={format} onValueChange={(v: any) => setFormat(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mp4">MP4</SelectItem>
                  <SelectItem value="webm">WebM</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      <Button
        onClick={handleExport}
        disabled={isExporting || !videoFile}
        className="h-8"
      >
        <div className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          <span>Export</span>
        </div>
      </Button>

      <ExportProgress
        progress={progress}
        onCancel={isExporting ? () => setIsExporting(false) : undefined}
      />
    </div>
  );
}

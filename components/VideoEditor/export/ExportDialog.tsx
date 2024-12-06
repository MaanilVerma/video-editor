import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { Download, Settings } from "lucide-react";
import { videoProcessor } from "@/lib/services/video-processor";
import { useEditorStore } from "@/lib/store/editor-store";

const EXPORT_FORMATS = [
  { value: "mp4", label: "MP4 (H.264)", codec: "libx264" },
  { value: "webm", label: "WebM (VP9)", codec: "libvpx-vp9" },
  { value: "mov", label: "QuickTime (H.264)", codec: "libx264" },
];

const QUALITY_PRESETS = [
  { value: "high", label: "High Quality", crf: 18 },
  { value: "medium", label: "Medium Quality", crf: 23 },
  { value: "low", label: "Low Quality", crf: 28 },
];

export function ExportDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [format, setFormat] = useState(EXPORT_FORMATS[0]);
  const [quality, setQuality] = useState(QUALITY_PRESETS[1]);
  const [customCrf, setCustomCrf] = useState(quality.crf);
  const [progress, setProgress] = useState(0);
  const [exporting, setExporting] = useState(false);

  const { videoFile, trimStart, trimEnd, textOverlays, imageOverlays } =
    useEditorStore();

  const handleExport = async () => {
    if (!videoFile) return;

    try {
      setExporting(true);

      const processedVideo = await videoProcessor.processVideo(videoFile, {
        quality: customCrf,
        codec: format.codec,
        onProgress: setProgress,
      });

      // Create download link
      const url = URL.createObjectURL(processedVideo);
      const a = document.createElement("a");
      a.href = url;
      a.download = `exported-video.${format.value}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setIsOpen(false);
    } catch (error) {
      console.error("Export failed:", error);
    } finally {
      setExporting(false);
      setProgress(0);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <Settings className="w-4 h-4 mr-2" />
          Export Settings
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Export Video</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Format</label>
            <Select
              value={format.value}
              onValueChange={(value) =>
                setFormat(EXPORT_FORMATS.find((f) => f.value === value)!)
              }
            >
              {EXPORT_FORMATS.map((format) => (
                <option key={format.value} value={format.value}>
                  {format.label}
                </option>
              ))}
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Quality Preset</label>
            <Select
              value={quality.value}
              onValueChange={(value) => {
                const newQuality = QUALITY_PRESETS.find(
                  (q) => q.value === value
                )!;
                setQuality(newQuality);
                setCustomCrf(newQuality.crf);
              }}
            >
              {QUALITY_PRESETS.map((preset) => (
                <option key={preset.value} value={preset.value}>
                  {preset.label}
                </option>
              ))}
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Custom Quality (CRF)</label>
            <Slider
              value={[customCrf]}
              min={0}
              max={51}
              step={1}
              onValueChange={([value]) => setCustomCrf(value)}
            />
            <span className="text-xs text-muted-foreground">
              Lower values mean better quality (0-51)
            </span>
          </div>

          {exporting && (
            <div className="space-y-2">
              <Progress value={progress} />
              <p className="text-sm text-center">{Math.round(progress)}%</p>
            </div>
          )}

          <Button
            onClick={handleExport}
            disabled={exporting}
            className="w-full"
          >
            <Download className="w-4 h-4 mr-2" />
            {exporting ? "Exporting..." : "Export"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

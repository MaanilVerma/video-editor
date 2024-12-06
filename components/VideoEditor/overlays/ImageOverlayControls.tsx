import { useState } from "react";
import { useEditorStore } from "@/lib/store/editor-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Image, Plus } from "lucide-react";
import { DurationInput } from "@/components/VideoEditor/controls/DurationInput";
import { cn } from "@/lib/utils";

export function ImageOverlayControls() {
  const [isUploading, setIsUploading] = useState(false);
  const [duration, setDuration] = useState(5);
  const [uploadedImage, setUploadedImage] = useState<{
    url: string;
    file: File;
  } | null>(null);
  const { currentTime, addImageOverlay } = useEditorStore();

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const url = URL.createObjectURL(file);
      setUploadedImage({ url, file });
    } catch (error) {
      console.error("Failed to upload image:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleAddImage = async (file: File) => {
    const id = crypto.randomUUID();

    // Get container dimensions
    const container = document.querySelector(".video-container");
    const containerWidth = container?.clientWidth || 0;
    const containerHeight = container?.clientHeight || 0;

    // Calculate center position
    const centerX = (containerWidth - 200) / 2; // 200 is default width
    const centerY = (containerHeight - 200) / 2; // 200 is default height

    addImageOverlay({
      id,
      file,
      url: URL.createObjectURL(file),
      position: {
        x: centerX,
        y: centerY,
      },
      size: { width: 200, height: 200 },
      timestamp: 0,
      duration: 5,
    });
  };

  return (
    <div className="space-y-4 animate-fade-in">
      {!uploadedImage ? (
        <div className="space-y-2">
          <Input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageUpload}
            disabled={isUploading}
            id="image-upload"
          />
          <Button
            variant="outline"
            className={cn(
              "w-full h-32 flex flex-col items-center justify-center gap-2",
              "border-2 border-dashed border-white/20 hover:border-white/40",
              "bg-white/5 hover:bg-white/10 transition-all",
              "rounded-lg"
            )}
            onClick={() => document.getElementById("image-upload")?.click()}
            disabled={isUploading}
          >
            <Image className="w-8 h-8 text-white/40" />
            <span className="text-sm text-white/60">Click to Upload Image</span>
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="relative aspect-video rounded-lg overflow-hidden bg-black/20 backdrop-blur-sm border border-white/10">
            <img
              src={uploadedImage.url}
              alt="Preview"
              className="w-full h-full object-contain"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-white/80">Duration (seconds)</Label>
            <DurationInput
              duration={duration}
              onChange={setDuration}
              maxDuration={30}
            />
          </div>

          <Button
            onClick={() => handleAddImage(uploadedImage.file)}
            className="w-full bg-white/10 hover:bg-white/20 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Image Overlay
          </Button>
        </div>
      )}
    </div>
  );
}

import { Upload, Film } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRef } from "react";

interface EmptyStateProps {
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isLoading: boolean;
}

export function EmptyState({ onUpload, isLoading }: EmptyStateProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="relative flex flex-col items-center justify-center h-full p-8 rounded-xl border-2 border-dashed border-red-500/20 bg-gradient-to-b from-red-500/5 to-transparent">
      <div className="absolute inset-0 bg-grid-white/5 [mask-image:linear-gradient(0deg,transparent,black)] pointer-events-none" />

      <Film className="w-16 h-16 text-zinc-200/40 mb-4" />
      <h3 className="text-xl font-semibold text-zinc-200 mb-2">
        No Video Selected
      </h3>
      <p className="text-sm text-red-500/60 text-center max-w-md mb-6">
        Upload a video to start editing. Add text overlays, images, and create
        stunning visual content.
      </p>

      <input
        ref={fileInputRef}
        type="file"
        accept="video/*"
        className="hidden"
        onChange={onUpload}
        disabled={isLoading}
      />
      <Button
        onClick={handleButtonClick}
        disabled={isLoading}
        className="bg-red-500 hover:bg-red-600 text-white gap-2"
      >
        <Upload className="w-4 h-4" />
        {isLoading ? "Uploading..." : "Upload Video"}
      </Button>
    </div>
  );
}

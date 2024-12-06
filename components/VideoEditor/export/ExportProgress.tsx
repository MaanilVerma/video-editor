import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

interface ExportProgressProps {
  progress: number;
  onCancel?: () => void;
}

export function ExportProgress({ progress, onCancel }: ExportProgressProps) {
  return (
    <AnimatePresence>
      {progress > 0 && (
        <motion.div
          initial={{ y: 0, opacity: 0 }}
          animate={{ y: -48, opacity: 1 }}
          exit={{ y: 0, opacity: 0 }}
          className="absolute right-0 flex items-center gap-2 px-3 py-1.5 bg-zinc-900/95 rounded-lg shadow-lg backdrop-blur-sm border border-zinc-800"
        >
          <div className="flex items-center gap-2.5">
            {/* Circular Progress */}
            <div className="relative w-4 h-4">
              <svg className="w-4 h-4 -rotate-90" viewBox="0 0 24 24">
                {/* Background circle */}
                <circle
                  className="fill-none stroke-zinc-800"
                  cx="12"
                  cy="12"
                  r="10"
                  strokeWidth="2.5"
                />
                {/* Progress circle */}
                <circle
                  className="fill-none stroke-emerald-500/90"
                  cx="12"
                  cy="12"
                  r="10"
                  strokeWidth="2.5"
                  strokeDasharray={`${(progress / 100) * 62.83} 62.83`}
                  strokeLinecap="round"
                  style={{
                    filter: "drop-shadow(0 0 2px rgb(16 185 129 / 0.3))",
                  }}
                />
              </svg>
              {/* Optional: Add a pulsing dot in the center */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/90 animate-pulse" />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-zinc-200">
                Exporting...
              </span>
              <span className="text-xs font-medium text-emerald-500">
                {Math.round(progress)}%
              </span>
            </div>

            {onCancel && (
              <button
                onClick={onCancel}
                className="ml-1 p-1 hover:bg-zinc-800/80 rounded-full transition-colors"
              >
                <X className="h-3 w-3 text-zinc-400 hover:text-zinc-300" />
              </button>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

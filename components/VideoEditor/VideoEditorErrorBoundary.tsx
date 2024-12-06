import { ErrorBoundary } from "@/components/error-boundary";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

export function VideoEditorErrorBoundary({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ErrorBoundary
      fallback={
        <div className="flex flex-col items-center justify-center min-h-[400px] p-4 space-y-4">
          <AlertCircle className="w-12 h-12 text-destructive" />
          <div className="text-center">
            <h3 className="text-lg font-semibold">Something went wrong</h3>
            <p className="text-sm text-muted-foreground mt-1">
              There was an error processing your video. Please try again.
            </p>
          </div>
          <Button onClick={() => window.location.reload()}>
            Reload Editor
          </Button>
        </div>
      }
    >
      {children}
    </ErrorBoundary>
  );
}

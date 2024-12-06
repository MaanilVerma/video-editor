import { Button } from "@/components/ui/button";
import { Plus, Type, Image as ImageIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TextOverlayControls } from "../overlays/TextOverlayControls";
import { ImageOverlayControls } from "../overlays/ImageOverlayControls";
import { cn } from "@/lib/utils";

export function OverlayControls() {
  return (
    <div className="relative backdrop-blur-md bg-black/30 rounded-xl border border-white/10 shadow-2xl animate-fade-in overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-secondary/10 pointer-events-none" />

      <div className="relative p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-white/90">
              Overlay Controls
            </h3>
            <p className="text-xs text-white/60">
              Add and manage your overlays
            </p>
          </div>

          <Dialog>
            <DialogTrigger asChild>
              <Button
                size="sm"
                className="bg-white/10 hover:bg-white/20 text-white border-white/20"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Overlay
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] bg-background/95 backdrop-blur-md border-white/20">
              <DialogHeader>
                <DialogTitle className="text-lg font-semibold text-white/90">
                  Add New Overlay
                </DialogTitle>
              </DialogHeader>
              <Tabs defaultValue="text" className="w-full">
                <TabsList className="w-full grid grid-cols-2 p-1 bg-black/20 rounded-lg">
                  <TabsTrigger
                    value="text"
                    className={cn(
                      "flex items-center gap-2 py-2 rounded-md",
                      "data-[state=active]:bg-white/10",
                      "data-[state=active]:text-white",
                      "transition-colors"
                    )}
                  >
                    <Type className="w-4 h-4" />
                    Text Overlay
                  </TabsTrigger>
                  <TabsTrigger
                    value="image"
                    className={cn(
                      "flex items-center gap-2 py-2 rounded-md",
                      "data-[state=active]:bg-white/10",
                      "data-[state=active]:text-white",
                      "transition-colors"
                    )}
                  >
                    <ImageIcon className="w-4 h-4" />
                    Image Overlay
                  </TabsTrigger>
                </TabsList>
                <div className="mt-6 p-4 bg-black/20 rounded-lg border border-white/10">
                  <TabsContent value="text" className="mt-0">
                    <TextOverlayControls />
                  </TabsContent>
                  <TabsContent value="image" className="mt-0">
                    <ImageOverlayControls />
                  </TabsContent>
                </div>
              </Tabs>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
}

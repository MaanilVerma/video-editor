import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AnimationData, Keyframe } from "@/lib/models/animations";
import { editorStorage } from "../utils/storage";

interface EditorState {
  videoFile: File | null;
  videoUrl: string | null;
  currentTime: number;
  duration: number;
  trimStart: number;
  trimEnd: number;
  textOverlays: TextOverlay[];
  imageOverlays: ImageOverlay[];
  animations: AnimationData[];
  setVideoFile: (file: File | null) => void;
  setCurrentTime: (time: number) => void;
  setDuration: (duration: number) => void;
  setTrimPoints: (start: number, end: number) => void;
  addTextOverlay: (overlay: TextOverlay) => void;
  updateTextOverlay: (id: string, overlay: Partial<TextOverlay>) => void;
  removeTextOverlay: (id: string) => void;
  addImageOverlay: (overlay: ImageOverlay) => void;
  updateImageOverlay: (id: string, overlay: Partial<ImageOverlay>) => void;
  removeImageOverlay: (id: string) => void;
  cleanup: () => void;
  addAnimation: (animation: AnimationData) => void;
  updateAnimation: (id: string, animation: Partial<AnimationData>) => void;
  removeAnimation: (id: string) => void;
  addKeyframe: (animationId: string, keyframe: Keyframe) => void;
  updateKeyframe: (
    animationId: string,
    keyframeId: string,
    keyframe: Partial<Keyframe>
  ) => void;
  removeKeyframe: (animationId: string, keyframeId: string) => void;
  initializeStore: () => void;
}

interface TextOverlay {
  id: string;
  text: string;
  position: { x: number; y: number };
  fontSize: number;
  fontFamily: string;
  color: string;
  timestamp: number;
  duration: number;
}

interface ImageOverlay {
  id: string;
  url: string;
  file?: File;
  position: { x: number; y: number };
  size: { width: number; height: number };
  timestamp: number;
  duration: number;
}

export const useEditorStore = create<EditorState>()(
  persist(
    (set, get) => ({
      videoFile: null,
      videoUrl: null,
      currentTime: 0,
      duration: 0,
      trimStart: 0,
      trimEnd: 0,
      textOverlays: [],
      imageOverlays: [],
      animations: [],

      setVideoFile: async (file) => {
        if (file) {
          try {
            const url = await editorStorage.storeVideo(file);
            set({
              videoFile: file,
              videoUrl: url,
              trimStart: 0,
              trimEnd: 0,
              currentTime: 0,
              duration: 0,
            });
          } catch (error) {
            console.error("Failed to store video:", error);
          }
        } else {
          await editorStorage.clearAll();
          set({
            videoFile: null,
            videoUrl: null,
            duration: 0,
            currentTime: 0,
            trimStart: 0,
            trimEnd: 0,
          });
        }
      },

      setCurrentTime: (time) => set({ currentTime: time }),
      setDuration: (duration) => {
        set({
          duration,
          trimEnd: duration,
        });
      },
      setTrimPoints: (start, end) => set({ trimStart: start, trimEnd: end }),

      addTextOverlay: (overlay) =>
        set((state) => ({
          textOverlays: [...state.textOverlays, overlay],
        })),

      updateTextOverlay: (id, overlay) =>
        set((state) => ({
          textOverlays: state.textOverlays.map((item) =>
            item.id === id ? { ...item, ...overlay } : item
          ),
        })),

      removeTextOverlay: (id) =>
        set((state) => ({
          textOverlays: state.textOverlays.filter((item) => item.id !== id),
        })),

      addImageOverlay: async (overlay: ImageOverlay) => {
        if (!overlay.file) {
          // For overlays without files (like during drag operations)
          set((state) => ({
            imageOverlays: [...state.imageOverlays, overlay],
          }));
          return;
        }

        try {
          // Create an immediate URL for smooth dragging experience
          const immediateUrl = URL.createObjectURL(overlay.file);

          // Add overlay immediately with temporary URL
          set((state) => ({
            imageOverlays: [
              ...state.imageOverlays,
              { ...overlay, url: immediateUrl },
            ],
          }));

          // Store in background and update URL later
          const base64Data = await editorStorage.storeOverlayImage(
            overlay.id,
            overlay.file
          );

          // Update with permanent base64 URL
          set((state) => ({
            imageOverlays: state.imageOverlays.map((o) =>
              o.id === overlay.id
                ? {
                    ...o,
                    url: base64Data,
                    file: undefined,
                  }
                : o
            ),
          }));

          // Cleanup temporary URL
          URL.revokeObjectURL(immediateUrl);
        } catch (error) {
          console.error("Failed to store overlay image:", error);
          throw error;
        }
      },

      updateImageOverlay: (id, overlay) =>
        set((state) => ({
          imageOverlays: state.imageOverlays.map((item) =>
            item.id === id ? { ...item, ...overlay } : item
          ),
        })),

      removeImageOverlay: (id) =>
        set((state) => ({
          imageOverlays: state.imageOverlays.filter((item) => item.id !== id),
        })),

      cleanup: () => {
        const state = get();
        // Revoke all URLs
        if (state.videoUrl) {
          URL.revokeObjectURL(state.videoUrl);
        }

        // Revoke any image overlay URLs
        state.imageOverlays.forEach((overlay) => {
          if (overlay.url?.startsWith("blob:")) {
            URL.revokeObjectURL(overlay.url);
          }
        });

        // Clear IndexedDB storage
        editorStorage.clearAll();

        // Reset all state
        set({
          videoFile: null,
          videoUrl: null,
          currentTime: 0,
          duration: 0,
          trimStart: 0,
          trimEnd: 0,
          textOverlays: [],
          imageOverlays: [],
          animations: [],
        });
      },

      addAnimation: (animation) =>
        set((state) => ({
          animations: [...state.animations, animation],
        })),

      updateAnimation: (id, animation) =>
        set((state) => ({
          animations: state.animations.map((a) =>
            a.id === id ? { ...a, ...animation } : a
          ),
        })),

      removeAnimation: (id) =>
        set((state) => ({
          animations: state.animations.filter((a) => a.id !== id),
        })),

      addKeyframe: (animationId, keyframe) =>
        set((state) => ({
          animations: state.animations.map((a) =>
            a.id === animationId
              ? { ...a, keyframes: [...a.keyframes, keyframe] }
              : a
          ),
        })),

      updateKeyframe: (animationId, keyframeId, keyframe) =>
        set((state) => ({
          animations: state.animations.map((a) =>
            a.id === animationId
              ? {
                  ...a,
                  keyframes: a.keyframes.map((k) =>
                    k.id === keyframeId ? { ...k, ...keyframe } : k
                  ),
                }
              : a
          ),
        })),

      removeKeyframe: (animationId, keyframeId) =>
        set((state) => ({
          animations: state.animations.map((a) =>
            a.id === animationId
              ? {
                  ...a,
                  keyframes: a.keyframes.filter((k) => k.id !== keyframeId),
                }
              : a
          ),
        })),

      initializeStore: async () => {
        console.log("=== Starting store initialization ===");
        try {
          const videoFile = await editorStorage.getVideo();
          const videoUrl = await editorStorage.getVideoUrl();

          if (videoFile && videoUrl) {
            console.log("Restored video successfully");
            set({ videoFile, videoUrl });
          }

          // Restore overlay images
          const state = get();
          console.log("Found overlays to restore:", state.imageOverlays.length);

          for (const overlay of state.imageOverlays) {
            console.log("=== Restoring overlay ===");
            console.log("Overlay data:", {
              id: overlay.id,
              hasUrl: !!overlay.url,
              urlLength: overlay.url?.length,
              timestamp: overlay.timestamp,
              duration: overlay.duration,
            });

            // No need to fetch from storage if we already have the base64 data
            if (overlay.url) {
              console.log("Using existing base64 URL");
              continue;
            }

            try {
              const url = await editorStorage.getOverlayImageUrl(overlay.id);
              if (url) {
                console.log("Retrieved new URL from storage");
                set((state) => ({
                  imageOverlays: state.imageOverlays.map((o) =>
                    o.id === overlay.id ? { ...o, url } : o
                  ),
                }));
              }
            } catch (error) {
              console.error("Error restoring overlay:", overlay.id, error);
            }
          }

          console.log("=== Store initialization complete ===");
        } catch (error) {
          console.error("Error during store initialization:", error);
        }
      },
    }),
    {
      name: "video-editor-storage",
      partialize: (state) => {
        const partialState = {
          currentTime: state.currentTime,
          duration: state.duration,
          trimStart: state.trimStart,
          trimEnd: state.trimEnd,
          textOverlays: state.textOverlays,
          imageOverlays: state.imageOverlays.map((overlay) => {
            const { file, ...rest } = overlay;
            // Don't warn about temporary blob URLs
            if (
              !rest.url ||
              (!rest.url.startsWith("data:") && !rest.url.startsWith("blob:"))
            ) {
              console.warn("Missing URL for overlay:", overlay.id);
            }
            return rest;
          }),
          animations: state.animations,
        };

        console.log("Persisting state:", {
          overlayCount: partialState.imageOverlays.length,
          overlayDetails: partialState.imageOverlays.map((o) => ({
            id: o.id,
            hasValidUrl: o.url?.length > 100,
          })),
        });

        return partialState;
      },
      onRehydrateStorage: () => (state) => {
        console.log("Store rehydrated with state:", state?.imageOverlays);
        if (state) {
          state.initializeStore();
        }
      },
    }
  )
);

import { openDB, DBSchema, IDBPDatabase } from "idb";

interface EditorDB extends DBSchema {
  "video-files": {
    key: string;
    value: {
      file: Blob;
      name: string;
      type: string;
      lastModified: number;
    };
  };
  "overlay-images": {
    key: string;
    value: {
      file: string;
      name: string;
      type: string;
      lastModified: number;
    };
  };
}

class EditorStorage {
  private db: IDBPDatabase<EditorDB> | null = null;

  async init() {
    this.db = await openDB<EditorDB>("editor-storage", 1, {
      upgrade(db) {
        db.createObjectStore("video-files");
        db.createObjectStore("overlay-images");
      },
    });
  }

  private async fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        if (!result || !result.startsWith("data:image/")) {
          console.error("Invalid image data:", result?.substring(0, 50));
          reject(new Error("Invalid image data"));
          return;
        }
        console.log("Generated base64:", {
          total: result.length,
          prefix: result.substring(0, 50),
          suffix: result.substring(result.length - 50),
        });
        resolve(result);
      };
      reader.onerror = (error) => {
        console.error("Error reading file:", error);
        reject(error);
      };
      reader.readAsDataURL(file);
    });
  }

  async storeOverlayImage(id: string, file: File) {
    if (!this.db) await this.init();

    try {
      console.log("Processing image:", {
        name: file.name,
        type: file.type,
        size: file.size,
      });

      const base64Data = await this.fileToBase64(file);

      // Store in IndexedDB
      const data = {
        file: base64Data,
        name: file.name,
        type: file.type,
        lastModified: file.lastModified,
      };

      await this.db!.put("overlay-images", data, id);

      // Verify storage
      const stored = await this.db!.get("overlay-images", id);
      if (!stored || stored.file.length !== base64Data.length) {
        console.error("Storage verification failed:", {
          original: base64Data.length,
          stored: stored?.file.length,
        });
        throw new Error("Storage verification failed");
      }

      console.log("Image stored successfully:", {
        id,
        size: base64Data.length,
        type: file.type,
      });

      return base64Data;
    } catch (error) {
      console.error("Error storing overlay image:", error);
      throw error;
    }
  }

  async getOverlayImageUrl(id: string) {
    if (!this.db) await this.init();

    try {
      const data = await this.db!.get("overlay-images", id);
      if (!data) {
        console.log("No data found in storage for:", id);
        return null;
      }

      console.log("Retrieved base64 data length:", data.file.length);
      if (!data.file.startsWith("data:")) {
        console.error(
          "Retrieved invalid base64 format:",
          data.file.substring(0, 50)
        );
        return null;
      }

      return data.file;
    } catch (error) {
      console.error("Error getting overlay image:", error);
      return null;
    }
  }

  async storeVideo(file: File) {
    if (!this.db) await this.init();

    // Store file data
    const arrayBuffer = await file.arrayBuffer();
    await this.db!.put(
      "video-files",
      {
        file: new Blob([arrayBuffer], { type: file.type }),
        name: file.name,
        type: file.type,
        lastModified: file.lastModified,
      },
      "current-video"
    );

    return URL.createObjectURL(file);
  }

  async getVideo() {
    if (!this.db) await this.init();
    const data = await this.db!.get("video-files", "current-video");
    if (!data) return null;

    return new File([data.file], data.name, {
      type: data.type,
      lastModified: data.lastModified,
    });
  }

  async getVideoUrl() {
    if (!this.db) await this.init();
    const data = await this.db!.get("video-files", "current-video");
    if (!data) return null;

    return URL.createObjectURL(data.file);
  }

  async getOverlayImage(id: string) {
    if (!this.db) await this.init();
    const data = await this.db!.get("overlay-images", id);
    if (!data) return null;

    const blob = this.base64ToBlob(data.file, data.type);
    return new File([blob], data.name, {
      type: data.type,
      lastModified: data.lastModified,
    });
  }

  private base64ToBlob(base64: string, type: string): Blob {
    try {
      console.log("Converting base64 to blob, type:", type);
      const parts = base64.split(",");
      if (parts.length !== 2) {
        console.error("Invalid base64 format");
        throw new Error("Invalid base64 format");
      }

      const byteString = atob(parts[1]);
      console.log("Decoded base64, length:", byteString.length);

      const ab = new ArrayBuffer(byteString.length);
      const ia = new Uint8Array(ab);

      for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
      }

      const blob = new Blob([ab], { type });
      console.log("Created blob:", blob.size, "bytes");
      return blob;
    } catch (error) {
      console.error("Error in base64ToBlob:", error);
      throw error;
    }
  }

  async clearAll() {
    if (!this.db) await this.init();

    // Clear stores
    await this.db!.clear("video-files");
    await this.db!.clear("overlay-images");
  }
}

export const editorStorage = new EditorStorage();

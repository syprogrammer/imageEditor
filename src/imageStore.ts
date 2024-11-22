import { Area } from "react-easy-crop";
import { create } from "zustand";
import { devtools } from "zustand/middleware";

// Define the `ImageData` type
export interface ImageData {
  id: number;
  src: string;
  crop: { x: number; y: number };
  zoom: number;
  rotation: number;
  brightness: number;
  contrast: number;
  croppedAreaPixels: Area | null;
}

export interface ImageStore {
  images: ImageData[]; // Array of ImageData objects
  addImages: (newImages: string[]) => void; // Adds new images to the store
 removeImage: (id: number) => Promise<void>;
  updateImageData: (id: number, newData: Partial<ImageData>) => void; // Updates properties of a specific image
  saveImages: () => void; // Save images (example logic)
  clearImages: () => void; // Clears all images
}

const useImageStore = create<ImageStore>()(
  devtools((set, get) => ({
    images: [], // Initialize with an empty array
    addImages: (newImages: string[]) =>
      set((state) => ({
        images: [
          ...state.images,
          ...newImages.map((src, index) => ({
            id: Date.now() + index,
            src,
            crop: { x: 0, y: 0 },
            zoom: 1,
            brightness: 100,
            contrast: 100,
            croppedAreaPixels: null,
            rotation: 0, // Initialize rotation to 0
          })),
        ],
      })),
    removeImage: (id: number) => {
      return new Promise<void>((resolve, reject) => {
        const images = get().images;
        console.log("zustand remove image id ", id, images);

        // Check if the image exists
        const imageExists = images.some((img) => img.id === id);

        if (!imageExists) {
          reject(new Error("Image not found"));
          return;
        }

        set((state) => ({
          images: state.images.filter((img) => img.id !== id),
        }));

        resolve(); // Resolve after successfully updating the state
      });
    },

    updateImageData: (id: number, newData: Partial<ImageData>) =>
      set((state) => ({
        images: state.images.map((img: ImageData) =>
          img.id === id ? { ...img, ...newData } : img
        ),
      })),
    saveImages: () => {
      // Example save logic (you can expand it to save images as needed)
      console.log("Saving images:", get().images);
    },
    clearImages: () => set(() => ({ images: [] })),
  }))
);

export { useImageStore }; // Make sure to export the hook and the type

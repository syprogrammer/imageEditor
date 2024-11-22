import React, { useState, useRef, useCallback } from "react";
import Cropper, { Area } from "react-easy-crop";

import "./ImageEditor.css";
import { getCroppedImg } from "./CropImage";
import { ImageData, useImageStore } from "./imageStore";
import { ArrowLeft, Contrast, MoveLeft, RefreshCw, Sun, Trash2 } from "lucide-react";
import { Slider } from "./components/ui/slider";
// import { ImageData, useImageStore } from "./imageStore";



interface ImageEditorProps {
  images?: string[];
  onGoBack: () => void; // Callback to go back to ImagePicker
}

const ImageEditor: React.FC<ImageEditorProps> = ({ onGoBack }) => {
  // Access the Zustand store using useImageStore
  // const { images,saveImages } = useImageStore()
  // // const [images, setImages] = useState<ImageData[]>([]);
  // const [activeImageId, setActiveImageId] = useState<number | null>(null);

  // const fileInputRef = useRef<HTMLInputElement | null>(null);

  // const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   if (e.target.files) {
  //     const filesArray = Array.from(e.target.files).map((file, index) => ({
  //       id: Date.now() + index,
  //       src: URL.createObjectURL(file),
  //       crop: { x: 0, y: 0 },
  //       zoom: 1,
  //       rotation: 0,
  //       brightness: 100,
  //       contrast: 100,
  //       croppedAreaPixels: null,
  //     }));
  //     saveImages((prev) => [...prev, ...filesArray]);
  //     if (filesArray.length > 0) setActiveImageId(filesArray[0].id);
  //   }
  // };

  // const handleCropComplete = useCallback(
  //   (id: number, _: Area, croppedAreaPixels: Area) => {
  //     setImages((prev) =>
  //       prev.map((img) =>
  //         img.id === id ? { ...img, croppedAreaPixels } : img
  //       )
  //     );
  //   },
  //   []
  // );

  // const handleSaveAll = async () => {
  //   for (const image of images) {
  //     const croppedImage = await getCroppedImg(
  //       image.src,
  //       image.croppedAreaPixels!,
  //       image.brightness,
  //       image.contrast,
  //       image.rotation
  //     );
  //     const link = document.createElement("a");
  //     link.href = croppedImage;
  //     link.download = `image-${image.id}.png`;
  //     link.click();
  //   }
  // };

  // const updateImageState = (id: number, key: keyof ImageData, value: any) => {
  //   setImages((prev) =>
  //     prev.map((img) => (img.id === id ? { ...img, [key]: value } : img))
  //   );
  // };

  // const activeImage = images.find((img) => img.id === activeImageId);
  const { images, updateImageData, addImages, removeImage } = useImageStore();

  const [activeImageId, setActiveImageId] = useState<number | null>(
    images.length > 0 ? images[0].id : null
  );

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files).map((file, index) => ({
        id: Date.now() + index,
        src: URL.createObjectURL(file),
        crop: { x: 0, y: 0 },
        zoom: 1,
        rotation: 0,
        brightness: 100,
        contrast: 100,
        croppedAreaPixels: null,
      }));
      addImages(filesArray.map((file) => file.src)); // Add new images to Zustand store
      if (filesArray.length > 0) setActiveImageId(filesArray[0].id);
    }
  };

  const handleCropComplete = useCallback(
    (id: number, _: Area, croppedAreaPixels: Area) => {
      updateImageData(id, { croppedAreaPixels }); // Update the croppedAreaPixels in the store
    },
    [updateImageData]
  );

  const handleSaveAll = async () => {
    // Wait for all image processing and download links to be created
    const downloadPromises = images.map(async (image) => {
      if (image.croppedAreaPixels) {
        // Assuming `getCroppedImg` returns a Blob or data URL for the cropped image
        const croppedImage = await getCroppedImg(
          image.src,
          image.croppedAreaPixels,
          image.brightness,
          image.contrast,
          image.rotation
        );

        // Create a temporary link to download the image
        const link = document.createElement("a");
        link.href = croppedImage;
        link.download = `image-${image.id}.png`;
        link.click(); // Trigger the download
      }
    });

    // Wait for all promises to complete before notifying the user or performing any other action
    await Promise.all(downloadPromises);
  };

  // Fix for TypeScript error: use keyof to ensure key is a valid key of ImageData
  const updateImageState = (id: number, key: keyof ImageData, value: any) => {
    updateImageData(id, { [key]: value });
  };


  const activeImage = images.find((img) => img.id === activeImageId);
  // Handle image removal
  const handleRemoveImage = async (id: number) => {
    await removeImage(id); // Remove image from the store

    const updatedImages = useImageStore.getState().images; // Access the latest images from the store

    if (updatedImages.length > 0) {
      setActiveImageId(updatedImages[0].id); // Set the new active image ID to the first image
    } else {
      setActiveImageId(null); // No images left, set active image ID to null
    }
  };
  return (
    <div className="p-4 w-full md:w-[400px] md:border">
      <div>
        <div className="flex justify-between items-center">
          <ArrowLeft className="text-blue-500" onClick={onGoBack} />
          <span className="text-blue-500">{1}/{images.length}</span>
          {
            activeImage && (
              <Trash2 size={16}
                onClick={() => handleRemoveImage(activeImage.id)}
                className="text-red-500 hover:font-bold cursor-pointer"
              />
            )
          }
        </div>
      </div>
      <div className="py-10">
        {activeImage && (
          <>
            <div className="crop-container bg-gray-50 border rounded-sm overflow-hidden">
              <Cropper
                image={activeImage.src}
                crop={activeImage.crop}
                zoom={activeImage.zoom}
                rotation={activeImage.rotation}
                aspect={1/1}
                // aspect={6 / 6} // You can change this aspect ratio if needed
                // cropSize={{ width: 400, height: 250 }} // Define the grid dimensions
                onCropChange={(crop) => updateImageState(activeImage.id, "crop", crop)}
                onZoomChange={(zoom) => updateImageState(activeImage.id, "zoom", zoom)}
                onCropComplete={(croppedArea, croppedAreaPixels) =>
                  handleCropComplete(activeImage.id, croppedArea, croppedAreaPixels)
                }
                style={{
                  containerStyle: {
                    filter: `brightness(${activeImage.brightness}%) contrast(${activeImage.contrast}%)`,
                    backgroundColor: '#F0F6FF', // Set the background to gray
                    opacity:1,
                  },
                }}

              />
            </div>

            <div className="controls">
              <div className="slider hidden">
                <Slider
                  className="w-full"
                  defaultValue={[activeImage.zoom]}
                  min={1}
                  max={3}
                  step={0.1}
                  onValueChange={(value) =>
                    updateImageData(activeImage.id, { zoom: value[0] })
                  }
                  // className=""
                />
              </div>
              <div className="flex gap-2 items-center">
                <Sun />
                <label>Brightness</label>
                <Slider
                  className="w-full"
                  defaultValue={[activeImage.brightness]}
                  min={50}
                  max={150}
                  step={1}
                  onValueChange={(value) =>
                    updateImageData(activeImage.id, { brightness: value[0] })
                  }
                />
              </div>
              <div className="flex gap-2 items-center">
                <Contrast />
                <label>Contrast</label>
                <Slider
                  className="w-full"
                  defaultValue={[activeImage.contrast]}
                  min={50}
                  max={150}
                  step={1}
                  onValueChange={(value) =>
                    updateImageData(activeImage.id, { contrast: value[0] })
                  }
                />
              </div>
              <div className="flex gap-2 items-center">
                <RefreshCw />
                <label>Rotation</label>
                <Slider
                  className="w-full"
                  defaultValue={[activeImage.rotation]}
                  min={0}
                  max={360}
                  step={1}
                  onValueChange={(value) =>
                    updateImageData(activeImage.id, { rotation: value[0] })
                  }
                />
              </div>
            </div>
          </>
        )}

        <div className="w-full p-2 my-4 ">

          {images.length > 0 && (
            <div className=" flex gap-2 w-full overflow-x-scroll">
              {images.map((image) => (
                <div
                  key={image.id}
                  className={`border-2 rounded-md p-1 w-[80px] h-[80px] shrink-0 object-contain ${activeImageId === image.id ? "border-blue-500 shadow-md" : ""
                    }`}
                  onClick={() => setActiveImageId(image.id)}
                >
                  {/* Image {image.id} */}
                  <img src={image.src} className="w-full h-full object-contain " />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="py-4 flex flex-row-reverse gap-2 items-center">
          {images.length > 0 && (
            <button
              className="w-[100px]"
              onClick={handleSaveAll}>Upload</button>
          )}
          {/* <button
            className="w-1/2 bg-tar"
            onClick={onGoBack}>Go Back</button> */}
        </div>
      </div>
    </div>
  );
};

export default ImageEditor;

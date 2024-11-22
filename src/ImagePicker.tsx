import React, { useEffect, useState } from "react";
import CameraCapture from "./CameraCapture";
import ImageEditor from "./ImageEditor";
import { useImageStore } from "./imageStore"; // Zustand store for images

const ImagePicker: React.FC = () => {
  const { images, addImages, removeImage } = useImageStore(); // Access Zustand store for images
  const [showEditor, setShowEditor] = useState(false); // Toggle editor visibility
  const [showCamera, setShowCamera] = useState(false); // Toggle camera view visibility

  // Handle image selection from gallery
  const handleGallerySelection = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedImages = Array.from(e.target.files).map((file) =>
        URL.createObjectURL(file) // Convert file to object URL
      );
      addImages(selectedImages); // Add selected images to the store
    }
  };

  // Handle image capture from camera
  const handleCapture = (imageSrc: string) => {
    addImages([imageSrc]); // Add captured image to the store
  };

  // Handle image removal
  const handleRemoveImage = (id: number) => {
    removeImage(id); // Remove image from the store
  };

  // Watch for image count to determine when to exit editor
  useEffect(() => {
    if (images.length === 0 && showEditor) {
      setShowEditor(false);
    }
  }, [images, showEditor]);

  return (
    <div className="image-picker">
      {/* Main content area where you choose either camera or gallery */}
      {!showEditor ? (
        <>
          <h2>Select an Option</h2>
          {!showCamera ? (
            <>
              {/* Button to trigger Camera capture */}
              <button onClick={() => setShowCamera(true)}>Click from Camera</button>

              {/* Gallery selection input */}
              <input
                type="file"
                accept="image/*"
                multiple
                id="galleryInput"
                onChange={handleGallerySelection}
              // style={{ display: "none" }} // Hide the default file input
              />
              <label htmlFor="galleryInput">
                <button>Select from Gallery</button>
              </label>
            </>
          ) : (
            // CameraCapture component to take photo
            <CameraCapture
              onCapture={handleCapture} // Handle captured image
              onClose={() => setShowCamera(false)} // Close the camera view
            />
          )}

          {/* Show selected images with remove option */}
          <div className="selected-images">
            {images.map((image, index) => (
              <div key={index} className="image-preview">
                <img src={image.src} alt={`selected-image-${index}`} width={100} height={100} />
                <button onClick={() => handleRemoveImage(image.id)}>Remove</button>
              </div>
            ))}
          </div>

          {/* Button to go to the editor when images are selected */}
          {images.length > 0 && !showCamera && (
            <button onClick={() => setShowEditor(true)}>Edit Images</button>
          )}
        </>
      ) : (
        // Show the ImageEditor component
        <ImageEditor onGoBack={() => setShowEditor(false)} />
      )}
    </div>
  );
};

export default ImagePicker;

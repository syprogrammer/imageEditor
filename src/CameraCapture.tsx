import React, { useRef } from "react";
import Webcam from "react-webcam";

interface CameraCaptureProps {
  onCapture: (imageSrc: string) => void;
  onClose: () => void;
}

const CameraCapture: React.FC<CameraCaptureProps> = ({ onCapture, onClose }) => {
  const webcamRef = useRef<Webcam>(null);

  const captureImage = () => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      if (imageSrc) {
        onCapture(imageSrc);
      }
    }
  };

  return (
    <div className="camera-capture">
      <Webcam
        audio={false}
        ref={webcamRef}
        screenshotFormat="image/jpeg"
        style={{
          width: "100%",
          height: "auto",
        }}
      />
      <button onClick={captureImage}>Capture</button>
      <button onClick={onClose}>Done</button>
    </div>
  );
};

export default CameraCapture;

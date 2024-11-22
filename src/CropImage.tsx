import { Area } from "react-easy-crop";

export const getCroppedImg = async (
  imageSrc: string,
  croppedAreaPixels: Area,
  brightness: number,
  contrast: number,
  rotation: number
): Promise<string> => {
  const createImage = (url: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = (error) => reject(error);
      img.src = url;
    });

  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx) throw new Error("Failed to get canvas context");

  const radians = (rotation * Math.PI) / 180;

  // Calculate canvas size to fit rotated image
  const canvasWidth =
    Math.abs(image.width * Math.cos(radians)) +
    Math.abs(image.height * Math.sin(radians));
  const canvasHeight =
    Math.abs(image.width * Math.sin(radians)) +
    Math.abs(image.height * Math.cos(radians));

  canvas.width = canvasWidth;
  canvas.height = canvasHeight;

  // Move context to the center and rotate
  ctx.translate(canvasWidth / 2, canvasHeight / 2);
  ctx.rotate(radians);
  ctx.translate(-image.width / 2, -image.height / 2);

  // Apply brightness and contrast
  ctx.filter = `brightness(${brightness}%) contrast(${contrast}%)`;

  // Draw the image onto the rotated canvas
  ctx.drawImage(image, 0, 0);

  // Create a second canvas for cropping
  const croppedCanvas = document.createElement("canvas");
  const croppedCtx = croppedCanvas.getContext("2d");

  if (!croppedCtx) throw new Error("Failed to get cropped canvas context");

  croppedCanvas.width = croppedAreaPixels.width;
  croppedCanvas.height = croppedAreaPixels.height;

  croppedCtx.drawImage(
    canvas,
    croppedAreaPixels.x,
    croppedAreaPixels.y,
    croppedAreaPixels.width,
    croppedAreaPixels.height,
    0,
    0,
    croppedAreaPixels.width,
    croppedAreaPixels.height
  );

  // Return the image as a base64 string
  return new Promise((resolve) => {
    croppedCanvas.toBlob((blob) => {
      resolve(URL.createObjectURL(blob!));
    }, "image/png");
  });
};

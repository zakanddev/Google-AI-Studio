import React, { useRef, useEffect, useState } from 'react';
import { BIRD_SIZE, BIRD_LEFT_POSITION } from '../constants';

interface BirdProps {
  y: number;
  imageUrl: string;
  rotation: number;
}

const Bird: React.FC<BirdProps> = ({ y, imageUrl, rotation }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // State to hold the pre-processed image with the background removed.
  const [processedImage, setProcessedImage] = useState<HTMLCanvasElement | null>(null);

  // Effect 1: Process the image ONCE when the imageUrl changes. This is the key performance fix.
  useEffect(() => {
    // Reset processed image when the theme changes to load the new character
    setProcessedImage(null);

    const img = new Image();
    img.crossOrigin = 'Anonymous'; // Important for canvas operations
    img.src = imageUrl;
    
    img.onload = () => {
      // Create an offscreen canvas for the chroma key processing
      const offscreenCanvas = document.createElement('canvas');
      offscreenCanvas.width = img.width;
      offscreenCanvas.height = img.height;
      const ctx = offscreenCanvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) return;

      // 1. Draw the original image to the offscreen canvas
      ctx.drawImage(img, 0, 0);

      // 2. Get pixel data and apply chroma key to remove the background
      try {
        // Dynamically sample the top-left corner to determine the background color.
        // This is much more robust than assuming a specific hex code.
        const cornerPixel = ctx.getImageData(0, 0, 1, 1).data;
        const keyR = cornerPixel[0];
        const keyG = cornerPixel[1];
        const keyB = cornerPixel[2];

        const imageData = ctx.getImageData(0, 0, img.width, img.height);
        const data = imageData.data;
        
        // A tolerance to catch similar shades and anti-aliased edges.
        const tolerance = 80; 

        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];

          // Calculate the color distance from our sampled background color
          const distance = Math.sqrt(
            Math.pow(r - keyR, 2) + Math.pow(g - keyG, 2) + Math.pow(b - keyB, 2)
          );

          // If the pixel is close to the background color, make it transparent
          if (distance < tolerance) {
            data[i + 3] = 0; // Set alpha to 0 (transparent)
          }
        }
        
        // 3. Put the modified, transparent pixel data back
        ctx.putImageData(imageData, 0, 0);

        // 4. Store the fully processed canvas in state for fast re-rendering
        setProcessedImage(offscreenCanvas);

      } catch (e) {
        console.error("Could not process image for chroma key. This may be due to a CORS issue if the image is not served correctly.", e);
        // Fallback: create a canvas with the original image if processing fails
        const fallbackCanvas = document.createElement('canvas');
        fallbackCanvas.width = img.width;
        fallbackCanvas.height = img.height;
        fallbackCanvas.getContext('2d')?.drawImage(img, 0, 0);
        setProcessedImage(fallbackCanvas);
      }
    };

    img.onerror = () => {
      console.error("Failed to load character image for canvas processing.");
    }
  }, [imageUrl]);

  // Effect 2: Render the processed image on every frame. This is now very fast.
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');

    if (!canvas || !ctx) return;
      
    // Always clear the canvas to prevent ghosting if the processed image is not ready yet
    ctx.clearRect(0, 0, BIRD_SIZE, BIRD_SIZE);

    if (!processedImage) {
      return; // Wait for the image to be processed
    }

    // Save the current context state
    ctx.save();
    
    // Move the rotation point to the center of the bird
    ctx.translate(BIRD_SIZE / 2, BIRD_SIZE / 2);
    // Apply rotation
    ctx.rotate((rotation * Math.PI) / 180);
    // Move the rotation point back
    ctx.translate(-BIRD_SIZE / 2, -BIRD_SIZE / 2);

    // Draw the pre-processed, background-free image. This is a very fast operation.
    ctx.drawImage(processedImage, 0, 0, BIRD_SIZE, BIRD_SIZE);
    
    // Restore the context to its original state
    ctx.restore();

  }, [y, rotation, processedImage]);

  return (
    <canvas
      ref={canvasRef}
      width={BIRD_SIZE}
      height={BIRD_SIZE}
      className="absolute"
      style={{
        top: 0,
        left: 0,
        zIndex: 3,
        imageRendering: 'pixelated', // Ensures crisp pixels for pixel art
        willChange: 'transform', // Performance hint for the browser
        transform: `translate(${BIRD_LEFT_POSITION}px, ${y}px)`,
      }}
    />
  );
};

export default Bird;

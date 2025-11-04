import React, { useRef, useEffect } from 'react';
import { SCREEN_WIDTH, SCREEN_HEIGHT } from '../constants';

interface BirdTrailProps {
  points: { x: number; y: number }[];
}

const BirdTrail: React.FC<BirdTrailProps> = ({ points }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    ctx.clearRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
    
    if (points.length < 2) return;

    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);

    // Use a solid color instead of a gradient for a persistent trail
    ctx.strokeStyle = 'rgba(255, 215, 0, 0.6)'; // Darker, golden trail
    ctx.lineWidth = 1.5; // Thinner line
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i].x, points[i].y);
    }
    
    ctx.stroke();

  }, [points]);

  return (
    <canvas
      ref={canvasRef}
      width={SCREEN_WIDTH}
      height={SCREEN_HEIGHT}
      className="absolute top-0 left-0"
      style={{ pointerEvents: 'none', zIndex: 1 }}
    />
  );
};

export default BirdTrail;

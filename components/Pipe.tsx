import React, { useRef, useEffect, useState } from 'react';
import { SCREEN_WIDTH, SCREEN_HEIGHT, PIPE_WIDTH } from '../constants';
import { type Pipe as PipeType } from '../types';

interface PipesProps {
  pipes: PipeType[];
  obstacleImage: HTMLImageElement | null;
}

const PIPE_LIP_HEIGHT = 25;
const LIP_INSET = 4; // How much wider the lip is on each side

const PipesCanvas: React.FC<PipesProps> = ({ pipes, obstacleImage }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [pattern, setPattern] = useState<CanvasPattern | null>(null);

  // Create the reusable pattern when the image is available
  useEffect(() => {
    if (obstacleImage && canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        const p = ctx.createPattern(obstacleImage, 'repeat');
        setPattern(p);
      }
    }
  }, [obstacleImage]);

  // Redraw all pipes when their positions change or the pattern is ready
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    
    ctx.clearRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);

    if (!pattern) return;

    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;

    for (const pipe of pipes) {
      // --- Top Pipe ---
      const topPipeBodyHeight = pipe.gapY - PIPE_LIP_HEIGHT;
      // Body
      ctx.fillStyle = pattern;
      ctx.fillRect(pipe.x, 0, PIPE_WIDTH, topPipeBodyHeight);
      ctx.strokeRect(pipe.x, 0, PIPE_WIDTH, topPipeBodyHeight);
      // Lip
      ctx.fillRect(pipe.x - LIP_INSET, topPipeBodyHeight, PIPE_WIDTH + LIP_INSET * 2, PIPE_LIP_HEIGHT);
      ctx.strokeRect(pipe.x - LIP_INSET, topPipeBodyHeight, PIPE_WIDTH + LIP_INSET * 2, PIPE_LIP_HEIGHT);
      
      // --- Bottom Pipe ---
      const bottomPipeY = pipe.gapY + pipe.gapSize;
      // Lip
      ctx.fillRect(pipe.x - LIP_INSET, bottomPipeY, PIPE_WIDTH + LIP_INSET * 2, PIPE_LIP_HEIGHT);
      ctx.strokeRect(pipe.x - LIP_INSET, bottomPipeY, PIPE_WIDTH + LIP_INSET * 2, PIPE_LIP_HEIGHT);
      // Body
      const bottomPipeBodyY = bottomPipeY + PIPE_LIP_HEIGHT;
      ctx.fillRect(pipe.x, bottomPipeBodyY, PIPE_WIDTH, SCREEN_HEIGHT - bottomPipeBodyY);
      ctx.strokeRect(pipe.x, bottomPipeBodyY, PIPE_WIDTH, SCREEN_HEIGHT - bottomPipeBodyY);
    }
  }, [pipes, pattern]);

  return (
    <canvas
      ref={canvasRef}
      width={SCREEN_WIDTH}
      height={SCREEN_HEIGHT}
      className="absolute top-0 left-0"
      style={{ zIndex: 2, pointerEvents: 'none' }}
    />
  );
};

export default PipesCanvas;

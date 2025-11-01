import React from 'react';
import { SCREEN_HEIGHT, PIPE_WIDTH } from '../constants';

interface PipeProps {
  x: number;
  gapY: number;
  color: string;
  pipeGap: number;
}

const Pipe: React.FC<PipeProps> = ({ x, gapY, color, pipeGap }) => {
  return (
    <>
      <div
        className="absolute"
        style={{
          left: x,
          top: 0,
          width: PIPE_WIDTH,
          height: gapY,
          backgroundColor: color,
          border: '2px solid #111',
          borderRadius: '8px',
          boxShadow: 'inset 0 0 10px rgba(0,0,0,0.5)'
        }}
      />
      <div
        className="absolute"
        style={{
          left: x,
          top: gapY + pipeGap,
          width: PIPE_WIDTH,
          height: SCREEN_HEIGHT - (gapY + pipeGap),
          backgroundColor: color,
          border: '2px solid #111',
          borderRadius: '8px',
          boxShadow: 'inset 0 0 10px rgba(0,0,0,0.5)'
        }}
      />
    </>
  );
};

export default Pipe;
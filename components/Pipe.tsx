import React from 'react';
import { SCREEN_HEIGHT, PIPE_WIDTH } from '../constants';

interface PipeProps {
  x: number;
  gapY: number;
  color: string;
  pipeGap: number;
}

const PIPE_LIP_HEIGHT = 25;
const LIP_INSET = 4; // How much wider the lip is on each side

const Pipe: React.FC<PipeProps> = ({ x, gapY, color, pipeGap }) => {

  // Common style for the main vertical part of the pipe
  const pipeBodyStyle: React.CSSProperties = {
    position: 'absolute',
    left: x,
    width: PIPE_WIDTH,
    background: color,
    borderLeft: '2px solid black',
    borderRight: '2px solid black',
    // Inset shadow creates a subtle 3D / lighting effect
    boxShadow: 'inset 6px 0px 10px rgba(0,0,0,0.4)',
  };

  // Common style for the end piece of the pipe
  const pipeLipStyle: React.CSSProperties = {
    position: 'absolute',
    left: x - LIP_INSET,
    width: PIPE_WIDTH + (LIP_INSET * 2),
    height: PIPE_LIP_HEIGHT,
    background: color,
    border: '2px solid black',
    borderRadius: '6px',
    boxShadow: 'inset 6px 0px 10px rgba(0,0,0,0.4)',
  };

  return (
    <>
      {/* Top Pipe Body */}
      <div
        style={{
          ...pipeBodyStyle,
          top: 0,
          height: gapY,
        }}
      />
      {/* Top Pipe Lip */}
      <div
        style={{
          ...pipeLipStyle,
          top: gapY - PIPE_LIP_HEIGHT,
          // Add a subtle drop shadow to the bottom of the lip
          boxShadow: `${pipeLipStyle.boxShadow}, 0 3px 3px rgba(0,0,0,0.3)`
        }}
      />

      {/* Bottom Pipe Body */}
      <div
        style={{
          ...pipeBodyStyle,
          top: gapY + pipeGap,
          height: SCREEN_HEIGHT - (gapY + pipeGap),
        }}
      />
      {/* Bottom Pipe Lip */}
      <div
        style={{
          ...pipeLipStyle,
          top: gapY + pipeGap,
          // Add a subtle "up" shadow to the top of the lip
          boxShadow: `${pipeLipStyle.boxShadow}, 0 -3px 3px rgba(0,0,0,0.3)`
        }}
      />
    </>
  );
};

export default Pipe;

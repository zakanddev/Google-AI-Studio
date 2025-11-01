import React from 'react';
import { SCREEN_WIDTH } from '../constants';

interface BackgroundProps {
  imageUrl: string;
  scrollPosition: number;
}

const Background: React.FC<BackgroundProps> = ({ imageUrl, scrollPosition }) => {
  // Calculate the position for two seamless background images
  const x1 = -(scrollPosition % SCREEN_WIDTH);
  const x2 = x1 + SCREEN_WIDTH;

  return (
    <>
      <div
        className="absolute top-0 h-full bg-cover bg-center"
        style={{
          backgroundImage: `url(${imageUrl})`,
          width: SCREEN_WIDTH,
          left: x1,
          height: '100%',
        }}
        aria-hidden="true"
      />
      <div
        className="absolute top-0 h-full bg-cover bg-center"
        style={{
          backgroundImage: `url(${imageUrl})`,
          width: SCREEN_WIDTH,
          left: x2,
          height: '100%',
        }}
        aria-hidden="true"
      />
    </>
  );
};

export default Background;
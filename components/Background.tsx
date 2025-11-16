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

  const styleCommon: React.CSSProperties = {
    position: 'absolute',
    top: 0,
    left: 0,
    width: SCREEN_WIDTH,
    height: '100%',
    backgroundImage: `url(${imageUrl})`,
    backgroundRepeat: 'no-repeat',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    willChange: 'transform',
  };

  return (
    <>
      <div
        style={{
          ...styleCommon,
          transform: `translateX(${x1}px)`,
        }}
        aria-hidden="true"
      />
      <div
        style={{
          ...styleCommon,
          transform: `translateX(${x2}px)`,
        }}
        aria-hidden="true"
      />
    </>
  );
};

export default Background;

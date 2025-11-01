import React from 'react';

interface BackgroundProps {
  imageUrl: string;
}

const Background: React.FC<BackgroundProps> = ({ imageUrl }) => {
  return (
    <div
      className="absolute top-0 left-0 w-full h-full bg-cover bg-center"
      style={{
        backgroundImage: `url(${imageUrl})`,
      }}
    />
  );
};

export default Background;

import React from 'react';
import { BIRD_SIZE, BIRD_LEFT_POSITION } from '../constants';

interface BirdProps {
  y: number;
  imageUrl: string;
  rotation: number;
}

const Bird: React.FC<BirdProps> = ({ y, imageUrl, rotation }) => {
  return (
    <div
      className="absolute bg-cover bg-center rounded-md"
      style={{
        width: BIRD_SIZE,
        height: BIRD_SIZE,
        top: y,
        left: BIRD_LEFT_POSITION,
        backgroundImage: `url(${imageUrl})`,
        transform: `rotate(${rotation}deg)`,
        transition: 'transform 0.2s ease-out, top 0.1s linear',
        boxShadow: '0 4px 15px rgba(0, 0, 0, 0.4)'
      }}
    />
  );
};

export default Bird;
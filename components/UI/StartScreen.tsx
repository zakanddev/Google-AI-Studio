import React from 'react';
import { type GameTheme } from '../../types';

interface StartScreenProps {
  theme: GameTheme;
}

const StartScreen: React.FC<StartScreenProps> = ({ theme }) => {
  return (
    <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-center p-4 z-10">
      <h2 className="text-3xl font-bold text-white mb-2" style={{ textShadow: '2px 2px 4px #000' }}>
        {theme.themeName}
      </h2>
      <div className="bg-white/10 backdrop-blur-sm p-4 rounded-lg border border-white/20 max-w-sm">
        <p className="text-lg font-semibold text-white">Character: {theme.character.name}</p>
        <p className="text-sm text-gray-300 mb-2">{theme.character.description}</p>
        <p className="text-lg font-semibold text-white">Obstacles: {theme.obstacle.name}</p>
        <p className="text-sm text-gray-300">{theme.obstacle.description}</p>
      </div>
      <p className="mt-6 text-2xl font-bold text-white animate-pulse">
        Tap to Start
      </p>
    </div>
  );
};

export default StartScreen;

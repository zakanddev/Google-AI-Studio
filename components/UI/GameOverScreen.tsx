import React from 'react';

interface GameOverScreenProps {
  score: number;
  onRestart: () => void;
}

const GameOverScreen: React.FC<GameOverScreenProps> = ({ score, onRestart }) => {
  
  const handleRestartClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent the game container from also receiving the click
    onRestart();
  };
  
  return (
    <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center z-10">
      <div className="bg-gray-800/80 backdrop-blur-md p-8 rounded-lg shadow-xl text-center border border-purple-500/50">
        <h2 className="text-4xl font-bold text-red-500 mb-2">Game Over</h2>
        <p className="text-xl text-white mb-4">Your Score</p>
        <p className="text-6xl font-bold text-yellow-400 mb-6">{score}</p>
        <button
          onClick={handleRestartClick}
          className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white font-bold rounded-md hover:opacity-90 transition-opacity text-xl"
        >
          Try Again
        </button>
      </div>
    </div>
  );
};

export default GameOverScreen;

import React from 'react';

interface GameOverScreenProps {
  score: number;
  highScore: number;
  onRestart: () => void;
}

const GameOverScreen: React.FC<GameOverScreenProps> = ({ score, highScore, onRestart }) => {
  
  const handleContainerClick = (e: React.MouseEvent) => {
    // This allows clicking anywhere on the overlay to restart
    onRestart();
  };

  const handleButtonClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent the container click from firing as well
    onRestart();
  };
  
  return (
    <div 
      className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center z-10 cursor-pointer"
      onClick={handleContainerClick}
    >
      <div className="bg-gray-800/80 backdrop-blur-md p-8 rounded-lg shadow-xl text-center border border-purple-500/50">
        <h2 className="text-4xl font-bold text-red-500 mb-2">Game Over</h2>
        <div className="flex justify-around items-end w-full mt-4 mb-6">
          <div className="text-center">
            <p className="text-xl text-white mb-1">Score</p>
            <p className="text-6xl font-bold text-yellow-400">{score}</p>
          </div>
          <div className="text-center">
            <p className="text-lg text-gray-300 mb-1">High Score</p>
            <p className="text-4xl font-bold text-cyan-400">{highScore}</p>
          </div>
        </div>
        <button
          onClick={handleButtonClick}
          className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white font-bold rounded-md hover:opacity-90 transition-opacity text-xl"
        >
          Try Again
        </button>
      </div>
    </div>
  );
};

export default GameOverScreen;
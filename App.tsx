import React, { useState, useCallback } from 'react';
import Game from './components/Game';
import ThemeGenerator from './components/UI/ThemeGenerator';
import { type GameTheme } from './types';

const App: React.FC = () => {
  const [gameTheme, setGameTheme] = useState<GameTheme | null>(null);

  const handleThemeGenerated = useCallback((theme: GameTheme) => {
    setGameTheme(theme);
  }, []);

  const handleBackToThemeSelection = useCallback(() => {
    setGameTheme(null);
  }, []);

  return (
    <div className="w-screen h-screen bg-gray-900 text-white flex flex-col items-center justify-center font-mono p-4">
      <div className="w-full max-w-lg mx-auto text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 mb-4">
          AI Flappy Game
        </h1>
        {!gameTheme ? (
          <ThemeGenerator onThemeGenerated={handleThemeGenerated} />
        ) : (
          <Game gameTheme={gameTheme} onBack={handleBackToThemeSelection} />
        )}
      </div>
      <footer className="absolute bottom-2 text-xs text-gray-500">
        <p>Created with Gemini AI</p>
      </footer>
    </div>
  );
};

export default App;

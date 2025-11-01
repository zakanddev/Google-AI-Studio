import React, { useState, useCallback } from 'react';
import { generateTheme } from '../../services/geminiService';
import { type GameTheme } from '../../types';

interface ThemeGeneratorProps {
  onThemeGenerated: (theme: GameTheme) => void;
}

const ThemeGenerator: React.FC<ThemeGeneratorProps> = ({ onThemeGenerated }) => {
  const [prompt, setPrompt] = useState<string>('A cyber-ninja jumping between neon skyscrapers');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) {
      setError('Please enter a theme idea.');
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const theme = await generateTheme(prompt);
      onThemeGenerated(theme);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  }, [prompt, onThemeGenerated]);

  return (
    <div className="w-full bg-gray-800/50 backdrop-blur-sm p-6 rounded-lg shadow-lg border border-purple-500/30">
      <p className="mb-4 text-gray-300">Describe a theme for the game, and AI will generate the assets!</p>
      <form onSubmit={handleSubmit}>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="e.g., A magical cat flying through a candy forest"
          className="w-full p-3 bg-gray-900 border border-gray-700 rounded-md focus:ring-2 focus:ring-pink-500 focus:outline-none transition text-white resize-none"
          rows={3}
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading}
          className="w-full mt-4 px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white font-bold rounded-md hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Generating...
            </>
          ) : (
            'Create My Game'
          )}
        </button>
        {error && <p className="mt-4 text-red-400">{error}</p>}
      </form>
    </div>
  );
};

export default ThemeGenerator;

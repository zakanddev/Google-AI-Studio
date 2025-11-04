import React, { useState, useCallback, useEffect } from 'react';
import { generateTheme } from '../../services/geminiService';
import { getHistory, addPromptToHistory } from '../../services/historyService';
import { type GameTheme, type PromptHistoryItem } from '../../types';

interface ThemeGeneratorProps {
  prompt: string;
  onPromptChange: (newPrompt: string) => void;
  onThemeGenerated: (theme: GameTheme) => void;
}

const ThemeGenerator: React.FC<ThemeGeneratorProps> = ({ prompt, onPromptChange, onThemeGenerated }) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<PromptHistoryItem[]>([]);
  const [isHistoryVisible, setIsHistoryVisible] = useState<boolean>(false);

  useEffect(() => {
    setHistory(getHistory());
  }, [isHistoryVisible]);

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
      addPromptToHistory(prompt);
      onThemeGenerated(theme);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  }, [prompt, onThemeGenerated]);
  
  const handleUsePrompt = (p: string) => {
    onPromptChange(p);
    setIsHistoryVisible(false);
  }

  return (
    <>
      <div className="w-full bg-gray-800/50 backdrop-blur-sm p-6 rounded-lg shadow-lg border border-purple-500/30">
        <p className="mb-4 text-gray-300">Describe a theme for the game, and AI will generate the assets!</p>
        <form onSubmit={handleSubmit}>
          <textarea
            value={prompt}
            onChange={(e) => onPromptChange(e.target.value)}
            placeholder="e.g., A magical cat flying through a candy forest"
            className="w-full p-3 bg-gray-900 border border-gray-700 rounded-md focus:ring-2 focus:ring-pink-500 focus:outline-none transition text-white resize-none"
            rows={3}
            disabled={isLoading}
          />
          <div className="flex flex-col sm:flex-row gap-2 mt-4">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white font-bold rounded-md hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
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
            <button
              type="button"
              onClick={() => setIsHistoryVisible(true)}
              disabled={isLoading}
              className="w-full sm:w-auto px-4 py-3 bg-gray-700 text-white font-bold rounded-md hover:bg-gray-600 transition-colors disabled:opacity-50"
            >
              History
            </button>
          </div>
          {error && <p className="mt-4 text-red-400">{error}</p>}
        </form>
      </div>

      {isHistoryVisible && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-2xl bg-gray-800 border border-purple-500/50 rounded-lg shadow-2xl flex flex-col" style={{maxHeight: '80vh'}}>
            <div className="p-4 border-b border-gray-700 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white">Prompt History</h2>
              <button onClick={() => setIsHistoryVisible(false)} className="text-gray-400 hover:text-white">&times;</button>
            </div>
            <div className="p-4 overflow-y-auto">
              {history.length > 0 ? (
                <ul className="space-y-3">
                  {history.map((item) => (
                    <li key={item.prompt} className="bg-gray-900/70 p-3 rounded-md border border-gray-700">
                      <p className="text-gray-300 italic mb-2">"{item.prompt}"</p>
                      <div className="flex justify-between items-center">
                        <div className="text-xs text-gray-400 space-x-4">
                          <span>Tries: <span className="font-semibold text-white">{item.tries}</span></span>
                          <span>High Score: <span className="font-semibold text-white">{item.highScore}</span></span>
                        </div>
                        <button onClick={() => handleUsePrompt(item.prompt)} className="px-3 py-1 text-sm bg-purple-600 rounded hover:bg-purple-500 transition-colors">
                          Use
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-400 text-center py-8">No history yet. Generate a theme to start!</p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ThemeGenerator;
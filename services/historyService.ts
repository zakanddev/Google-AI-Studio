import { type PromptHistoryItem } from '../types';

const HISTORY_KEY = 'ai-flappy-prompt-history';

export const getHistory = (): PromptHistoryItem[] => {
  try {
    const historyJson = localStorage.getItem(HISTORY_KEY);
    return historyJson ? JSON.parse(historyJson) : [];
  } catch (error) {
    console.error("Failed to parse prompt history from localStorage", error);
    return [];
  }
};

const saveHistory = (history: PromptHistoryItem[]): void => {
  try {
    const historyJson = JSON.stringify(history);
    localStorage.setItem(HISTORY_KEY, historyJson);
  } catch (error) {
    console.error("Failed to save prompt history to localStorage", error);
  }
};

export const addPromptToHistory = (prompt: string): void => {
  if (!prompt.trim()) return;
  const history = getHistory();
  const existingEntry = history.find(item => item.prompt === prompt);

  if (!existingEntry) {
    const newHistory = [{ prompt, highScore: 0, tries: 0 }, ...history];
    // Keep history to a reasonable size, e.g., 20 entries
    if (newHistory.length > 20) {
      newHistory.pop();
    }
    saveHistory(newHistory);
  }
};

export const incrementTries = (prompt: string): void => {
  if (!prompt.trim()) return;
  const history = getHistory();
  const entry = history.find(item => item.prompt === prompt);

  if (entry) {
    entry.tries += 1;
    saveHistory(history);
  }
};

export const updateHighScore = (prompt: string, score: number): void => {
  if (!prompt.trim()) return;
  const history = getHistory();
  const entry = history.find(item => item.prompt === prompt);
  
  if (entry && score > entry.highScore) {
    entry.highScore = score;
    saveHistory(history);
  }
};

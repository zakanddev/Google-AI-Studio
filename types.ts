export interface GameTheme {
  themeName: string;
  prompt: string;
  character: {
    name: string;
    description: string;
    imageUrl: string;
  };
  obstacle: {
    name: string;
    description: string;
    imageUrl: string;
  };
  background: {
    description: string;
    imageUrl: string;
  };
}

export interface PromptHistoryItem {
  prompt: string;
  highScore: number;
  tries: number;
}

export type GameState = 'ready' | 'playing' | 'gameOver';

export interface Pipe {
    x: number;
    gapY: number;
    isScored: boolean;
    gapSize: number;
}
export interface GameTheme {
  themeName: string;
  character: {
    name: string;
    description: string;
    imageUrl: string;
  };
  obstacle: {
    name: string;
    description: string;
    color: string;
  };
  background: {
    description: string;
    imageUrl: string;
  };
}

export type GameState = 'ready' | 'playing' | 'gameOver';

export interface Pipe {
    x: number;
    gapY: number;
    isScored: boolean;
}

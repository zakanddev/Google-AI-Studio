export const SCREEN_HEIGHT = 600;
export const SCREEN_WIDTH = 400;

export const BIRD_SIZE = 96;
export const BIRD_LEFT_POSITION = 80;

export const GRAVITY = 0.4;
export const JUMP_VELOCITY = -7;
export const MAX_VELOCITY = 10;

export const PIPE_WIDTH = 60;
export const PIPE_GAP = 220;
export const PIPE_SPACING = 250;
export const PIPE_SPEED = 2.5;

// Difficulty Scaling Constants
export const SCORE_DIFFICULTY_INTERVAL = 8; // Every 8 points, difficulty increases
export const PIPE_SPEED_INCREASE = 0.2;
export const PIPE_GAP_DECREASE = 3;
export const MIN_PIPE_GAP = 120; // The smallest the gap can get
export const MAX_PIPE_SPEED = 5;   // The fastest the pipes can move

// Hitbox reduction factor. 1 = full size, 0.35 = 35% of the sprite size.
export const BIRD_HITBOX_SCALE = 0.35;
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { type GameTheme, type GameState, type Pipe as PipeType } from '../types';
import {
  SCREEN_HEIGHT, SCREEN_WIDTH, BIRD_SIZE, BIRD_LEFT_POSITION, GRAVITY,
  JUMP_VELOCITY, MAX_VELOCITY, PIPE_WIDTH, PIPE_GAP, PIPE_SPACING, PIPE_SPEED
} from '../constants';
import Bird from './Bird';
import Pipe from './Pipe';
import Background from './Background';
import StartScreen from './UI/StartScreen';
import GameOverScreen from './UI/GameOverScreen';

interface GameProps {
  gameTheme: GameTheme;
  onBack: () => void;
}

const Game: React.FC<GameProps> = ({ gameTheme, onBack }) => {
  const [gameState, setGameState] = useState<GameState>('ready');
  const [birdY, setBirdY] = useState(SCREEN_HEIGHT / 2 - BIRD_SIZE / 2);
  const [birdVelocity, setBirdVelocity] = useState(0);
  const [pipes, setPipes] = useState<PipeType[]>([]);
  const [score, setScore] = useState(0);
  const gameLoopRef = useRef<number>();

  const resetGame = useCallback(() => {
    setGameState('ready');
    setBirdY(SCREEN_HEIGHT / 2 - BIRD_SIZE / 2);
    setBirdVelocity(0);
    setScore(0);
    setPipes([createPipe(SCREEN_WIDTH * 1.5), createPipe(SCREEN_WIDTH * 1.5 + PIPE_SPACING)]);
  }, []);

  useEffect(() => {
    resetGame();
  }, [gameTheme, resetGame]);

  const createPipe = (x: number): PipeType => {
    const gapY = Math.floor(Math.random() * (SCREEN_HEIGHT - PIPE_GAP - 100)) + 50;
    return { x, gapY, isScored: false };
  };

  const gameLoop = useCallback(() => {
    if (gameState !== 'playing') return;

    // Bird physics
    setBirdVelocity(v => Math.min(v + GRAVITY, MAX_VELOCITY));
    setBirdY(y => y + birdVelocity);
    const birdBottom = birdY + BIRD_SIZE;

    // Ground and ceiling collision
    if (birdBottom > SCREEN_HEIGHT || birdY < 0) {
      setGameState('gameOver');
      return;
    }

    // Pipe logic
    let newPipes = pipes.map(pipe => ({ ...pipe, x: pipe.x - PIPE_SPEED }));

    // Collision with pipes
    for (const pipe of newPipes) {
      const birdRight = BIRD_LEFT_POSITION + BIRD_SIZE;
      const pipeRight = pipe.x + PIPE_WIDTH;

      if (birdRight > pipe.x && BIRD_LEFT_POSITION < pipeRight) {
        if (birdY < pipe.gapY || birdBottom > pipe.gapY + PIPE_GAP) {
          setGameState('gameOver');
          return;
        }
      }
      
      // Score
      if (!pipe.isScored && pipeRight < BIRD_LEFT_POSITION) {
        pipe.isScored = true;
        setScore(s => s + 1);
      }
    }
    
    // Add/remove pipes
    if (newPipes.length > 0 && newPipes[0].x < -PIPE_WIDTH) {
        newPipes.shift();
    }
    if (newPipes.length > 0 && SCREEN_WIDTH - newPipes[newPipes.length - 1].x >= PIPE_SPACING) {
        newPipes.push(createPipe(newPipes[newPipes.length - 1].x + PIPE_SPACING));
    }
    
    setPipes(newPipes);

    gameLoopRef.current = requestAnimationFrame(gameLoop);
  }, [gameState, birdY, birdVelocity, pipes]);
  
  useEffect(() => {
    if (gameState === 'playing') {
      gameLoopRef.current = requestAnimationFrame(gameLoop);
    }
    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [gameState, gameLoop]);

  const handleUserAction = useCallback(() => {
    if (gameState === 'ready') {
      setGameState('playing');
      setBirdVelocity(JUMP_VELOCITY);
    } else if (gameState === 'playing') {
      setBirdVelocity(JUMP_VELOCITY);
    }
  }, [gameState]);
  
  return (
    <div className="flex flex-col items-center">
      <div
        className="relative overflow-hidden rounded-lg shadow-2xl border-2 border-purple-500/50 cursor-pointer"
        style={{ width: SCREEN_WIDTH, height: SCREEN_HEIGHT }}
        onClick={handleUserAction}
        onTouchStart={handleUserAction}
      >
        <Background imageUrl={gameTheme.background.imageUrl} />
        {pipes.map((pipe, index) => (
          <Pipe key={index} x={pipe.x} gapY={pipe.gapY} color={gameTheme.obstacle.color} />
        ))}
        <Bird y={birdY} imageUrl={gameTheme.character.imageUrl} />
        <div className="absolute top-4 left-1/2 -translate-x-1/2 text-5xl font-bold text-white" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.7)' }}>
          {score}
        </div>
        {gameState === 'ready' && <StartScreen theme={gameTheme} />}
        {gameState === 'gameOver' && <GameOverScreen score={score} onRestart={resetGame} />}
      </div>
      <button onClick={onBack} className="mt-4 px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600 transition">
        Change Theme
      </button>
    </div>
  );
};

export default Game;

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { type GameTheme, type GameState, type Pipe as PipeType } from '../types';
import {
  SCREEN_HEIGHT, SCREEN_WIDTH, BIRD_SIZE, BIRD_LEFT_POSITION, GRAVITY,
  JUMP_VELOCITY, MAX_VELOCITY, PIPE_WIDTH, PIPE_GAP, PIPE_SPACING, PIPE_SPEED,
  SCORE_DIFFICULTY_INTERVAL, PIPE_SPEED_INCREASE, PIPE_GAP_DECREASE, MIN_PIPE_GAP, MAX_PIPE_SPEED
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
  const [birdRotation, setBirdRotation] = useState(0);
  const [pipes, setPipes] = useState<PipeType[]>([]);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [isAssetsLoading, setIsAssetsLoading] = useState(true);
  const [bgScroll, setBgScroll] = useState(0);
  const gameLoopRef = useRef<number | null>(null);
  const scoreRef = useRef(score); // Ref to hold score for callbacks

  // Keep scoreRef updated with the latest score
  useEffect(() => {
    scoreRef.current = score;
  }, [score]);

  // Load high score from local storage on mount
  useEffect(() => {
    const savedHighScore = localStorage.getItem('ai-flappy-highscore');
    if (savedHighScore) {
      setHighScore(parseInt(savedHighScore, 10));
    }
  }, []);
  
  // Preload assets
  useEffect(() => {
    setIsAssetsLoading(true);
    const charImg = new Image();
    const bgImg = new Image();
    
    charImg.src = gameTheme.character.imageUrl;
    bgImg.src = gameTheme.background.imageUrl;

    Promise.all([
      new Promise((resolve, reject) => { charImg.onload = resolve; charImg.onerror = reject; }),
      new Promise((resolve, reject) => { bgImg.onload = resolve; bgImg.onerror = reject; })
    ]).then(() => {
      setIsAssetsLoading(false);
    }).catch(err => {
        console.error("Failed to load game assets", err);
        setIsAssetsLoading(false); // Still allow game to start, might look broken
    });
  }, [gameTheme]);

  const createPipe = useCallback((x: number, gap: number): PipeType => {
    const gapY = Math.floor(Math.random() * (SCREEN_HEIGHT - gap - 100)) + 50;
    return { x, gapY, isScored: false, gapSize: gap };
  }, []);

  const resetGame = useCallback(() => {
    setGameState('ready');
    setBirdY(SCREEN_HEIGHT / 2 - BIRD_SIZE / 2);
    setBirdVelocity(0);
    setBirdRotation(0);
    
    // Use scoreRef to access latest score inside functional update
    // This avoids making `resetGame` dependent on `score` or `highScore`
    setHighScore(currentHighScore => {
      const finalScore = scoreRef.current;
      if (finalScore > currentHighScore) {
        localStorage.setItem('ai-flappy-highscore', finalScore.toString());
        return finalScore;
      }
      return currentHighScore;
    });

    setScore(0);
    setPipes([createPipe(SCREEN_WIDTH * 1.5, PIPE_GAP), createPipe(SCREEN_WIDTH * 1.5 + PIPE_SPACING, PIPE_GAP)]);
    setBgScroll(0);
  }, [createPipe]);

  // This effect now correctly resets the game only when the theme changes.
  useEffect(() => {
    resetGame();
  }, [gameTheme, resetGame]);


  const gameLoop = useCallback(() => {
    if (gameState !== 'playing') return;

    // --- Difficulty Scaling ---
    const difficultyLevel = Math.floor(score / SCORE_DIFFICULTY_INTERVAL);
    const currentPipeSpeed = Math.min(MAX_PIPE_SPEED, PIPE_SPEED + difficultyLevel * PIPE_SPEED_INCREASE);
    const currentPipeGap = Math.max(MIN_PIPE_GAP, PIPE_GAP - difficultyLevel * PIPE_GAP_DECREASE);

    // --- Physics and Collision Detection ---
    const nextBirdVelocity = Math.min(birdVelocity + GRAVITY, MAX_VELOCITY);
    const nextBirdY = birdY + nextBirdVelocity;

    // 1. Ground and Ceiling Collision
    if (nextBirdY + BIRD_SIZE >= SCREEN_HEIGHT || nextBirdY <= 0) {
      setGameState('gameOver');
      return;
    }

    // 2. Pipe Collision
    for (const pipe of pipes) {
      const birdRight = BIRD_LEFT_POSITION + BIRD_SIZE;
      const pipeRight = pipe.x + PIPE_WIDTH;

      if (birdRight > pipe.x && BIRD_LEFT_POSITION < pipeRight) {
        // Use the pipe's own gapSize for fair collision detection
        if (nextBirdY < pipe.gapY || nextBirdY + BIRD_SIZE > pipe.gapY + pipe.gapSize) {
          setGameState('gameOver');
          return;
        }
      }
    }
    
    // --- State Updates for Pipes and Score (Refactored for Robustness) ---
    const { newPipes, scoreDelta } = pipes.reduce<{ newPipes: PipeType[], scoreDelta: number }>((acc, pipe) => {
        const movedPipe = { ...pipe, x: pipe.x - currentPipeSpeed };

        if (!pipe.isScored && movedPipe.x + PIPE_WIDTH < BIRD_LEFT_POSITION) {
            movedPipe.isScored = true;
            acc.scoreDelta += 1;
        }

        if (movedPipe.x > -PIPE_WIDTH) {
            acc.newPipes.push(movedPipe);
        }

        return acc;
    }, { newPipes: [], scoreDelta: 0 });

    let finalPipes = newPipes;
    const lastPipe = finalPipes[finalPipes.length - 1];
    if (lastPipe && SCREEN_WIDTH - lastPipe.x >= PIPE_SPACING) {
        const newPipe = createPipe(lastPipe.x + PIPE_SPACING, currentPipeGap);
        finalPipes = [...finalPipes, newPipe];
    }
    
    // --- Commit all state changes for the next render ---
    setBirdVelocity(nextBirdVelocity);
    setBirdY(nextBirdY);
    setBirdRotation(Math.max(-30, Math.min(90, nextBirdVelocity * 5)));
    setPipes(finalPipes);
    if (scoreDelta > 0) {
      setScore(prevScore => prevScore + scoreDelta);
    }
    setBgScroll(prev => prev + currentPipeSpeed * 0.5);

    gameLoopRef.current = requestAnimationFrame(gameLoop);
  }, [gameState, birdY, birdVelocity, pipes, score, createPipe]);
  
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
    if (isAssetsLoading) return;
    if (gameState === 'ready') {
      setGameState('playing');
      setBirdVelocity(JUMP_VELOCITY);
    } else if (gameState === 'playing') {
      setBirdVelocity(JUMP_VELOCITY);
    } else if (gameState === 'gameOver') {
      resetGame();
    }
  }, [gameState, resetGame, isAssetsLoading]);

  if (isAssetsLoading) {
    return (
        <div className="flex flex-col items-center">
            <div
                className="relative overflow-hidden rounded-lg shadow-2xl border-2 border-purple-500/50 flex items-center justify-center bg-gray-800"
                style={{ width: SCREEN_WIDTH, height: SCREEN_HEIGHT }}
            >
                <div className="text-white text-center">
                    <svg className="animate-spin mx-auto h-10 w-10 text-white mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <p className="text-lg font-bold">Generating Assets...</p>
                    <p className="text-sm text-gray-400">Please wait a moment.</p>
                </div>
            </div>
            <button onClick={onBack} className="mt-4 px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600 transition">
                Back
            </button>
        </div>
    );
  }
  
  return (
    <div className="flex flex-col items-center">
      <div
        className="relative overflow-hidden rounded-lg shadow-2xl border-2 border-purple-500/50 cursor-pointer"
        style={{ width: SCREEN_WIDTH, height: SCREEN_HEIGHT }}
        onClick={handleUserAction}
        onTouchStart={(e) => { e.preventDefault(); handleUserAction(); }}
        role="button"
        tabIndex={0}
        aria-label="Game Area"
      >
        <Background imageUrl={gameTheme.background.imageUrl} scrollPosition={bgScroll} />
        {pipes.map((pipe, index) => (
          <Pipe key={index} x={pipe.x} gapY={pipe.gapY} color={gameTheme.obstacle.color} pipeGap={pipe.gapSize} />
        ))}
        <Bird y={birdY} imageUrl={gameTheme.character.imageUrl} rotation={birdRotation} />
        <div className="absolute top-4 left-1/2 -translate-x-1/2 text-5xl font-bold text-white" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.7)' }}>
          {score}
        </div>
        {gameState === 'ready' && <StartScreen theme={gameTheme} />}
        {gameState === 'gameOver' && <GameOverScreen score={score} highScore={highScore} onRestart={resetGame} />}
      </div>
      <button onClick={onBack} className="mt-4 px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600 transition">
        Change Theme
      </button>
    </div>
  );
};

export default Game;
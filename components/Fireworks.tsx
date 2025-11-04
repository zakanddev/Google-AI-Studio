import React, { useRef, useEffect } from 'react';
import { SCREEN_WIDTH, SCREEN_HEIGHT } from '../constants';

interface FireworkTrigger {
  id: number;
  x: number;
  y: number;
  colors: string[];
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  alpha: number;
}

interface FireworkProps {
  triggers: FireworkTrigger[];
}

const PARTICLE_COUNT = 60;
const GRAVITY = 0.06;
const FADE_RATE = 0.98;

const Fireworks: React.FC<FireworkProps> = ({ triggers }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  // FIX: Initialize useRef with null to provide an initial value and correct typing.
  // The call `useRef<number>()` is ambiguous and can lead to errors because it doesn't provide an initial value for the specified type.
  const animationFrameRef = useRef<number | null>(null);
  const lastTriggersRef = useRef<FireworkTrigger[]>([]);

  // Effect to set up the main animation loop, runs only once on mount
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const animate = () => {
      // Only clear and draw if there are particles
      if (particlesRef.current.length > 0) {
        ctx.clearRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
        
        particlesRef.current = particlesRef.current.filter(p => {
          // Update particle physics
          p.vy += GRAVITY;
          p.x += p.vx;
          p.y += p.vy;
          p.alpha *= FADE_RATE;

          if (p.alpha <= 0.01) return false;

          // Draw particle
          const r = parseInt(p.color.slice(1, 3), 16);
          const g = parseInt(p.color.slice(3, 5), 16);
          const b = parseInt(p.color.slice(5, 7), 16);
          ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${p.alpha})`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
          ctx.fill();
          
          return true; // Keep particle alive
        });
      }

      animationFrameRef.current = requestAnimationFrame(animate);
    };
    
    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        // FIX: Assign null to match the updated ref type.
        animationFrameRef.current = null;
      }
    };
  }, []); // Empty dependency array ensures this runs only once

  // Effect to add new particles when triggers change
  useEffect(() => {
    const newTriggers = triggers.filter(t => !lastTriggersRef.current.some(lt => lt.id === t.id));
    
    if (newTriggers.length > 0) {
        newTriggers.forEach(trigger => {
            for (let i = 0; i < PARTICLE_COUNT; i++) {
                const angle = Math.random() * Math.PI * 2;
                const speed = Math.random() * 4 + 1;
                particlesRef.current.push({
                    x: trigger.x,
                    y: trigger.y,
                    vx: Math.cos(angle) * speed,
                    vy: Math.sin(angle) * speed,
                    color: trigger.colors[Math.floor(Math.random() * trigger.colors.length)] || '#FFFFFF',
                    alpha: 1,
                });
            }
        });
        lastTriggersRef.current = triggers;
    }
  }, [triggers]);

  return (
    <canvas
      ref={canvasRef}
      width={SCREEN_WIDTH}
      height={SCREEN_HEIGHT}
      className="absolute top-0 left-0"
      style={{ pointerEvents: 'none' }}
    />
  );
};

export default Fireworks;

"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";

interface RacingGameProps {
  onBack: () => void;
  playerName: string;
  playerAvatar: string | null;
}

export default function RacingGame({ onBack, playerName }: RacingGameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameLoopRef = useRef<number>();
  
  const [car] = useState({
    x: 375,
    y: 500,
    width: 50,
    height: 80,
    speed: 0,
    maxSpeed: 8,
    acceleration: 0.2,
    friction: 0.1
  });

  const [keys] = useState<Set<string>>(new Set());
  const [score, setScore] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);

  const gameLoop = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    // Clear canvas
    ctx.fillStyle = "#1a1a1a";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw road
    ctx.fillStyle = "#333";
    ctx.fillRect(100, 0, 600, canvas.height);

    // Draw lane lines
    ctx.fillStyle = "#fff";
    ctx.setLineDash([20, 20]);
    ctx.beginPath();
    ctx.moveTo(300, 0);
    ctx.lineTo(300, canvas.height);
    ctx.moveTo(500, 0);
    ctx.lineTo(500, canvas.height);
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw car
    ctx.fillStyle = "#ff4444";
    ctx.fillRect(car.x, car.y, car.width, car.height);

    // Draw wheels
    ctx.fillStyle = "#000";
    ctx.fillRect(car.x + 5, car.y + 10, 10, 15);
    ctx.fillRect(car.x + 35, car.y + 10, 10, 15);
    ctx.fillRect(car.x + 5, car.y + 55, 10, 15);
    ctx.fillRect(car.x + 35, car.y + 55, 10, 15);

    gameLoopRef.current = requestAnimationFrame(gameLoop);
  }, [car]);

  useEffect(() => {
    if (gameStarted) {
      gameLoopRef.current = requestAnimationFrame(gameLoop);
    }
    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [gameLoop, gameStarted]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    setKeys(prev => new Set(prev).add(e.key));
  }, []);

  const handleKeyUp = useCallback((e: KeyboardEvent) => {
    setKeys(prev => {
      const newKeys = new Set(prev);
      newKeys.delete(e.key);
      return newKeys;
    });
  }, []);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);

  const startGame = () => {
    setGameStarted(true);
    setScore(0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-900 via-black to-yellow-900 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-orbitron font-bold text-white">Underground Racing</h1>
            <div className="text-orange-400">Driver: {playerName} • Score: {score.toLocaleString()}</div>
          </div>
          <Button onClick={onBack} variant="outline">← Back to Game Center</Button>
        </div>

        <div className="flex flex-col items-center">
          {!gameStarted ? (
            <div className="text-center space-y-6">
              <div className="text-white text-xl">Ready to race through the city streets?</div>
              <Button onClick={startGame} className="bg-orange-600 hover:bg-orange-700 text-xl px-8 py-4">
                🏎️ Start Race
              </Button>
            </div>
          ) : (
            <>
              <canvas
                ref={canvasRef}
                width={800}
                height={600}
                className="border border-orange-500 bg-black rounded-lg"
              />
              
              <div className="mt-6 text-center text-gray-400">
                <div className="grid grid-cols-4 gap-4">
                  <div>Accelerate: W or ↑</div>
                  <div>Brake: S or ↓</div>
                  <div>Left: A or ←</div>
                  <div>Right: D or →</div>
                </div>
                <div className="mt-2">Race through traffic and avoid crashes!</div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
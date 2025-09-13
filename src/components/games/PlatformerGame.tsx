"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";

interface PlatformerGameProps {
  onBack: () => void;
  playerName: string;
  playerAvatar: string | null;
}

export default function PlatformerGame({ onBack, playerName }: PlatformerGameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameLoopRef = useRef<number>();
  
  const [player] = useState({
    x: 100,
    y: 400,
    width: 32,
    height: 32,
    velocityX: 0,
    velocityY: 0,
    onGround: false,
    speed: 5,
    jumpPower: 15
  });

  const [keys] = useState<Set<string>>(new Set());
  const [score] = useState(0);
  const [level] = useState(1);

  const platforms = [
    { x: 0, y: 550, width: 800, height: 50 },
    { x: 150, y: 450, width: 100, height: 20 },
    { x: 350, y: 350, width: 100, height: 20 },
    { x: 550, y: 250, width: 100, height: 20 },
  ];

  const collectibles = [
    { x: 180, y: 420, collected: false },
    { x: 380, y: 320, collected: false },
    { x: 580, y: 220, collected: false },
  ];

  const gameLoop = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    // Clear canvas
    ctx.fillStyle = "#0a0a0a";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw platforms
    ctx.fillStyle = "#444";
    platforms.forEach(platform => {
      ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
    });

    // Draw collectibles
    ctx.fillStyle = "#ffff00";
    collectibles.forEach(coin => {
      if (!coin.collected) {
        ctx.beginPath();
        ctx.arc(coin.x + 10, coin.y + 10, 8, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    // Draw player
    ctx.fillStyle = "#4444ff";
    ctx.fillRect(player.x, player.y, player.width, player.height);

    gameLoopRef.current = requestAnimationFrame(gameLoop);
  }, [player]);

  useEffect(() => {
    gameLoopRef.current = requestAnimationFrame(gameLoop);
    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [gameLoop]);

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-900 via-black to-blue-900 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-orbitron font-bold text-white">Neon Runner</h1>
            <div className="text-cyan-400">Player: {playerName} • Level: {level} • Score: {score}</div>
          </div>
          <Button onClick={onBack} variant="outline">← Back to Game Center</Button>
        </div>

        <div className="flex flex-col items-center">
          <canvas
            ref={canvasRef}
            width={800}
            height={600}
            className="border border-cyan-500 bg-black rounded-lg"
          />
          
          <div className="mt-6 text-center text-gray-400">
            <div className="grid grid-cols-3 gap-8">
              <div>Move: A/D or ←/→</div>
              <div>Jump: W or Space</div>
              <div>Collect coins to score!</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
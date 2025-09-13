"use client";

import { useRef, useEffect, useCallback, useState } from "react";
import { Button } from "@/components/ui/button";

interface GameEngineProps {
  onBack: () => void;
  playerAvatar: string | null;
  playerName: string;
}

// Game entities interfaces
interface Vector2 {
  x: number;
  y: number;
}

interface Entity {
  id: string;
  position: Vector2;
  velocity: Vector2;
  width: number;
  height: number;
  health: number;
  maxHealth: number;
  type: "player" | "enemy" | "vehicle" | "building" | "pickup";
}

interface Player extends Entity {
  type: "player";
  money: number;
  weapons: string[];
  currentWeapon: string;
  avatar?: string;
}

interface Enemy extends Entity {
  type: "enemy";
  aiType: "patrol" | "aggressive" | "defensive";
  target: Vector2 | null;
}

interface Bullet {
  id: string;
  position: Vector2;
  velocity: Vector2;
  damage: number;
  owner: string;
}

interface Mission {
  id: string;
  title: string;
  description: string;
  objectives: string[];
  reward: number;
  completed: boolean;
}

export default function GameEngine({ onBack, playerAvatar }: GameEngineProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameLoopRef = useRef<number>();
  const lastTimeRef = useRef<number>(0);
  
  // Game state
  const [gameState] = useState<"playing" | "paused" | "mission-complete">("playing");
  const [player, setPlayer] = useState<Player>({
    id: "player",
    position: { x: 400, y: 300 },
    velocity: { x: 0, y: 0 },
    width: 32,
    height: 32,
    health: 100,
    maxHealth: 100,
    type: "player",
    money: 1000,
    weapons: ["pistol", "rifle"],
    currentWeapon: "pistol",
    avatar: playerAvatar || undefined
  });
  
  const [enemies, setEnemies] = useState<Enemy[]>([]);
  const [bullets, setBullets] = useState<Bullet[]>([]);
  const [currentMission] = useState<Mission>({
    id: "tutorial",
    title: "Business Territory",
    description: "Eliminate rival gang members and secure the warehouse",
    objectives: ["Eliminate 5 enemies", "Reach the warehouse", "Collect the money"],
    reward: 5000,
    completed: false
  });
  
  // Input state
  const [keys, setKeys] = useState<Set<string>>(new Set());
  const [mousePos, setMousePos] = useState<Vector2>({ x: 0, y: 0 });

  // Initialize game
  useEffect(() => {
    initializeGame();
    startGameLoop();
    
    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, []);

  const initializeGame = () => {
    // Spawn initial enemies
    const initialEnemies: Enemy[] = [
      {
        id: "enemy1",
        position: { x: 200, y: 150 },
        velocity: { x: 0, y: 0 },
        width: 28,
        height: 28,
        health: 60,
        maxHealth: 60,
        type: "enemy",
        aiType: "patrol",
        target: null
      },
      {
        id: "enemy2", 
        position: { x: 600, y: 450 },
        velocity: { x: 0, y: 0 },
        width: 28,
        height: 28,
        health: 60,
        maxHealth: 60,
        type: "enemy",
        aiType: "aggressive",
        target: null
      },
      {
        id: "enemy3",
        position: { x: 800, y: 200 },
        velocity: { x: 0, y: 0 },
        width: 28,
        height: 28,
        health: 60,
        maxHealth: 60,
        type: "enemy", 
        aiType: "defensive",
        target: null
      }
    ];
    setEnemies(initialEnemies);
  };

  const startGameLoop = () => {
    const gameLoop = (currentTime: number) => {
      const deltaTime = (currentTime - lastTimeRef.current) / 1000;
      lastTimeRef.current = currentTime;

      if (gameState === "playing") {
        update(deltaTime);
        render();
      }

      gameLoopRef.current = requestAnimationFrame(gameLoop);
    };
    
    gameLoopRef.current = requestAnimationFrame(gameLoop);
  };

  const update = (deltaTime: number) => {
    updatePlayer(deltaTime);
    updateEnemies(deltaTime);
    updateBullets(deltaTime);
    checkCollisions();
  };

  const updatePlayer = (deltaTime: number) => {
    const speed = 150; // pixels per second
    const newVelocity = { x: 0, y: 0 };

    // Handle input
    if (keys.has("w") || keys.has("W")) newVelocity.y = -speed;
    if (keys.has("s") || keys.has("S")) newVelocity.y = speed;
    if (keys.has("a") || keys.has("A")) newVelocity.x = -speed;
    if (keys.has("d") || keys.has("D")) newVelocity.x = speed;

    // Normalize diagonal movement
    if (newVelocity.x !== 0 && newVelocity.y !== 0) {
      const magnitude = Math.sqrt(newVelocity.x ** 2 + newVelocity.y ** 2);
      newVelocity.x = (newVelocity.x / magnitude) * speed;
      newVelocity.y = (newVelocity.y / magnitude) * speed;
    }

    setPlayer(prev => ({
      ...prev,
      velocity: newVelocity,
      position: {
        x: Math.max(0, Math.min(800 - prev.width, prev.position.x + newVelocity.x * deltaTime)),
        y: Math.max(0, Math.min(600 - prev.height, prev.position.y + newVelocity.y * deltaTime))
      }
    }));
  };

  const updateEnemies = (deltaTime: number) => {
    setEnemies(prev => prev.map(enemy => {
      // Simple AI behavior
      const playerPos = player.position;
      const enemyPos = enemy.position;
      const distance = Math.sqrt((playerPos.x - enemyPos.x) ** 2 + (playerPos.y - enemyPos.y) ** 2);
      
      const newVelocity = { x: 0, y: 0 };
      const speed = 80;
      
      if (enemy.aiType === "aggressive" && distance < 200) {
        // Move towards player
        const angle = Math.atan2(playerPos.y - enemyPos.y, playerPos.x - enemyPos.x);
        newVelocity.x = Math.cos(angle) * speed;
        newVelocity.y = Math.sin(angle) * speed;
      } else if (enemy.aiType === "patrol") {
        // Simple patrol pattern
        const time = Date.now() / 1000;
        newVelocity.x = Math.sin(time + parseFloat(enemy.id.slice(-1))) * speed * 0.5;
        newVelocity.y = Math.cos(time + parseFloat(enemy.id.slice(-1))) * speed * 0.5;
      }
      
      return {
        ...enemy,
        velocity: newVelocity,
        position: {
          x: Math.max(0, Math.min(800 - enemy.width, enemyPos.x + newVelocity.x * deltaTime)),
          y: Math.max(0, Math.min(600 - enemy.height, enemyPos.y + newVelocity.y * deltaTime))
        }
      };
    }));
  };

  const updateBullets = (deltaTime: number) => {
    setBullets(prev => prev.map(bullet => ({
      ...bullet,
      position: {
        x: bullet.position.x + bullet.velocity.x * deltaTime,
        y: bullet.position.y + bullet.velocity.y * deltaTime
      }
    })).filter(bullet => 
      bullet.position.x >= 0 && bullet.position.x <= 800 &&
      bullet.position.y >= 0 && bullet.position.y <= 600
    ));
  };

  const checkCollisions = () => {
    // Check bullet-enemy collisions
    bullets.forEach(bullet => {
      if (bullet.owner === "player") {
        enemies.forEach(enemy => {
          if (isColliding(bullet.position, { x: 4, y: 4 }, enemy.position, { x: enemy.width, y: enemy.height })) {
            // Damage enemy
            setEnemies(prev => prev.map(e => 
              e.id === enemy.id ? { ...e, health: Math.max(0, e.health - bullet.damage) } : e
            ).filter(e => e.health > 0));
            
            // Remove bullet
            setBullets(prev => prev.filter(b => b.id !== bullet.id));
          }
        });
      }
    });
  };

  const isColliding = (pos1: Vector2, size1: Vector2, pos2: Vector2, size2: Vector2) => {
    return pos1.x < pos2.x + size2.x &&
           pos1.x + size1.x > pos2.x &&
           pos1.y < pos2.y + size2.y &&
           pos1.y + size1.y > pos2.y;
  };

  const shoot = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const canvasX = mousePos.x - rect.left;
    const canvasY = mousePos.y - rect.top;
    
    const angle = Math.atan2(canvasY - player.position.y, canvasX - player.position.x);
    const bulletSpeed = 400;
    
    const newBullet: Bullet = {
      id: `bullet_${Date.now()}_${Math.random()}`,
      position: { ...player.position },
      velocity: {
        x: Math.cos(angle) * bulletSpeed,
        y: Math.sin(angle) * bulletSpeed
      },
      damage: player.currentWeapon === "rifle" ? 40 : 25,
      owner: "player"
    };
    
    setBullets(prev => [...prev, newBullet]);
  };

  const render = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    // Clear canvas
    ctx.fillStyle = "#1a1a1a";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grid background
    ctx.strokeStyle = "#333";
    ctx.lineWidth = 1;
    for (let x = 0; x < canvas.width; x += 50) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += 50) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    // Draw buildings/environment
    ctx.fillStyle = "#444";
    ctx.fillRect(100, 100, 150, 100); // Building 1
    ctx.fillRect(600, 300, 120, 80);  // Building 2
    ctx.fillRect(300, 450, 200, 90);  // Building 3

    // Draw enemies
    enemies.forEach(enemy => {
      ctx.fillStyle = "#ff4444";
      ctx.fillRect(enemy.position.x, enemy.position.y, enemy.width, enemy.height);
      
      // Health bar
      ctx.fillStyle = "#ff0000";
      ctx.fillRect(enemy.position.x, enemy.position.y - 10, enemy.width, 4);
      ctx.fillStyle = "#00ff00";
      ctx.fillRect(enemy.position.x, enemy.position.y - 10, (enemy.health / enemy.maxHealth) * enemy.width, 4);
    });

    // Draw bullets
    bullets.forEach(bullet => {
      ctx.fillStyle = "#ffff00";
      ctx.fillRect(bullet.position.x, bullet.position.y, 4, 4);
    });

    // Draw player
    ctx.fillStyle = "#4444ff";
    ctx.fillRect(player.position.x, player.position.y, player.width, player.height);
    
    // Player health bar
    ctx.fillStyle = "#ff0000";
    ctx.fillRect(player.position.x, player.position.y - 10, player.width, 4);
    ctx.fillStyle = "#00ff00";
    ctx.fillRect(player.position.x, player.position.y - 10, (player.health / player.maxHealth) * player.width, 4);
  };

  // Event handlers
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

  const handleMouseMove = useCallback((e: MouseEvent) => {
    setMousePos({ x: e.clientX, y: e.clientY });
  }, []);

  const handleMouseDown = useCallback(() => {
    shoot();
  }, []);

  const handleMouseUp = useCallback(() => {
    // Mouse up handler if needed
  }, []);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [handleKeyDown, handleKeyUp, handleMouseMove, handleMouseDown, handleMouseUp]);

  return (
    <div className="min-h-screen bg-black flex flex-col">
      {/* HUD */}
      <div className="bg-gray-900 border-b border-gray-700 p-4 flex justify-between items-center">
        <div className="flex items-center gap-6">
          <Button onClick={onBack} variant="outline" size="sm">
            ← Back to Menu
          </Button>
          <div className="text-white">
            <span className="text-green-400">Health:</span> {player.health}/{player.maxHealth}
          </div>
          <div className="text-white">
            <span className="text-yellow-400">Money:</span> ${player.money}
          </div>
          <div className="text-white">
            <span className="text-blue-400">Weapon:</span> {player.currentWeapon}
          </div>
        </div>
        <div className="text-white">
          <span className="text-purple-400">Enemies:</span> {enemies.length}
        </div>
      </div>

      {/* Mission Info */}
      <div className="bg-gray-800 border-b border-gray-600 p-3">
        <div className="text-white">
          <span className="text-orange-400 font-bold">Mission:</span> {currentMission.title}
        </div>
        <div className="text-sm text-gray-300">{currentMission.description}</div>
      </div>

      {/* Game Canvas */}
      <div className="flex-1 flex items-center justify-center bg-gray-900">
        <canvas
          ref={canvasRef}
          width={800}
          height={600}
          className="border border-gray-600 bg-black cursor-crosshair"
        />
      </div>

      {/* Controls Info */}
      <div className="bg-gray-900 border-t border-gray-700 p-4">
        <div className="text-center text-sm text-gray-400">
          Use WASD to move • Click to shoot • Eliminate all enemies to complete mission
        </div>
      </div>
    </div>
  );
}
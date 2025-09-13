"use client";

import { useRef, useEffect, useCallback, useState } from "react";
import { Button } from "@/components/ui/button";

interface EnhancedGameEngineProps {
  onBack: () => void;
  playerAvatar: string | null;
  playerName: string;
}

// Enhanced game entities for Unity-style gameplay
interface Vector2 {
  x: number;
  y: number;
}

interface GameObject {
  id: string;
  position: Vector2;
  velocity: Vector2;
  rotation: number;
  width: number;
  height: number;
  active: boolean;
  layer: number;
}

interface Player extends GameObject {
  health: number;
  maxHealth: number;
  energy: number;
  maxEnergy: number;
  score: number;
  level: number;
  experience: number;
  weapons: Weapon[];
  currentWeapon: number;
  abilities: Ability[];
  powerUps: PowerUp[];
  avatar?: string;
}

interface Enemy extends GameObject {
  health: number;
  maxHealth: number;
  type: "grunt" | "heavy" | "boss" | "flyer";
  aiState: "idle" | "patrol" | "chase" | "attack" | "flee";
  target: Vector2 | null;
  attackCooldown: number;
  dropRate: number;
}

interface Weapon {
  id: string;
  name: string;
  damage: number;
  fireRate: number;
  ammo: number;
  maxAmmo: number;
  range: number;
  spread: number;
  lastFired: number;
}

interface Ability {
  id: string;
  name: string;
  cooldown: number;
  lastUsed: number;
  energyCost: number;
}

interface PowerUp extends GameObject {
  type: "health" | "energy" | "weapon" | "speed" | "damage" | "shield";
  value: number;
  duration: number;
}

interface Projectile extends GameObject {
  damage: number;
  owner: string;
  lifeTime: number;
  piercing: number;
}

interface Particle extends GameObject {
  life: number;
  maxLife: number;
  color: string;
  size: number;
}

interface GameStats {
  enemiesKilled: number;
  timeAlive: number;
  powerUpsCollected: number;
  damageDealt: number;
  damageTaken: number;
  accuracy: number;
}

export default function EnhancedGameEngine({ onBack, playerAvatar, playerName }: EnhancedGameEngineProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameLoopRef = useRef<number>();
  const lastTimeRef = useRef<number>(0);
  const gameStartTime = useRef<number>(Date.now());
  
  // Enhanced game state
  const [gameState, setGameState] = useState<"playing" | "paused" | "gameOver" | "levelComplete">("playing");
  const [currentLevel, setCurrentLevel] = useState(1);
  const [waveNumber, setWaveNumber] = useState(1);
  const [enemiesRemaining, setEnemiesRemaining] = useState(0);
  
  const [player, setPlayer] = useState<Player>({
    id: "player",
    position: { x: 400, y: 300 },
    velocity: { x: 0, y: 0 },
    rotation: 0,
    width: 32,
    height: 32,
    active: true,
    layer: 1,
    health: 100,
    maxHealth: 100,
    energy: 100,
    maxEnergy: 100,
    score: 0,
    level: 1,
    experience: 0,
    weapons: [
      {
        id: "pistol",
        name: "Plasma Pistol",
        damage: 25,
        fireRate: 300,
        ammo: 15,
        maxAmmo: 15,
        range: 300,
        spread: 0.1,
        lastFired: 0
      },
      {
        id: "rifle",
        name: "Assault Rifle",
        damage: 20,
        fireRate: 150,
        ammo: 30,
        maxAmmo: 30,
        range: 400,
        spread: 0.15,
        lastFired: 0
      }
    ],
    currentWeapon: 0,
    abilities: [
      {
        id: "dash",
        name: "Energy Dash",
        cooldown: 3000,
        lastUsed: 0,
        energyCost: 25
      },
      {
        id: "shield",
        name: "Energy Shield",
        cooldown: 5000,
        lastUsed: 0,
        energyCost: 40
      }
    ],
    powerUps: [],
    avatar: playerAvatar || undefined
  });
  
  const [enemies, setEnemies] = useState<Enemy[]>([]);
  const [projectiles, setProjectiles] = useState<Projectile[]>([]);
  const [powerUps, setPowerUps] = useState<PowerUp[]>([]);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [explosions] = useState<Particle[]>([]);
  
  const [gameStats, setGameStats] = useState<GameStats>({
    enemiesKilled: 0,
    timeAlive: 0,
    powerUpsCollected: 0,
    damageDealt: 0,
    damageTaken: 0,
    accuracy: 0
  });
  
  // Input state
  const [keys, setKeys] = useState<Set<string>>(new Set());
  const [mousePos, setMousePos] = useState<Vector2>({ x: 0, y: 0 });
  const [shotsFired, setShotsFired] = useState(0);
  const [shotsHit, setShotsHit] = useState(0);

  // Initialize enhanced game
  useEffect(() => {
    initializeLevel();
    startGameLoop();
    
    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, []);

  const initializeLevel = () => {
    spawnWave(waveNumber);
    spawnPowerUps();
  };

  const spawnWave = (wave: number) => {
    const waveEnemies: Enemy[] = [];
    const enemyCount = Math.min(5 + wave * 2, 15);
    
    for (let i = 0; i < enemyCount; i++) {
      const enemyType = Math.random() < 0.7 ? "grunt" : Math.random() < 0.9 ? "heavy" : "flyer";
      const enemy: Enemy = {
        id: `enemy_${wave}_${i}`,
        position: {
          x: Math.random() > 0.5 ? Math.random() * 100 : 700 + Math.random() * 100,
          y: Math.random() > 0.5 ? Math.random() * 100 : 500 + Math.random() * 100
        },
        velocity: { x: 0, y: 0 },
        rotation: 0,
        width: enemyType === "heavy" ? 40 : enemyType === "flyer" ? 24 : 28,
        height: enemyType === "heavy" ? 40 : enemyType === "flyer" ? 24 : 28,
        active: true,
        layer: 1,
        health: enemyType === "heavy" ? 100 : enemyType === "flyer" ? 40 : 60,
        maxHealth: enemyType === "heavy" ? 100 : enemyType === "flyer" ? 40 : 60,
        type: enemyType,
        aiState: "patrol",
        target: null,
        attackCooldown: 0,
        dropRate: enemyType === "heavy" ? 0.8 : 0.3
      };
      waveEnemies.push(enemy);
    }
    
    setEnemies(waveEnemies);
    setEnemiesRemaining(enemyCount);
  };

  const spawnPowerUps = () => {
    const powerUpTypes: PowerUp["type"][] = ["health", "energy", "weapon", "speed", "damage"];
    const newPowerUps: PowerUp[] = [];
    
    for (let i = 0; i < 3; i++) {
      const type = powerUpTypes[Math.floor(Math.random() * powerUpTypes.length)];
      const powerUp: PowerUp = {
        id: `powerup_${i}`,
        position: {
          x: 100 + Math.random() * 600,
          y: 100 + Math.random() * 400
        },
        velocity: { x: 0, y: 0 },
        rotation: 0,
        width: 20,
        height: 20,
        active: true,
        layer: 0,
        type,
        value: type === "health" ? 30 : type === "energy" ? 40 : 1,
        duration: type === "speed" || type === "damage" ? 10000 : 0
      };
      newPowerUps.push(powerUp);
    }
    
    setPowerUps(newPowerUps);
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
    updateProjectiles(deltaTime);
    updatePowerUps(deltaTime);
    updateParticles(deltaTime);
    checkCollisions();
    updateGameStats(deltaTime);
    
    // Check wave completion
    if (enemies.length === 0 && gameState === "playing") {
      setTimeout(() => {
        setWaveNumber(prev => prev + 1);
        spawnWave(waveNumber + 1);
        spawnPowerUps();
      }, 2000);
    }
  };

  const updatePlayer = (deltaTime: number) => {
    const speed = 200;
    const newVelocity = { x: 0, y: 0 };

    // Handle movement input
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

    // Apply speed power-up
    const speedBoost = player.powerUps.find(p => p.type === "speed");
    if (speedBoost) {
      newVelocity.x *= 1.5;
      newVelocity.y *= 1.5;
    }

    // Update player rotation to face mouse
    const canvas = canvasRef.current;
    if (canvas) {
      const rect = canvas.getBoundingClientRect();
      const canvasX = mousePos.x - rect.left;
      const canvasY = mousePos.y - rect.top;
      const angle = Math.atan2(canvasY - player.position.y, canvasX - player.position.x);
      
      setPlayer(prev => ({
        ...prev,
        rotation: angle,
        velocity: newVelocity,
        position: {
          x: Math.max(0, Math.min(800 - prev.width, prev.position.x + newVelocity.x * deltaTime)),
          y: Math.max(0, Math.min(600 - prev.height, prev.position.y + newVelocity.y * deltaTime))
        },
        energy: Math.min(prev.maxEnergy, prev.energy + 20 * deltaTime) // Energy regeneration
      }));
    }
  };

  const updateEnemies = (deltaTime: number) => {
    setEnemies(prev => prev.map(enemy => {
      if (!enemy.active) return enemy;

      const playerPos = player.position;
      const enemyPos = enemy.position;
      const distance = Math.sqrt((playerPos.x - enemyPos.x) ** 2 + (playerPos.y - enemyPos.y) ** 2);
      
      let newVelocity = { x: 0, y: 0 };
      let newAiState = enemy.aiState;
      const speed = enemy.type === "flyer" ? 120 : enemy.type === "heavy" ? 60 : 80;
      
      // AI State Machine
      switch (enemy.aiState) {
        case "idle":
        case "patrol":
          if (distance < 150) {
            newAiState = "chase";
          } else {
            // Patrol behavior
            const time = Date.now() / 1000;
            newVelocity.x = Math.sin(time + parseFloat(enemy.id.slice(-1))) * speed * 0.3;
            newVelocity.y = Math.cos(time + parseFloat(enemy.id.slice(-1))) * speed * 0.3;
          }
          break;
          
        case "chase":
          if (distance > 300) {
            newAiState = "patrol";
          } else if (distance < 50 && enemy.attackCooldown <= 0) {
            newAiState = "attack";
          } else {
            // Move towards player
            const angle = Math.atan2(playerPos.y - enemyPos.y, playerPos.x - enemyPos.x);
            newVelocity.x = Math.cos(angle) * speed;
            newVelocity.y = Math.sin(angle) * speed;
          }
          break;
          
        case "attack":
          // Attack player
          if (enemy.attackCooldown <= 0) {
            // Create enemy projectile
            const angle = Math.atan2(playerPos.y - enemyPos.y, playerPos.x - enemyPos.x);
            const projectile: Projectile = {
              id: `enemy_bullet_${Date.now()}_${Math.random()}`,
              position: { ...enemyPos },
              velocity: {
                x: Math.cos(angle) * 300,
                y: Math.sin(angle) * 300
              },
              rotation: angle,
              width: 6,
              height: 6,
              active: true,
              layer: 1,
              damage: enemy.type === "heavy" ? 25 : 15,
              owner: enemy.id,
              lifeTime: 2000,
              piercing: 0
            };
            
            setProjectiles(p => [...p, projectile]);
            enemy.attackCooldown = enemy.type === "heavy" ? 2000 : 1500;
          }
          newAiState = "chase";
          break;
      }
      
      return {
        ...enemy,
        aiState: newAiState,
        velocity: newVelocity,
        position: {
          x: Math.max(0, Math.min(800 - enemy.width, enemyPos.x + newVelocity.x * deltaTime)),
          y: Math.max(0, Math.min(600 - enemy.height, enemyPos.y + newVelocity.y * deltaTime))
        },
        attackCooldown: Math.max(0, enemy.attackCooldown - deltaTime * 1000)
      };
    }));
  };

  const updateProjectiles = (deltaTime: number) => {
    setProjectiles(prev => prev.map(projectile => ({
      ...projectile,
      position: {
        x: projectile.position.x + projectile.velocity.x * deltaTime,
        y: projectile.position.y + projectile.velocity.y * deltaTime
      },
      lifeTime: projectile.lifeTime - deltaTime * 1000
    })).filter(projectile => 
      projectile.lifeTime > 0 &&
      projectile.position.x >= -10 && projectile.position.x <= 810 &&
      projectile.position.y >= -10 && projectile.position.y <= 610 &&
      projectile.active
    ));
  };

  const updatePowerUps = (deltaTime: number) => {
    // Animate power-ups
    setPowerUps(prev => prev.map(powerUp => ({
      ...powerUp,
      rotation: powerUp.rotation + deltaTime * 2,
      position: {
        ...powerUp.position,
        y: powerUp.position.y + Math.sin(Date.now() / 1000 + parseFloat(powerUp.id.slice(-1))) * 0.5
      }
    })));

    // Update player power-ups
    setPlayer(prev => ({
      ...prev,
      powerUps: prev.powerUps.map(powerUp => ({
        ...powerUp,
        duration: powerUp.duration - deltaTime * 1000
      })).filter(powerUp => powerUp.duration > 0)
    }));
  };

  const updateParticles = (deltaTime: number) => {
    setParticles(prev => prev.map(particle => ({
      ...particle,
      life: particle.life - deltaTime * 1000,
      position: {
        x: particle.position.x + particle.velocity.x * deltaTime,
        y: particle.position.y + particle.velocity.y * deltaTime
      }
    })).filter(particle => particle.life > 0));

    setExplosions(prev => prev.map(explosion => ({
      ...explosion,
      life: explosion.life - deltaTime * 1000,
      size: explosion.size + deltaTime * 20
    })).filter(explosion => explosion.life > 0));
  };

  const updateGameStats = (deltaTime: number) => {
    setGameStats(prev => ({
      ...prev,
      timeAlive: prev.timeAlive + deltaTime,
      accuracy: shotsFired > 0 ? (shotsHit / shotsFired) * 100 : 0
    }));
  };

  const checkCollisions = () => {
    // Player projectiles vs enemies
    projectiles.forEach(projectile => {
      if (projectile.owner === "player") {
        enemies.forEach(enemy => {
          if (enemy.active && isColliding(projectile.position, { x: projectile.width, y: projectile.height }, enemy.position, { x: enemy.width, y: enemy.height })) {
            // Damage enemy
            const newHealth = enemy.health - projectile.damage;
            if (newHealth <= 0) {
              // Enemy killed
              createExplosion(enemy.position);
              
              if (Math.random() < enemy.dropRate) {
                spawnRandomPowerUp(enemy.position);
              }
              
              setPlayer(prev => ({
                ...prev,
                score: prev.score + (enemy.type === "heavy" ? 100 : enemy.type === "flyer" ? 75 : 50),
                experience: prev.experience + 10
              }));
              
              setGameStats(prev => ({ ...prev, enemiesKilled: prev.enemiesKilled + 1 }));
              setShotsHit(prev => prev + 1);
              
              setEnemies(prev => prev.filter(e => e.id !== enemy.id));
              setEnemiesRemaining(prev => prev - 1);
            } else {
              setEnemies(prev => prev.map(e => 
                e.id === enemy.id ? { ...e, health: newHealth } : e
              ));
              setShotsHit(prev => prev + 1);
            }
            
            setProjectiles(prev => prev.filter(p => p.id !== projectile.id));
            setGameStats(prev => ({ ...prev, damageDealt: prev.damageDealt + projectile.damage }));
          }
        });
      }
    });

    // Enemy projectiles vs player
    projectiles.forEach(projectile => {
      if (projectile.owner !== "player") {
        if (isColliding(projectile.position, { x: projectile.width, y: projectile.height }, player.position, { x: player.width, y: player.height })) {
          // Damage player
          const newHealth = Math.max(0, player.health - projectile.damage);
          setPlayer(prev => ({ ...prev, health: newHealth }));
          setGameStats(prev => ({ ...prev, damageTaken: prev.damageTaken + projectile.damage }));
          
          if (newHealth <= 0) {
            setGameState("gameOver");
          }
          
          setProjectiles(prev => prev.filter(p => p.id !== projectile.id));
          createHitEffect(player.position);
        }
      }
    });

    // Player vs power-ups
    powerUps.forEach(powerUp => {
      if (isColliding(player.position, { x: player.width, y: player.height }, powerUp.position, { x: powerUp.width, y: powerUp.height })) {
        collectPowerUp(powerUp);
        setPowerUps(prev => prev.filter(p => p.id !== powerUp.id));
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
    const currentWeapon = player.weapons[player.currentWeapon];
    const now = Date.now();
    
    if (now - currentWeapon.lastFired < currentWeapon.fireRate || currentWeapon.ammo <= 0) {
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const canvasX = mousePos.x - rect.left;
    const canvasY = mousePos.y - rect.top;
    
    const baseAngle = Math.atan2(canvasY - player.position.y, canvasX - player.position.x);
    const spread = currentWeapon.spread;
    const angle = baseAngle + (Math.random() - 0.5) * spread;
    
    const bulletSpeed = 500;
    const damageBoost = player.powerUps.find(p => p.type === "damage") ? 1.5 : 1;
    
    const newProjectile: Projectile = {
      id: `bullet_${Date.now()}_${Math.random()}`,
      position: { ...player.position },
      velocity: {
        x: Math.cos(angle) * bulletSpeed,
        y: Math.sin(angle) * bulletSpeed
      },
      rotation: angle,
      width: 4,
      height: 4,
      active: true,
      layer: 1,
      damage: currentWeapon.damage * damageBoost,
      owner: "player",
      lifeTime: 2000,
      piercing: 0
    };
    
    setProjectiles(prev => [...prev, newProjectile]);
    
    // Update weapon
    setPlayer(prev => ({
      ...prev,
      weapons: prev.weapons.map((weapon, index) => 
        index === prev.currentWeapon 
          ? { ...weapon, ammo: weapon.ammo - 1, lastFired: now }
          : weapon
      )
    }));
    
    setShotsFired(prev => prev + 1);
    
    // Create muzzle flash
    createMuzzleFlash(player.position, angle);
  };

  const createExplosion = (position: Vector2) => {
    const explosionParticles: Particle[] = [];
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const speed = 100 + Math.random() * 50;
      const particle: Particle = {
        id: `explosion_${Date.now()}_${i}`,
        position: { ...position },
        velocity: {
          x: Math.cos(angle) * speed,
          y: Math.sin(angle) * speed
        },
        rotation: 0,
        width: 4,
        height: 4,
        active: true,
        layer: 2,
        life: 500,
        maxLife: 500,
        color: "#ff4400",
        size: 2
      };
      explosionParticles.push(particle);
    }
    setParticles(prev => [...prev, ...explosionParticles]);
  };

  const createMuzzleFlash = (position: Vector2, angle: number) => {
    const flash: Particle = {
      id: `flash_${Date.now()}`,
      position: { ...position },
      velocity: { x: 0, y: 0 },
      rotation: angle,
      width: 8,
      height: 8,
      active: true,
      layer: 2,
      life: 100,
      maxLife: 100,
      color: "#ffff00",
      size: 6
    };
    setParticles(prev => [...prev, flash]);
  };

  const createHitEffect = (position: Vector2) => {
    const hitParticles: Particle[] = [];
    for (let i = 0; i < 4; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 50 + Math.random() * 30;
      const particle: Particle = {
        id: `hit_${Date.now()}_${i}`,
        position: { ...position },
        velocity: {
          x: Math.cos(angle) * speed,
          y: Math.sin(angle) * speed
        },
        rotation: 0,
        width: 3,
        height: 3,
        active: true,
        layer: 2,
        life: 300,
        maxLife: 300,
        color: "#ff0000",
        size: 1.5
      };
      hitParticles.push(particle);
    }
    setParticles(prev => [...prev, ...hitParticles]);
  };

  const spawnRandomPowerUp = (position: Vector2) => {
    const types: PowerUp["type"][] = ["health", "energy", "weapon", "speed", "damage"];
    const type = types[Math.floor(Math.random() * types.length)];
    
    const powerUp: PowerUp = {
      id: `drop_${Date.now()}`,
      position: { ...position },
      velocity: { x: 0, y: 0 },
      rotation: 0,
      width: 16,
      height: 16,
      active: true,
      layer: 0,
      type,
      value: type === "health" ? 25 : type === "energy" ? 30 : 1,
      duration: type === "speed" || type === "damage" ? 8000 : 0
    };
    
    setPowerUps(prev => [...prev, powerUp]);
  };

  const collectPowerUp = (powerUp: PowerUp) => {
    switch (powerUp.type) {
      case "health":
        setPlayer(prev => ({ ...prev, health: Math.min(prev.maxHealth, prev.health + powerUp.value) }));
        break;
      case "energy":
        setPlayer(prev => ({ ...prev, energy: Math.min(prev.maxEnergy, prev.energy + powerUp.value) }));
        break;
      case "weapon":
        // Reload current weapon
        setPlayer(prev => ({
          ...prev,
          weapons: prev.weapons.map((weapon, index) => 
            index === prev.currentWeapon ? { ...weapon, ammo: weapon.maxAmmo } : weapon
          )
        }));
        break;
      case "speed":
      case "damage":
        setPlayer(prev => ({
          ...prev,
          powerUps: [...prev.powerUps.filter(p => p.type !== powerUp.type), powerUp]
        }));
        break;
    }
    
    setGameStats(prev => ({ ...prev, powerUpsCollected: prev.powerUpsCollected + 1 }));
  };

  const useAbility = (abilityIndex: number) => {
    const ability = player.abilities[abilityIndex];
    const now = Date.now();
    
    if (now - ability.lastUsed < ability.cooldown || player.energy < ability.energyCost) {
      return;
    }
    
    switch (ability.id) {
      case "dash":
        // Quick dash in movement direction
        const dashSpeed = 300;
        const dashVelocity = { ...player.velocity };
        if (dashVelocity.x === 0 && dashVelocity.y === 0) {
          dashVelocity.x = Math.cos(player.rotation) * dashSpeed;
          dashVelocity.y = Math.sin(player.rotation) * dashSpeed;
        }
        
        setPlayer(prev => ({
          ...prev,
          position: {
            x: Math.max(0, Math.min(800 - prev.width, prev.position.x + dashVelocity.x * 0.2)),
            y: Math.max(0, Math.min(600 - prev.height, prev.position.y + dashVelocity.y * 0.2))
          },
          energy: prev.energy - ability.energyCost,
          abilities: prev.abilities.map(a => 
            a.id === ability.id ? { ...a, lastUsed: now } : a
          )
        }));
        break;
        
      case "shield":
        // Temporary invincibility/shield
        setPlayer(prev => ({
          ...prev,
          energy: prev.energy - ability.energyCost,
          abilities: prev.abilities.map(a => 
            a.id === ability.id ? { ...a, lastUsed: now } : a
          )
        }));
        break;
    }
  };

  const render = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    // Clear canvas
    ctx.fillStyle = "#0a0a0a";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw background grid
    ctx.strokeStyle = "#222";
    ctx.lineWidth = 0.5;
    for (let x = 0; x < canvas.width; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    // Draw power-ups (bottom layer)
    powerUps.forEach(powerUp => {
      ctx.save();
      ctx.translate(powerUp.position.x + powerUp.width/2, powerUp.position.y + powerUp.height/2);
      ctx.rotate(powerUp.rotation);
      
      // Power-up glow
      ctx.shadowColor = getPowerUpColor(powerUp.type);
      ctx.shadowBlur = 10;
      
      ctx.fillStyle = getPowerUpColor(powerUp.type);
      ctx.fillRect(-powerUp.width/2, -powerUp.height/2, powerUp.width, powerUp.height);
      
      ctx.restore();
    });

    // Draw enemies
    enemies.forEach(enemy => {
      if (!enemy.active) return;
      
      ctx.save();
      ctx.translate(enemy.position.x + enemy.width/2, enemy.position.y + enemy.height/2);
      
      // Enemy color based on type
      ctx.fillStyle = enemy.type === "heavy" ? "#aa4444" : enemy.type === "flyer" ? "#4444aa" : "#ff4444";
      ctx.fillRect(-enemy.width/2, -enemy.height/2, enemy.width, enemy.height);
      
      // Enemy health bar
      ctx.fillStyle = "#ff0000";
      ctx.fillRect(-enemy.width/2, -enemy.height/2 - 8, enemy.width, 3);
      ctx.fillStyle = "#00ff00";
      ctx.fillRect(-enemy.width/2, -enemy.height/2 - 8, (enemy.health / enemy.maxHealth) * enemy.width, 3);
      
      ctx.restore();
    });

    // Draw projectiles
    projectiles.forEach(projectile => {
      ctx.fillStyle = projectile.owner === "player" ? "#ffff00" : "#ff6600";
      ctx.fillRect(projectile.position.x, projectile.position.y, projectile.width, projectile.height);
    });

    // Draw particles and effects
    particles.forEach(particle => {
      const alpha = particle.life / particle.maxLife;
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = particle.color;
      ctx.fillRect(particle.position.x, particle.position.y, particle.size, particle.size);
      ctx.restore();
    });

    // Draw player
    ctx.save();
    ctx.translate(player.position.x + player.width/2, player.position.y + player.height/2);
    ctx.rotate(player.rotation);
    
    // Player glow if powered up
    if (player.powerUps.length > 0) {
      ctx.shadowColor = "#00ffff";
      ctx.shadowBlur = 15;
    }
    
    ctx.fillStyle = "#4444ff";
    ctx.fillRect(-player.width/2, -player.height/2, player.width, player.height);
    
    // Player health bar
    ctx.resetTransform();
    ctx.fillStyle = "#ff0000";
    ctx.fillRect(player.position.x, player.position.y - 10, player.width, 4);
    ctx.fillStyle = "#00ff00";
    ctx.fillRect(player.position.x, player.position.y - 10, (player.health / player.maxHealth) * player.width, 4);
    
    // Energy bar
    ctx.fillStyle = "#0000ff";
    ctx.fillRect(player.position.x, player.position.y - 6, player.width, 2);
    ctx.fillStyle = "#00ffff";
    ctx.fillRect(player.position.x, player.position.y - 6, (player.energy / player.maxEnergy) * player.width, 2);
    
    ctx.restore();
  };

  const getPowerUpColor = (type: PowerUp["type"]) => {
    switch (type) {
      case "health": return "#00ff00";
      case "energy": return "#0088ff";
      case "weapon": return "#ffff00";
      case "speed": return "#ff8800";
      case "damage": return "#ff0088";
      default: return "#ffffff";
    }
  };

  const switchWeapon = () => {
    setPlayer(prev => ({
      ...prev,
      currentWeapon: (prev.currentWeapon + 1) % prev.weapons.length
    }));
  };

  const restartGame = () => {
    setGameState("playing");
    setCurrentLevel(1);
    setWaveNumber(1);
    setShotsFired(0);
    setShotsHit(0);
    setPlayer(prev => ({
      ...prev,
      position: { x: 400, y: 300 },
      health: prev.maxHealth,
      energy: prev.maxEnergy,
      score: 0,
      level: 1,
      experience: 0,
      powerUps: [],
      weapons: prev.weapons.map(w => ({ ...w, ammo: w.maxAmmo }))
    }));
    setGameStats({
      enemiesKilled: 0,
      timeAlive: 0,
      powerUpsCollected: 0,
      damageDealt: 0,
      damageTaken: 0,
      accuracy: 0
    });
    gameStartTime.current = Date.now();
    initializeLevel();
  };

  // Event handlers
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    setKeys(prev => new Set(prev).add(e.key));
    
    // Weapon switching
    if (e.key === "q" || e.key === "Q") {
      switchWeapon();
    }
    
    // Abilities
    if (e.key === "1") {
      useAbility(0); // Dash
    }
    if (e.key === "2") {
      useAbility(1); // Shield
    }
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

  if (gameState === "gameOver") {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center text-white p-8">
          <h1 className="text-6xl font-orbitron font-bold text-red-400 mb-6">GAME OVER</h1>
          <div className="text-xl mb-8">
            <div className="mb-2">Final Score: <span className="text-yellow-400">{player.score.toLocaleString()}</span></div>
            <div className="mb-2">Wave Reached: <span className="text-blue-400">{waveNumber}</span></div>
            <div className="mb-2">Enemies Killed: <span className="text-red-400">{gameStats.enemiesKilled}</span></div>
            <div className="mb-2">Time Survived: <span className="text-green-400">{Math.floor(gameStats.timeAlive)}s</span></div>
            <div className="mb-2">Accuracy: <span className="text-purple-400">{gameStats.accuracy.toFixed(1)}%</span></div>
          </div>
          <div className="flex gap-4 justify-center">
            <Button onClick={restartGame} className="bg-green-600 hover:bg-green-700">
              Play Again
            </Button>
            <Button onClick={onBack} variant="outline">
              Back to Menu
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex flex-col">
      {/* Enhanced HUD */}
      <div className="bg-gray-900 border-b border-gray-700 p-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-6">
            <Button onClick={onBack} variant="outline" size="sm">
              ← Back to Menu
            </Button>
            <div className="text-white">
              <span className="text-green-400">Health:</span> {player.health}/{player.maxHealth}
            </div>
            <div className="text-white">
              <span className="text-blue-400">Energy:</span> {player.energy}/{player.maxEnergy}
            </div>
            <div className="text-white">
              <span className="text-yellow-400">Score:</span> {player.score.toLocaleString()}
            </div>
            <div className="text-white">
              <span className="text-purple-400">Wave:</span> {waveNumber}
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-white">
              <span className="text-orange-400">Weapon:</span> {player.weapons[player.currentWeapon].name} 
              ({player.weapons[player.currentWeapon].ammo}/{player.weapons[player.currentWeapon].maxAmmo})
            </div>
            <div className="text-white">
              <span className="text-red-400">Enemies:</span> {enemiesRemaining}
            </div>
          </div>
        </div>
        
        {/* Power-up indicators */}
        {player.powerUps.length > 0 && (
          <div className="mt-2 flex gap-2">
            {player.powerUps.map((powerUp, index) => (
              <div key={index} className="bg-gray-700 px-2 py-1 rounded text-xs text-white">
                <span style={{ color: getPowerUpColor(powerUp.type) }}>
                  {powerUp.type.toUpperCase()}: {Math.ceil(powerUp.duration / 1000)}s
                </span>
              </div>
            ))}
          </div>
        )}
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

      {/* Enhanced Controls Info */}
      <div className="bg-gray-900 border-t border-gray-700 p-4">
        <div className="text-center text-sm text-gray-400">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>Move: WASD</div>
            <div>Shoot: Click</div>
            <div>Switch Weapon: Q</div>
            <div>Dash: 1 | Shield: 2</div>
          </div>
          <div className="mt-2">
            Survive waves of enemies • Collect power-ups • Level up your character
          </div>
        </div>
      </div>
    </div>
  );
}
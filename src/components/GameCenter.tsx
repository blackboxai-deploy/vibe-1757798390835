"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import EnhancedGameEngine from "@/components/EnhancedGameEngine";
import PuzzleGame from "@/components/games/PuzzleGame";
import StrategyGame from "@/components/games/StrategyGame";
import AdventureGame from "@/components/games/AdventureGame";
import PlatformerGame from "@/components/games/PlatformerGame";
import RPGGame from "@/components/games/RPGGame";
import RacingGame from "@/components/games/RacingGame";
import SimpleTestGame from "@/components/games/SimpleTestGame";

interface GameCenterProps {
  onBack: () => void;
  playerName: string;
  playerAvatar: string | null;
}

type SelectedGame = 
  | "action" 
  | "puzzle" 
  | "strategy" 
  | "adventure" 
  | "platformer" 
  | "rpg" 
  | "racing" 
  | "test"
  | null;

interface GameInfo {
  id: SelectedGame;
  title: string;
  description: string;
  genre: string;
  difficulty: "Easy" | "Medium" | "Hard" | "Extreme";
  players: string;
  features: string[];
  icon: string;
  color: string;
  borderColor: string;
}

export default function GameCenter({ onBack, playerName, playerAvatar }: GameCenterProps) {
  const [selectedGame, setSelectedGame] = useState<SelectedGame>(null);
  const [gameStats] = useState({
    gamesPlayed: 47,
    totalScore: 234650,
    achievementsUnlocked: 23,
    hoursPlayed: 12.5
  });

  const games: GameInfo[] = [
    {
      id: "action",
      title: "Street Empire: Enhanced",
      description: "Unity-style 2D action shooter with advanced enemy AI, wave progression, and power-up systems",
      genre: "Action Shooter",
      difficulty: "Hard",
      players: "Single Player",
      features: ["Real-time combat", "Enemy AI", "Power-ups", "Wave system", "Statistics"],
      icon: "🎯",
      color: "from-red-800/50 to-red-900/80",
      borderColor: "border-red-500"
    },
    {
      id: "puzzle",
      title: "Cyber Puzzle Master",
      description: "Mind-bending puzzle challenges with increasing complexity and strategic thinking",
      genre: "Puzzle",
      difficulty: "Medium",
      players: "Single Player",
      features: ["Logic puzzles", "Pattern matching", "Time challenges", "Hint system", "Level editor"],
      icon: "🧩",
      color: "from-blue-800/50 to-blue-900/80",
      borderColor: "border-blue-500"
    },
    {
      id: "strategy",
      title: "Empire Builder",
      description: "Build and manage your criminal empire with resource management and tactical decisions",
      genre: "Strategy",
      difficulty: "Extreme",
      players: "Single Player",
      features: ["Resource management", "Territory control", "Economic warfare", "Diplomacy", "Research"],
      icon: "⚔️",
      color: "from-yellow-800/50 to-yellow-900/80",
      borderColor: "border-yellow-500"
    },
    {
      id: "adventure",
      title: "Urban Detective",
      description: "Investigate crimes and solve mysteries in a noir-style adventure game",
      genre: "Adventure",
      difficulty: "Medium",
      players: "Single Player",
      features: ["Story-driven", "Investigation", "Dialogue choices", "Multiple endings", "Inventory"],
      icon: "🔍",
      color: "from-purple-800/50 to-purple-900/80",
      borderColor: "border-purple-500"
    },
    {
      id: "platformer",
      title: "Neon Runner",
      description: "Fast-paced platformer with parkour mechanics and cyberpunk aesthetics",
      genre: "Platformer",
      difficulty: "Hard",
      players: "Single Player",
      features: ["Parkour mechanics", "Speed runs", "Wall jumping", "Collectibles", "Boss fights"],
      icon: "🏃",
      color: "from-cyan-800/50 to-cyan-900/80",
      borderColor: "border-cyan-500"
    },
    {
      id: "rpg",
      title: "Street Legends RPG",
      description: "Level up your character in an RPG with skill trees, equipment, and story progression",
      genre: "RPG",
      difficulty: "Hard",
      players: "Single Player",
      features: ["Character progression", "Skill trees", "Equipment system", "Quests", "Stats"],
      icon: "⚗️",
      color: "from-green-800/50 to-green-900/80",
      borderColor: "border-green-500"
    },
    {
      id: "racing",
      title: "Underground Racing",
      description: "High-speed racing through city streets with customizable vehicles and tracks",
      genre: "Racing",
      difficulty: "Medium",
      players: "Single Player",
      features: ["Vehicle customization", "Multiple tracks", "Time trials", "Drifting", "Upgrades"],
      icon: "🏎️",
      color: "from-orange-800/50 to-orange-900/80",
      borderColor: "border-orange-500"
    },
    {
      id: "test",
      title: "Click Test Game",
      description: "Simple test game to verify the gaming system is working correctly",
      genre: "Test",
      difficulty: "Easy",
      players: "Single Player",
      features: ["Click mechanics", "Score system", "Real-time updates", "Simple UI", "Quick play"],
      icon: "🎮",
      color: "from-pink-800/50 to-pink-900/80",
      borderColor: "border-pink-500"
    }
  ];

  const handleGameSelect = (gameId: SelectedGame) => {
    setSelectedGame(gameId);
  };

  const handleBackToGameCenter = () => {
    setSelectedGame(null);
  };

   if (selectedGame) {
    const gameProps = {
      onBack: handleBackToGameCenter,
      playerName,
      playerAvatar
    };

    try {
      switch (selectedGame) {
        case "action":
          return <EnhancedGameEngine {...gameProps} />;
        case "puzzle":
          return <PuzzleGame {...gameProps} />;
        case "strategy":
          return <StrategyGame {...gameProps} />;
        case "adventure":
          return <AdventureGame {...gameProps} />;
        case "platformer":
          return <PlatformerGame {...gameProps} />;
        case "rpg":
          return <RPGGame {...gameProps} />;
        case "racing":
          return <RacingGame {...gameProps} />;
        case "test":
          return <SimpleTestGame {...gameProps} />;
        default:
          return (
            <div className="min-h-screen bg-black flex items-center justify-center">
              <div className="text-center text-white">
                <h1 className="text-3xl mb-4">Game Not Found</h1>
                <Button onClick={handleBackToGameCenter} className="bg-blue-600 hover:bg-blue-700">
                  ← Back to Game Center
                </Button>
              </div>
            </div>
          );
      }
    } catch (error) {
      return (
        <div className="min-h-screen bg-black flex items-center justify-center">
          <div className="text-center text-white">
            <h1 className="text-3xl mb-4 text-red-400">Game Error</h1>
            <p className="mb-4">Sorry, there was an error loading the game.</p>
            <Button onClick={handleBackToGameCenter} className="bg-blue-600 hover:bg-blue-700">
              ← Back to Game Center
            </Button>
          </div>
        </div>
      );
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-blue-900 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl md:text-5xl font-orbitron font-bold text-white mb-2">
              GAME CENTER
            </h1>
            <p className="text-xl text-gray-300">
              Justin Devon Mitchell's Complete Gaming Collection
            </p>
          </div>
          <Button onClick={onBack} variant="outline" className="text-white border-white">
            ← Back to Main Menu
          </Button>
        </div>

        {/* Player Stats */}
        <Card className="bg-gray-800/50 border-gray-600 mb-8">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-3">
              <span className="text-2xl">👤</span>
              Player Profile: {playerName}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">{gameStats.gamesPlayed}</div>
                <div className="text-sm text-gray-400">Games Played</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-400">{gameStats.totalScore.toLocaleString()}</div>
                <div className="text-sm text-gray-400">Total Score</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-400">{gameStats.achievementsUnlocked}</div>
                <div className="text-sm text-gray-400">Achievements</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400">{gameStats.hoursPlayed}h</div>
                <div className="text-sm text-gray-400">Hours Played</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Game Selection Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
          {games.map((game) => (
            <Card 
              key={game.id}
              className={`bg-gradient-to-br ${game.color} ${game.borderColor} border-2 cursor-pointer hover:scale-105 transition-all duration-300 hover:shadow-2xl`}
              onClick={() => handleGameSelect(game.id)}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{game.icon}</span>
                    <div>
                      <CardTitle className="text-white text-lg">{game.title}</CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary" className="text-xs">
                          {game.genre}
                        </Badge>
                        <Badge 
                          className={`text-xs ${
                            game.difficulty === "Easy" ? "bg-green-600" :
                            game.difficulty === "Medium" ? "bg-yellow-600" :
                            game.difficulty === "Hard" ? "bg-orange-600" : "bg-red-600"
                          }`}
                        >
                          {game.difficulty}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300 text-sm mb-4 line-clamp-3">
                  {game.description}
                </p>
                <div className="space-y-2">
                  <div className="text-xs text-gray-400">
                    <span className="text-white">Players:</span> {game.players}
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {game.features.slice(0, 3).map((feature, index) => (
                      <span 
                        key={index}
                        className="text-xs bg-gray-700/50 px-2 py-1 rounded text-gray-300"
                      >
                        {feature}
                      </span>
                    ))}
                    {game.features.length > 3 && (
                      <span className="text-xs bg-gray-700/50 px-2 py-1 rounded text-gray-300">
                        +{game.features.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Featured Game Showcase */}
        <Card className="bg-gradient-to-r from-red-900/30 to-yellow-900/30 border-yellow-500">
          <CardHeader>
            <CardTitle className="text-white text-2xl flex items-center gap-3">
              <span className="text-3xl">🏆</span>
              Featured: Street Empire Enhanced Edition
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-gray-300 mb-4">
                  Experience the ultimate 2D action shooter with Unity-quality gameplay, 
                  advanced enemy AI, and addictive wave-based progression. Features include 
                  real-time particle effects, multiple weapon types, power-up systems, and 
                  comprehensive statistics tracking.
                </p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-green-400">✓</span>
                    <span className="text-gray-300">60fps smooth gameplay</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-green-400">✓</span>
                    <span className="text-gray-300">Advanced enemy AI systems</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-green-400">✓</span>
                    <span className="text-gray-300">Real-time particle effects</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-green-400">✓</span>
                    <span className="text-gray-300">Power-up and ability systems</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-center">
                <Button 
                  onClick={() => handleGameSelect("action")}
                  className="bg-red-600 hover:bg-red-700 text-white px-8 py-4 text-lg"
                >
                  🎯 Play Featured Game
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="mt-8 text-center text-gray-400">
          <p className="text-sm">
            Game Center • {games.length} Games Available • Justin Devon Mitchell Action Pack
          </p>
          <p className="text-xs mt-1">
            All games feature advanced avatar creation with full-body animation, video recording, and integrated systems
          </p>
        </div>
      </div>
    </div>
  );
}
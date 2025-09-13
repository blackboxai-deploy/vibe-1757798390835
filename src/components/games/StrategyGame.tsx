"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface StrategyGameProps {
  onBack: () => void;
  playerName: string;
  playerAvatar: string | null;
}

interface Territory {
  id: string;
  name: string;
  owner: "player" | "rival" | "neutral";
  income: number;
  defense: number;
  population: number;
  type: "residential" | "commercial" | "industrial" | "special";
}

interface Resource {
  money: number;
  influence: number;
  reputation: number;
  manpower: number;
}

interface Rival {
  id: string;
  name: string;
  strength: number;
  aggression: number;
  territories: number;
  relationship: "hostile" | "neutral" | "allied";
}

export default function StrategyGame({ onBack, playerName }: StrategyGameProps) {
  const [gameState, setGameState] = useState<"menu" | "playing" | "gameOver">("menu");
  const [turn, setTurn] = useState(1);
  const [selectedTerritory, setSelectedTerritory] = useState<Territory | null>(null);

  
  const [resources, setResources] = useState<Resource>({
    money: 10000,
    influence: 50,
    reputation: 25,
    manpower: 100
  });

  const [territories, setTerritories] = useState<Territory[]>([
    { id: "downtown", name: "Downtown District", owner: "neutral", income: 2000, defense: 3, population: 15000, type: "commercial" },
    { id: "industrial", name: "Industrial Zone", owner: "neutral", income: 1500, defense: 2, population: 8000, type: "industrial" },
    { id: "suburbs", name: "Suburban Area", owner: "player", income: 1000, defense: 1, population: 12000, type: "residential" },
    { id: "warehouse", name: "Warehouse District", owner: "rival", income: 1200, defense: 4, population: 5000, type: "industrial" },
    { id: "finance", name: "Financial District", owner: "neutral", income: 3000, defense: 5, population: 10000, type: "special" },
    { id: "port", name: "Port Area", owner: "rival", income: 2500, defense: 3, population: 7000, type: "commercial" },
    { id: "residential", name: "Uptown Residential", owner: "neutral", income: 800, defense: 1, population: 18000, type: "residential" },
    { id: "casino", name: "Casino District", owner: "rival", income: 4000, defense: 6, population: 6000, type: "special" }
  ]);

  const [rivals, setRivals] = useState<Rival[]>([
    { id: "dmitri", name: "Dmitri Volkov", strength: 75, aggression: 80, territories: 3, relationship: "hostile" },
    { id: "cartel", name: "Santos Cartel", strength: 60, aggression: 60, territories: 0, relationship: "neutral" },
    { id: "yakuza", name: "Tanaka-gumi", strength: 90, aggression: 40, territories: 0, relationship: "neutral" }
  ]);

  const [notifications, setNotifications] = useState<string[]>([]);

  const playerTerritories = territories.filter(t => t.owner === "player");
  const rivalTerritories = territories.filter(t => t.owner === "rival");
  const neutralTerritories = territories.filter(t => t.owner === "neutral");

  const addNotification = (message: string) => {
    setNotifications(prev => [message, ...prev.slice(0, 4)]);
  };

  const calculateTurnIncome = () => {
    return playerTerritories.reduce((total, territory) => total + territory.income, 0);
  };

  const calculateTotalStrength = () => {
    return playerTerritories.reduce((total, territory) => total + territory.defense, 0) + Math.floor(resources.manpower / 10);
  };

  const attackTerritory = (territory: Territory) => {
    if (territory.owner === "player" || resources.manpower < 20) return;

    const playerStrength = calculateTotalStrength();
    const territoryDefense = territory.defense + (territory.owner === "rival" ? 15 : 5);
    const attackCost = territory.defense * 1000;

    if (resources.money < attackCost) {
      addNotification("Not enough money to launch attack!");
      return;
    }

    // Calculate success chance
    const successChance = Math.max(0.2, Math.min(0.9, playerStrength / (territoryDefense + 10)));
    const success = Math.random() < successChance;

    setResources(prev => ({
      ...prev,
      money: prev.money - attackCost,
      manpower: prev.manpower - 20,
      reputation: success ? prev.reputation + 5 : prev.reputation - 3
    }));

    if (success) {
      setTerritories(prev => prev.map(t => 
        t.id === territory.id ? { ...t, owner: "player" } : t
      ));
      addNotification(`Successfully captured ${territory.name}!`);
      
      // Update rival relationships
      if (territory.owner === "rival") {
        setRivals(prev => prev.map(rival => ({
          ...rival,
          relationship: rival.relationship === "allied" ? "neutral" : 
                      rival.relationship === "neutral" ? "hostile" : "hostile",
          aggression: Math.min(100, rival.aggression + 10)
        })));
      }
    } else {
      addNotification(`Failed to capture ${territory.name}. Lost resources in the attempt.`);
    }
  };

  const negotiateTerritory = (territory: Territory) => {
    if (territory.owner === "player" || resources.influence < 10) return;

    const negotiationCost = territory.income * 2;
    const influenceCost = 10;

    if (resources.money < negotiationCost) {
      addNotification("Not enough money for negotiation!");
      return;
    }

    const successChance = Math.max(0.1, Math.min(0.7, resources.reputation / 100));
    const success = Math.random() < successChance;

    setResources(prev => ({
      ...prev,
      money: prev.money - negotiationCost,
      influence: prev.influence - influenceCost,
      reputation: success ? prev.reputation + 3 : prev.reputation - 1
    }));

    if (success) {
      setTerritories(prev => prev.map(t => 
        t.id === territory.id ? { ...t, owner: "player" } : t
      ));
      addNotification(`Successfully negotiated control of ${territory.name}!`);
    } else {
      addNotification(`Negotiation with ${territory.name} failed.`);
    }
  };

  const fortifyTerritory = (territory: Territory) => {
    if (territory.owner !== "player" || resources.money < 5000) return;

    setResources(prev => ({
      ...prev,
      money: prev.money - 5000,
      influence: prev.influence + 2
    }));

    setTerritories(prev => prev.map(t => 
      t.id === territory.id ? { ...t, defense: t.defense + 1 } : t
    ));

    addNotification(`Fortified ${territory.name} defenses!`);
  };

  const endTurn = () => {
    // Calculate income
    const income = calculateTurnIncome();
    const upkeep = playerTerritories.length * 500;
    const netIncome = income - upkeep;

    setResources(prev => ({
      money: prev.money + netIncome,
      influence: Math.max(0, prev.influence + (playerTerritories.length * 2) - 5),
      reputation: Math.max(0, prev.reputation + 1),
      manpower: Math.min(200, prev.manpower + 10)
    }));

    // Rival actions
    performRivalActions();

    setTurn(prev => prev + 1);
    addNotification(`Turn ${turn} completed. Income: $${income.toLocaleString()}, Upkeep: $${upkeep.toLocaleString()}`);

    // Check win condition
    if (playerTerritories.length >= 6) {
      setGameState("gameOver");
      addNotification("Victory! You control the majority of the city!");
    }

    // Check lose condition
    if (playerTerritories.length === 0) {
      setGameState("gameOver");
      addNotification("Defeat! You lost all your territories.");
    }
  };

  const performRivalActions = () => {
    rivals.forEach(rival => {
      if (rival.relationship === "hostile" && Math.random() < rival.aggression / 100) {
        // Rival might attack player territory
        const vulnerableTerritories = playerTerritories.filter(t => t.defense < 3);
        if (vulnerableTerritories.length > 0) {
          const target = vulnerableTerritories[Math.floor(Math.random() * vulnerableTerritories.length)];
          if (Math.random() < 0.3) { // 30% chance of successful rival attack
            setTerritories(prev => prev.map(t => 
              t.id === target.id ? { ...t, owner: "rival" } : t
            ));
            addNotification(`${rival.name} captured ${target.name}!`);
          } else {
            addNotification(`${rival.name} attempted to attack ${target.name} but failed.`);
          }
        }
      }
    });
  };

  const startGame = () => {
    setGameState("playing");
    setTurn(1);
    setNotifications(["Game started! Build your criminal empire."]);
  };

  const restartGame = () => {
    setGameState("menu");
    setTurn(1);
    setResources({ money: 10000, influence: 50, reputation: 25, manpower: 100 });
    // Reset territories to initial state
    setTerritories([
      { id: "downtown", name: "Downtown District", owner: "neutral", income: 2000, defense: 3, population: 15000, type: "commercial" },
      { id: "industrial", name: "Industrial Zone", owner: "neutral", income: 1500, defense: 2, population: 8000, type: "industrial" },
      { id: "suburbs", name: "Suburban Area", owner: "player", income: 1000, defense: 1, population: 12000, type: "residential" },
      { id: "warehouse", name: "Warehouse District", owner: "rival", income: 1200, defense: 4, population: 5000, type: "industrial" },
      { id: "finance", name: "Financial District", owner: "neutral", income: 3000, defense: 5, population: 10000, type: "special" },
      { id: "port", name: "Port Area", owner: "rival", income: 2500, defense: 3, population: 7000, type: "commercial" },
      { id: "residential", name: "Uptown Residential", owner: "neutral", income: 800, defense: 1, population: 18000, type: "residential" },
      { id: "casino", name: "Casino District", owner: "rival", income: 4000, defense: 6, population: 6000, type: "special" }
    ]);
    setNotifications([]);
  };

  const getTerritoryColor = (territory: Territory) => {
    switch (territory.owner) {
      case "player": return "bg-green-600 border-green-400";
      case "rival": return "bg-red-600 border-red-400";
      case "neutral": return "bg-gray-600 border-gray-400";
    }
  };

  const getTerritoryIcon = (type: Territory["type"]) => {
    switch (type) {
      case "residential": return "🏘️";
      case "commercial": return "🏢";
      case "industrial": return "🏭";
      case "special": return "💎";
    }
  };

  if (gameState === "gameOver") {
    const victory = playerTerritories.length >= 6;
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-900 via-black to-red-900 flex items-center justify-center p-4">
        <Card className="bg-gray-800/50 border-gray-600 max-w-lg w-full">
          <CardHeader>
            <CardTitle className={`text-center text-3xl ${victory ? "text-green-400" : "text-red-400"}`}>
              {victory ? "🏆 Victory!" : "💀 Defeat!"}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="text-white">
              <div className="text-lg mb-2">
                {victory ? `Congratulations ${playerName}! You control the city!` : `Better luck next time, ${playerName}.`}
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-xl text-yellow-400">{turn}</div>
                  <div className="text-gray-400">Turns</div>
                </div>
                <div>
                  <div className="text-xl text-green-400">{playerTerritories.length}</div>
                  <div className="text-gray-400">Territories</div>
                </div>
                <div>
                  <div className="text-xl text-blue-400">${resources.money.toLocaleString()}</div>
                  <div className="text-gray-400">Money</div>
                </div>
                <div>
                  <div className="text-xl text-purple-400">{resources.reputation}</div>
                  <div className="text-gray-400">Reputation</div>
                </div>
              </div>
            </div>
            <div className="flex gap-4 justify-center">
              <Button onClick={startGame} className="bg-yellow-600 hover:bg-yellow-700">
                Play Again
              </Button>
              <Button onClick={restartGame} variant="outline">
                Back to Menu
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (gameState === "playing") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-900 via-black to-red-900 p-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-orbitron font-bold text-white">Empire Builder</h1>
              <div className="text-yellow-400">Turn {turn} • {playerName}'s Empire</div>
            </div>
            <Button onClick={onBack} variant="outline">
              ← Back to Game Center
            </Button>
          </div>

          {/* Resources */}
          <Card className="bg-gray-800/50 border-gray-600 mb-6">
            <CardContent className="p-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-xl text-green-400">${resources.money.toLocaleString()}</div>
                  <div className="text-xs text-gray-400">Money</div>
                </div>
                <div className="text-center">
                  <div className="text-xl text-blue-400">{resources.influence}</div>
                  <div className="text-xs text-gray-400">Influence</div>
                </div>
                <div className="text-center">
                  <div className="text-xl text-purple-400">{resources.reputation}</div>
                  <div className="text-xs text-gray-400">Reputation</div>
                </div>
                <div className="text-center">
                  <div className="text-xl text-orange-400">{resources.manpower}</div>
                  <div className="text-xs text-gray-400">Manpower</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Territory Map */}
            <div className="lg:col-span-3">
              <Card className="bg-gray-800/50 border-gray-600">
                <CardHeader>
                  <CardTitle className="text-white flex justify-between">
                    City Territories
                    <Button onClick={endTurn} className="bg-yellow-600 hover:bg-yellow-700">
                      End Turn
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {territories.map((territory) => (
                      <Card
                        key={territory.id}
                        className={`cursor-pointer transition-all hover:scale-105 ${getTerritoryColor(territory)}`}
                        onClick={() => setSelectedTerritory(territory)}
                      >
                        <CardContent className="p-4">
                          <div className="text-center">
                            <div className="text-2xl mb-2">{getTerritoryIcon(territory.type)}</div>
                            <div className="text-white font-bold text-sm">{territory.name}</div>
                            <div className="text-xs text-gray-200 mt-2">
                              <div>Income: ${territory.income}/turn</div>
                              <div>Defense: {territory.defense}</div>
                              <div>Pop: {(territory.population / 1000).toFixed(0)}k</div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Side Panel */}
            <div className="space-y-6">
              {/* Territory Details */}
              {selectedTerritory && (
                <Card className="bg-gray-800/50 border-gray-600">
                  <CardHeader>
                    <CardTitle className="text-white text-lg">{selectedTerritory.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-sm text-gray-300">
                      <div>Owner: <span className="capitalize text-white">{selectedTerritory.owner}</span></div>
                      <div>Type: <span className="capitalize text-white">{selectedTerritory.type}</span></div>
                      <div>Income: <span className="text-green-400">${selectedTerritory.income}/turn</span></div>
                      <div>Defense: <span className="text-red-400">{selectedTerritory.defense}</span></div>
                      <div>Population: <span className="text-blue-400">{selectedTerritory.population.toLocaleString()}</span></div>
                    </div>
                    
                    {selectedTerritory.owner !== "player" && (
                      <div className="space-y-2">
                        <Button 
                          onClick={() => attackTerritory(selectedTerritory)}
                          className="w-full bg-red-600 hover:bg-red-700 text-sm py-2"
                          disabled={resources.manpower < 20}
                        >
                          🗡️ Attack (${selectedTerritory.defense * 1000})
                        </Button>
                        <Button 
                          onClick={() => negotiateTerritory(selectedTerritory)}
                          className="w-full bg-blue-600 hover:bg-blue-700 text-sm py-2"
                          disabled={resources.influence < 10}
                        >
                          💼 Negotiate (${selectedTerritory.income * 2})
                        </Button>
                      </div>
                    )}
                    
                    {selectedTerritory.owner === "player" && (
                      <Button 
                        onClick={() => fortifyTerritory(selectedTerritory)}
                        className="w-full bg-green-600 hover:bg-green-700 text-sm py-2"
                        disabled={resources.money < 5000}
                      >
                        🛡️ Fortify ($5,000)
                      </Button>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Empire Stats */}
              <Card className="bg-gray-800/50 border-gray-600">
                <CardHeader>
                  <CardTitle className="text-white text-lg">Empire Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-sm">
                    <div className="flex justify-between text-gray-300">
                      <span>Your Territories:</span>
                      <span className="text-green-400">{playerTerritories.length}</span>
                    </div>
                    <div className="flex justify-between text-gray-300">
                      <span>Rival Territories:</span>
                      <span className="text-red-400">{rivalTerritories.length}</span>
                    </div>
                    <div className="flex justify-between text-gray-300">
                      <span>Neutral:</span>
                      <span className="text-gray-400">{neutralTerritories.length}</span>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm text-gray-300 mb-1">
                      <span>Control</span>
                      <span>{Math.round((playerTerritories.length / territories.length) * 100)}%</span>
                    </div>
                    <Progress 
                      value={(playerTerritories.length / territories.length) * 100} 
                      className="h-2"
                    />
                  </div>
                  <div className="text-xs text-gray-400">
                    Income/Turn: ${calculateTurnIncome().toLocaleString()}
                  </div>
                </CardContent>
              </Card>

              {/* Notifications */}
              <Card className="bg-gray-800/50 border-gray-600">
                <CardHeader>
                  <CardTitle className="text-white text-lg">Recent Events</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {notifications.map((notification, index) => (
                      <div key={index} className="text-xs text-gray-300 p-2 bg-gray-700/30 rounded">
                        {notification}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-900 via-black to-red-900 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-orbitron font-bold text-white">
            Empire Builder
          </h1>
          <Button onClick={onBack} variant="outline">
            ← Back to Game Center
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="bg-gray-800/50 border-gray-600">
            <CardHeader>
              <CardTitle className="text-white">Game Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-300">
                Build and manage your criminal empire by controlling territories throughout the city. 
                Use strategy, negotiation, and force to expand your influence and become the ultimate crime boss.
              </p>
              
              <div className="space-y-3">
                <h3 className="text-white font-semibold">How to Play:</h3>
                <ul className="list-disc list-inside text-gray-300 text-sm space-y-1">
                  <li>Start with one territory and limited resources</li>
                  <li>Attack neutral or rival territories to expand</li>
                  <li>Negotiate peaceful takeovers with influence</li>
                  <li>Fortify your territories against rival attacks</li>
                  <li>Manage money, influence, reputation, and manpower</li>
                  <li>Control 6+ territories to win the game</li>
                </ul>
              </div>

              <Button onClick={startGame} className="w-full bg-yellow-600 hover:bg-yellow-700 text-lg py-3">
                ⚔️ Start Empire
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/50 border-gray-600">
            <CardHeader>
              <CardTitle className="text-white">Strategy Guide</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-white font-semibold mb-2">Resources:</h3>
                <ul className="list-disc list-inside text-gray-300 text-sm space-y-1">
                  <li><strong>Money:</strong> Used for attacks, negotiations, and fortifications</li>
                  <li><strong>Influence:</strong> Required for diplomatic negotiations</li>
                  <li><strong>Reputation:</strong> Affects success rates of negotiations</li>
                  <li><strong>Manpower:</strong> Needed for military operations</li>
                </ul>
              </div>

              <div>
                <h3 className="text-white font-semibold mb-2">Territory Types:</h3>
                <ul className="list-disc list-inside text-gray-300 text-sm space-y-1">
                  <li><strong>🏘️ Residential:</strong> High population, moderate income</li>
                  <li><strong>🏢 Commercial:</strong> Good income, moderate defense</li>
                  <li><strong>🏭 Industrial:</strong> Steady income, low population</li>
                  <li><strong>💎 Special:</strong> High income, strong defense</li>
                </ul>
              </div>

              <div>
                <h3 className="text-white font-semibold mb-2">Tips:</h3>
                <ul className="list-disc list-inside text-gray-300 text-sm space-y-1">
                  <li>Balance aggressive expansion with defensive fortification</li>
                  <li>High-income territories are worth the investment</li>
                  <li>Watch your upkeep costs as you expand</li>
                  <li>Build reputation for easier negotiations</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
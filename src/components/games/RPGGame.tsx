"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface RPGGameProps {
  onBack: () => void;
  playerName: string;
  playerAvatar: string | null;
}

export default function RPGGame({ onBack, playerName }: RPGGameProps) {
  const [character] = useState({
    name: playerName,
    level: 1,
    hp: 100,
    maxHp: 100,
    mp: 50,
    maxMp: 50,
    exp: 0,
    nextLevelExp: 100,
    str: 10,
    def: 8,
    int: 6,
    skillPoints: 0
  });

  const [location, setLocation] = useState("City Streets");
  const [inventory] = useState([
    { name: "Steel Knife", type: "weapon", power: 15 },
    { name: "Leather Armor", type: "armor", defense: 10 },
    { name: "Health Potion", type: "consumable", effect: "heal", power: 50, quantity: 3 }
  ]);

  const [quests] = useState([
    { id: 1, title: "Find the Missing Informant", status: "active", reward: "500 XP + $2000" },
    { id: 2, title: "Eliminate Rival Gang Leader", status: "available", reward: "1000 XP + $5000" },
    { id: 3, title: "Collect Protection Money", status: "completed", reward: "200 XP + $1000" }
  ]);

  const locations = [
    "City Streets", "Underground Club", "Warehouse District", "Financial District", "Boss's Office"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-black to-red-900 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-orbitron font-bold text-white">Street Legends RPG</h1>
          <Button onClick={onBack} variant="outline">← Back to Game Center</Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Character Stats */}
          <Card className="bg-gray-800/50 border-gray-600">
            <CardHeader>
              <CardTitle className="text-white">{character.name}</CardTitle>
              <div className="text-green-400">Level {character.level} Street Boss</div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between text-sm text-gray-300 mb-1">
                  <span>Health</span>
                  <span>{character.hp}/{character.maxHp}</span>
                </div>
                <Progress value={(character.hp / character.maxHp) * 100} className="h-2" />
              </div>
              
              <div>
                <div className="flex justify-between text-sm text-gray-300 mb-1">
                  <span>Energy</span>
                  <span>{character.mp}/{character.maxMp}</span>
                </div>
                <Progress value={(character.mp / character.maxMp) * 100} className="h-2 bg-blue-900" />
              </div>

              <div>
                <div className="flex justify-between text-sm text-gray-300 mb-1">
                  <span>Experience</span>
                  <span>{character.exp}/{character.nextLevelExp}</span>
                </div>
                <Progress value={(character.exp / character.nextLevelExp) * 100} className="h-2 bg-purple-900" />
              </div>

              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-600">
                <div className="text-center">
                  <div className="text-red-400 text-xl">{character.str}</div>
                  <div className="text-xs text-gray-400">Strength</div>
                </div>
                <div className="text-center">
                  <div className="text-blue-400 text-xl">{character.def}</div>
                  <div className="text-xs text-gray-400">Defense</div>
                </div>
                <div className="text-center">
                  <div className="text-purple-400 text-xl">{character.int}</div>
                  <div className="text-xs text-gray-400">Intelligence</div>
                </div>
              </div>

              {character.skillPoints > 0 && (
                <div className="p-3 bg-yellow-900/30 rounded">
                  <div className="text-yellow-400 text-sm">Skill Points Available: {character.skillPoints}</div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Game World */}
          <Card className="bg-gray-800/50 border-gray-600">
            <CardHeader>
              <CardTitle className="text-white">Current Location: {location}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-gray-300">
                You find yourself in the {location.toLowerCase()}. The neon lights flicker overhead 
                as you consider your next move in building your criminal empire.
              </div>

              <div className="space-y-2">
                <h3 className="text-white font-semibold">Available Actions:</h3>
                <div className="grid grid-cols-1 gap-2">
                  <Button className="bg-red-600 hover:bg-red-700 justify-start">
                    🗡️ Start Combat Encounter
                  </Button>
                  <Button className="bg-blue-600 hover:bg-blue-700 justify-start">
                    💼 Complete Business Deal
                  </Button>
                  <Button className="bg-green-600 hover:bg-green-700 justify-start">
                    🏪 Visit Black Market Shop
                  </Button>
                  <Button className="bg-purple-600 hover:bg-purple-700 justify-start">
                    🎯 Accept New Mission
                  </Button>
                </div>
              </div>

              <div>
                <h3 className="text-white font-semibold mb-2">Travel To:</h3>
                <div className="grid grid-cols-2 gap-2">
                  {locations.map((loc) => (
                    <Button
                      key={loc}
                      onClick={() => setLocation(loc)}
                      variant={location === loc ? "default" : "outline"}
                      className="text-xs"
                      disabled={location === loc}
                    >
                      {loc}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quests & Inventory */}
          <div className="space-y-6">
            <Card className="bg-gray-800/50 border-gray-600">
              <CardHeader>
                <CardTitle className="text-white">Active Quests</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {quests.map((quest) => (
                    <div key={quest.id} className="p-3 bg-gray-700/30 rounded">
                      <div className="text-white font-medium text-sm">{quest.title}</div>
                      <div className="text-xs text-gray-400">{quest.reward}</div>
                      <div className={`text-xs mt-1 ${
                        quest.status === "completed" ? "text-green-400" :
                        quest.status === "active" ? "text-yellow-400" : "text-gray-400"
                      }`}>
                        {quest.status.toUpperCase()}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/50 border-gray-600">
              <CardHeader>
                <CardTitle className="text-white">Inventory</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {inventory.map((item, index) => (
                    <div key={index} className="p-2 bg-gray-700/30 rounded">
                      <div className="text-white text-sm">{item.name}</div>
                      <div className="text-xs text-gray-400 capitalize">{item.type}</div>
                      {item.power && (
                        <div className="text-xs text-green-400">
                          {item.type === "weapon" ? "ATK" : 
                           item.type === "armor" ? "DEF" : "Effect"}: +{item.power}
                        </div>
                      )}
                      {item.quantity && (
                        <div className="text-xs text-blue-400">Qty: {item.quantity}</div>
                      )}
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
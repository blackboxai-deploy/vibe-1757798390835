"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface SimpleTestGameProps {
  onBack: () => void;
  playerName: string;
  playerAvatar: string | null;
}

export default function SimpleTestGame({ onBack, playerName }: SimpleTestGameProps) {
  const [score, setScore] = useState(0);
  const [clicks, setClicks] = useState(0);

  const handleClick = () => {
    setClicks(prev => prev + 1);
    setScore(prev => prev + 10);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-black to-purple-900 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-orbitron font-bold text-white">
            Test Game - {playerName}
          </h1>
          <Button onClick={onBack} variant="outline">
            ← Back to Game Center
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="bg-gray-800/50 border-gray-600">
            <CardHeader>
              <CardTitle className="text-white">Simple Click Game</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center space-y-4">
                <div className="text-3xl text-yellow-400">Score: {score}</div>
                <div className="text-xl text-blue-400">Clicks: {clicks}</div>
                <Button 
                  onClick={handleClick}
                  className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 text-xl"
                >
                  Click Me! (+10 points)
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/50 border-gray-600">
            <CardHeader>
              <CardTitle className="text-white">Game Stats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-gray-300">
                  Player: <span className="text-white">{playerName}</span>
                </div>
                <div className="text-gray-300">
                  Total Clicks: <span className="text-blue-400">{clicks}</span>
                </div>
                <div className="text-gray-300">
                  Average per Click: <span className="text-green-400">10 points</span>
                </div>
                <div className="text-gray-300">
                  Status: <span className="text-yellow-400">
                    {score === 0 ? "Ready to play!" :
                     score < 100 ? "Getting started..." :
                     score < 500 ? "Nice clicking!" :
                     score < 1000 ? "Click master!" : "Click champion!"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
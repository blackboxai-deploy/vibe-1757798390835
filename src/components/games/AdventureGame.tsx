"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface AdventureGameProps {
  onBack: () => void;
  playerName: string;
  playerAvatar: string | null;
}

export default function AdventureGame({ onBack, playerName }: AdventureGameProps) {
  const [chapter, setChapter] = useState(0);
  const [inventory] = useState(["Detective Badge", "Notebook", "Smartphone"]);
  const [evidence] = useState(["Suspicious Email", "Financial Records"]);

  const chapters = [
    {
      title: "The Missing Person Case",
      text: `Detective ${playerName}, you've been assigned to investigate the disappearance of Marcus Wellington, a prominent banker who vanished three days ago. His office shows signs of a struggle, but no body has been found.`,
      choices: [
        { text: "Investigate the office thoroughly", action: () => setChapter(1) },
        { text: "Interview the last person who saw him", action: () => setChapter(2) },
        { text: "Check financial records", action: () => setChapter(3) }
      ]
    },
    // Add more chapters as needed
  ];

  const currentChapter = chapters[chapter] || chapters[0];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-black to-indigo-900 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-orbitron font-bold text-white">Urban Detective</h1>
          <Button onClick={onBack} variant="outline">← Back to Game Center</Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="bg-gray-800/50 border-gray-600">
              <CardHeader>
                <CardTitle className="text-white">{currentChapter.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <p className="text-gray-300 text-lg leading-relaxed">
                  {currentChapter.text}
                </p>
                <div className="space-y-3">
                  {currentChapter.choices.map((choice, index) => (
                    <Button
                      key={index}
                      onClick={choice.action}
                      className="w-full text-left justify-start bg-purple-600 hover:bg-purple-700"
                    >
                      {choice.text}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="bg-gray-800/50 border-gray-600">
              <CardHeader>
                <CardTitle className="text-white">Inventory</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {inventory.map((item, index) => (
                    <div key={index} className="text-gray-300 text-sm p-2 bg-gray-700/30 rounded">
                      {item}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/50 border-gray-600">
              <CardHeader>
                <CardTitle className="text-white">Evidence</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {evidence.map((item, index) => (
                    <div key={index} className="text-yellow-300 text-sm p-2 bg-yellow-900/20 rounded">
                      {item}
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
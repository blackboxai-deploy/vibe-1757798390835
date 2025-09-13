"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface PuzzleGameProps {
  onBack: () => void;
  playerName: string;
  playerAvatar: string | null;
}

interface PuzzlePiece {
  id: number;
  value: number;
  position: number;
}

type GameMode = "numbers" | "colors" | "patterns";
type Difficulty = "easy" | "medium" | "hard";

export default function PuzzleGame({ onBack, playerName, playerAvatar }: PuzzleGameProps) {
  const [gameMode, setGameMode] = useState<GameMode>("numbers");
  const [difficulty, setDifficulty] = useState<Difficulty>("easy");
  const [gridSize, setGridSize] = useState(3);
  const [puzzle, setPuzzle] = useState<PuzzlePiece[]>([]);
  const [moves, setMoves] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [gameState, setGameState] = useState<"menu" | "playing" | "completed">("menu");
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [bestScore, setBestScore] = useState<{ moves: number; time: number } | null>(null);

  // Timer effect
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimeElapsed(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  const initializePuzzle = useCallback(() => {
    const size = gridSize;
    const totalPieces = size * size;
    const pieces: PuzzlePiece[] = [];
    
    // Create solved puzzle first
    for (let i = 0; i < totalPieces - 1; i++) {
      pieces.push({
        id: i,
        value: i + 1,
        position: i
      });
    }
    
    // Add empty piece (0)
    pieces.push({
      id: totalPieces - 1,
      value: 0,
      position: totalPieces - 1
    });
    
    // Shuffle puzzle with valid moves only
    shufflePuzzle(pieces, size);
    setPuzzle(pieces);
  }, [gridSize]);

  const shufflePuzzle = (pieces: PuzzlePiece[], size: number) => {
    const shuffleMoves = difficulty === "easy" ? 20 : difficulty === "medium" ? 50 : 100;
    
    for (let i = 0; i < shuffleMoves; i++) {
      const emptyPiece = pieces.find(p => p.value === 0);
      if (!emptyPiece) continue;
      
      const validMoves = getValidMoves(emptyPiece.position, size);
      const randomMove = validMoves[Math.floor(Math.random() * validMoves.length)];
      
      // Swap empty piece with random valid neighbor
      const targetPiece = pieces.find(p => p.position === randomMove);
      if (targetPiece) {
        const tempPos = emptyPiece.position;
        emptyPiece.position = targetPiece.position;
        targetPiece.position = tempPos;
      }
    }
  };

  const getValidMoves = (emptyPosition: number, size: number): number[] => {
    const validMoves: number[] = [];
    const row = Math.floor(emptyPosition / size);
    const col = emptyPosition % size;
    
    // Up
    if (row > 0) validMoves.push(emptyPosition - size);
    // Down
    if (row < size - 1) validMoves.push(emptyPosition + size);
    // Left
    if (col > 0) validMoves.push(emptyPosition - 1);
    // Right
    if (col < size - 1) validMoves.push(emptyPosition + 1);
    
    return validMoves;
  };

  const handlePieceClick = (clickedPiece: PuzzlePiece) => {
    if (gameState !== "playing") return;
    
    const emptyPiece = puzzle.find(p => p.value === 0);
    if (!emptyPiece) return;
    
    const validMoves = getValidMoves(emptyPiece.position, gridSize);
    
    if (validMoves.includes(clickedPiece.position)) {
      // Swap positions
      const newPuzzle = puzzle.map(piece => {
        if (piece.id === clickedPiece.id) {
          return { ...piece, position: emptyPiece.position };
        } else if (piece.id === emptyPiece.id) {
          return { ...piece, position: clickedPiece.position };
        }
        return piece;
      });
      
      setPuzzle(newPuzzle);
      setMoves(prev => prev + 1);
      
      // Check if puzzle is solved
      if (isPuzzleSolved(newPuzzle)) {
        setGameState("completed");
        setIsTimerRunning(false);
        
        // Update best score
        if (!bestScore || moves + 1 < bestScore.moves || timeElapsed < bestScore.time) {
          setBestScore({ moves: moves + 1, time: timeElapsed });
        }
      }
    }
  };

  const isPuzzleSolved = (currentPuzzle: PuzzlePiece[]): boolean => {
    return currentPuzzle.every(piece => 
      piece.value === 0 ? piece.position === gridSize * gridSize - 1 : piece.position === piece.value - 1
    );
  };

  const startGame = () => {
    const size = difficulty === "easy" ? 3 : difficulty === "medium" ? 4 : 5;
    setGridSize(size);
    setMoves(0);
    setTimeElapsed(0);
    setGameState("playing");
    setIsTimerRunning(true);
    
    // Initialize puzzle after state updates
    setTimeout(() => {
      initializePuzzle();
    }, 0);
  };

  const restartGame = () => {
    setGameState("menu");
    setMoves(0);
    setTimeElapsed(0);
    setIsTimerRunning(false);
  };

  const getPieceColor = (value: number): string => {
    if (value === 0) return "transparent";
    
    if (gameMode === "colors") {
      const colors = [
        "#ff4444", "#44ff44", "#4444ff", "#ffff44", "#ff44ff", "#44ffff",
        "#ff8844", "#88ff44", "#4488ff", "#ff4488", "#88ff88", "#4488ff",
        "#ff8888", "#88ff88", "#8888ff", "#ffff88", "#ff88ff", "#88ffff"
      ];
      return colors[value % colors.length];
    } else if (gameMode === "patterns") {
      const patterns = ["🔴", "🟢", "🔵", "🟡", "🟣", "🟠", "⚪", "🟤", "⚫"];
      return patterns[value % patterns.length];
    }
    
    return "#4444ff";
  };

  const renderPuzzleGrid = () => {
    const sortedPuzzle = [...puzzle].sort((a, b) => a.position - b.position);
    
    return (
      <div 
        className={`grid gap-2 mx-auto max-w-md`}
        style={{
          gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
          width: `${gridSize * 70}px`,
          height: `${gridSize * 70}px`
        }}
      >
        {sortedPuzzle.map((piece) => (
          <div
            key={piece.position}
            onClick={() => handlePieceClick(piece)}
            className={`
              w-16 h-16 flex items-center justify-center text-white font-bold text-lg
              border-2 border-gray-600 rounded-lg cursor-pointer transition-all duration-200
              hover:scale-105 hover:border-yellow-400
              ${piece.value === 0 ? 'bg-transparent border-dashed' : 'bg-gray-700 hover:bg-gray-600'}
            `}
            style={{
              backgroundColor: piece.value === 0 ? 'transparent' : getPieceColor(piece.value),
              color: gameMode === "colors" ? "#000" : "#fff"
            }}
          >
            {piece.value === 0 ? "" : 
             gameMode === "patterns" ? getPieceColor(piece.value) : 
             piece.value}
          </div>
        ))}
      </div>
    );
  };

  if (gameState === "completed") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-black to-green-900 flex items-center justify-center p-4">
        <Card className="bg-gray-800/50 border-gray-600 max-w-lg w-full">
          <CardHeader>
            <CardTitle className="text-white text-center text-3xl">
              🎉 Puzzle Completed!
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="text-white">
              <div className="text-lg mb-2">Great job, {playerName}!</div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-2xl text-yellow-400">{moves}</div>
                  <div className="text-sm text-gray-400">Moves</div>
                </div>
                <div>
                  <div className="text-2xl text-green-400">{Math.floor(timeElapsed / 60)}:{(timeElapsed % 60).toString().padStart(2, '0')}</div>
                  <div className="text-sm text-gray-400">Time</div>
                </div>
              </div>
              {bestScore && (
                <div className="mt-4 p-3 bg-yellow-900/30 rounded-lg">
                  <div className="text-yellow-400 font-bold">Best Score</div>
                  <div className="text-sm">
                    {bestScore.moves} moves in {Math.floor(bestScore.time / 60)}:{(bestScore.time % 60).toString().padStart(2, '0')}
                  </div>
                </div>
              )}
            </div>
            <div className="flex gap-4 justify-center">
              <Button onClick={startGame} className="bg-green-600 hover:bg-green-700">
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
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-black to-green-900 p-4">
        <div className="max-w-4xl mx-auto">
          {/* Game HUD */}
          <div className="flex justify-between items-center mb-8">
            <Button onClick={onBack} variant="outline">
              ← Back to Game Center
            </Button>
            <div className="flex items-center gap-6 text-white">
              <div>
                <span className="text-yellow-400">Moves:</span> {moves}
              </div>
              <div>
                <span className="text-green-400">Time:</span> {Math.floor(timeElapsed / 60)}:{(timeElapsed % 60).toString().padStart(2, '0')}
              </div>
              <div>
                <span className="text-blue-400">Mode:</span> {gameMode} ({difficulty})
              </div>
            </div>
          </div>

          {/* Puzzle Grid */}
          <div className="flex flex-col items-center">
            <h1 className="text-4xl font-orbitron font-bold text-white mb-8">
              Cyber Puzzle Master
            </h1>
            {renderPuzzleGrid()}
            
            <div className="mt-8 text-center text-gray-400">
              <p>Click tiles adjacent to the empty space to move them</p>
              <p>Arrange numbers in order from 1 to {gridSize * gridSize - 1}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-black to-green-900 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-orbitron font-bold text-white">
            Cyber Puzzle Master
          </h1>
          <Button onClick={onBack} variant="outline">
            ← Back to Game Center
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Game Settings */}
          <Card className="bg-gray-800/50 border-gray-600">
            <CardHeader>
              <CardTitle className="text-white">Game Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Game Mode */}
              <div>
                <label className="text-white font-medium mb-3 block">Game Mode</label>
                <div className="grid grid-cols-3 gap-2">
                  {(["numbers", "colors", "patterns"] as GameMode[]).map((mode) => (
                    <Button
                      key={mode}
                      onClick={() => setGameMode(mode)}
                      variant={gameMode === mode ? "default" : "outline"}
                      className="capitalize"
                    >
                      {mode}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Difficulty */}
              <div>
                <label className="text-white font-medium mb-3 block">Difficulty</label>
                <div className="grid grid-cols-3 gap-2">
                  {(["easy", "medium", "hard"] as Difficulty[]).map((diff) => (
                    <Button
                      key={diff}
                      onClick={() => setDifficulty(diff)}
                      variant={difficulty === diff ? "default" : "outline"}
                      className="capitalize"
                    >
                      {diff}
                    </Button>
                  ))}
                </div>
                <div className="mt-2 text-sm text-gray-400">
                  {difficulty === "easy" && "3x3 grid, fewer shuffles"}
                  {difficulty === "medium" && "4x4 grid, moderate shuffles"}
                  {difficulty === "hard" && "5x5 grid, maximum shuffles"}
                </div>
              </div>

              <Button onClick={startGame} className="w-full bg-blue-600 hover:bg-blue-700 text-lg py-3">
                🧩 Start Puzzle
              </Button>
            </CardContent>
          </Card>

          {/* Game Info */}
          <Card className="bg-gray-800/50 border-gray-600">
            <CardHeader>
              <CardTitle className="text-white">How to Play</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-gray-300">
                <h3 className="text-white font-semibold mb-2">Objective</h3>
                <p>Arrange the numbered tiles in order by sliding them into the empty space.</p>
              </div>
              
              <div className="text-gray-300">
                <h3 className="text-white font-semibold mb-2">Controls</h3>
                <ul className="list-disc list-inside space-y-1">
                  <li>Click on tiles adjacent to the empty space</li>
                  <li>Tiles will slide into the empty space</li>
                  <li>Try to complete with minimum moves</li>
                </ul>
              </div>

              <div className="text-gray-300">
                <h3 className="text-white font-semibold mb-2">Game Modes</h3>
                <ul className="list-disc list-inside space-y-1">
                  <li><strong>Numbers:</strong> Classic numbered tiles</li>
                  <li><strong>Colors:</strong> Colorful tiles to arrange</li>
                  <li><strong>Patterns:</strong> Symbol-based puzzle</li>
                </ul>
              </div>

              {bestScore && (
                <div className="p-3 bg-yellow-900/30 rounded-lg">
                  <div className="text-yellow-400 font-bold mb-1">Your Best Score</div>
                  <div className="text-white">
                    {bestScore.moves} moves in {Math.floor(bestScore.time / 60)}:{(bestScore.time % 60).toString().padStart(2, '0')}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
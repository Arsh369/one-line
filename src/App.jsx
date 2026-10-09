import React, { useState, useEffect } from "react";
import generateLevel from "./levels/level";

function App() {
  const [currentLevelIndex, setCurrentLevelIndex] = useState(()=>{
    const saved = localStorage.getItem("currentLevel");
    return saved ? Number(saved) : 0;
  });

  const [grid, setGrid] = useState([]);
  const [path, setPath] = useState([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isWon, setIsWon] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);

  const [startPos, setStartPos] = useState("");
  const [totalPlayable, setTotalPlayable] = useState(0);

  useEffect(()=>{
    localStorage.setItem("currentLevel",currentLevelIndex);
  },[currentLevelIndex])

  useEffect(() => {
    const currentGrid = generateLevel("expert");
    setGrid(currentGrid);

    let playableCount = 0;
    let startCoords = "";

    currentGrid.forEach((row, y) => {
      row.forEach((cell, x) => {
        if (cell === 1 || cell === 2) playableCount++;
        if (cell === 2) startCoords = `${y}-${x}`;
      });
    });

    setTotalPlayable(playableCount);
    setStartPos(startCoords);
    setPath([startCoords]);
    setIsWon(false);
    setIsDrawing(false);
    setShowCelebration(false);
  }, [currentLevelIndex]);

  useEffect(() => {
    if (path.length > 0 && path.length === totalPlayable) {
      setIsWon(true);
      setIsDrawing(false);
      setShowCelebration(true);

      const timer = setTimeout(() => {
        handleNextLevel();
      }, 2000);

      return () => clearTimeout(timer);
    } else {
      setIsWon(false);
    }
  }, [path, totalPlayable]);

  useEffect(() => {
    const handlePointerUp = () => setIsDrawing(false);
    window.addEventListener("pointerup", handlePointerUp);
    return () => window.removeEventListener("pointerup", handlePointerUp);
  }, []);

  const isAdjacent = (pos1, pos2) => {
    if (!pos1 || !pos2) return false;
    const [y1, x1] = pos1.split("-").map(Number);
    const [y2, x2] = pos2.split("-").map(Number);
    return Math.abs(y1 - y2) + Math.abs(x1 - x2) === 1;
  };

  const handlePointerDown = (y, x) => {
    if (isWon) return;
    const pos = `${y}-${x}`;

    if (pos === startPos) {
      setPath([startPos]);
      setIsDrawing(true);
    } else if (pos === path[path.length - 1]) {
      setIsDrawing(true);
    }
  };

  const handlePointerEnter = (y, x) => {
    if (!isDrawing || isWon) return;

    const pos = `${y}-${x}`;
    const lastPos = path[path.length - 1];

    if (grid[y][x] === 0 || grid[y][x] === 3) return;

    if (path.length > 1 && pos === path[path.length - 2]) {
      setPath((prev) => prev.slice(0, -1));
      return;
    }

    if (!path.includes(pos) && isAdjacent(pos, lastPos)) {
      setPath((prev) => [...prev, pos]);
    }
  };

  const handleNextLevel = () => {
    setCurrentLevelIndex(currentLevelIndex+1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white flex flex-col items-center p-6 font-sans select-none touch-none overflow-hidden relative">
      {/* Celebration Overlay */}
      {showCelebration && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm transition-opacity duration-500">
          <div className="text-center animate-bounce">
            <h2 className="text-5xl font-extrabold text-yellow-400 drop-shadow-[0_0_20px_rgba(250,204,21,0.8)] mb-4 tracking-wider">
              Level Cleared!
            </h2>
            <p className="text-xl text-[#38bdf8] font-medium tracking-widest animate-pulse">
              Loading Next Level...
            </p>
          </div>
        </div>
      )}

      {/* Top Bar */}
        <div className="px-6 py-2 my-4 rounded-full font-bold tracking-widest text-sm shadow-inner transition-colors duration-500 bg-gray-600/50 text-gray-300">
          LEVEL {currentLevelIndex}
        </div>

      {/* Game Grid Container */}
      <div className="w-full max-w-sm grid grid-cols-5 relative mb-12">
        {grid.map((row, y) =>
          row.map((cell, x) => {
            const pos = `${y}-${x}`;
            const isActive = path.includes(pos);
            const isStart = cell === 2;

            return (
              <div key={pos} className="w-full aspect-square p-1 relative">
                {cell === 0 ? null : cell === 3 ? (
                  <div className="w-full h-full bg-[#4a4a4a] rounded-xl shadow-[inset_0_-4px_0_rgba(0,0,0,0.4)]" />
                ) : (
                  <div
                    onPointerDown={() => handlePointerDown(y, x)}
                    onPointerEnter={() => handlePointerEnter(y, x)}
                    className={`w-full h-full rounded-xl flex items-center justify-center relative cursor-pointer transition-colors duration-300
                      ${
                        isActive
                          ? "bg-[#38bdf8] shadow-[inset_0_-4px_0_rgba(0,0,0,0.2)]"
                          : "bg-white shadow-[inset_0_-4px_0_rgba(0,0,0,0.1)]"
                      }
                      ${isWon && isActive ? "brightness-110" : ""} ${isStart ? "bg-red-300":""}
                    `}
                  />
                )}
              </div>
            );
          }),
        )}
      </div>
    </div>
  );
}

export default App;

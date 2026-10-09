import React, { useState, useEffect } from "react";
import generateLevel from "./levels/level";

function App() {
  const [currentLevelIndex, setCurrentLevelIndex] = useState(0);
  const [grid, setGrid] = useState([]);
  const [path, setPath] = useState([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isWon, setIsWon] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);

  const [startPos, setStartPos] = useState("");
  const [totalPlayable, setTotalPlayable] = useState(0);

  useEffect(() => {
    const griid = generateLevel("easy");
    const currentGrid = griid.grid;
    console.log(currentGrid);
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
    if (currentLevelIndex < LEVELS.length - 1) {
      setCurrentLevelIndex((prev) => prev + 1);
    } else {
      setCurrentLevelIndex(0);
    }
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
      <div className="w-full max-w-sm flex justify-between items-center mb-16 mt-4">
        <button className="bg-gray-500/40 hover:bg-gray-500/60 transition rounded-xl text-2xl font-serif italic text-gray-300 w-12 h-12 flex items-center justify-center shadow-lg">
          i
        </button>
        <div className="px-6 py-2 rounded-full font-bold tracking-widest text-sm shadow-inner transition-colors duration-500 bg-gray-600/50 text-gray-300">
          LEVEL {(currentLevelIndex + 1).toString().padStart(2, "0")}
        </div>
        <button className="bg-gray-500/40 hover:bg-gray-500/60 transition rounded-xl text-2xl text-gray-300 w-12 h-12 flex items-center justify-center shadow-lg">
          ⚙
        </button>
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
                        isActive || isStart
                          ? "bg-[#38bdf8] shadow-[inset_0_-4px_0_rgba(0,0,0,0.2)]"
                          : "bg-white shadow-[inset_0_-4px_0_rgba(0,0,0,0.1)]"
                      }
                      ${isWon && isActive ? "brightness-110" : ""}
                    `}
                  />
                )}
              </div>
            );
          }),
        )}
      </div>

      {/* Bottom Area */}
      <div className="mt-auto mb-12 flex flex-col items-center h-24 justify-center">
        <h1
          className="text-3xl font-bold text-[#38bdf8] tracking-wide drop-shadow-[0_0_8px_rgba(56,189,248,0.5)] transition-opacity duration-300"
          style={{ opacity: showCelebration ? 0 : 1 }}
        >
          Dare To Solve!
        </h1>
      </div>
    </div>
  );
}

export default App;

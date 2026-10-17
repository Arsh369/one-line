import { useState, useEffect } from "react";
import generateLevel from "./levels/level";
import Tutorial from "./tutorial/Tutorial";
import SplashScreen from "./splash/SplashScreen";
import playBlockSound from "./utils/playBlockSound";
import { Volume2, VolumeOff } from "lucide-react";

// function isInstalledPWA() {
//   return (
//     window.matchMedia("(display-mode: standalone)").matches ||
//     window.navigator.standalone === true
//   );
// }

function App() {
  const [currentLevelIndex, setCurrentLevelIndex] = useState(() => {
    const saved = localStorage.getItem("currentLevel");
    return saved ? Number(saved) : 0;
  });
  const [showSplash, setShowSplash] = useState(false);
  const [grid, setGrid] = useState([]);
  const [path, setPath] = useState([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isWon, setIsWon] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);

  const [startPos, setStartPos] = useState("");
  const [totalPlayable, setTotalPlayable] = useState(0);
  const [sound, setSound] = useState(false);
  // useEffect(()=>{
  //   if(isInstalledPWA()){
  //     setShowSplash(true);
  //   }
  // },[])

  useEffect(() => {
    localStorage.setItem("currentLevel", currentLevelIndex);
  }, [currentLevelIndex]);

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
    window.addEventListener("pointercancel", handlePointerUp);
    return () => {
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("pointercancel", handlePointerUp);
    };
  }, []);

  const isAdjacent = (pos1, pos2) => {
    if (!pos1 || !pos2) return false;
    const [y1, x1] = pos1.split("-").map(Number);
    const [y2, x2] = pos2.split("-").map(Number);
    return Math.abs(y1 - y2) + Math.abs(x1 - x2) === 1;
  };

  const handlePointerDown = (e, y, x) => {
    if (isWon) return;
    const pos = `${y}-${x}`;

    if (pos === startPos) {
      setPath([startPos]);
      setIsDrawing(true);
      e.currentTarget.setPointerCapture(e.pointerId);
    } else if (path.includes(pos)) {
      setPath((prev) => prev.slice(0, prev.indexOf(pos) + 1));
      setIsDrawing(true);
      e.currentTarget.setPointerCapture(e.pointerId);
    }
  };

  const handleGridPointerMove = (e) => {
    if (!isDrawing || isWon) return;
    const element = document.elementFromPoint(e.clientX, e.clientY);
    const cellElement = element?.closest("[data-cell]");

    if (!cellElement) return;

    const [y, x] = cellElement.dataset.cell.split("-").map(Number);

    handlePointerEnter(y, x);
  };

  const handlePointerEnter = (y, x) => {
    if(sound){playBlockSound(y, x)};
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
    setCurrentLevelIndex(currentLevelIndex + 1);
  };
  const handleSound = () => {
    setSound(!sound);
  };
  // if(showSplash){
  //   return (
  //     <SplashScreen onComplete={()=> setShowSplash(false)}/>
  //   );
  // }

  return (
    <div className="min-h-screen bg-[#202322] text-[#F5F5F5] flex flex-col items-center justify-between p-6 font-sans select-none touch-none overflow-hidden relative">
      {/* Celebration Overlay */}
      {showCelebration && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-[#171717]/90 backdrop-blur-md transition-all duration-300">
          <div className="text-center p-8 bg-[#202020] border border-[#303030] rounded-2xl shadow-[0_0_30px_rgba(0,217,130,0.15)] transform animate-in fade-in zoom-in-95 duration-200">
            {/* Success Badge Icon */}
            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-[#00BF70]/20 border border-[#00D982] flex items-center justify-center text-[#00D982] text-xl font-bold shadow-[0_0_15px_rgba(0,217,130,0.3)] animate-pulse">
              ✓
            </div>

            {/* Title */}
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#F5F5F5] tracking-widest uppercase mb-2">
              Level{" "}
              <span className="text-[#00D982] drop-shadow-[0_0_10px_rgba(0,217,130,0.4)]">
                Cleared
              </span>
            </h2>

            {/* Arcade Accent Line */}
            <div className="w-16 h-1 bg-[#00BF70] mx-auto rounded-full mb-4 shadow-[0_0_10px_#00BF70]" />

            {/* Subtext */}
            <p className="text-xs md:text-sm text-[#999999] font-mono tracking-widest uppercase animate-pulse">
              Loading Next Stage...
            </p>
          </div>
        </div>
      )}

      {/* Top Bar */}
      <div className="w-full max-w-sm flex items-center justify-between mt-2">
        <div className="px-6 py-2 rounded-xl bg-[#202020] border border-[#303030] font-bold tracking-widest text-xs md:text-sm text-[#F5F5F5] shadow-[0_4px_0_#087A4B]">
          LEVEL {currentLevelIndex}
        </div>
        <div className="cursor-pointer" onClick={() => handleSound()}>
          {sound ? <Volume2 /> : <VolumeOff />}
        </div>
      </div>

      {/* Game Grid Container */}
      <div
        className="w-full max-w-sm grid grid-cols-5 gap-2 p-4 bg-[#171717] border border-[#303030] rounded-2xl shadow-2xl relative my-auto touch-none"
        onPointerMove={handleGridPointerMove}
      >
        {/* SVG overlay adjusted with inset-4 to match the parent's p-4 padding */}
        <svg
          className="absolute inset-4 pointer-events-none z-10 overflow-visible"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          {path.length > 1 &&
            path.slice(0, -1).map((pos, index) => {
              const [y1, x1] = pos.split("-").map(Number);
              const [y2, x2] = path[index + 1].split("-").map(Number);

              // Exact center calculation for a 5x5 grid
              const getCenter = (coord) => coord * 20 + 10;

              return (
                <line
                  key={`${pos}-${path[index + 1]}`}
                  x1={getCenter(x1)}
                  y1={getCenter(y1)}
                  x2={getCenter(x2)}
                  y2={getCenter(y2)}
                  stroke="#FFFFFF"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              );
            })}
        </svg>

        {grid.map((row, y) =>
          row.map((cell, x) => {
            const pos = `${y}-${x}`;
            const isActive = path.includes(pos);
            const isStart = cell === 2;

            return (
              <div key={pos} className="w-full aspect-square relative">
                {cell === 0 ? null : cell === 3 ? (
                  <div className="w-full h-full bg-[#111111] border border-dashed border-[#888888] rounded-lg flex items-center justify-center shadow-inner">
                    <div className="w-2 h-2 rounded-full bg-[#666666]" />
                  </div>
                ) : (
                  <div
                    data-cell={`${y}-${x}`}
                    onPointerDown={(e) => handlePointerDown(e, y, x)}
                    className={`w-full h-full rounded-lg flex items-center justify-center relative touch-none cursor-pointer transition-all duration-150 shadow-sm ${
                      isActive
                        ? "bg-[#00BF70] text-[#080D0B] shadow-[0_3px_0_#087A4B] scale-[0.98]"
                        : "bg-[#252827] border border-[#3A3F3D] text-[#F5F5F5] hover:border-[#00BF70]"
                    } ${isWon && isActive ? "bg-[#00D982]" : ""} ${
                      isStart && !isActive
                        ? "border-2 border-[#00D982] bg-[#1E2E28] ring-2 ring-[#00D982]/30"
                        : ""
                    }`}
                  >
                    {isStart && (
                      <div className="w-6 h-6 rounded-full bg-white  shadow-[0_0_8px_#00D982]" />
                    )}
                  </div>
                )}
              </div>
            );
          }),
        )}
      </div>
      <div className="w-full max-w-sm h-10" />
      <Tutorial />
    </div>
  );
}

export default App;

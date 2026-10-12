import { useEffect, useRef, useState } from "react";

const STORAGE_KEY = "oneLineTutorialCompleted";

// A simple 3x3 puzzle with a valid path through every block.
const SOLUTION = [
  [0, 0],
  [0, 1],
  [0, 2],
  [1, 2],
  [1, 1],
  [1, 0],
  [2, 0],
  [2, 1],
  [2, 2],
];

const sameCell = (a, b) =>
  a && b && a[0] === b[0] && a[1] === b[1];

export default function Tutorial({ onStartGame }) {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState("welcome");
  const [path, setPath] = useState([]);
  const [message, setMessage] = useState("");

  const gridRef = useRef(null);
  const pathRef = useRef([]);
  const draggingRef = useRef(false);

  // Automatically show the tutorial on the first visit.
  useEffect(() => {
    const completed = localStorage.getItem(STORAGE_KEY);

    if (completed !== "true") {
      setIsOpen(true);
    }
  }, []);

  const updatePath = (nextPath) => {
    pathRef.current = nextPath;
    setPath(nextPath);
  };

  const startTutorial = () => {
    updatePath([]);
    draggingRef.current = false;
    setMessage("");
    setStep("playing");
  };

  const finishTutorial = () => {
    localStorage.setItem(STORAGE_KEY, "true");
    draggingRef.current = false;
    setIsOpen(false);
  };

  const skipTutorial = () => {
    finishTutorial();
  };

  const openTutorialAgain = () => {
    setIsOpen(true);
    setStep("welcome");
    updatePath([]);
    setMessage("");
    draggingRef.current = false;
  };

  // Start dragging from the starting block or current endpoint.
  const handlePointerDown = (event) => {
    if (step !== "playing") return;

    const cell = event.target.closest("[data-cell]");

    if (!cell || !gridRef.current?.contains(cell)) return;

    const [row, col] = cell.dataset.cell.split("-").map(Number);
    const currentPath = pathRef.current;

    if (currentPath.length === 0) {
      if (!sameCell([row, col], SOLUTION[0])) {
        setMessage("Start from the highlighted block!");
        return;
      }

      updatePath([SOLUTION[0]]);
      setMessage("Great! Now drag to the next block.");
    } else if (
      !sameCell([row, col], currentPath[currentPath.length - 1])
    ) {
      return;
    }

    draggingRef.current = true;

    try {
      gridRef.current.setPointerCapture(event.pointerId);
    } catch {
      // Pointer capture may not be available in every environment.
    }
  };

  // Identify the cell underneath the pointer.
  const handlePointerMove = (event) => {
    if (!draggingRef.current || step !== "playing") return;

    const element = document.elementFromPoint(
      event.clientX,
      event.clientY
    );

    const cell = element?.closest("[data-cell]");

    if (!cell || !gridRef.current?.contains(cell)) return;

    const [row, col] = cell.dataset.cell.split("-").map(Number);
    const currentPath = pathRef.current;
    const expectedCell = SOLUTION[currentPath.length];

    // Ignore the current cell and cells already visited.
    if (
      currentPath.some((item) => sameCell(item, [row, col]))
    ) {
      return;
    }

    // Only allow the next cell in this tutorial's solution.
    if (!sameCell([row, col], expectedCell)) {
      return;
    }

    const nextPath = [...currentPath, [row, col]];

    updatePath(nextPath);
    setMessage(
      nextPath.length === SOLUTION.length
        ? "Perfect! You completed the tutorial!"
        : "Excellent! Keep following the path."
    );

    if (nextPath.length === SOLUTION.length) {
      draggingRef.current = false;
      setStep("success");
    }
  };

  const handlePointerUp = () => {
    draggingRef.current = false;
  };

  const handlePlay = () => {
    finishTutorial();

    if (onStartGame) {
      onStartGame();
    }
  };

  return (
    <>
      {/* Persistent help button */}
      {!isOpen && (
        <button
          onClick={openTutorialAgain}
          className="fixed bottom-5 right-5 z-40 rounded-full
                     bg-indigo-600 px-5 py-3 text-sm font-semibold
                     text-white shadow-lg transition hover:bg-indigo-500"
        >
          ? How to Play
        </button>
      )}

      {/* Tutorial overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center
                     justify-center overflow-y-auto bg-black/75
                     p-4 backdrop-blur-sm"
        >
          <div
            className="my-auto w-full max-w-md rounded-3xl
                       border border-white/10 bg-slate-900 p-6
                       text-white shadow-2xl sm:p-8"
          >
            {/* Welcome screen */}
            {step === "welcome" && (
              <div className="text-center">
                <div className="mb-5 text-5xl">🧩</div>

                <h2 className="mb-3 text-2xl font-bold">
                  One Line Puzzle
                </h2>

                <p className="mb-6 leading-relaxed text-slate-300">
                  Connect the blocks using one continuous line.
                  Follow the path and complete the puzzle!
                </p>

                <div className="mb-6 rounded-2xl bg-slate-800 p-4">
                  <div className="grid grid-cols-3 gap-2">
                    {SOLUTION.map(([row, col], index) => (
                      <div
                        key={`${row}-${col}`}
                        className={`flex aspect-square items-center
                                    justify-center rounded-lg text-sm
                                    font-bold ${
                                      index === 0
                                        ? "bg-indigo-500"
                                        : "bg-slate-700"
                                    }`}
                      >
                        {index === 0 ? "S" : "■"}
                      </div>
                    ))}
                  </div>

                  <p className="mt-3 text-xs text-slate-400">
                    S = Starting block
                  </p>
                </div>

                <button
                  onClick={startTutorial}
                  className="w-full rounded-xl bg-indigo-600
                             px-5 py-3 font-semibold transition
                             hover:bg-indigo-500"
                >
                  Start Tutorial
                </button>

                <button
                  onClick={skipTutorial}
                  className="mt-3 w-full py-2 text-sm text-slate-400
                             transition hover:text-white"
                >
                  Skip Tutorial
                </button>
              </div>
            )}

            {/* Interactive puzzle */}
            {step === "playing" && (
              <div>
                <div className="mb-5 text-center">
                  <p className="mb-2 text-xs font-semibold uppercase
                                tracking-widest text-indigo-400">
                    Interactive Tutorial
                  </p>

                  <h2 className="text-2xl font-bold">
                    Follow the Path
                  </h2>

                  <p className="mt-2 text-sm leading-relaxed
                                text-slate-300">
                    {path.length === 0
                      ? "Press and drag from the purple starting block."
                      : "Keep dragging across the blocks to complete the path."}
                  </p>
                </div>

                {/* Progress */}
                <div className="mb-5">
                  <div className="mb-2 flex justify-between text-xs
                                  text-slate-400">
                    <span>Progress</span>
                    <span>
                      {path.length} / {SOLUTION.length} blocks
                    </span>
                  </div>

                  <div className="h-2 overflow-hidden rounded-full
                                  bg-slate-700">
                    <div
                      className="h-full rounded-full bg-indigo-500
                                 transition-all duration-200"
                      style={{
                        width: `${
                          (path.length / SOLUTION.length) * 100
                        }%`,
                      }}
                    />
                  </div>
                </div>

                {/* Game grid */}
                <div
                  ref={gridRef}
                  onPointerDown={handlePointerDown}
                  onPointerMove={handlePointerMove}
                  onPointerUp={handlePointerUp}
                  onPointerCancel={handlePointerUp}
                  className="mx-auto grid w-full max-w-xs
                             grid-cols-3 gap-2 touch-none
                             select-none"
                >
                  {Array.from({ length: 9 }, (_, index) => {
                    const row = Math.floor(index / 3);
                    const col = index % 3;

                    const position = [row, col];

                    const visited = path.some((item) =>
                      sameCell(item, position)
                    );

                    const isStart = sameCell(
                      position,
                      SOLUTION[0]
                    );

                    const isCurrent = sameCell(
                      position,
                      path[path.length - 1]
                    );

                    return (
                      <div
                        key={index}
                        data-cell={`${row}-${col}`}
                        className={`relative flex aspect-square
                                    items-center justify-center
                                    rounded-xl border-2 text-lg
                                    font-bold transition-colors
                                    duration-150 ${
                                      visited
                                        ? "border-indigo-400 bg-indigo-500 text-white"
                                        : "border-slate-700 bg-slate-800 text-slate-500"
                                    } ${
                                      isStart && path.length === 0
                                        ? "animate-pulse border-indigo-400 ring-2 ring-indigo-400/30"
                                        : ""
                                    } ${
                                      isCurrent
                                        ? "ring-2 ring-white/50"
                                        : ""
                                    }`}
                      >
                        {isStart && !visited ? "S" : ""}

                        {visited && (
                          <span>
                            {isStart ? "S" : "✓"}
                          </span>
                        )}

                        {/* Visual line connecting adjacent blocks */}
                        {visited && !isCurrent && (
                          <span className="absolute -right-2
                                           top-1/2 z-10 h-1
                                           w-2 -translate-y-1/2
                                           bg-indigo-300" />
                        )}
                      </div>
                    );
                  })}
                </div>

                <p
                  aria-live="polite"
                  className="mt-5 min-h-10 text-center
                             text-sm leading-relaxed text-indigo-300"
                >
                  {message}
                </p>

                <div className="mt-3 flex gap-3">
                  <button
                    onClick={startTutorial}
                    className="flex-1 rounded-xl bg-slate-800
                               px-4 py-3 text-sm font-semibold
                               transition hover:bg-slate-700"
                  >
                    Restart
                  </button>

                  <button
                    onClick={skipTutorial}
                    className="flex-1 rounded-xl border
                               border-slate-700 px-4 py-3
                               text-sm font-semibold text-slate-300
                               transition hover:bg-slate-800"
                  >
                    Skip
                  </button>
                </div>
              </div>
            )}

            {/* Success screen */}
            {step === "success" && (
              <div className="py-5 text-center">
                <div className="mb-5 text-6xl">🎉</div>

                <h2 className="mb-3 text-2xl font-bold">
                  Great Job!
                </h2>

                <p className="mb-7 leading-relaxed text-slate-300">
                  You've completed the tutorial and learned
                  how to connect the blocks.
                  Now you're ready for the real challenge!
                </p>

                <button
                  onClick={handlePlay}
                  className="w-full rounded-xl bg-indigo-600
                             px-5 py-3 font-semibold transition
                             hover:bg-indigo-500"
                >
                  Play Level 1 →
                </button>

                <button
                  onClick={startTutorial}
                  className="mt-3 w-full py-2 text-sm text-slate-400
                             transition hover:text-white"
                >
                  Practice Again
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
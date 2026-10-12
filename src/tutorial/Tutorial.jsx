import { useEffect, useRef, useState } from "react";

const STORAGE_KEY = "oneLineTutorialCompleted";

// Tutorial puzzle, written as [row, col] from the start block to the end block.
// One continuous line that covers all 21 green blocks:
//   up the left edge, a small zig-zag in the middle, a loop on the right,
//   back up to the top row, across it, and down to the end dot.
const SOLUTION = [
  [4, 0],
  [3, 0],
  [2, 0],
  [2, 1],
  [3, 1],
  [3, 2],
  [4, 2],
  [4, 3],
  [3, 3],
  [2, 3],
  [2, 2],
  [1, 2],
  [1, 1],
  [1, 0],
  [0, 0],
  [0, 1],
  [0, 2],
  [0, 3],
  [0, 4],
  [1, 4],
  [2, 4],
];

const SIZE = 5;

// Dotted tiles: the line can never enter these.
const BLOCKED_CELLS = new Set(["1-3", "3-4", "4-4"]);

// Plain gray tile: not part of the path, so the tutorial leaves it empty.
const EMPTY_CELLS = new Set(["4-1"]);

const sameCell = (a, b) => !!a && !!b && a[0] === b[0] && a[1] === b[1];

const isAdjacent = (a, b) =>
  !!a && !!b && Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]) === 1;

const progressMessage = (count) => {
  if (count <= 1) return "Great start! Keep dragging to the next block.";
  if (count < 8) return "Nice! Follow the pulsing block.";
  if (count < 15) return "You're doing great. Keep the line unbroken.";
  return "Almost there. Head for the white dot!";
};

/**
 * 5x5 board. The line is drawn as an SVG overlay, so it bends
 * correctly around corners instead of showing small connector stubs.
 */
function Board({ path, hint = null, gridRef, handlers = {} }) {
  const head = path.length ? path[path.length - 1] : SOLUTION[0];
  const points = path.map(([r, c]) => `${c + 0.5},${r + 0.5}`).join(" ");

  return (
    <div
      className="mx-auto w-full max-w-[320px] rounded-2xl border
                 border-[#303532] bg-[#171918] p-2 sm:p-3"
    >
      <div
        ref={gridRef}
        {...handlers}
        className="relative grid grid-cols-5 touch-none select-none"
      >
        {Array.from({ length: SIZE * SIZE }, (_, index) => {
          const row = Math.floor(index / SIZE);
          const col = index % SIZE;
          const key = `${row}-${col}`;
          const isBlocked = BLOCKED_CELLS.has(key);
          const isEmpty = EMPTY_CELLS.has(key);
          const isHint = sameCell([row, col], hint);

          let tone = "border-[#00C878] bg-[#00C878]";
          if (isBlocked) {
            tone = "border-dashed border-[#303532] bg-[#101211]";
          } else if (isEmpty) {
            tone = "border-[#393E3B] bg-[#2A2D2C]";
          }

          return (
            <div key={key} data-cell={key} className="aspect-square p-[3px] sm:p-1">
              <div
                className={`flex h-full w-full items-center justify-center
                            rounded-lg border ${tone} ${
                              isHint
                                ? "animate-pulse ring-2 ring-white/60"
                                : ""
                            }`}
              >
                {isBlocked && (
                  <span className="h-1 w-1 rounded-full bg-[#3A3D3C]" />
                )}
              </div>
            </div>
          );
        })}

        <svg
          viewBox={`0 0 ${SIZE} ${SIZE}`}
          className="pointer-events-none absolute inset-0 h-full w-full"
          aria-hidden="true"
        >
          {path.length > 1 && (
            <polyline
              points={points}
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="0.16"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}
          <circle
            cx={head[1] + 0.5}
            cy={head[0] + 0.5}
            r="0.2"
            fill="#FFFFFF"
            className={path.length === 0 ? "animate-pulse" : ""}
          />
        </svg>
      </div>
    </div>
  );
}

export default function Tutorial({ onStartGame }) {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState("welcome");
  const [path, setPath] = useState([]);
  const [message, setMessage] = useState("");

  const gridRef = useRef(null);
  const pathRef = useRef([]);
  const draggingRef = useRef(false);

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
    updatePath([]);
    setMessage("");
    draggingRef.current = false;
    setStep("welcome");
    setIsOpen(true);
  };

  const getCellFromPoint = (x, y) => {
    const element = document.elementFromPoint(x, y);
    const cell = element?.closest("[data-cell]");

    if (!cell || !gridRef.current?.contains(cell)) return null;

    const [row, col] = cell.dataset.cell.split("-").map(Number);
    return [row, col];
  };

  const handlePointerDown = (event) => {
    if (step !== "playing") return;

    const position = getCellFromPoint(event.clientX, event.clientY);

    if (!position) return;
    if (BLOCKED_CELLS.has(`${position[0]}-${position[1]}`)) return;

    const currentPath = pathRef.current;

    if (currentPath.length === 0) {
      if (!sameCell(position, SOLUTION[0])) {
        setMessage("Start from the bottom-left block with the white dot.");
        return;
      }

      updatePath([position]);
      setMessage(progressMessage(1));
    } else {
      // Dragging can only continue from the end of the line.
      if (!sameCell(position, currentPath[currentPath.length - 1])) return;
    }

    draggingRef.current = true;

    try {
      event.currentTarget.setPointerCapture(event.pointerId);
    } catch {
      // Continue without pointer capture if unavailable.
    }
  };

  const handlePointerMove = (event) => {
    if (!draggingRef.current || step !== "playing") return;

    const position = getCellFromPoint(event.clientX, event.clientY);

    if (!position) return;
    if (BLOCKED_CELLS.has(`${position[0]}-${position[1]}`)) return;

    const currentPath = pathRef.current;
    const lastCell = currentPath[currentPath.length - 1];

    if (sameCell(position, lastCell)) return;

    // Dragging back onto the previous block undoes the last step.
    const previousCell = currentPath[currentPath.length - 2];

    if (sameCell(position, previousCell)) {
      updatePath(currentPath.slice(0, -1));
      setMessage("Retracing. Drag forward to continue.");
      return;
    }

    // Ignore blocks that are already part of the line.
    if (currentPath.some((cell) => sameCell(cell, position))) return;

    const targetIndex = SOLUTION.findIndex((cell) => sameCell(cell, position));
    const gap = targetIndex - currentPath.length;

    // Accept the next block, or two at once if a fast drag skipped one.
    if (targetIndex === -1 || gap < 0 || gap > 1) {
      if (isAdjacent(position, lastCell)) {
        setMessage("Not that way. Follow the pulsing block.");
      }
      return;
    }

    const nextPath = SOLUTION.slice(0, targetIndex + 1);

    updatePath(nextPath);

    if (nextPath.length === SOLUTION.length) {
      draggingRef.current = false;
      setMessage("Perfect! Every block is connected.");
      setStep("success");
    } else {
      setMessage(progressMessage(nextPath.length));
    }
  };

  const handlePointerUp = () => {
    draggingRef.current = false;
  };

  const handlePlay = () => {
    finishTutorial();
    onStartGame?.();
  };

  return (
    <>
      {/* Help button */}
      {!isOpen && (
        <button
          onClick={openTutorialAgain}
          className="fixed bottom-10 right-5 z-40 rounded-full
                     border border-[#303633] bg-[#202322]
                     px-5 py-3 text-xs font-bold tracking-wider
                     text-[#F5F5F5] shadow-[0_4px_0_#087A4B]
                     transition hover:bg-[#292D2B] active:translate-y-1"
        >
          ? HOW TO PLAY
        </button>
      )}

      {/* Tutorial modal */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center
                     justify-center overflow-y-auto bg-black/75
                     p-4 backdrop-blur-sm"
        >
          <div
            className="my-auto w-full max-w-md rounded-3xl
                       border border-[#343936] bg-[#1C1F1D]
                       p-5 text-[#F5F5F5] shadow-2xl sm:p-7"
          >
            {/* Welcome */}
            {step === "welcome" && (
              <div className="text-center">
                <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl border border-[#393E3B] bg-[#252927] overflow-hidden">
                  <img
                    src="/one_line_block_puzzle.png"
                    alt="one line"
                    className="w-full h-full object-cover scale-110"
                  />
                </div>

                <h2 className="text-2xl font-extrabold tracking-tight">
                  ONE LINE
                </h2>

                <p className="mt-2 text-sm leading-relaxed text-[#A3AAA5]">
                  Draw one unbroken line through every green block. Dotted
                  tiles are blocked.
                </p>

                {/* Solved example */}
                <div className="my-6">
                  <Board path={SOLUTION} />
                </div>

                <p className="mb-5 text-xs text-[#858D87]">
                  This is the finished puzzle. Now you try it.
                </p>

                <button
                  onClick={startTutorial}
                  className="w-full rounded-xl bg-[#00C878]
                             px-5 py-3.5 font-bold text-[#08251A]
                             transition hover:bg-[#00D583]
                             active:scale-[0.98]"
                >
                  START TUTORIAL →
                </button>

                <button
                  onClick={skipTutorial}
                  className="mt-3 w-full py-2 text-sm text-[#858D87]
                             transition hover:text-white"
                >
                  Skip tutorial
                </button>
              </div>
            )}

            {/* Interactive tutorial */}
            {step === "playing" && (
              <div>
                <div className="mb-5 text-center">
                  <p
                    className="mb-2 text-[10px] font-bold
                               uppercase tracking-[0.25em]
                               text-[#00C878]"
                  >
                    LEARN TO PLAY
                  </p>

                  <h2 className="text-xl font-extrabold">Draw the line</h2>

                  <p className="mt-2 text-sm leading-relaxed text-[#A3AAA5]">
                    {path.length === 0
                      ? "Press the white dot in the bottom-left corner, then drag."
                      : "Keep dragging. Drag backwards to undo a step."}
                  </p>
                </div>

                {/* Progress */}
                <div className="mb-5">
                  <div className="mb-2 flex justify-between text-xs">
                    <span className="text-[#858D87]">PATH PROGRESS</span>

                    <span className="font-semibold text-[#00C878]">
                      {path.length}/{SOLUTION.length}
                    </span>
                  </div>

                  <div className="h-1.5 overflow-hidden rounded-full bg-[#303532]">
                    <div
                      className="h-full rounded-full bg-[#00C878]
                                 transition-all duration-200"
                      style={{
                        width: `${(path.length / SOLUTION.length) * 100}%`,
                      }}
                    />
                  </div>
                </div>

                <Board
                  path={path}
                  hint={SOLUTION[path.length] ?? null}
                  gridRef={gridRef}
                  handlers={{
                    onPointerDown: handlePointerDown,
                    onPointerMove: handlePointerMove,
                    onPointerUp: handlePointerUp,
                    onPointerCancel: handlePointerUp,
                  }}
                />

                <p
                  aria-live="polite"
                  className="mt-4 min-h-10 text-center text-sm
                             leading-relaxed text-[#00C878]"
                >
                  {message}
                </p>

                <div className="mt-3 flex gap-3">
                  <button
                    onClick={startTutorial}
                    className="flex-1 rounded-xl border
                               border-[#393E3B] bg-[#242827]
                               px-4 py-3 text-sm font-bold
                               transition hover:bg-[#2D3230]"
                  >
                    RESTART
                  </button>

                  <button
                    onClick={skipTutorial}
                    className="flex-1 rounded-xl border
                               border-[#393E3B] px-4 py-3
                               text-sm font-bold text-[#A3AAA5]
                               transition hover:bg-[#242827]"
                  >
                    SKIP
                  </button>
                </div>
              </div>
            )}

            {/* Success */}
            {step === "success" && (
              <div className="py-6 text-center">
                <div className="mb-5">
                  <Board path={SOLUTION} />
                </div>

                <h2 className="text-2xl font-extrabold">NICE WORK!</h2>

                <p
                  className="mx-auto mb-7 mt-3 max-w-xs
                              text-sm leading-relaxed text-[#A3AAA5]"
                >
                  You covered every block with one line. You're ready to take
                  on the real puzzles!
                </p>

                <button
                  onClick={handlePlay}
                  className="w-full rounded-xl bg-[#00C878]
                             px-5 py-3.5 font-bold text-[#08251A]
                             transition hover:bg-[#00D583]
                             active:scale-[0.98]"
                >
                  PLAY
                </button>

                <button
                  onClick={startTutorial}
                  className="mt-3 w-full py-2 text-sm text-[#858D87]
                             transition hover:text-white"
                >
                  Practice again
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
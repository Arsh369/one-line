import { useEffect, useRef, useState } from "react";

const STORAGE_KEY = "oneLineTutorialCompleted";

// The tutorial path follows the green blocks in your reference.
const SOLUTION = [
  [1, 3],
  [2, 3],
  [2, 2],
  [3, 2],
];

// Cells with dotted borders are inactive.
const BLOCKED_CELLS = new Set([
  "0-2",
  "0-3",
  "0-4",
  "1-4",
  "2-4",
  "3-4",
]);

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

  const handlePointerDown = (event) => {
    if (step !== "playing") return;

    const cell = event.target.closest("[data-cell]");

    if (!cell || !gridRef.current?.contains(cell)) return;

    const [row, col] = cell.dataset.cell.split("-").map(Number);
    const position = [row, col];
    const currentPath = pathRef.current;

    if (BLOCKED_CELLS.has(`${row}-${col}`)) return;

    if (currentPath.length === 0) {
      if (!sameCell(position, SOLUTION[0])) {
        setMessage("Start from the green block with the white dot.");
        return;
      }

      updatePath([position]);
      setMessage("Great! Keep dragging to the next green block.");
    } else {
      const lastCell = currentPath[currentPath.length - 1];

      // Allow dragging only from the current endpoint.
      if (!sameCell(position, lastCell)) return;
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

    const element = document.elementFromPoint(
      event.clientX,
      event.clientY
    );

    const cell = element?.closest("[data-cell]");

    if (!cell || !gridRef.current?.contains(cell)) return;

    const [row, col] = cell.dataset.cell.split("-").map(Number);
    const position = [row, col];

    if (BLOCKED_CELLS.has(`${row}-${col}`)) return;

    const currentPath = pathRef.current;

    // Ignore already visited blocks.
    if (currentPath.some((item) => sameCell(item, position))) {
      return;
    }

    // The tutorial accepts only the next block in the example path.
    const expectedCell = SOLUTION[currentPath.length];

    if (!sameCell(position, expectedCell)) return;

    // Ensure the next block is adjacent.
    const lastCell = currentPath[currentPath.length - 1];

    const distance =
      Math.abs(lastCell[0] - row) +
      Math.abs(lastCell[1] - col);

    if (distance !== 1) return;

    const nextPath = [...currentPath, position];

    updatePath(nextPath);

    if (nextPath.length === SOLUTION.length) {
      draggingRef.current = false;
      setMessage("Perfect! You completed the tutorial.");
      setStep("success");
    } else {
      setMessage("Nice! Keep following the green path.");
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
                <div
                  className="mb-4 inline-flex h-14 w-14 items-center
                             justify-center rounded-2xl
                             border border-[#393E3B] bg-[#252927]
                             text-3xl"
                >
                  <span className="text-[#00C878]">↗</span>
                </div>

                <h2 className="text-2xl font-extrabold tracking-tight">
                  ONE LINE
                </h2>

                <p className="mt-2 text-sm leading-relaxed text-[#A3AAA5]">
                  Connect the blocks with one continuous line.
                  Let's learn how to play!
                </p>

                {/* 5x5 preview */}
                <div
                  className="mx-auto my-6 w-full max-w-[300px]
                             rounded-2xl border border-[#303532]
                             bg-[#171918] p-3 sm:p-4"
                >
                  <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
                    {Array.from({ length: 25 }, (_, index) => {
                      const row = Math.floor(index / 5);
                      const col = index % 5;
                      const key = `${row}-${col}`;
                      const isBlocked = BLOCKED_CELLS.has(key);
                      const isPath = SOLUTION.some((cell) =>
                        sameCell(cell, [row, col])
                      );
                      const isStart = sameCell(
                        [row, col],
                        SOLUTION[0]
                      );

                      return (
                        <div
                          key={key}
                          className={`flex aspect-square items-center
                                      justify-center rounded-lg border ${
                                        isBlocked
                                          ? "border-dashed border-[#303532] bg-[#101211]"
                                          : isPath
                                            ? "border-[#00C878] bg-[#00C878]"
                                            : "border-[#393E3B] bg-[#242827]"
                                      }`}
                        >
                          {isStart && (
                            <span className="h-3 w-3 rounded-full bg-white" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <p className="mb-5 text-xs text-[#858D87]">
                  Follow the green blocks to complete the path.
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

                  <h2 className="text-xl font-extrabold">
                    Follow the Path
                  </h2>

                  <p className="mt-2 text-sm leading-relaxed text-[#A3AAA5]">
                    {path.length === 0
                      ? "Press and drag from the green block with the white dot."
                      : "Continue dragging across the connected green blocks."}
                  </p>
                </div>

                {/* Progress */}
                <div className="mb-5">
                  <div className="mb-2 flex justify-between text-xs">
                    <span className="text-[#858D87]">
                      PATH PROGRESS
                    </span>

                    <span className="font-semibold text-[#00C878]">
                      {path.length}/{SOLUTION.length}
                    </span>
                  </div>

                  <div className="h-1.5 overflow-hidden rounded-full bg-[#303532]">
                    <div
                      className="h-full rounded-full bg-[#00C878]
                                 transition-all duration-200"
                      style={{
                        width: `${
                          (path.length / SOLUTION.length) * 100
                        }%`,
                      }}
                    />
                  </div>
                </div>

                {/* 5x5 game grid */}
                <div
                  ref={gridRef}
                  onPointerDown={handlePointerDown}
                  onPointerMove={handlePointerMove}
                  onPointerUp={handlePointerUp}
                  onPointerCancel={handlePointerUp}
                  className="mx-auto grid w-full max-w-[320px]
                             grid-cols-5 gap-1.5 rounded-2xl
                             border border-[#303532] bg-[#171918]
                             p-3 touch-none select-none sm:gap-2 sm:p-4"
                >
                  {Array.from({ length: 25 }, (_, index) => {
                    const row = Math.floor(index / 5);
                    const col = index % 5;
                    const key = `${row}-${col}`;

                    const isBlocked = BLOCKED_CELLS.has(key);

                    const visited = path.some((cell) =>
                      sameCell(cell, [row, col])
                    );

                    const isStart = sameCell(
                      [row, col],
                      SOLUTION[0]
                    );

                    const isCurrent = sameCell(
                      [row, col],
                      path[path.length - 1]
                    );

                    return (
                      <div
                        key={key}
                        data-cell={key}
                        className={`relative flex aspect-square
                                    items-center justify-center
                                    rounded-lg border ${
                                      isBlocked
                                        ? "border-dashed border-[#303532] bg-[#101211]"
                                        : visited
                                          ? "border-[#00C878] bg-[#00C878]"
                                          : "border-[#393E3B] bg-[#242827]"
                                    } ${
                                      isStart && path.length === 0
                                        ? "animate-pulse ring-2 ring-[#00C878]/40"
                                        : ""
                                    } ${
                                      isCurrent
                                        ? "ring-2 ring-white/50"
                                        : ""
                                    }`}
                      >
                        {isStart && (
                          <span
                            className={`h-3 w-3 rounded-full ${
                              visited ? "bg-white" : "bg-[#00C878]"
                            }`}
                          />
                        )}

                        {visited && !isStart && (
                          <span className="text-lg font-bold text-white">
                            •
                          </span>
                        )}

                        {/* Connect adjacent visited cells */}
                        {visited && !isCurrent && (
                          <span className="pointer-events-none absolute
                                           inset-0 flex items-center
                                           justify-center">
                            <span className="absolute right-[-7px]
                                             top-1/2 z-10 h-1
                                             w-2 bg-[#00C878]" />
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>

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
                <div
                  className="mx-auto mb-5 flex h-16 w-16
                             items-center justify-center rounded-2xl
                             border border-[#087A4B] bg-[#073D2B]
                             text-3xl text-[#00C878]"
                >
                  ✓
                </div>

                <h2 className="text-2xl font-extrabold">
                  NICE WORK!
                </h2>

                <p className="mx-auto mb-7 mt-3 max-w-xs
                              text-sm leading-relaxed text-[#A3AAA5]">
                  You've completed the tutorial. You're ready
                  to take on the real puzzles!
                </p>

                <button
                  onClick={handlePlay}
                  className="w-full rounded-xl bg-[#00C878]
                             px-5 py-3.5 font-bold text-[#08251A]
                             transition hover:bg-[#00D583]
                             active:scale-[0.98]"
                >
                  PLAY LEVEL 1 →
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
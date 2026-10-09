const GRID_SIZE = 5;

const DIFFICULTY = {
  easy: { minCells: 5, maxCells: 8 },
  medium: { minCells: 9, maxCells: 13 },
  hard: { minCells: 14, maxCells: 18 },
  expert: { minCells: 19, maxCells: 23 }
};

const DIRECTIONS = [
  [-1, 0], // Up
  [1, 0],  // Down
  [0, -1], // Left
  [0, 1]   // Right
];

// Fisher-Yates shuffle
function shuffle(array) {
  const result = [...array];

  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));

    [result[i], result[j]] = [result[j], result[i]];
  }

  return result;
}

// Get valid neighboring cells
function getNeighbors(row, col, size) {
  return shuffle(
    DIRECTIONS
      .map(([dr, dc]) => [row + dr, col + dc])
      .filter(
        ([r, c]) =>
          r >= 0 &&
          r < size &&
          c >= 0 &&
          c < size
      )
  );
}

// Generate a random path without revisiting cells
function generatePath(size, targetCells) {
  const maxAttempts = 100;
  const maxNodes = 100000;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const startRow = Math.floor(Math.random() * size);
    const startCol = Math.floor(Math.random() * size);

    const path = [[startRow, startCol]];
    const visited = new Set([
      `${startRow},${startCol}`
    ]);

    let nodesVisited = 0;

    function dfs(row, col) {
      nodesVisited++;

      if (path.length === targetCells) {
        return true;
      }

      if (nodesVisited > maxNodes) {
        return false;
      }

      const neighbors = getNeighbors(row, col, size);

      for (const [nextRow, nextCol] of neighbors) {
        const key = `${nextRow},${nextCol}`;

        if (visited.has(key)) {
          continue;
        }

        visited.add(key);
        path.push([nextRow, nextCol]);

        if (dfs(nextRow, nextCol)) {
          return true;
        }

        // Backtrack
        path.pop();
        visited.delete(key);

        if (nodesVisited > maxNodes) {
          return false;
        }
      }

      return false;
    }

    if (dfs(startRow, startCol)) {
      return path;
    }
  }

  throw new Error(
    `Could not generate a path with ${targetCells} cells.`
  );
}

// Convert the path into your existing grid format
function createGrid(size, path) {
  const grid = Array.from(
    { length: size },
    () => Array(size).fill(3)
  );

  path.forEach(([row, col], index) => {
    grid[row][col] = index === 0 ? 2 : 1;
  });

  return grid;
}

// Generate a level for a selected difficulty
function generateLevel(difficulty) {
  const config = DIFFICULTY[difficulty];

  if (!config) {
    throw new Error(`Unknown difficulty: ${difficulty}`);
  }

  const targetCells =
    Math.floor(
      Math.random() *
        (config.maxCells - config.minCells + 1)
    ) + config.minCells;

  const solution = generatePath(
    GRID_SIZE,
    targetCells
  );

  const grid = createGrid(GRID_SIZE, solution);

  return {
    difficulty,
    playableCells: targetCells,
    grid,

    // Keep this private from the player.
    // Useful for testing and debugging.
    solution
  };
}

export default generateLevel;
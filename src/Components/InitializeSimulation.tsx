import { Cell } from '../cell';

export const GRID_SIZE = 100;
export const DEFAULT_TIME_INTERVAL = 1000;
export const DEFAULT_MUTATION_RATE = 0.1;
export const DEFAULT_LIFESPAN = 6;


//function creates 2d grid, randomly populates cells with alive or dead state, assigns default properties of cell
export function initializeGrid(
  rows: number = GRID_SIZE,
  cols: number = GRID_SIZE
): Cell[][] {
  const grid: Cell[][] = [];
  for (let row = 0; row < rows; row++) {
    const currentRow: Cell[] = [];
    for (let col = 0; col < cols; col++) {
      currentRow.push({
        id: row * cols + col,
        isAlive: Math.random() < 0.02,
        age: 0,
        mutationRate: DEFAULT_MUTATION_RATE,
        color: 'green',
      });
    }
    grid.push(currentRow);
  }
  return grid;
}


//function uses array of directions to find neighbors of cell, loops through each 
// direction and checks if neighbor is within grid bounds, returns array of neighbor coordinates
export function getNeighbors(
  row: number,
  col: number,
  gridSize: number
): Array<{ row: number; col: number }> {
  const neighbors = [];
  const directions = [
    [-1, 0],
    [1, 0],
    [0, -1],
    [0, 1],
  ];
  for (const [dr, dc] of directions) {
    const newRow = row + dr;
    const newCol = col + dc;
    if (
      newRow >= 0 &&
      newRow < gridSize &&
      newCol >= 0 &&
      newCol < gridSize
    ) {
      neighbors.push({ row: newRow, col: newCol });
    }
  }
  return neighbors;
}


//function simulates a generation of cell division and aging, returns new grid state
export function simulateGeneration(
  grid: Cell[][],
  mutationRate: number,
  lifespan: number
): Cell[][] {
  
  const gridSize = grid.length;
  // Clone the grid so we don’t mutate in place
  const newGrid = grid.map((r) => r.map((cell) => ({ ...cell })));
  // loop through grid, age each cell, if cell age exceeds lifespan, set isAlive to false and reset age
  for (let row = 0; row < gridSize; row++) {
    for (let col = 0; col < gridSize; col++) {
      const cell = newGrid[row][col];
      if (cell.isAlive) {
        cell.age += 1;
        if (cell.age >= lifespan) {
          cell.isAlive = false;
          cell.age = 0;
        }
      }
    }
  }
  // 3) Cell division pass
  const cellsToAdd: Array<{
    row: number;
    col: number;
    parentCell: Cell;
  }> = [];
  // Loop through the grid again to find cells that are alive and can divide, use getNeighbors 
  // to find empty neighbors of cell, if empty neighbor found, create new cell randomly with properties of
  //  parent cell and add to cellsToAdd array
  for (let row = 0; row < gridSize; row++) {
    for (let col = 0; col < gridSize; col++) {
      const cell = grid[row][col];
      if (cell.isAlive) {
        const neighbors = getNeighbors(row, col, gridSize);
        const emptyNeighbors = neighbors.filter(
          ({ row: nRow, col: nCol }) => !grid[nRow][nCol].isAlive
        );
        if (emptyNeighbors.length > 0) {
          const rand = emptyNeighbors[
            Math.floor(Math.random() * emptyNeighbors.length)
          ];
          const isMutated = Math.random() < mutationRate;
          const newCell: Cell = {
            id: rand.row * gridSize + rand.col,
            isAlive: true,
            age: 0,
            mutationRate: isMutated
              ? Math.min(mutationRate * 1.5, 1.0)
              : mutationRate,
            color: isMutated ? 'orange' : cell.color,
          };
          cellsToAdd.push({
            row: rand.row,
            col: rand.col,
            parentCell: newCell,
          });
        }
      }
    }
  }
  // Add new cells to the grid based on cellsToAdd array,
  // ensuring that we do not overwrite existing cells
  cellsToAdd.forEach(({ row, col, parentCell }) => {
    newGrid[row][col] = parentCell;
  });
  return newGrid;
}

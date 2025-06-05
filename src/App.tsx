import React, { useState, useEffect, useRef } from 'react';
import logo from './logo.svg';
import './App.css';
import InputField from './Components/InputField';
import PetriDish from './Components/PetriDish';
import { Cell } from './cell';

// Function to initialize the grid with cells
const initializeGrid = (rows: number = 50, cols: number = 50): Cell[][] => {
  const grid: Cell[][] = [];

  for (let row = 0; row < rows; row++) {
    const currentRow: Cell[] = [];
    for (let col = 0; col < cols; col++) {
      currentRow.push({
        id: row * cols + col,
        isAlive: Math.random() < 0.1, // Reduced initial density to 10%
        age: 0,
        mutationRate: 0.1,
        color: 'green',
      });
    }
    grid.push(currentRow);
  }

  return grid;
};

// Function to get neighboring cells (up, down, left, right)
const getNeighbors = (grid: Cell[][], row: number, col: number): Array<{row: number, col: number}> => {
  const neighbors = [];
  const directions = [
    [-1, 0], // up
    [1, 0],  // down
    [0, -1], // left
    [0, 1]   // right
  ];

  for (const [dr, dc] of directions) {
    const newRow = row + dr;
    const newCol = col + dc;
    
    if (newRow >= 0 && newRow < grid.length && newCol >= 0 && newCol < grid[0].length) {
      neighbors.push({ row: newRow, col: newCol });
    }
  }
  
  return neighbors;
};

// Function to simulate one generation of bacterial growth
const simulateGeneration = (grid: Cell[][], mutationRate: number, lifespan: number): Cell[][] => {
  const newGrid = grid.map(row => row.map(cell => ({ ...cell })));
  
  // First pass: age all cells and kill old ones
  for (let row = 0; row < newGrid.length; row++) {
    for (let col = 0; col < newGrid[row].length; col++) {
      const cell = newGrid[row][col];
      if (cell.isAlive) {
        cell.age += 1;
        // Kill cells that exceed their lifespan
        if (cell.age >= lifespan) {
          cell.isAlive = false;
          cell.age = 0;
        }
      }
    }
  }
  
  // Second pass: handle cell division
  const cellsToAdd: Array<{row: number, col: number, parentCell: Cell}> = [];
  
  for (let row = 0; row < grid.length; row++) {
    for (let col = 0; col < grid[row].length; col++) {
      const cell = grid[row][col];
      
      // Only living cells can divide
      if (cell.isAlive) {
        const neighbors = getNeighbors(grid, row, col);
        const emptyNeighbors = neighbors.filter(({row: nRow, col: nCol}) => 
          !grid[nRow][nCol].isAlive
        );
        
        // Cell can divide if there's at least one empty neighbor
        if (emptyNeighbors.length > 0) {
          // Randomly select an empty neighbor for division
          const randomNeighbor = emptyNeighbors[Math.floor(Math.random() * emptyNeighbors.length)];
          
          // Create new cell with potential mutation
          const isMutated = Math.random() < mutationRate;
          const newCell: Cell = {
            id: randomNeighbor.row * grid[0].length + randomNeighbor.col,
            isAlive: true,
            age: 0,
            mutationRate: isMutated ? Math.min(mutationRate * 1.5, 1.0) : mutationRate,
            color: isMutated ? 'orange' : cell.color, // Mutated cells are orange
          };
          
          cellsToAdd.push({
            row: randomNeighbor.row,
            col: randomNeighbor.col,
            parentCell: newCell
          });
        }
      }
    }
  }
  
  // Third pass: add new cells
  cellsToAdd.forEach(({row, col, parentCell}) => {
    newGrid[row][col] = parentCell;
  });
  
  return newGrid;
};

const App: React.FC = () => {
  const [running, setRunning] = useState(false);
  const [grid, setGrid] = useState<Cell[][]>(initializeGrid());
  
  // Input field values with defaults
  const [timeInterval, setTimeInterval] = useState('1000');
  const [mutationRate, setMutationRate] = useState('0.1');
  const [lifespan, setLifespan] = useState('6');
  
  // Statistics
  const [generation, setGeneration] = useState(0);
  const [livingCells, setLivingCells] = useState(0);
  const [mutatedCells, setMutatedCells] = useState(0);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const simulationStartTime = useRef<number>(0);
  const lifespanTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Calculate statistics
  useEffect(() => {
    let living = 0;
    let mutated = 0;
    
    grid.forEach(row => {
      row.forEach(cell => {
        if (cell.isAlive) {
          living++;
          if (cell.color === 'orange') {
            mutated++;
          }
        }
      });
    });
    
    setLivingCells(living);
    setMutatedCells(mutated);
  }, [grid]);

  // Handle cell click to kill cell
  const handleCellClick = (row: number, col: number) => {
    setGrid((prevGrid) => {
      const newGrid = prevGrid.map((r, rowIndex) =>
        r.map((cell, colIndex) => {
          if (rowIndex === row && colIndex === col) {
            return { ...cell, isAlive: false, age: 0 };
          }
          return cell;
        })
      );
      return newGrid;
    });
  };

  const startSimulation = () => {
    const interval = parseInt(timeInterval) || 1000;
    const mutation = parseFloat(mutationRate) || 0.1;
    const cellLifespan = parseInt(lifespan) || 6;
    const lifespanMs = parseInt(lifespan) * 1000 || 6000;
    
    simulationStartTime.current = Date.now();
    
    intervalRef.current = setInterval(() => {
      setGrid(prevGrid => simulateGeneration(prevGrid, mutation, cellLifespan));
      setGeneration(prev => prev + 1);
    }, interval);
    
    // Set timeout to stop simulation after specified lifespan
    lifespanTimeoutRef.current = setTimeout(() => {
      stopSimulation();
    }, lifespanMs);
  };

  const stopSimulation = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (lifespanTimeoutRef.current) {
      clearTimeout(lifespanTimeoutRef.current);
      lifespanTimeoutRef.current = null;
    }
    setRunning(false);
  };

  const toggleSimulation = () => {
    if (running) {
      stopSimulation();
    } else {
      setRunning(true);
      startSimulation();
    }
  };

  const resetSimulation = () => {
    stopSimulation();
    setGrid(initializeGrid());
    setGeneration(0);
  };
  
  return (
    <div className="app-container">
      <h1>Bacterial Growth Simulation</h1>

      <div className="controls-container">
        <InputField
          label="Time Interval (ms)"
          placeholder="Enter time interval (default: 1000)"
          value={timeInterval}
          onChange={setTimeInterval}
        />
        <InputField
          label="Mutation Rate (0-1)"
          placeholder="Enter mutation probability (default: 0.1)"
          value={mutationRate}
          onChange={setMutationRate}
        />
        <InputField
          label="Cell Lifespan (generations)"
          placeholder="Enter cell lifespan (default: 6)" 
          value={lifespan}
          onChange={setLifespan}
        />
      
        <div className="button-group">
          <button 
            className={`simulation-button ${running ? 'stop' : 'start'}`}
            onClick={toggleSimulation}
          >
            {running ? 'Stop Simulation' : 'Start Simulation'}
          </button>
          
          <button 
            className="simulation-button reset"
            onClick={resetSimulation}
          >
            Reset Grid
          </button>
        </div>

        <div className="stats-container">
          <div className="stat">
            <span className="stat-label">Generation:</span>
            <span className="stat-value">{generation}</span>
          </div>
          <div className="stat">
            <span className="stat-label">Living Cells:</span>
            <span className="stat-value">{livingCells}</span>
          </div>
          <div className="stat">
            <span className="stat-label">Mutated Cells:</span>
            <span className="stat-value mutated">{mutatedCells}</span>
          </div>
        </div>
      </div>
      
      <div className="legend">
        <div className="legend-item">
          <div className="legend-color normal"></div>
          <span>Normal Cells</span>
        </div>
        <div className="legend-item">
          <div className="legend-color mutated"></div>
          <span>Mutated Cells</span>
        </div>
        <div className="legend-item">
          <div className="legend-color dead"></div>
          <span>Dead/Empty</span>
        </div>
      </div>
      
      <PetriDish grid={grid} onCellClick={handleCellClick} />
    </div>
  );
};

export default App;
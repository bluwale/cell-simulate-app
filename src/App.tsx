import React, { useState, useEffect, useRef } from 'react';
import logo from './logo.svg';
import './App.css';
import InputField from './Components/InputField';
import PetriDish from './Components/PetriDish';
import { Cell } from './cell';

const GRID_SIZE = 200; // Meeting the 200x200 requirement
const DEFAULT_TIME_INTERVAL = 1000;
const DEFAULT_MUTATION_RATE = 0.1;
const DEFAULT_LIFESPAN = 6;

// Optimized grid initialization with reduced initial density for 200x200
const initializeGrid = (rows: number = GRID_SIZE, cols: number = GRID_SIZE): Cell[][] => {
  const grid: Cell[][] = [];

  for (let row = 0; row < rows; row++) {
    const currentRow: Cell[] = [];
    for (let col = 0; col < cols; col++) {
      currentRow.push({
        id: row * cols + col,
        isAlive: Math.random() < 0.02, // Reduced to 2% for better performance with larger grid
        age: 0,
        mutationRate: DEFAULT_MUTATION_RATE,
        color: 'green',
      });
    }
    grid.push(currentRow);
  }

  return grid;
};

// Function to get neighboring cells (up, down, left, right)
const getNeighbors = (row: number, col: number, gridSize: number): Array<{row: number, col: number}> => {
  const neighbors = [];
  const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];

  for (const [dr, dc] of directions) {
    const newRow = row + dr;
    const newCol = col + dc;
    
    if (newRow >= 0 && newRow < gridSize && newCol >= 0 && newCol < gridSize) {
      neighbors.push({ row: newRow, col: newCol });
    }
  }
  
  return neighbors;
};

// Function to simulate one generation of bacterial growth
const simulateGeneration = (grid: Cell[][], mutationRate: number, lifespan: number): Cell[][] => {
  const newGrid = grid.map(row => row.map(cell => ({ ...cell })));
  const gridSize = grid.length;
  
  // First pass: age all cells and kill old ones
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
  
  // Second pass: handle cell division
  const cellsToAdd: Array<{row: number, col: number, parentCell: Cell}> = [];
  
  for (let row = 0; row < gridSize; row++) {
    for (let col = 0; col < gridSize; col++) {
      const cell = grid[row][col];
      
      if (cell.isAlive) {
        const neighbors = getNeighbors(row, col, gridSize);
        const emptyNeighbors = neighbors.filter(({row: nRow, col: nCol}) => 
          !grid[nRow][nCol].isAlive
        );
        
        if (emptyNeighbors.length > 0) {
          const randomNeighbor = emptyNeighbors[Math.floor(Math.random() * emptyNeighbors.length)];
          
          const isMutated = Math.random() < mutationRate;
          const newCell: Cell = {
            id: randomNeighbor.row * gridSize + randomNeighbor.col,
            isAlive: true,
            age: 0,
            mutationRate: isMutated ? Math.min(mutationRate * 1.5, 1.0) : mutationRate,
            color: isMutated ? 'orange' : cell.color,
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
  
  const [timeInterval, setTimeInterval] = useState(DEFAULT_TIME_INTERVAL.toString());
  const [mutationRate, setMutationRate] = useState(DEFAULT_MUTATION_RATE.toString());
  const [lifespan, setLifespan] = useState(DEFAULT_LIFESPAN.toString());
  
  const [generation, setGeneration] = useState(0);
  const [livingCells, setLivingCells] = useState(0);
  const [mutatedCells, setMutatedCells] = useState(0);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Calculate statistics with useMemo for performance
  const calculateStats = useCallback(() => {
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

  useEffect(() => {
    calculateStats();
  }, [calculateStats]);

  // Fixed: Now allows both adding AND removing cells
  const handleCellClick = useCallback((row: number, col: number) => {
    setGrid((prevGrid) => {
      const newGrid = prevGrid.map((r, rowIndex) =>
        r.map((cell, colIndex) => {
          if (rowIndex === row && colIndex === col) {
            // Toggle cell state: if alive, kill it; if dead, revive it
            return { 
              ...cell, 
              isAlive: !cell.isAlive, 
              age: !cell.isAlive ? 0 : cell.age,
              color: !cell.isAlive ? 'green' : cell.color
            };
          }
          return cell;
        })
      );
      return newGrid;
    });
  }, []);

  const startSimulation = useCallback(() => {
    const interval = parseInt(timeInterval) || DEFAULT_TIME_INTERVAL;
    const mutation = parseFloat(mutationRate) || DEFAULT_MUTATION_RATE;
    const cellLifespan = parseInt(lifespan) || DEFAULT_LIFESPAN;
    
    // Validate inputs
    if (interval < 100) {
      alert('Time interval must be at least 100ms for performance reasons');
      return;
    }
    if (mutation < 0 || mutation > 1) {
      alert('Mutation rate must be between 0 and 1');
      return;
    }
    if (cellLifespan < 1) {
      alert('Cell lifespan must be at least 1 generation');
      return;
    }
    
    intervalRef.current = setInterval(() => {
      setGrid(prevGrid => simulateGeneration(prevGrid, mutation, cellLifespan));
      setGeneration(prev => prev + 1);
    }, interval);
    
    setRunning(true);
  }, [timeInterval, mutationRate, lifespan]);

  const stopSimulation = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setRunning(false);
  }, []);

  const toggleSimulation = useCallback(() => {
    if (running) {
      stopSimulation();
    } else {
      startSimulation();
    }
  }, [running, startSimulation, stopSimulation]);

  const resetSimulation = useCallback(() => {
    stopSimulation();
    setGrid(initializeGrid());
    setGeneration(0);
  }, [stopSimulation]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);
  
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '20px',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif'
    }}>
      <h1 style={{
        color: 'white',
        fontSize: '2.5rem',
        marginBottom: '30px',
        textShadow: '2px 2px 4px rgba(0, 0, 0, 0.3)'
      }}>
        Bacterial Growth Simulation
      </h1>

      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        marginBottom: '30px',
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(10px)',
        padding: '30px',
        borderRadius: '15px',
        border: '1px solid rgba(255, 255, 255, 0.2)'
      }}>
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
      
        <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', justifyContent: 'center' }}>
          <button 
            onClick={toggleSimulation}
            style={{
              padding: '15px 30px',
              fontSize: '18px',
              fontWeight: '600',
              border: 'none',
              borderRadius: '12px',
              cursor: 'pointer',
              background: running ? 
                'linear-gradient(45deg, #f44336, #da190b)' : 
                'linear-gradient(45deg, #4CAF50, #45a049)',
              color: 'white',
              minWidth: '150px'
            }}
          >
            {running ? 'Stop Simulation' : 'Start Simulation'}
          </button>
          
          <button 
            onClick={resetSimulation}
            style={{
              padding: '15px 30px',
              fontSize: '18px',
              fontWeight: '600',
              border: 'none',
              borderRadius: '12px',
              cursor: 'pointer',
              background: 'linear-gradient(45deg, #ff9800, #f57c00)',
              color: 'white',
              minWidth: '150px'
            }}
          >
            Reset Grid
          </button>
        </div>

        <div style={{
          display: 'flex',
          justifyContent: 'space-around',
          gap: '20px',
          marginTop: '20px',
          padding: '20px',
          background: 'rgba(255, 255, 255, 0.05)',
          borderRadius: '10px'
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <span style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '12px' }}>GENERATION</span>
            <span style={{ color: 'white', fontSize: '24px', fontWeight: 'bold' }}>{generation}</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <span style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '12px' }}>LIVING CELLS</span>
            <span style={{ color: 'white', fontSize: '24px', fontWeight: 'bold' }}>{livingCells}</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <span style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '12px' }}>MUTATED CELLS</span>
            <span style={{ color: '#ff9800', fontSize: '24px', fontWeight: 'bold' }}>{mutatedCells}</span>
          </div>
        </div>
      </div>
      
      <div style={{
        display: 'flex',
        gap: '20px',
        marginBottom: '20px',
        padding: '15px',
        background: 'rgba(255, 255, 255, 0.1)',
        borderRadius: '10px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'white' }}>
          <div style={{
            width: '16px',
            height: '16px',
            background: 'radial-gradient(circle, #4CAF50, #2E7D32)',
            borderRadius: '3px'
          }} />
          <span>Normal Cells</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'white' }}>
          <div style={{
            width: '16px',
            height: '16px',
            background: 'radial-gradient(circle, #ff9800, #f57c00)',
            borderRadius: '3px'
          }} />
          <span>Mutated Cells</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'white' }}>
          <div style={{
            width: '16px',
            height: '16px',
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '3px'
          }} />
          <span>Dead/Empty</span>
        </div>
      </div>

      <p style={{
        color: 'white',
        marginBottom: '20px',
        textAlign: 'center',
        background: 'rgba(255, 255, 255, 0.1)',
        padding: '10px 20px',
        borderRadius: '8px'
      }}>
        Click on cells to add/remove bacteria. Grid size: {GRID_SIZE}×{GRID_SIZE}
      </p>
      
      <div style={{
        border: '3px solid rgba(255, 255, 255, 0.3)',
        borderRadius: '15px',
        padding: '10px',
        background: 'rgba(255, 255, 255, 0.1)',
        maxHeight: '70vh',
        overflow: 'auto'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {grid.map((row, rowIndex) => (
            <div key={rowIndex} style={{ display: 'flex' }}>
              {row.map((cell, colIndex) => (
                <div
                  key={colIndex}
                  onClick={() => handleCellClick(rowIndex, colIndex)}
                  style={{
                    width: '3px',
                    height: '3px',
                    border: '0.5px solid rgba(255, 255, 255, 0.1)',
                    cursor: 'pointer',
                    background: !cell.isAlive 
                      ? 'rgba(255, 255, 255, 0.1)'
                      : cell.color === 'orange'
                        ? 'radial-gradient(circle, #ff9800, #f57c00)'
                        : 'radial-gradient(circle, #4CAF50, #2E7D32)'
                  }}
                  title={cell.isAlive ? `Age: ${cell.age}, Mutation Rate: ${cell.mutationRate.toFixed(2)}` : 'Dead cell - Click to add bacteria'}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default App;
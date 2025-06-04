import React, { useState } from 'react';
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
        id: row * cols + col, // Generate unique ID
        isAlive: Math.random() < 0.3, // 30% chance of alive at start
        age: 0,
        mutationRate: 0.1, // Default mutation rate
        color: 'green', // Default color
      });
    }
    grid.push(currentRow);
  }

  return grid;
};

const App: React.FC = () => {
  const [running, setRunning] = useState(false); // State to track if the simulation is running
  const [grid, setGrid] = useState<Cell[][]>(initializeGrid());
  
  // Add state for input field values
  const [timeInterval, setTimeInterval] = useState('');
  const [mutationRate, setMutationRate] = useState('');
  const [lifespan, setLifespan] = useState('');

  // Fixed cell click handler - moved inside component to access setGrid
  const handleCellClick = (row: number, col: number) => {
    setGrid((prevGrid) => {
      const newGrid = prevGrid.map((r, rowIndex) =>
        r.map((cell, colIndex) => {
          if (rowIndex === row && colIndex === col) {
            return { ...cell, isAlive: false, age: 0 }; // Fixed: use isAlive instead of alive
          }
          return cell;
        })
      );
      return newGrid;
    });
  };

  const toggleSimulation = () => {
    // Function to toggle the simulation state
    setRunning((prev) => !prev);
    console.log("Simulation toggled");
  }
  
  return (
    <div className="app-container">
      <h1>Cell Growth Simulation</h1>

      <div className="controls-container">
        <InputField
          label="Time Interval (ms)"
          placeholder="Enter time interval"
          value={timeInterval}
          onChange={setTimeInterval}
        />
        <InputField
          label="Mutation Rate (%)"
          placeholder="Enter rate of mutation"
          value={mutationRate}
          onChange={setMutationRate}
        />
        <InputField
          label="Lifespan (seconds)"
          placeholder="Enter lifespan of simulation" 
          value={lifespan}
          onChange={setLifespan}
        />
      
        <button 
          className={`simulation-button ${running ? 'stop' : 'start'}`}
          onClick={toggleSimulation}
        >
          {running ? 'Stop Simulation' : 'Start Simulation'}
        </button>
      </div>
      
      <PetriDish grid={grid} onCellClick={handleCellClick} />
    </div>
  );
};

export default App;
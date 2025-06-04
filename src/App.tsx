import React, { useState } from 'react';
import logo from './logo.svg';
import './App.css';
import InputField from './Components/InputField';
import PetriDish from './Components/PetriDish';
import './cell';

const App: React.FC = () => {
  
  const [running, setRunning] = useState(false);// State to track if the simulation is running

  const [grid, setGrid] = useState<cell[][]>(initializeGrid());


  const initializeGrid = (rows: number = 20, cols: number = 20): Cell[][] => {
  const grid: Cell[][] = [];

  for (let row = 0; row < rows; row++) {
    const currentRow: Cell[] = [];
    for (let col = 0; col < cols; col++) {
      currentRow.push({
        alive: Math.random() < 0.3, // 30% chance of alive at start
        age: 0,
      });
    }
    grid.push(currentRow);
  }

  return grid;
};



  const toggleSimulation = () => {// Function to toggle the simulation state
    setRunning((prev) => !prev);
    console.log("Simulation toggled");

  }
  
  return (
    <div>
      <h1>Cell Growth Simulation</h1>

      <InputField
        label="Time Interval "
        placeholder="Enter time interval"
        value=""
        onChange={(value) => console.log(value)}
      />
      <InputField
        label="Mutation Rate (%) "
        placeholder="Enter rate of mutation"
        value=""
        onChange={(value) => console.log(value)}
      />
      <InputField
        label="Lifespan (seconds) "
        placeholder="Enter lifespan of simulation" 
        value=""
        onChange={(value) => console.log(value)}
      />
    
    <button onClick={toggleSimulation}>
        {running ? 'Stop Simulation' : 'Start Simulation'}
      </button>
    
    
    
    </div>



  );
};

export default App;

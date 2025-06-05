import React, { useState, useEffect, useRef, useCallback } from 'react';
import './App.css';
import './Components/styles.css';

import { Cell } from './cell';
import PetriDish from './Components/PetriDish';
import InputField from './Components/InputField';
import ControlsPanel from './Components/ControlPanel';
import StatsPanel from './Components/StatisticsPanel';
import Legend from './Components/Legend';
import GrowthChart, { GrowthDataPoint } from './Components/GrowthChart';

//importing constants have helped with preformance
import {
  GRID_SIZE,
  DEFAULT_TIME_INTERVAL,
  DEFAULT_MUTATION_RATE,
  DEFAULT_LIFESPAN,
  initializeGrid,
  simulateGeneration,
} from './Components/InitializeSimulation';

const App: React.FC = () => {
  
  // State variables
  const [running, setRunning] = useState(false);
  const [grid, setGrid] = useState<Cell[][]>(() => initializeGrid());

  const [timeInterval, setTimeInterval] = useState(
    DEFAULT_TIME_INTERVAL.toString()
  );
  const [mutationRate, setMutationRate] = useState(
    DEFAULT_MUTATION_RATE.toString()
  );
  const [lifespan, setLifespan] = useState(DEFAULT_LIFESPAN.toString());

  const [generation, setGeneration] = useState(0);
  const [livingCells, setLivingCells] = useState(0);
  const [mutatedCells, setMutatedCells] = useState(0);
  const [growthData, setGrowthData] = useState<GrowthDataPoint[]>([]);
  const [showChart, setShowChart] = useState(false);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Calculate stats
  const calculateStats = useCallback(() => {
    let living = 0;
    let mutated = 0;
    grid.forEach((row) =>
      row.forEach((cell) => {
        if (cell.isAlive) {
          living++;
          if (cell.color === 'orange') mutated++;
        }
      })
    );
    setLivingCells(living);
    setMutatedCells(mutated);
  }, [grid]);

  useEffect(() => {
    calculateStats();
    // Update growth data when stats change and simulation is running
    if (running && generation > 0) {
      const newDataPoint: GrowthDataPoint = {
        generation,
        livingCells,
        mutatedCells,
        normalCells: livingCells - mutatedCells,
      };
      
      setGrowthData(prevData => {
        // Keep only the last 100 data points for performance
        const updatedData = [...prevData, newDataPoint];
        return updatedData.length > 100 ? updatedData.slice(-100) : updatedData;
      });
    }
  }, [calculateStats, running, generation, livingCells, mutatedCells]);

  // function to handle cell clicks, checks row and col indicies, toggles cell state and color
  const handleCellClick = useCallback((row: number, col: number) => {
    setGrid((prevGrid) =>
      prevGrid.map((r, rowIndex) =>
        r.map((cell, colIndex) => {
          if (rowIndex === row && colIndex === col) {
            return {
              ...cell,
              isAlive: !cell.isAlive,
              age: !cell.isAlive ? 0 : cell.age,
              color: !cell.isAlive ? 'green' : cell.color,
            };
          }
          return cell;
        })
      )
    );
  }, []);

  // Start / Stop / Reset simulation
  const startSimulation = useCallback(() => {
    const interval = parseInt(timeInterval) || DEFAULT_TIME_INTERVAL;
    const mutation = parseFloat(mutationRate) || DEFAULT_MUTATION_RATE;
    const cellLifespan = parseInt(lifespan) || DEFAULT_LIFESPAN;

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
      setGrid((prevGrid) =>
        simulateGeneration(prevGrid, mutation, cellLifespan)
      );
      setGeneration((prev) => prev + 1);
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
    running ? stopSimulation() : startSimulation();
  }, [running, startSimulation, stopSimulation]);

  const resetSimulation = useCallback(() => {
    stopSimulation();
    setGrid(initializeGrid());
    setGeneration(0);
    setGrowthData([]); // Clear growth data on reset
  }, [stopSimulation]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return (
    <div className="app-container">
      <h1>Bacterial Growth Simulation</h1>

      <ControlsPanel
        timeInterval={timeInterval}
        onTimeIntervalChange={setTimeInterval}
        mutationRate={mutationRate}
        onMutationRateChange={setMutationRate}
        lifespan={lifespan}
        onLifespanChange={setLifespan}
        running={running}
        onToggle={toggleSimulation}
        onReset={resetSimulation}
      />

      <StatsPanel
        generation={generation}
        livingCells={livingCells}
        mutatedCells={mutatedCells}
      />

      <GrowthChart 
        data={growthData}
        isVisible={showChart}
        onToggleVisibility={() => setShowChart(!showChart)}
      />

      <Legend />

      <p
        className="instructions"
        style={{
          color: 'white',
          marginBottom: '20px',
          textAlign: 'center',
          background: 'rgba(255,255,255,0.1)',
          padding: '10px 20px',
          borderRadius: '8px',
        }}
      >
        Click on cells to add/remove bacteria. Grid size: {GRID_SIZE}×{GRID_SIZE}
      </p>

      <PetriDish grid={grid} onCellClick={handleCellClick} />
    </div>
  );
};

export default App;
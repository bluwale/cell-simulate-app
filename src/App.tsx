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

import {
  GRID_SIZE,
  DEFAULT_TIME_INTERVAL,
  DEFAULT_MUTATION_RATE,
  DEFAULT_LIFESPAN,
  initializeGrid,
  simulateGeneration,
} from './Components/InitializeSimulation';

interface PerformanceMetrics {
  generation: number;
  executionTime: number;
  memoryUsage: number;
  cellCount: number;
  timestamp: number;
}

const App: React.FC = () => {
  const [running, setRunning] = useState(false);
  const [grid, setGrid] = useState<Cell[][]>(() => initializeGrid());

  const [timeInterval, setTimeInterval] = useState(DEFAULT_TIME_INTERVAL.toString());
  const [mutationRate, setMutationRate] = useState(DEFAULT_MUTATION_RATE.toString());
  const [lifespan, setLifespan] = useState(DEFAULT_LIFESPAN.toString());

  const [generation, setGeneration] = useState(0);
  const [livingCells, setLivingCells] = useState(0);
  const [mutatedCells, setMutatedCells] = useState(0);
  const [growthData, setGrowthData] = useState<GrowthDataPoint[]>([]);
  const [showChart, setShowChart] = useState(false);

  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetrics[]>([]);
  const [showPerformanceMetrics, setShowPerformanceMetrics] = useState(false);
  const [currentPerformance, setCurrentPerformance] = useState({
    avgExecutionTime: 0,
    avgMemoryUsage: 0,
    maxMemoryUsage: 0,
    minExecutionTime: 0,
    maxExecutionTime: 0,
  });

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const getMemoryUsage = (): number => {
    if ('memory' in performance && (performance as any).memory) {
      const memory = (performance as any).memory;
      return Math.round((memory.usedJSHeapSize / (1024 * 1024)) * 100) / 100;
    }
    return 0;
  };

  const updatePerformanceStats = useCallback(() => {
    if (performanceMetrics.length === 0) return;

    const executionTimes = performanceMetrics.map(m => m.executionTime);
    const memoryUsages = performanceMetrics.map(m => m.memoryUsage).filter(m => m > 0);

    setCurrentPerformance({
      avgExecutionTime: Math.round((executionTimes.reduce((a, b) => a + b, 0) / executionTimes.length) * 100) / 100,
      avgMemoryUsage: memoryUsages.length > 0 ? Math.round((memoryUsages.reduce((a, b) => a + b, 0) / memoryUsages.length) * 100) / 100 : 0,
      maxMemoryUsage: memoryUsages.length > 0 ? Math.max(...memoryUsages) : 0,
      minExecutionTime: Math.min(...executionTimes),
      maxExecutionTime: Math.max(...executionTimes),
    });
  }, [performanceMetrics]);

  useEffect(() => {
    updatePerformanceStats();
  }, [updatePerformanceStats]);

  const calculateStats = useCallback(() => {
    let living = 0;
    let mutated = 0;
    grid.forEach(row =>
      row.forEach(cell => {
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
    if (running && generation > 0) {
      const newDataPoint: GrowthDataPoint = {
        generation,
        livingCells,
        mutatedCells,
        normalCells: livingCells - mutatedCells,
      };

      setGrowthData(prevData => {
        const updatedData = [...prevData, newDataPoint];
        return updatedData.length > 100 ? updatedData.slice(-100) : updatedData;
      });
    }
  }, [calculateStats, running, generation, livingCells, mutatedCells]);

  const handleCellClick = useCallback((row: number, col: number) => {
    setGrid(prevGrid =>
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
      setGrid(prevGrid => {
        const startTime = performance.now();
        const memoryBefore = getMemoryUsage();

        const newGrid = simulateGeneration(prevGrid, mutation, cellLifespan);

        const endTime = performance.now();
        const memoryAfter = getMemoryUsage();
        const executionTime = Math.round((endTime - startTime) * 100) / 100;

        const cellCount = newGrid.flat().filter(cell => cell.isAlive).length;

        const metric: PerformanceMetrics = {
          generation: 0,
          executionTime,
          memoryUsage: memoryAfter > 0 ? memoryAfter : memoryBefore,
          cellCount,
          timestamp: Date.now(),
        };

        console.log(`Generation execution time: ${executionTime} ms | Memory: ${metric.memoryUsage} MB | Living cells: ${cellCount}`);

        setPerformanceMetrics(prevMetrics => {
          const updatedMetrics = [...prevMetrics, metric];
          return updatedMetrics.length > 50 ? updatedMetrics.slice(-50) : updatedMetrics;
        });

        return newGrid;
      });

      setGeneration(prev => {
        const nextGen = prev + 1;
        setPerformanceMetrics(prevMetrics => {
          if (prevMetrics.length > 0) {
            const updated = [...prevMetrics];
            updated[updated.length - 1].generation = nextGen;
            return updated;
          }
          return prevMetrics;
        });
        return nextGen;
      });
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
    setGrowthData([]);
    setPerformanceMetrics([]);
  }, [stopSimulation]);

  const exportPerformanceData = useCallback(() => {
    console.log('Performance Metrics Export:');
    console.table(performanceMetrics);

    const csvHeader = 'Generation,Execution Time (ms),Memory Usage (MB),Cell Count,Timestamp';
    const csvData = performanceMetrics.map(m =>
      `${m.generation},${m.executionTime},${m.memoryUsage},${m.cellCount},${m.timestamp}`
    ).join('\n');

    console.log('\nCSV Format:');
    console.log(csvHeader);
    console.log(csvData);
  }, [performanceMetrics]);

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

      <div className="performance-container">
        <div className="performance-header">
          <h3>Performance Metrics</h3>
          <div className="performance-buttons">
            <button
              onClick={() => setShowPerformanceMetrics(!showPerformanceMetrics)}
              className={`performance-toggle-button ${showPerformanceMetrics ? 'active' : ''}`}
            >
              {showPerformanceMetrics ? 'Hide' : 'Show'} Metrics
            </button>
          </div>
        </div>

        {showPerformanceMetrics && (
          <div className="performance-stats">
            {performanceMetrics.length > 0 ? (
              <>
                <div className="perf-stat-grid">
                  <div className="perf-stat">
                    <span className="perf-stat-label">Avg Execution Time</span>
                    <span className="perf-stat-value">{currentPerformance.avgExecutionTime} ms</span>
                  </div>
                  <div className="perf-stat">
                    <span className="perf-stat-label">Execution Range</span>
                    <span className="perf-stat-value">{currentPerformance.minExecutionTime} - {currentPerformance.maxExecutionTime} ms</span>
                  </div>
                  {currentPerformance.avgMemoryUsage > 0 && (
                    <>
                      <div className="perf-stat">
                        <span className="perf-stat-label">Avg Memory Usage</span>
                        <span className="perf-stat-value">{currentPerformance.avgMemoryUsage} MB</span>
                      </div>
                      <div className="perf-stat">
                        <span className="perf-stat-label">Peak Memory</span>
                        <span className="perf-stat-value">{currentPerformance.maxMemoryUsage} MB</span>
                      </div>
                    </>
                  )}
                  <div className="perf-stat">
                    <span className="perf-stat-label">Generations Tracked</span>
                    <span className="perf-stat-value">{performanceMetrics.length}</span>
                  </div>
                </div>

                <div className="recent-performance">
                  <h4>Recent Performance (Last 10 generations)</h4>
                  <div className="performance-history">
                    {performanceMetrics.slice(-10).reverse().map((metric, index) => (
                      <div key={index} className="performance-entry">
                        <span>Gen {metric.generation}: {metric.executionTime}ms</span>
                        {metric.memoryUsage > 0 && <span> | {metric.memoryUsage}MB</span>}
                        <span> | {metric.cellCount} cells</span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="no-performance-data">
                <p>Start the simulation to collect performance metrics</p>
              </div>
            )}
          </div>
        )}
      </div>

      <GrowthChart
        data={growthData}
        isVisible={showChart}
        onToggleVisibility={() => setShowChart(!showChart)}
      />

      <Legend />

      <p className="instructions" style={{
        color: 'white',
        marginBottom: '20px',
        textAlign: 'center',
        background: 'rgba(255,255,255,0.1)',
        padding: '10px 20px',
        borderRadius: '8px',
      }}>
        Click on cells to add/remove bacteria. Grid size: {GRID_SIZE}×{GRID_SIZE}
      </p>

      <PetriDish grid={grid} onCellClick={handleCellClick} />
    </div>
  );
};

export default App;

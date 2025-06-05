// src/Components/ControlsPanel.tsx
import React from 'react';
import InputField from './InputField';

type Props = {
  timeInterval: string;
  onTimeIntervalChange: (v: string) => void;
  mutationRate: string;
  onMutationRateChange: (v: string) => void;
  lifespan: string;
  onLifespanChange: (v: string) => void;
  running: boolean;
  onToggle: () => void;
  onReset: () => void;
};

export default function ControlsPanel({
  timeInterval,
  onTimeIntervalChange,
  mutationRate,
  onMutationRateChange,
  lifespan,
  onLifespanChange,
  running,
  onToggle,
  onReset,
}: Props) {
  return (
    <div className="controls-container">
      <InputField
        label="Time Interval (ms)"
        placeholder="Enter time interval (default: 1000)"
        value={timeInterval}
        onChange={onTimeIntervalChange}
      />
      <InputField
        label="Mutation Rate (0–1)"
        placeholder="Enter mutation probability (default: 0.1)"
        value={mutationRate}
        onChange={onMutationRateChange}
      />
      <InputField
        label="Cell Lifespan (gens)"
        placeholder="Enter cell lifespan (default: 6)"
        value={lifespan}
        onChange={onLifespanChange}
      />

      <div className="button-group">
        <button
          onClick={onToggle}
          className={`simulation-button ${running ? 'stop' : 'start'}`}
        >
          {running ? 'Stop Simulation' : 'Start Simulation'}
        </button>
        <button onClick={onReset} className="simulation-button reset">
          Reset Grid
        </button>
      </div>
    </div>
  );
}

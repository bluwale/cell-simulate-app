// src/Components/StatsPanel.tsx
import React from 'react';

type Props = {
  generation: number;
  livingCells: number;
  mutatedCells: number;
};

export default function StatsPanel({
  generation,
  livingCells,
  mutatedCells,
}: Props) {
  return (
    <div className="stats-container">
      <div className="stat">
        <span className="stat-label">GENERATION</span>
        <span className="stat-value">{generation}</span>
      </div>
      <div className="stat">
        <span className="stat-label">LIVING CELLS</span>
        <span className="stat-value">{livingCells}</span>
      </div>
      <div className="stat">
        <span className="stat-label">MUTATED CELLS</span>
        <span className="stat-value mutated">{mutatedCells}</span>
      </div>
    </div>
  );
}

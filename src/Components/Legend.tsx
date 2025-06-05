// src/Components/Legend.tsx
import React from 'react';

export default function Legend() {
  return (
    <div className="legend">
      <div className="legend-item">
        <div className="legend-color normal" />
        <span>Normal Cells</span>
      </div>
      <div className="legend-item">
        <div className="legend-color mutated" />
        <span>Mutated Cells</span>
      </div>
      <div className="legend-item">
        <div className="legend-color dead" />
        <span>Dead/Empty</span>
      </div>
    </div>
  );
}

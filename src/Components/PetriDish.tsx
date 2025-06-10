import React from 'react';
import { Cell } from '../cell';


const PetriDish: React.FC<{
  grid: Cell[][];
  onCellClick?: (row: number, col: number) => void;
}> = ({ grid, onCellClick }) => {
  
  // Function to determine the class of a cell based on its state, returns a string whether alive, dead, or mutated
  const getCellClass = (cell: Cell): string => {
    if (!cell.isAlive) return 'cell dead';
    if (cell.color === 'orange') return 'cell alive mutated';
    return 'cell alive normal';
  };

  return (
    <div className="petri-dish">
      {grid.map((row, rowIndex) => (
        <div key={rowIndex} className="row">
          {row.map((cell, colIndex) => (
            <div
              key={colIndex}
              className={getCellClass(cell)}
              onClick={() => onCellClick && onCellClick(rowIndex, colIndex)}
              style={{ cursor: onCellClick ? 'pointer' : 'default' }}
              title={cell.isAlive ? `Age: ${cell.age}, Mutation Rate: ${cell.mutationRate.toFixed(2)}` : 'Dead cell'}
            />
          ))}
        </div>
      ))}
    </div>
  );
};

export default PetriDish;
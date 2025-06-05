import React from 'react';
import { Cell } from '../cell';
import './styles.css';

type PetriDishProps = {
    grid: Cell[][];
    onCellClick?: (row: number, col: number) => void;
}

const PetriDish: React.FC<PetriDishProps> = ({ grid, onCellClick }) => {
    const getCellClass = (cell: Cell): string => {
        if (!cell.isAlive) return 'cell dead';
        
        // Different classes based on cell properties
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
                        ></div>
                    ))}
                </div>
            ))}
        </div>
    );
}

export default PetriDish;
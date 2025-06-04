import React from 'react';
import { Cell } from '../cell';
import './styles.css';

type PetriDishProps = {
    grid: Cell[][];
    onCellClick?: (row: number, col: number) => void; // Fixed: proper function signature
}

const PetriDish: React.FC<PetriDishProps> = ({ grid, onCellClick }) => {
    return (
        <div className="petri-dish">
            {grid.map((row, rowIndex) => (
                <div key={rowIndex} className="row">
                    {row.map((cell, colIndex) => (
                        <div
                            key={colIndex}
                            className={`cell ${cell.isAlive ? 'alive' : 'dead'}`}
                            onClick={() => onCellClick && onCellClick(rowIndex, colIndex)} // Fixed: pass row and col indices
                            style={{ cursor: onCellClick ? 'pointer' : 'default' }} // Add visual feedback
                        ></div>
                    ))}
                </div>
            ))}
        </div>
    );
}

export default PetriDish;
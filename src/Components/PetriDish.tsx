import React from 'react';
import { Cell } from '../cell';
import './styles.css';

type PetriDishProps = {
    grid: Cell[][];
    onCellClick?: (cell: Cell) => void;
}

const PetriDish: React.FC<PetriDishProps> = ({ grid,onCellClick }) => {
    return (
        <div className="petri-dish">
            {grid.map((row, rowIndex) => (
                <div key={rowIndex} className="row">
                    {row.map((cell, colIndex) => (
                        <div
                            key={colIndex}
                            className={`cell ${cell.isAlive ? 'alive' : 'dead'}`}
                            onClick={() => onCellClick(rowIndex, colIndex)}
                        ></div>
                    ))}
                </div>
            ))}
        </div>
    );
}

export default PetriDish;

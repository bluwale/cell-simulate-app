import React from 'react';
import { Cell } from '../cell';
import './styles.css';

type PetriDishProps = {
    grid: Cell[][];
}

const PetriDish: React.FC<PetriDishProps> = ({ grid }) => {
    return (
        <div className="petri-dish">
            {grid.map((row, rowIndex) => (
                <div key={rowIndex} className="row">
                    {row.map((cell, colIndex) => (
                        <div
                            key={colIndex}
                            className={`cell ${cell.isAlive ? 'alive' : 'dead'}`}
                        ></div>
                    ))}
                </div>
            ))}
        </div>
    );
}

export default PetriDish;

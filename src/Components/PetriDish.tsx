// Optimized PetriDish Component with virtualization for better performance
const PetriDish: React.FC<{
  grid: Cell[][];
  onCellClick?: (row: number, col: number) => void;
}> = ({ grid, onCellClick }) => {
  const getCellClass = (cell: Cell): string => {
    if (!cell.isAlive) return 'cell dead';
    if (cell.color === 'orange') return 'cell alive mutated';
    return 'cell alive normal';
  };

  // For performance with 200x200 grid, we use smaller cells
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
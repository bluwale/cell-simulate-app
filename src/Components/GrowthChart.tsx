import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export interface GrowthDataPoint {
  generation: number;
  livingCells: number;
  mutatedCells: number;
  normalCells: number;
}

type Props = {
  data: GrowthDataPoint[];
  isVisible: boolean;
  onToggleVisibility: () => void;
};

export default function GrowthChart({ data, isVisible, onToggleVisibility }: Props) {
  // Custom tooltip to show detailed information
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="growth-tooltip">
          <p className="tooltip-label">{`Generation ${label}`}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {`${entry.name}: ${entry.value}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="growth-chart-container">
      <div className="chart-header">
        <h3>Colony Growth Over Time </h3>
        <button 
          onClick={onToggleVisibility}
          className={`chart-toggle-button ${isVisible ? 'active' : ''}`}
        >
          {isVisible ? 'Hide Chart' : 'Show Chart'}
        </button>
      </div>
      
      {isVisible && (
        <div className="chart-wrapper">
          {data.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart
                data={data}
                margin={{
                  top: 20,
                  right: 30,
                  left: 20,
                  bottom: 20,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.2)" />
                <XAxis 
                  dataKey="generation" 
                  stroke="rgba(255,255,255,0.8)"
                  fontSize={12}
                />
                <YAxis 
                  stroke="rgba(255,255,255,0.8)"
                  fontSize={12}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                  wrapperStyle={{ color: 'white' }}
                />
                <Line
                  type="monotone"
                  dataKey="livingCells"
                  stroke="#4CAF50"
                  strokeWidth={3}
                  dot={{ fill: '#4CAF50', strokeWidth: 2, r: 4 }}
                  name="Total Living Cells"
                  connectNulls={false}
                />
                <Line
                  type="monotone"
                  dataKey="normalCells"
                  stroke="#2E7D32"
                  strokeWidth={2}
                  dot={{ fill: '#2E7D32', strokeWidth: 2, r: 3 }}
                  name="Normal Cells"
                  connectNulls={false}
                />
                <Line
                  type="monotone"
                  dataKey="mutatedCells"
                  stroke="#ff9800"
                  strokeWidth={2}
                  dot={{ fill: '#ff9800', strokeWidth: 2, r: 3 }}
                  name="Mutated Cells"
                  connectNulls={false}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="no-data-message">
              <p>Start the simulation to see growth data</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
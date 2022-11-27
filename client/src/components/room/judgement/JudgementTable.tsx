import { useMemo } from 'react';

import { useAppSelector } from '../../../data/reduxHooks';
import { getOrderedPlayerNames } from '../../../data/roomSlice';

const TABLE_SIZE = 100;

interface JudgementTableProps {}

const JudgementTable = ({}: JudgementTableProps) => {
  const playerNames = useAppSelector(getOrderedPlayerNames);

  const renderedSeats = useMemo(
    () =>
      playerNames.map((playerName, index) => {
        const theta = (index / playerNames.length) * Math.PI * 2 + Math.PI / 2;
        const radius = TABLE_SIZE / 3;
        const x = radius * Math.cos(theta) + TABLE_SIZE / 2;
        const y = radius * Math.sin(theta) + TABLE_SIZE / 2;
        return (
          <circle
            key={playerName ?? index}
            cx={x}
            cy={y}
            r={TABLE_SIZE / 20}
            style={{ fill: 'lightgray', stroke: 'gray' }}
          />
        );
      }),
    [playerNames]
  );
  const renderedNameTags = useMemo(
    () =>
      playerNames.map((playerName, index) => {
        const position = index / playerNames.length;
        const theta = position * Math.PI * 2 + Math.PI / 2;
        const radius = TABLE_SIZE * 0.42;
        const x = radius * Math.cos(theta) + TABLE_SIZE / 2;
        const y = radius * Math.sin(theta) + TABLE_SIZE / 2;
        const textAnchor =
          position < 0.001 || Math.abs(position - 0.5) < 0.001
            ? 'middle'
            : position < 0.5
            ? 'end'
            : 'start';
        return (
          <text
            key={playerName ?? index}
            x={x}
            y={y}
            textAnchor={textAnchor}
            dominantBaseline="middle"
          >
            {playerName ?? 'Player'}
          </text>
        );
      }),
    [playerNames]
  );

  return (
    <div style={{ textAlign: 'center' }}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox={`-${TABLE_SIZE / 4} 0 ${TABLE_SIZE * 1.5} ${TABLE_SIZE}`}
        fontSize={TABLE_SIZE / 20}
        style={{ width: '100%', maxHeight: '80vh', strokeWidth: TABLE_SIZE / 100 }}
      >
        <circle
          cx={TABLE_SIZE / 2}
          cy={TABLE_SIZE / 2}
          r={TABLE_SIZE / 5}
          style={{ fill: 'lightgray', stroke: 'gray' }}
        />
        <g>{renderedSeats}</g>
        <g>{renderedNameTags}</g>
      </svg>
    </div>
  );
};

export default JudgementTable;

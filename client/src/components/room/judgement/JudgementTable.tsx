import { useMemo } from 'react';

import { useDndMonitor, useDroppable } from '@dnd-kit/core';

import {
  JudgementGameState,
  JudgementPlayCardAction,
  JudgementSpectatorGameState,
} from '../../../../generated_types/judgement';
import { getPlayerNames } from '../../../data/playerSlice';
import { useAppSelector } from '../../../data/reduxHooks';
import useConnectedGameSocket from '../../../game/useConnectedGameSocket';
import { isCardDraggableData } from '../../game/Hand';

import { DROPPABLE_TABLE_ID } from './dndConfig';

const BASE_SIZE = 100;
const HALF_BASE_SIZE = BASE_SIZE / 2;
const TABLE_SIZE = BASE_SIZE / 5;
const PILE_CARD_SIZE = BASE_SIZE / 10;

const SmallCard = () => (
  <g transform={`translate(${HALF_BASE_SIZE},${HALF_BASE_SIZE}) rotate(5)`}>
    <rect
      x={-PILE_CARD_SIZE / 2}
      y={-PILE_CARD_SIZE * 0.7}
      rx={PILE_CARD_SIZE / 5}
      width={PILE_CARD_SIZE}
      height={PILE_CARD_SIZE * 1.4}
      fill="white"
      stroke="black"
    />
    <circle cx={0} cy={0} r={PILE_CARD_SIZE / 5} fill="black" />
  </g>
);

interface Props {
  game: JudgementGameState | JudgementSpectatorGameState;
  canPlayCards?: boolean;
}

const JudgementTable = ({ game, canPlayCards }: Props) => {
  const socket = useConnectedGameSocket();

  const { isOver, setNodeRef } = useDroppable({ id: DROPPABLE_TABLE_ID, disabled: !canPlayCards });

  useDndMonitor({
    onDragEnd(event) {
      const activeData = event.active.data.current;
      if (socket && event.over?.id === DROPPABLE_TABLE_ID && isCardDraggableData(activeData)) {
        const action: JudgementPlayCardAction = {
          actionType: 'PLAY_CARD',
          card: `${activeData.card.suit}${activeData.card.rank}`,
        };
        socket.emit('game_input', action);
      }
    },
  });

  const renderedSeats = useMemo(
    () =>
      game.orderedPlayerIds.map((playerId, index) => {
        const theta = (index / game.orderedPlayerIds.length) * Math.PI * 2 + Math.PI / 2;
        const radius = BASE_SIZE / 3;
        const x = radius * Math.cos(theta) + HALF_BASE_SIZE;
        const y = radius * Math.sin(theta) + HALF_BASE_SIZE;
        return (
          <circle
            key={index}
            cx={x}
            cy={y}
            r={BASE_SIZE / 20}
            style={{
              fill: playerId === game.orderedPlayerIds[game.currentTurnIndex] ? 'red' : 'lightgray',
              stroke: 'gray',
            }}
          />
        );
      }),
    [game.currentTurnIndex, game.orderedPlayerIds]
  );
  const players = useAppSelector(getPlayerNames);
  const renderedNameTags = useMemo(
    () =>
      game.orderedPlayerIds.map((playerId, index) => {
        const position = index / game.orderedPlayerIds.length;
        const theta = position * Math.PI * 2 + Math.PI / 2;
        const radius = BASE_SIZE * 0.42;
        const x = radius * Math.cos(theta) + HALF_BASE_SIZE;
        const y = radius * Math.sin(theta) + HALF_BASE_SIZE;
        const textAnchor =
          position < 0.001 || Math.abs(position - 0.5) < 0.001
            ? 'middle'
            : position < 0.5
            ? 'end'
            : 'start';
        return (
          <text key={index} x={x} y={y} textAnchor={textAnchor} dominantBaseline="middle">
            {players[playerId] ?? 'Player'}
          </text>
        );
      }),
    [game.orderedPlayerIds, players]
  );

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={`-${HALF_BASE_SIZE / 2} 0 ${BASE_SIZE * 1.5} ${BASE_SIZE}`}
      fontSize={BASE_SIZE / 20}
      style={{ width: '100%', maxHeight: '100%', strokeWidth: BASE_SIZE / 100 }}
    >
      <circle
        cx={HALF_BASE_SIZE}
        cy={HALF_BASE_SIZE}
        r={TABLE_SIZE}
        style={{
          fill: isOver ? 'red' : 'lightgray',
          stroke: 'gray',
          transition: isOver ? '0s' : '0.3s',
        }}
      />
      {game.pile.map((card, index) => (
        <SmallCard key={index} />
      ))}
      <foreignObject
        x={HALF_BASE_SIZE - TABLE_SIZE}
        y={HALF_BASE_SIZE - TABLE_SIZE}
        width={TABLE_SIZE * 2}
        height={TABLE_SIZE * 2}
      >
        <div ref={setNodeRef} style={{ width: '100%', height: '100%' }} />
      </foreignObject>
      <g>{renderedSeats}</g>
      <g>{renderedNameTags}</g>
    </svg>
  );
};

export default JudgementTable;

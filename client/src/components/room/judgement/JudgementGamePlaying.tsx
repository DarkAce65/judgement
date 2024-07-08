import { useCallback, useState } from 'react';

import { DndContext } from '@dnd-kit/core';
import { Button, Space, Typography } from 'antd';

import {
  JudgementGameState,
  JudgementOrderCardsAction,
  JudgementPlayCardAction,
} from '../../../../generated_types/judgement';
import { optimisticallyReorderCards } from '../../../data/gameSlice';
import { useAppDispatch } from '../../../data/reduxHooks';
import useConnectedGameSocket from '../../../game/useConnectedGameSocket';
import useConfiguredSensors from '../../../utils/useConfiguredSensors';
import Card, { CardType } from '../../game/Card';
import Hand from '../../game/Hand';

import JudgementTable from './JudgementTable';

interface Props {
  game: JudgementGameState;
}

const JudgementGamePlaying = ({ game }: Props) => {
  const dispatch = useAppDispatch();
  const sensors = useConfiguredSensors();
  const socket = useConnectedGameSocket();

  const [selectedCard, setSelectedCard] = useState<CardType | null>(null);

  const reorderCards = useCallback(
    (fromIndex: number, toIndex: number) => {
      if (!socket) return;

      const action: JudgementOrderCardsAction = { actionType: 'ORDER_CARDS', fromIndex, toIndex };
      socket.emit('game_input', action);
      dispatch(optimisticallyReorderCards({ fromIndex, toIndex }));
    },
    [dispatch, socket],
  );

  const playCard = useCallback(() => {
    if (!socket || !selectedCard) return;

    const card = `${selectedCard.suit}${selectedCard.rank}`;
    const action: JudgementPlayCardAction = { actionType: 'PLAY_CARD', card };
    socket.emit('game_input', action);
    setSelectedCard(null);
  }, [socket, selectedCard]);

  return (
    <DndContext sensors={sensors}>
      <Typography.Paragraph>
        <div style={{ height: '60vh' }}>
          <JudgementTable game={game} canPlayCards={true} />
        </div>
        <Space direction="vertical" style={{ display: 'flex' }}>
          <Space direction="horizontal" size="large">
            Pile:
            {game.pile.map((value, index) => (
              <Card key={index} card={value} style={{ width: 100 }} />
            ))}
          </Space>
          <Hand
            cards={game.playerState.hand}
            onReorderCards={reorderCards}
            onClick={(card) => setSelectedCard(card)}
          />
          <Button disabled={!selectedCard} onClick={playCard}>
            Play card
          </Button>
        </Space>
      </Typography.Paragraph>
    </DndContext>
  );
};

export default JudgementGamePlaying;

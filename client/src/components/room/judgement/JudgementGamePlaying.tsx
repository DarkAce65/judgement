import { useCallback, useState } from 'react';

import { DndContext } from '@dnd-kit/core';
import { Button, Radio, Space, Typography } from 'antd';

import {
  JudgementGameState,
  JudgementOrderCardsAction,
  JudgementPlayCardAction,
} from '../../../../generated_types/judgement';
import { optimisticallyReorderCards } from '../../../data/gameSlice';
import { useAppDispatch } from '../../../data/reduxHooks';
import withGameSocket, { WithGameSocketProps } from '../../../game/withGameSocket';
import { useConfiguredSensors } from '../../../utils/useConfiguredSensors';
import Card, { CardType } from '../../game/Card';
import Hand from '../../game/Hand';

interface Props {
  game: JudgementGameState;
}

const JudgementGamePlaying = ({ game, socket }: Props & WithGameSocketProps) => {
  const dispatch = useAppDispatch();
  const sensors = useConfiguredSensors();

  const [selectedCard, setSelectedCard] = useState<CardType | null>(null);

  const reorderCards = useCallback(
    (fromIndex: number, toIndex: number) => {
      const action: JudgementOrderCardsAction = { actionType: 'ORDER_CARDS', fromIndex, toIndex };
      socket.emit('game_input', action);
      dispatch(optimisticallyReorderCards({ fromIndex, toIndex }));
    },
    [dispatch, socket]
  );

  const playCard = useCallback(() => {
    if (!selectedCard) {
      return;
    }

    const card = `${selectedCard.suit}${selectedCard.rank}`;
    const action: JudgementPlayCardAction = { actionType: 'PLAY_CARD', card };
    socket.emit('game_input', action);
    setSelectedCard(null);
  }, [socket, selectedCard]);

  return (
    <DndContext sensors={sensors}>
      <Typography.Paragraph>
        <Space direction="vertical">
          <Space direction="horizontal" size="large">
            Pile:
            {game.pile.map((value, index) => (
              <Card key={index} card={value} style={{ width: 100 }} />
            ))}
          </Space>
          <Radio.Group
            value={selectedCard}
            onChange={(evt) => {
              setSelectedCard(evt.target.value);
            }}
          >
            <Space direction="horizontal">
              <Hand
                cards={game.playerState.hand}
                onReorderCards={reorderCards}
                onSelect={(index) => setSelectedCard(game.playerState.hand[index])}
              />
            </Space>
          </Radio.Group>
          <Button disabled={!selectedCard} onClick={playCard}>
            Play card
          </Button>
        </Space>
      </Typography.Paragraph>
    </DndContext>
  );
};

export default withGameSocket(JudgementGamePlaying);

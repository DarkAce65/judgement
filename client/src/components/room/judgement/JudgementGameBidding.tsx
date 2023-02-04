import { useCallback, useState } from 'react';

import { DndContext } from '@dnd-kit/core';
import { Button, InputNumber, Space, Typography } from 'antd';

import {
  JudgementBidHandsAction,
  JudgementGameState,
  JudgementOrderCardsAction,
} from '../../../../generated_types/judgement';
import { optimisticallyReorderCards } from '../../../data/gameSlice';
import { useAppDispatch } from '../../../data/reduxHooks';
import useConnectedGameSocket from '../../../game/useConnectedGameSocket';
import useConfiguredSensors from '../../../utils/useConfiguredSensors';
import Hand from '../../game/Hand';

import JudgementTable from './JudgementTable';

interface Props {
  game: JudgementGameState;
}

const JudgementGameBidding = ({ game }: Props) => {
  const dispatch = useAppDispatch();
  const sensors = useConfiguredSensors();
  const socket = useConnectedGameSocket();

  const [bidAmount, setBidAmount] = useState<number | null>(null);

  const reorderCards = useCallback(
    (fromIndex: number, toIndex: number) => {
      if (!socket) return;

      const action: JudgementOrderCardsAction = { actionType: 'ORDER_CARDS', fromIndex, toIndex };
      socket.emit('game_input', action);
      dispatch(optimisticallyReorderCards({ fromIndex, toIndex }));
    },
    [dispatch, socket]
  );
  const bidHands = useCallback(() => {
    if (!socket || bidAmount === null) return;

    const action: JudgementBidHandsAction = { actionType: 'BID_HANDS', numHands: bidAmount };
    socket.emit('game_input', action);
    setBidAmount(null);
  }, [socket, bidAmount]);

  return (
    <DndContext sensors={sensors}>
      <Typography.Paragraph>
        <JudgementTable game={game} />
        <Space direction="vertical" style={{ display: 'flex' }}>
          <Hand cards={game.playerState.hand} onReorderCards={reorderCards} />
          <Space direction="horizontal">
            <InputNumber
              value={bidAmount || undefined}
              min={0}
              onChange={(bid) => {
                setBidAmount(bid);
              }}
              onPressEnter={bidHands}
            />
            <Button disabled={bidAmount === null} onClick={bidHands}>
              Bid hands
            </Button>
          </Space>
        </Space>
      </Typography.Paragraph>
    </DndContext>
  );
};

export default JudgementGameBidding;

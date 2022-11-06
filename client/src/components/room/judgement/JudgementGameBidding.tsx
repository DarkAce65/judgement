import { useCallback, useState } from 'react';

import { DndContext } from '@dnd-kit/core';
import { Button, InputNumber, Space, Typography } from 'antd';

import { JudgementBidHandsAction, JudgementGameState } from '../../../../generated_types/judgement';
import withGameSocket, { WithGameSocketProps } from '../../../game/withGameSocket';
import { useConfiguredSensors } from '../../../utils/useConfiguredSensors';
import Hand from '../../game/Hand';

interface Props {
  game: JudgementGameState;
}

const JudgementGameBidding = ({ game, socket }: Props & WithGameSocketProps) => {
  const sensors = useConfiguredSensors();

  const [bidAmount, setBidAmount] = useState<number | null>(null);

  const bidHands = useCallback(() => {
    if (bidAmount === null) {
      return;
    }

    const action: JudgementBidHandsAction = { actionType: 'BID_HANDS', numHands: bidAmount };
    socket.emit('game_input', action);
    setBidAmount(null);
  }, [socket, bidAmount]);

  return (
    <Typography.Paragraph>
      <Space direction="vertical" style={{ display: 'flex' }}>
        <DndContext sensors={sensors}>
          <Hand cards={game.playerState.hand} />
        </DndContext>
        <Space direction="horizontal">
          <InputNumber
            value={bidAmount || undefined}
            min={0}
            onChange={(bid) => {
              setBidAmount(bid);
            }}
          />
          <Button disabled={bidAmount === null} onClick={bidHands}>
            Bid hands
          </Button>
        </Space>
      </Space>
    </Typography.Paragraph>
  );
};

export default withGameSocket(JudgementGameBidding);

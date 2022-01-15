import { useCallback, useState } from 'react';

import { Button, InputNumber, Radio, Space, Typography } from 'antd';

import {
  JudgementBidHandsAction,
  JudgementGameState,
  JudgementPlayCardAction,
} from '../../../../generated_types/judgement';
import { getPlayerId } from '../../../data/playerSlice';
import { useAppSelector } from '../../../data/reduxHooks';
import withGameSocket, { WithGameSocketProps } from '../../../game/withGameSocket';

interface Props {
  game: JudgementGameState;
}

const JudgementGame = ({ game, socket }: Props & WithGameSocketProps) => {
  const playerId = useAppSelector(getPlayerId)!;

  const [bidAmount, setBidAmount] = useState<number | null>(null);
  const [selectedCard, setSelectedCard] = useState<string | null>(null);

  const bidHands = useCallback(() => {
    if (bidAmount === null) {
      return;
    }

    const action: JudgementBidHandsAction = { actionType: 'BID_HANDS', numHands: bidAmount };
    socket.emit('game_input', action);
    setBidAmount(null);
  }, [socket, bidAmount]);

  const playCard = useCallback(() => {
    if (!selectedCard) {
      return;
    }

    const action: JudgementPlayCardAction = { actionType: 'PLAY_CARD', card: selectedCard };
    socket.emit('game_input', action);
    setSelectedCard(null);
  }, [socket, selectedCard]);

  return (
    <>
      {game.phase === 'BIDDING' && (
        <Typography.Paragraph>
          <Space direction="vertical">
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
        </Typography.Paragraph>
      )}
      {game.phase === 'PLAYING' && (
        <Typography.Paragraph>
          <Space direction="vertical">
            <Radio.Group
              value={selectedCard}
              onChange={(evt) => {
                setSelectedCard(evt.target.value);
              }}
            >
              <Space direction="horizontal">
                {game.playerStates?.[playerId]?.hand?.map((value, index) => (
                  <Radio key={index} value={value.suit + value.rank}>
                    {value.suit + value.rank}
                  </Radio>
                ))}
              </Space>
            </Radio.Group>
            <Button disabled={!selectedCard} onClick={playCard}>
              Play card
            </Button>
          </Space>
        </Typography.Paragraph>
      )}
    </>
  );
};

export default withGameSocket(JudgementGame);

import { useCallback, useState } from 'react';

import { ArrowDownOutlined, ArrowUpOutlined } from '@ant-design/icons';
import { DndContext } from '@dnd-kit/core';
import { Button, Col, Grid, Row, Space } from 'antd';

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
  const breakpoints = Grid.useBreakpoint();

  const [bidAmount, setBidAmount] = useState(0);

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
    if (!socket) return;

    const action: JudgementBidHandsAction = { actionType: 'BID_HANDS', numHands: bidAmount };
    socket.emit('game_input', action);
  }, [socket, bidAmount]);

  return (
    <DndContext sensors={sensors}>
      <div style={{ maxWidth: 1000, margin: 'auto' }}>
        <Row>
          <Col xs={20} style={{ maxHeight: '60vh' }}>
            <JudgementTable game={game} />
          </Col>
          <Col
            xs={{ span: 4 }}
            style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}
          >
            <Space direction="vertical" size="large">
              <div>
                <Button
                  icon={<ArrowUpOutlined />}
                  block={true}
                  disabled={bidAmount >= game.playerState.hand.length}
                  onClick={() => {
                    setBidAmount((amt) => amt + 1);
                  }}
                />
                <div style={{ fontSize: breakpoints.sm ? '3rem' : '2rem', textAlign: 'center' }}>
                  {bidAmount}
                </div>
                <Button
                  icon={<ArrowDownOutlined />}
                  block={true}
                  disabled={bidAmount <= 0}
                  onClick={() => {
                    setBidAmount((amt) => amt - 1);
                  }}
                />
              </div>
              <Button type="primary" block={true} disabled={bidAmount === null} onClick={bidHands}>
                Bid hands
              </Button>
            </Space>
          </Col>
        </Row>
      </div>

      <Hand cards={game.playerState.hand} onReorderCards={reorderCards} />
    </DndContext>
  );
};

export default JudgementGameBidding;

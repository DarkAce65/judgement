import { useCallback, useEffect, useState } from 'react';

import { Button, InputNumber, PageHeader, Radio, Select, Space, Typography, message } from 'antd';
import { useNavigate } from 'react-router-dom';

import {
  JudgementBidHandsAction,
  JudgementPlayCardAction,
} from '../../../generated_types/judgement';
import {
  GameErrorMessage,
  GameName,
  GameStateMessage,
  PlayersMessage,
  RoomMessage,
  SetGameMessage,
} from '../../../generated_types/websocket';
import { getGame, loadGameState } from '../../data/gameSlice';
import { getPlayerId } from '../../data/playerSlice';
import { useAppDispatch, useAppSelector } from '../../data/reduxHooks';
import { getGameName, getPlayers, loadPlayers, loadRoomState } from '../../data/roomSlice';
import GameSocket from '../../game/GameSocket';
import withGameSocket, { WithGameSocketProps } from '../../game/withGameSocket';
import PlayerNameInput from '../PlayerNameInput';
import requirePlayerName from '../requirePlayerName';

import LeaveRoomButton from './LeaveRoomButton';

interface Props {
  roomId: string;
}

const Room = ({ roomId, socket, namespace }: Props & WithGameSocketProps) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const playerId = useAppSelector(getPlayerId)!;
  const gameName = useAppSelector(getGameName);
  const players = useAppSelector(getPlayers);
  const game = useAppSelector(getGame);

  useEffect(() => {
    socket.emit('join_room', roomId);
    GameSocket.onReconnect(namespace, () => {
      socket.emit('join_room', roomId);
    });
  }, [socket, namespace, roomId]);

  useEffect(() => {
    GameSocket.onNamespaced(namespace, 'room', (roomMessage: RoomMessage) => {
      dispatch(loadRoomState(roomMessage));
    });
    GameSocket.onNamespaced(namespace, 'players', (playersMessage: PlayersMessage) => {
      dispatch(loadPlayers(playersMessage));
    });
    GameSocket.onNamespaced(namespace, 'game_state', (gameStateMessage: GameStateMessage) => {
      dispatch(loadGameState(gameStateMessage));
    });
    GameSocket.onNamespaced(namespace, 'invalid_input', (error: GameErrorMessage) => {
      message.error(error.errorMessage);
    });
  }, [dispatch, namespace]);

  const [bidAmount, setBidAmount] = useState<number | null>(null);
  const [selectedCard, setSelectedCard] = useState<string | null>(null);

  const handleGameChange = useCallback(
    (name: GameName) => {
      const setGameMessage: SetGameMessage = { gameName: name };
      socket.emit('set_game', setGameMessage);
    },
    [socket]
  );

  const handleGameInit = useCallback(() => {
    socket.emit('confirm_game');
  }, [socket]);

  const handleGameStart = useCallback(() => {
    socket.emit('start_game');
  }, [socket]);

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
    <PageHeader
      title={`hello ${roomId}`}
      onBack={() => {
        navigate('/');
      }}
    >
      <Select<GameName>
        value={gameName}
        options={[{ label: 'Judgement', value: 'JUDGEMENT' }]}
        onChange={handleGameChange}
        style={{ width: '100%', maxWidth: 250 }}
      />
      <Typography.Paragraph>{playerId}</Typography.Paragraph>
      {players.map((player, index) => (
        <Typography.Paragraph key={index}>{player}</Typography.Paragraph>
      ))}
      <Typography.Paragraph>
        <Space direction="horizontal">
          <Button onClick={handleGameInit}>Init game</Button>
          <Button onClick={handleGameStart}>Start game</Button>
        </Space>
      </Typography.Paragraph>
      {game && game.phase === 'BIDDING' && (
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
      {game && game.phase === 'PLAYING' && (
        <Typography.Paragraph>
          <Space direction="vertical">
            <Radio.Group
              value={selectedCard}
              onChange={(evt) => {
                setSelectedCard(evt.target.value);
              }}
            >
              <Space direction="horizontal">
                {game?.playerStates?.[playerId]?.hand?.map((value, index) => (
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
      <Typography.Paragraph>
        <Space direction="vertical" style={{ width: '100%' }}>
          <PlayerNameInput />
          <LeaveRoomButton roomId={roomId} />
        </Space>
      </Typography.Paragraph>
      <Typography.Paragraph style={{ fontSize: '0.7em' }}>
        <pre>{JSON.stringify(game, null, 2)}</pre>
      </Typography.Paragraph>
    </PageHeader>
  );
};

export default requirePlayerName(withGameSocket(Room));

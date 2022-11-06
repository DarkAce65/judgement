import { useCallback, useEffect, useMemo } from 'react';

import { Button, PageHeader, Select, Space, Typography, message } from 'antd';
import { useNavigate } from 'react-router-dom';

import {
  GameErrorMessage,
  GameName,
  GameStateMessage,
  PlayersMessage,
  RoomMessage,
  SetGameMessage,
} from '../../../generated_types/websocket';
import { getGame, loadGameState } from '../../data/gameSlice';
import { getPlayerId, loadPlayers } from '../../data/playerSlice';
import { useAppDispatch, useAppSelector } from '../../data/reduxHooks';
import { getGameName, getOrderedPlayerNames, loadRoomState } from '../../data/roomSlice';
import GameSocket, { Listener } from '../../game/GameSocket';
import withGameSocket, { WithGameSocketProps } from '../../game/withGameSocket';
import PlayerNameInput from '../PlayerNameInput';
import requirePlayerName from '../requirePlayerName';

import LeaveRoomButton from './LeaveRoomButton';
import JudgementContainer from './judgement/JudgementContainer';

interface Props {
  roomId: string;
}

const Room = ({ roomId, socket, namespace }: Props & WithGameSocketProps) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const playerId = useAppSelector(getPlayerId)!;
  const gameName = useAppSelector(getGameName);
  const playerNames = useAppSelector(getOrderedPlayerNames);
  const game = useAppSelector(getGame);

  useEffect(() => {
    socket.emit('join_room', roomId);
    GameSocket.onReconnect(namespace, () => {
      socket.emit('join_room', roomId);
    });
  }, [socket, namespace, roomId]);

  useEffect(() => {
    const listeners: { [event: string]: Listener } = {
      ['room']: (roomMessage: RoomMessage) => {
        dispatch(loadRoomState(roomMessage));
      },
      ['players']: (playersMessage: PlayersMessage) => {
        dispatch(loadPlayers(playersMessage));
      },
      ['game_state']: (gameStateMessage: GameStateMessage) => {
        dispatch(loadGameState(gameStateMessage));
      },
      ['invalid_input']: (error: GameErrorMessage) => {
        message.error(error.errorMessage);
      },
    };
    for (const [event, listener] of Object.entries(listeners)) {
      GameSocket.onNamespaced(namespace, event, listener);
    }

    return () => {
      for (const [event, listener] of Object.entries(listeners)) {
        GameSocket.offNamespaced(namespace, event, listener);
      }
    };
  }, [dispatch, namespace]);

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

  const renderedGame = useMemo(() => {
    if (!game) {
      return null;
    }

    switch (game.gameName) {
      case 'JUDGEMENT':
        return <JudgementContainer game={game} />;
      default:
        return null;
    }
  }, [game]);

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
      {playerNames.map((playerName, index) => (
        <Typography.Paragraph key={index}>{playerName}</Typography.Paragraph>
      ))}
      {!game && (
        <Typography.Paragraph>
          <Button onClick={handleGameInit}>Init game</Button>
        </Typography.Paragraph>
      )}
      {game && game.status === 'NOT_STARTED' && (
        <Typography.Paragraph>
          <Button onClick={handleGameStart}>Start game</Button>
        </Typography.Paragraph>
      )}
      {renderedGame}
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

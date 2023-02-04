import { useCallback } from 'react';

import { PageHeader } from '@ant-design/pro-layout';
import { Button, Select, Space, Typography, message } from 'antd';
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
import { loadPlayers } from '../../data/playerSlice';
import { useAppDispatch, useAppSelector } from '../../data/reduxHooks';
import {
  getGameName,
  getOrderedPlayerNames,
  loadRoomState,
  resetRoomState,
} from '../../data/roomSlice';
import GameSocket from '../../game/GameSocket';
import useConnectedGameSocket from '../../game/useConnectedGameSocket';
import PlayerNameInput from '../PlayerNameInput';
import ensurePlayerWithCookie from '../ensurePlayerWithCookie';

import DebugGameState from './DebugGameState';
import LeaveRoomButton from './LeaveRoomButton';
import RoomSettingsWrapper from './RoomSettingsWrapper';
import JudgementContainer from './judgement/JudgementContainer';

interface Props {
  roomId: string;
}

const Room = ({ roomId }: Props) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const socket = useConnectedGameSocket(({ socket, namespace }) => {
    socket.emit('join_room', roomId);
    GameSocket.onReconnect(namespace, () => {
      socket.emit('join_room', roomId);
    });
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
  });

  const gameName = useAppSelector(getGameName);
  const playerNames = useAppSelector(getOrderedPlayerNames);
  const game = useAppSelector(getGame);

  const handleGameChange = useCallback(
    (name: GameName) => {
      const setGameMessage: SetGameMessage = { gameName: name };
      socket?.emit('set_game', setGameMessage);
    },
    [socket]
  );

  const handleGameInit = useCallback(() => {
    socket?.emit('confirm_game');
  }, [socket]);

  const handleGameStart = useCallback(() => {
    socket?.emit('start_game');
  }, [socket]);

  if (game) {
    switch (game.gameName) {
      case 'JUDGEMENT':
        return (
          <RoomSettingsWrapper roomId={roomId}>
            {game.status === 'NOT_STARTED' && (
              <Typography.Paragraph>
                <Button onClick={handleGameStart}>Start game</Button>
              </Typography.Paragraph>
            )}
            <JudgementContainer game={game} />
          </RoomSettingsWrapper>
        );
      default:
        return null;
    }
  }

  return (
    <PageHeader
      title={`hello ${roomId}`}
      onBack={() => {
        navigate('/');
        dispatch(resetRoomState());
      }}
    >
      <Select<GameName>
        value={gameName}
        options={[{ label: 'Judgement', value: 'JUDGEMENT' }]}
        onChange={handleGameChange}
        style={{ width: '100%', maxWidth: 250 }}
      />
      {playerNames.map((playerName, index) => (
        <Typography.Paragraph key={index}>{playerName}</Typography.Paragraph>
      ))}
      <Typography.Paragraph>
        <Button onClick={handleGameInit}>Init game</Button>
      </Typography.Paragraph>
      <Typography.Paragraph>
        <Space direction="vertical" style={{ width: '100%' }}>
          <PlayerNameInput />
          <LeaveRoomButton roomId={roomId} />
        </Space>
      </Typography.Paragraph>
      <DebugGameState />
    </PageHeader>
  );
};

export default ensurePlayerWithCookie(Room);

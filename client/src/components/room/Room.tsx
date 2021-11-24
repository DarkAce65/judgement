import { useCallback, useEffect, useState } from 'react';

import { Button, PageHeader, Radio, Select, Space, Typography, message } from 'antd';
import { useHistory } from 'react-router-dom';

import { JudgementPlayCardAction } from '../../../generated_types/judgement';
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
  const history = useHistory();

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

  const handleGameChange = useCallback(
    (name: GameName) => {
      const setGameMessage: SetGameMessage = { gameName: name };
      socket.emit('set_game', setGameMessage);
    },
    [socket]
  );

  const handleGameStart = useCallback(() => {
    socket.emit('start_game');
  }, [socket]);

  const [selectedCard, setSelectedCard] = useState<string | null>(null);

  const ping = useCallback(() => {
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
        history.push('/');
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
        <Button onClick={handleGameStart}>Start game</Button>
      </Typography.Paragraph>
      {game && (
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
            <Button disabled={!selectedCard} onClick={ping}>
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

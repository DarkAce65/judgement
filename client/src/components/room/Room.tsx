import { useCallback, useEffect, useState } from 'react';

import { PageHeader, Select, Space, Typography } from 'antd';
import Cookies from 'js-cookie';
import { useHistory } from 'react-router-dom';

import { GameName } from '../../../generated_types/judgement';
import { PlayersMessage, SetGameMessage } from '../../../generated_types/websocket';
import { PLAYER_ID_COOKIE } from '../../constants';
import GameSocket from '../../game/GameSocket';
import useGameSocket from '../../game/useGameSocket';
import PlayerNameInput from '../PlayerNameInput';
import withPlayerName from '../SetPlayerNamePage';

import LeaveRoomButton from './LeaveRoomButton';

interface Props {
  roomId: string;
}

const Room = ({ roomId }: Props) => {
  const history = useHistory();

  const [players, setPlayers] = useState<string[]>([]);
  const { socket, namespace } = useGameSocket();

  useEffect(() => {
    if (socket === null) {
      return;
    }

    socket.emit('join_room', roomId);
  }, [roomId, socket]);

  useEffect(() => {
    if (namespace === null) {
      return;
    }

    GameSocket.onNamespaced(namespace, 'players', (data: PlayersMessage) => {
      setPlayers(data.players);
    });
  }, [namespace]);

  const onGameSelectChange = useCallback(
    (gameName: GameName) => {
      if (socket === null) {
        return;
      }

      const setGameMessage: SetGameMessage = { gameName };
      socket.emit('set_game', setGameMessage);
    },
    [socket]
  );

  return (
    <PageHeader
      title={`hello ${roomId}`}
      onBack={() => {
        history.push('/');
      }}
    >
      <Select<GameName>
        options={[{ label: 'Judgement', value: 'JUDGEMENT' }]}
        onChange={onGameSelectChange}
        style={{ width: '100%', maxWidth: 250 }}
      />
      <Typography.Paragraph>{Cookies.get(PLAYER_ID_COOKIE)}</Typography.Paragraph>
      {players.map((player, index) => (
        <Typography.Paragraph key={index}>{player}</Typography.Paragraph>
      ))}
      <Space direction="vertical" style={{ width: '100%' }}>
        <PlayerNameInput />
        <LeaveRoomButton roomId={roomId} />
      </Space>
    </PageHeader>
  );
};

export default withPlayerName(Room);

import { useEffect, useState } from 'react';

import { PageHeader, Typography } from 'antd';
import { useHistory } from 'react-router-dom';

import { PlayersMessage } from '../../../generated_types/websocket';
import GameSocket from '../../game/GameSocket';
import useGameSocket from '../../game/useGameSocket';
import getCookie from '../../utils/getCookie';
import PlayerNameInput from '../PlayerNameInput';

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

  return (
    <PageHeader
      title={`hello ${roomId}`}
      onBack={() => {
        history.push('/');
      }}
    >
      <Typography.Paragraph>{getCookie('player_id')}</Typography.Paragraph>
      {players.map((player, index) => (
        <Typography.Paragraph key={index}>{player}</Typography.Paragraph>
      ))}
      <PlayerNameInput />
    </PageHeader>
  );
};

export default Room;

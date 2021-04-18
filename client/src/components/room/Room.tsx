import { useState } from 'react';

import { PageHeader, Typography } from 'antd';
import { useHistory } from 'react-router-dom';

import { PlayersMessage } from '../../../generated_types/websocket';
import GameSocket from '../../game/GameSocket';
import getCookie from '../../utils/getCookie';
import useMountEffect from '../../utils/useMountEffect';
import PlayerNameInput from '../PlayerNameInput';

interface Props {
  roomId: string;
}

const Room = ({ roomId }: Props) => {
  const history = useHistory();

  const [players, setPlayers] = useState<string[]>([]);

  useMountEffect(() => {
    const socket = GameSocket.connect();

    socket.emit('join_room', roomId);

    GameSocket.onNamespaced(Room.name, 'players', (data: PlayersMessage) => {
      setPlayers(data.players);
    });

    return () => {
      GameSocket.offAllNamespaced(Room.name);
    };
  });

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

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
    const { socket, namespace } = GameSocket.attach();

    socket.emit('join_room', roomId);

    GameSocket.onNamespaced(namespace, 'players', (data: PlayersMessage) => {
      setPlayers(data.players);
    });

    return () => {
      GameSocket.detach(namespace);
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

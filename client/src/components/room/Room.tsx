import { PageHeader, Typography } from 'antd';
import { useHistory, useParams } from 'react-router-dom';

import GameSocket from '../../game/GameSocket';
import getCookie from '../../utils/getCookie';
import useMountEffect from '../../utils/useMountEffect';
import PlayerNameInput from '../PlayerNameInput';

const Room = () => {
  const history = useHistory();
  const { roomId } = useParams<{ roomId: string }>();

  useMountEffect(() => {
    const socket = GameSocket.connect();

    socket.emit('join_room', roomId);

    GameSocket.onNamespaced(Room.name, 'players', (...args: unknown[]) => {
      console.log(...args);
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
      <PlayerNameInput />
    </PageHeader>
  );
};

export default Room;

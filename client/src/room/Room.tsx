import { Layout, PageHeader, Typography } from 'antd';
import { useHistory, useParams } from 'react-router-dom';

import PlayerNameInput from '../PlayerNameInput';
import GameSocket from '../game/GameSocket';
import getCookie from '../utils/getCookie';
import useMountEffect from '../utils/useMountEffect';

const Room = () => {
  const history = useHistory();
  const { roomId } = useParams<{ roomId: string }>();

  useMountEffect(() => {
    const socket = GameSocket.connect();

    socket.emit('join_room', roomId);

    GameSocket.onNamespaced(Room.name, 'room_players', (...args: unknown[]) => {
      console.log(...args);
    });

    return () => {
      GameSocket.offAllNamespaced(Room.name);
    };
  });

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Layout.Content>
        <PageHeader
          title={`hello ${roomId}`}
          onBack={() => {
            history.push('/');
          }}
        >
          <Typography.Paragraph>{getCookie('player_id')}</Typography.Paragraph>
          <PlayerNameInput />
        </PageHeader>
      </Layout.Content>
    </Layout>
  );
};

export default Room;

import { Layout, PageHeader } from 'antd';
import { useHistory, useParams } from 'react-router-dom';

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
    <Layout>
      <Layout.Content>
        <PageHeader
          title={`hello ${roomId}`}
          onBack={() => {
            history.push('/');
          }}
        >
          <p style={{ margin: 0 }}>{getCookie('player_id')}</p>
        </PageHeader>
      </Layout.Content>
    </Layout>
  );
};

export default Room;

import { Layout, PageHeader } from 'antd';
import { useHistory, useParams } from 'react-router-dom';

import GameSocket from '../game/GameSocket';
import getCookie from '../utils/getCookie';
import useMountEffect from '../utils/useMountEffect';

const Lobby = () => {
  const history = useHistory();
  const { roomId } = useParams<{ roomId: string }>();

  useMountEffect(() => {
    const socket = GameSocket.connect();

    socket.emit('join_room', roomId);

    GameSocket.onNamespaced(Lobby.name, 'lobby_players', (...args: unknown[]) => {
      console.log(...args);
    });

    return () => {
      GameSocket.offAllNamespaced(Lobby.name);
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

export default Lobby;

import { useCallback } from 'react';

import { Layout } from 'antd';
import { RouteComponentProps } from 'react-router-dom';

import CreateLobbyButton from './CreateLobbyButton';
import PlayerNameInput from './PlayerNameInput';

interface Props extends RouteComponentProps {}

const Home = ({ history }: Props) => {
  const handleLobbyCreate = useCallback(
    (roomId: string) => {
      history.push(`/lobby/${roomId}`);
    },
    [history]
  );

  return (
    <Layout>
      <Layout.Content style={{ padding: 24 }}>
        <PlayerNameInput />
        <CreateLobbyButton onCreate={handleLobbyCreate} />
      </Layout.Content>
    </Layout>
  );
};

export default Home;

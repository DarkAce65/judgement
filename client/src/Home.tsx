import { useCallback } from 'react';

import { Layout, PageHeader } from 'antd';
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
      <Layout.Content>
        <PageHeader title="Home">
          <PlayerNameInput />
          <CreateLobbyButton onCreate={handleLobbyCreate} />
        </PageHeader>
      </Layout.Content>
    </Layout>
  );
};

export default Home;

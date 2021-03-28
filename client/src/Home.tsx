import { useCallback } from 'react';

import { Layout, PageHeader } from 'antd';
import { RouteComponentProps } from 'react-router-dom';

import CreateRoomButton from './CreateRoomButton';
import PlayerNameInput from './PlayerNameInput';

interface Props extends RouteComponentProps {}

const Home = ({ history }: Props) => {
  const handleRoomCreate = useCallback(
    (roomId: string) => {
      history.push(`/room/${roomId}`);
    },
    [history]
  );

  return (
    <Layout>
      <Layout.Content>
        <PageHeader title="Home">
          <PlayerNameInput />
          <CreateRoomButton onCreate={handleRoomCreate} />
        </PageHeader>
      </Layout.Content>
    </Layout>
  );
};

export default Home;

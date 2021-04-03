import { useCallback } from 'react';

import { Divider, PageHeader } from 'antd';
import { RouteComponentProps } from 'react-router-dom';
import styled from 'styled-components';

import CreateRoomButton from './CreateRoomButton';
import JoinRoomInput from './JoinRoomInput';

const CenteredBlock = styled.div`
  width: 50%;
  min-width: 400px;
  margin: 0 auto;
  text-align: center;
`;

interface Props extends RouteComponentProps {}

const Home = ({ history }: Props) => {
  const navigateToRoom = useCallback(
    (roomId: string) => {
      history.push(`/room/${roomId}`);
    },
    [history]
  );

  return (
    <PageHeader title="Home">
      <CenteredBlock>
        <CreateRoomButton onCreate={navigateToRoom} />
        <Divider style={{ textTransform: 'lowercase', fontVariant: 'small-caps' }}>Or</Divider>
        <JoinRoomInput onJoin={navigateToRoom} />
      </CenteredBlock>
    </PageHeader>
  );
};

export default Home;

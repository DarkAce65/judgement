import { Divider, PageHeader } from 'antd';
import styled from 'styled-components';

import CreateRoomButton from './CreateRoomButton';
import JoinRoomInput from './JoinRoomInput';

const CenteredBlock = styled.div`
  max-width: 400px;
  margin: 0 auto;
  text-align: center;
`;

const Home = () => (
  <PageHeader title="Home">
    <CenteredBlock>
      <CreateRoomButton />
      <Divider style={{ textTransform: 'lowercase', fontVariant: 'small-caps' }}>Or</Divider>
      <JoinRoomInput />
    </CenteredBlock>
  </PageHeader>
);

export default Home;

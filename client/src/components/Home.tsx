import { Divider } from 'antd';
import styled from 'styled-components';

import CreateRoomButton from './CreateRoomButton';
import JoinRoomInput from './JoinRoomInput';
import PageLayout from './PageLayout';

const CenteredBlock = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  margin: 0 auto;

  &::before,
  &::after {
    content: '';
    flex-grow: 1;
  }

  &::after {
    flex-grow: 2;
  }
`;

const Home = () => (
  <PageLayout>
    <CenteredBlock style={{ height: '100vh', maxWidth: 400, textAlign: 'center' }}>
      <div>
        <CreateRoomButton buttonProps={{ block: true }} />
        <Divider style={{ textTransform: 'lowercase', fontVariant: 'small-caps' }}>Or</Divider>
        <JoinRoomInput />
      </div>
    </CenteredBlock>
  </PageLayout>
);

export default Home;

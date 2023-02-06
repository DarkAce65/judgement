import { Divider } from 'antd';
import styled from 'styled-components';

import CreateRoomButton from './CreateRoomButton';
import JoinRoomInput from './JoinRoomInput';

const CenteredBlock = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  max-width: 400px;
  margin: 0 auto;
  text-align: center;

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
  <CenteredBlock>
    <div>
      <CreateRoomButton buttonProps={{ block: true }} />
      <Divider style={{ textTransform: 'lowercase', fontVariant: 'small-caps' }}>Or</Divider>
      <JoinRoomInput />
    </div>
  </CenteredBlock>
);

export default Home;

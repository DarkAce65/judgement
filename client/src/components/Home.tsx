import { Divider, Dropdown, Select, Space } from 'antd';
import styled from 'styled-components';

import CreateGameButton from './CreateGameButton';
import JoinGameInput from './JoinGameInput';
import PageLayout from './PageLayout';
import { GameName } from '../../generated_types/api';
import { useState } from 'react';

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

function Home() {
  return (
    <PageLayout>
      <CenteredBlock style={{ height: '100vh', maxWidth: 400 }}>
        <div>
          <CreateGameButton />
          <Divider style={{ textTransform: 'lowercase', fontVariant: 'small-caps' }}>Or</Divider>
          <JoinGameInput />
        </div>
      </CenteredBlock>
    </PageLayout>
  );
}

export default Home;

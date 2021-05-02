import { ComponentType } from 'react';

import { PageHeader } from 'antd';
import { useSelector } from 'react-redux';
import styled from 'styled-components';

import { getPlayerName } from '../data/playerSlice';

import PlayerNameInput from './PlayerNameInput';

const CenteredBlock = styled.div`
  width: 50%;
  min-width: 400px;
  margin: 0 auto;
  text-align: center;
`;

const SetPlayerNamePage = () => {
  return (
    <PageHeader>
      <CenteredBlock>
        <PlayerNameInput />
      </CenteredBlock>
    </PageHeader>
  );
};

const withPlayerName = <P,>(WrappedComponent: ComponentType<P>) => {
  const WithPlayerName = (props: P) => {
    const playerName = useSelector(getPlayerName);

    if (!playerName) {
      return <SetPlayerNamePage />;
    }

    return <WrappedComponent {...props} />;
  };

  return WithPlayerName;
};

export default withPlayerName;

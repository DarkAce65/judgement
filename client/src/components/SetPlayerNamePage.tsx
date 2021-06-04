import { ComponentType, useState } from 'react';

import { PageHeader } from 'antd';
import Cookies from 'js-cookie';
import { useSelector } from 'react-redux';
import styled from 'styled-components';

import { PLAYER_ID_COOKIE } from '../constants';
import { ensurePlayer, getEnsurePlayerFetchStatus, getPlayerName } from '../data/playerSlice';
import { useAppDispatch } from '../data/reduxHooks';

import ErrorPage from './ErrorPage';
import LoadingPage from './LoadingPage';
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
    const dispatch = useAppDispatch();

    const playerName = useSelector(getPlayerName);
    const [renewingCookie, setRenewingCookie] = useState(false);
    const ensurePlayerFetchStatus = useSelector(getEnsurePlayerFetchStatus);

    if (!playerName) {
      return <SetPlayerNamePage />;
    }

    if (!renewingCookie && !Cookies.get(PLAYER_ID_COOKIE)) {
      setRenewingCookie(true);
      dispatch(ensurePlayer(playerName));
    }

    if (renewingCookie) {
      if (ensurePlayerFetchStatus === 'uninitialized' || ensurePlayerFetchStatus === 'pending') {
        return <LoadingPage />;
      } else if (ensurePlayerFetchStatus === 'failed') {
        return <ErrorPage />;
      }
    }

    return <WrappedComponent {...props} />;
  };

  return WithPlayerName;
};

export default withPlayerName;

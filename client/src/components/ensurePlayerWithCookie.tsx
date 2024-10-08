import { ComponentType, useRef } from 'react';

import Cookies from 'js-cookie';
import { useSelector } from 'react-redux';

import { PLAYER_AUTH_ID_COOKIE } from '../constants';
import { ensurePlayer, getEnsurePlayerFetchStatus, getPlayerName } from '../data/playerSlice';
import { useAppDispatch } from '../data/reduxHooks';

import ErrorPage from './ErrorPage';
import LoadingPage from './LoadingPage';
import PageLayout from './PageLayout';
import PlayerNameModal from './PlayerNameModal';
import usePlayerName from '../data/usePlayerName';

function ensurePlayerWithCookie<P extends object>(WrappedComponent: ComponentType<P>) {
  function EnsurePlayerCookie(props: P) {
    const dispatch = useAppDispatch();

    const [playerName, setPlayerName] = usePlayerName();
    const isRenewingCookie = useRef(false);
    const ensurePlayerFetchStatus = useSelector(getEnsurePlayerFetchStatus);

    if (!playerName) {
      return (
        <PageLayout>
          <PlayerNameModal open={true} />
        </PageLayout>
      );
    }

    if (!isRenewingCookie.current && !Cookies.get(PLAYER_AUTH_ID_COOKIE)) {
      isRenewingCookie.current = true;
      setTimeout(() => {
        dispatch(ensurePlayer(playerName));
      }, 0);
    }

    if (isRenewingCookie.current) {
      if (ensurePlayerFetchStatus === 'uninitialized' || ensurePlayerFetchStatus === 'pending') {
        return <LoadingPage />;
      } else if (ensurePlayerFetchStatus === 'failed') {
        return <ErrorPage />;
      }
    }

    return <WrappedComponent {...props} />;
  }

  return EnsurePlayerCookie;
}

export default ensurePlayerWithCookie;

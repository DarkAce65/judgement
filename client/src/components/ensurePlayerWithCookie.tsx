import { ComponentType, useCallback, useRef, useState } from 'react';

import { PageHeader } from '@ant-design/pro-layout';
import Cookies from 'js-cookie';
import { useSelector } from 'react-redux';
import styled from 'styled-components';

import { PLAYER_ID_COOKIE } from '../constants';
import { ensurePlayer, getEnsurePlayerFetchStatus, getPlayerName } from '../data/playerSlice';
import { useAppDispatch } from '../data/reduxHooks';
import useIsMounted from '../utils/useIsMounted';

import ErrorPage from './ErrorPage';
import LoadingPage from './LoadingPage';
import PlayerNameInput, { PlayerNameModal } from './PlayerNameInput';

const CenteredBlock = styled.div`
  width: 50%;
  min-width: 400px;
  margin: 0 auto;
  text-align: center;
`;

const ensurePlayerWithCookie = <P extends object>(WrappedComponent: ComponentType<P>) => {
  const EnsurePlayerCookie = (props: P) => {
    const dispatch = useAppDispatch();

    const playerName = useSelector(getPlayerName);
    const isRenewingCookie = useRef(false);
    const ensurePlayerFetchStatus = useSelector(getEnsurePlayerFetchStatus);

    if (!playerName) {
      return (
        <PageHeader>
          <CenteredBlock>
            <PlayerNameInput />
          </CenteredBlock>
        </PageHeader>
      );
    }

    if (!isRenewingCookie.current && !Cookies.get(PLAYER_ID_COOKIE)) {
      isRenewingCookie.current = true;
      dispatch(ensurePlayer(playerName));
    }

    if (isRenewingCookie.current) {
      if (ensurePlayerFetchStatus === 'uninitialized' || ensurePlayerFetchStatus === 'pending') {
        return <LoadingPage />;
      } else if (ensurePlayerFetchStatus === 'failed') {
        return <ErrorPage />;
      }
    }

    return <WrappedComponent {...props} />;
  };

  return EnsurePlayerCookie;
};

export interface WithRequirePlayerNameProps {
  requirePlayerName: () => Promise<void>;
}

export const withRequirePlayerName = <P extends object>(
  WrappedComponent: ComponentType<P & WithRequirePlayerNameProps>
) => {
  const RequirePlayerName = (props: P) => {
    const isMounted = useIsMounted();
    const playerName = useSelector(getPlayerName);

    const [promiseHandlers, setPromiseHandlers] = useState<{
      resolve: () => void;
      reject: () => void;
    } | null>(null);

    const requirePlayerName = useCallback(() => {
      if (playerName) {
        return Promise.resolve();
      }

      const promise = new Promise<void>((resolve, reject) => {
        if (isMounted.current) {
          setPromiseHandlers({ resolve, reject });
        }
      });

      return promise;
    }, [isMounted, playerName]);

    return (
      <>
        <PlayerNameModal
          open={promiseHandlers !== null}
          onOk={() => {
            promiseHandlers?.resolve();
            setPromiseHandlers(null);
          }}
          onCancel={() => {
            promiseHandlers?.reject();
            setPromiseHandlers(null);
          }}
        />
        <WrappedComponent {...props} requirePlayerName={requirePlayerName} />
      </>
    );
  };

  return RequirePlayerName;
};

export default ensurePlayerWithCookie;

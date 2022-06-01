import React from 'react';
import ReactDOM from 'react-dom/client';

import { unwrapResult } from '@reduxjs/toolkit';
import { Button, message } from 'antd';

import App from './components/App';
import { ensurePlayer, getPlayerName } from './data/playerSlice';
import store from './data/store';
import GameSocket, { isConnectionError } from './game/GameSocket';

import 'antd/dist/antd.less';

const initializeGameSocket = () => {
  let socketRetries = 0;
  GameSocket.initializeSocket(
    (socket, error) => {
      if (socketRetries < 3 && isConnectionError(error)) {
        const { dispatch, getState } = store;
        const playerName = getPlayerName(getState());

        dispatch(ensurePlayer(playerName!))
          .then(unwrapResult)
          .then(() => {
            socket.connect();
            socketRetries++;
          })
          .catch();
      } else {
        const errorMessage = (
          <>
            <span>Error connecting to server</span>
            <Button
              type="link"
              onClick={() => {
                socket.connect();
              }}
            >
              Retry
            </Button>
          </>
        );
        socket.disconnect();
        message.error({ key: 'socketError', content: errorMessage, duration: 0 });
      }
    },
    () => {
      socketRetries = 0;
      message.destroy('socketError');
    }
  );
};

const render = () => {
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
};

initializeGameSocket();
render();

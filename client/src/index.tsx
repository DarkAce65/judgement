import React from 'react';
import ReactDOM from 'react-dom';

import { unwrapResult } from '@reduxjs/toolkit';
import { Button, message } from 'antd';
import { Provider } from 'react-redux';
import { Socket } from 'socket.io-client';

import App from './components/App';
import { ensurePlayer, getPlayerName } from './data/playerSlice';
import store from './data/store';
import GameSocket, { isConnectionError } from './game/GameSocket';

import './index.less';

const makeErrorMessage = (socket: Socket) => (
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
        socket.disconnect();
        message.error({
          key: 'socketError',
          content: makeErrorMessage(socket),
          duration: 0,
        });
      }
    },
    () => {
      socketRetries = 0;
      message.destroy('socketError');
    }
  );
};

const render = () => {
  ReactDOM.render(
    <React.StrictMode>
      <Provider store={store}>
        <App />
      </Provider>
    </React.StrictMode>,
    document.getElementById('root')
  );
};

initializeGameSocket();
render();

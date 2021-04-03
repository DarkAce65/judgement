import React from 'react';
import ReactDOM from 'react-dom';

import { unwrapResult } from '@reduxjs/toolkit';
import { Button, message } from 'antd';
import { Provider } from 'react-redux';

import App from './components/App';
import { getPlayerName, setPlayerName } from './data/playerSlice';
import store from './data/store';
import GameSocket from './game/GameSocket';

import './index.less';

const initializeGameSocket = () => {
  const { dispatch, getState } = store;
  const playerName = getPlayerName(getState());

  const errorMessage = (
    <>
      <span>Error connecting to server</span>
      <Button
        type="link"
        onClick={() => {
          GameSocket.connect();
        }}
      >
        Retry
      </Button>
    </>
  );

  let socketRetries = 0;
  GameSocket.initializeSocket(
    (error, socket) => {
      if (socketRetries < 3 && error.message === 'unknown_player_id') {
        dispatch(setPlayerName(playerName || ''))
          .then(unwrapResult)
          .then(() => {
            socket.connect();
            socketRetries++;
          })
          .catch();
      } else {
        GameSocket.disconnect();
        message.error({
          content: errorMessage,
          duration: 0,
          key: 'socketError',
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

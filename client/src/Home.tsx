import React, { PureComponent } from 'react';

import { RouteComponentProps } from 'react-router-dom';
import { Socket } from 'socket.io-client';
import styled from 'styled-components';

import { buildRequestPath, buildSocket, fetchAPI } from './api/client';
import logo from './logo.svg';

import './Home.css';

const Logs = styled.div`
  position: fixed;
  top: 10px;
  right: 10px;
  font-size: 12px;
  text-align: right;
  pointer-events: none;
`;

interface Props extends RouteComponentProps {}

interface State {
  socket: Socket | null;
  logs: string[];
}

class Home extends PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      socket: null,
      logs: [],
    };

    this.initSocket = this.initSocket.bind(this);
    this.sendMessage = this.sendMessage.bind(this);
    this.disconnect = this.disconnect.bind(this);
  }

  initSocket() {
    if (this.state.socket !== null) {
      return;
    }

    const socket = buildSocket();

    socket.onAny((event: string, data: string | { data: string }) => {
      if (typeof data === 'object' && Object.prototype.hasOwnProperty.call(data, 'data')) {
        data = data.data;
      }

      console.log({ event, data });

      if (typeof data === 'object') {
        data = JSON.stringify(data);
      }

      this.setState({ logs: [...this.state.logs, `${data}/${event}`] });
    });

    socket.on('unknown_player_id', () => {
      const playerName = localStorage.getItem('playerName') || 'hello';

      fetchAPI('/ensure-player', {
        method: 'POST',
        body: JSON.stringify({ playerName }),
      })
        .then(() => {
          if (this.state.socket?.disconnected) {
            this.state.socket.connect();
          }
        })
        .catch((...args) => console.error('failed', ...args));
    });

    socket.on('disconnect', () => {
      this.forceUpdate();
    });

    this.setState({ socket });
  }

  sendMessage() {
    this.state.socket?.send('test');
  }

  disconnect() {
    if (this.state.socket === null) {
      return;
    }

    this.state.socket.disconnect();
    this.setState({ socket: null });
  }

  render() {
    const { history } = this.props;
    const { socket, logs } = this.state;

    return (
      <div className="Home">
        <header className="Home-header">
          <img src={logo} className="Home-logo" alt="logo" />
          <p>
            Edit <code>src/Home.tsx</code> and save to reload.
          </p>
          <p>
            <button onClick={() => this.setState({ logs: [] })}>Clear logs</button>
            <button
              onClick={() =>
                fetch(buildRequestPath('/hello'))
                  .then((res) => res.json())
                  .then(console.log)
                  .catch((...args) => console.error('failed', ...args))
              }
            >
              Make request
            </button>
            {socket === null || !socket.connected ? (
              <button onClick={this.initSocket}>Init socket</button>
            ) : (
              <>
                <button onClick={this.sendMessage}>Send message</button>
                <button onClick={this.disconnect}>Disconnect</button>
              </>
            )}
            <br />
            <button
              onClick={() => {
                const playerName = localStorage.getItem('playerName') || 'hello';

                fetchAPI('/create-game', {
                  method: 'POST',
                  body: JSON.stringify({ playerName }),
                })
                  .then((res) => res.json())
                  .then(({ roomId }) => {
                    history.push(`/lobby/${roomId}`);
                  })
                  .catch((...args) => console.error('failed', ...args));
              }}
            >
              Create room
            </button>
          </p>
          <a
            className="Home-link"
            href="https://reactjs.org"
            target="_blank"
            rel="noopener noreferrer"
          >
            Learn React
          </a>
          <Logs>
            {logs.map((log, i) => (
              <div key={i}>{log}</div>
            ))}
          </Logs>
        </header>
      </div>
    );
  }
}

export default Home;

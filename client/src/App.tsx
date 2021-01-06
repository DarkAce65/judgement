import React, { PureComponent } from 'react';

import { Socket } from 'socket.io-client';
import styled from 'styled-components';

import { buildRequestPath, buildSocket } from './api/client';
import logo from './logo.svg';

import './App.css';

const Logs = styled.div`
  position: fixed;
  top: 10px;
  right: 10px;
  font-size: 12px;
  text-align: right;
`;

interface Props {}

interface State {
  socket: Socket | null;
  logs: string[];
}

class App extends PureComponent<Props, State> {
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
      console.log(data);

      if (typeof data === 'object' && Object.prototype.hasOwnProperty.call(data, 'data')) {
        data = data.data;
      }

      this.setState({ logs: [...this.state.logs, `${data}/${event}`] });
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
    const { socket, logs } = this.state;

    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <p>
            Edit <code>src/App.tsx</code> and save to reload.
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
            <button onClick={this.initSocket}>Init socket</button>
            {socket !== null && (
              <>
                <button onClick={this.sendMessage}>Send message</button>
                <button onClick={this.disconnect}>Disconnect</button>
              </>
            )}
          </p>
          <a
            className="App-link"
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

export default App;

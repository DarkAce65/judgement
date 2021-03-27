import { Socket } from 'socket.io-client';

import { buildSocket, fetchAPI } from '../api/client';
import getCookie from '../utils/getCookie';

class GameSocket {
  static socket: Socket | null = null;
  private static connectionRetries = 0;

  private static anyListeners: { [namespace: string]: (() => void)[] } = {};
  private static listeners: {
    [namespace: string]: {
      [event: string]: (() => void)[];
    };
  } = {};

  static initializeSocket(): Socket {
    this.socket = buildSocket((auth) => auth({ player_id: getCookie('player_id') }));
    this.connectionRetries = 0;

    this.socket.on('connect_error', (error: Error) => {
      if (this.connectionRetries < 3 && error.message === 'unknown_player_id') {
        const playerName = localStorage.getItem('playerName') || 'hello';

        fetchAPI('/ensure-player', {
          method: 'POST',
          body: JSON.stringify({ playerName }),
        })
          .then(() => {
            this.socket?.connect();
            this.connectionRetries++;
          })
          .catch((...args) => console.error('failed', ...args));
      }
    });

    return this.socket;
  }

  static connect(): Socket {
    if (this.socket === null) {
      return this.initializeSocket();
    } else if (this.socket.disconnected) {
      return this.socket.connect();
    }

    return this.socket;
  }

  static onAnyNamespaced(
    namespace: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    listener: (...args: any[]) => void
  ): void {
    if (this.socket === null) {
      this.initializeSocket();
    }

    if (!this.anyListeners[namespace]) {
      this.anyListeners[namespace] = [];
    }

    this.socket!.onAny(listener);
    this.anyListeners[namespace].push(listener);
  }

  static offAnyNamespaced(
    namespace: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    listener?: (...args: any[]) => void
  ): void {
    if (this.socket === null) {
      throw new Error('Socket not initialized');
    }

    const namespacedListeners = this.anyListeners[namespace];

    if (!namespacedListeners) {
      return;
    }

    if (listener) {
      for (let i = 0; i < namespacedListeners.length; i++) {
        if (namespacedListeners[i] === listener) {
          this.socket.offAny(namespacedListeners[i]);
          namespacedListeners.splice(i, 1);
          if (namespacedListeners.length === 0) {
            delete this.anyListeners[namespace];
          }
          break;
        }
      }
    } else {
      for (const activeListener of namespacedListeners) {
        this.socket.offAny(activeListener);
      }

      delete this.anyListeners[namespace];
    }
  }

  static onNamespaced(
    namespace: string,
    event: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    listener: (...args: any[]) => void
  ) {
    if (this.socket === null) {
      this.initializeSocket();
    }

    if (!this.listeners[namespace]) {
      this.listeners[namespace] = {};
    }
    if (!this.listeners[namespace][event]) {
      this.listeners[namespace][event] = [];
    }

    this.socket!.on(event, listener);
    this.listeners[namespace][event].push(listener);
  }

  static offNamespaced(
    namespace: string,
    event?: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    listener?: (...args: any[]) => void
  ) {
    if (this.socket === null) {
      throw new Error('Socket not initialized');
    }

    const namespacedListeners = this.listeners[namespace];

    if (!namespacedListeners) {
      return;
    }

    if (event) {
      if (listener) {
        for (let i = 0; i < namespacedListeners[event].length; i++) {
          if (namespacedListeners[event][i] === listener) {
            this.socket.off(event, namespacedListeners[event][i]);
            namespacedListeners[event].splice(i, 1);
            if (namespacedListeners[event].length === 0) {
              delete this.listeners[namespace][event];
            }
            break;
          }
        }
      } else {
        for (const activeListener of namespacedListeners[event]) {
          this.socket.off(event, activeListener);
        }

        delete this.listeners[namespace][event];
      }
    } else {
      for (const eventKey in namespacedListeners) {
        if (Object.prototype.hasOwnProperty.call(namespacedListeners, eventKey)) {
          for (const activeListener of namespacedListeners[eventKey]) {
            this.socket.off(eventKey, activeListener);
          }
        }
      }

      delete this.listeners[namespace];
    }
  }

  static offAllNamespaced(namespace: string) {
    this.offAnyNamespaced(namespace);
    this.offNamespaced(namespace);
  }
}

export default GameSocket;

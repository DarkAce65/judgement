import { Socket } from 'socket.io-client';

import { buildSocket } from '../api/client';
import getCookie from '../utils/getCookie';

class GameSocket {
  static socket: Socket | null = null;

  private static resetConnectionAttempts?: () => void;

  private static anyListeners: { [namespace: string]: (() => void)[] } = {};
  private static listeners: {
    [namespace: string]: {
      [event: string]: (() => void)[];
    };
  } = {};

  static initializeSocket(
    onConnectionError?: (error: Error, socket: Socket) => void,
    resetConnectionAttempts?: () => void
  ): Socket {
    const socket = buildSocket({
      auth: (auth) => auth({ player_id: getCookie('player_id') }),
      autoConnect: false,
    });
    this.socket = socket;

    if (onConnectionError) {
      socket.on('connect_error', (error: Error) => onConnectionError(error, socket));
    }
    if (resetConnectionAttempts) {
      this.resetConnectionAttempts = resetConnectionAttempts;
      socket.on('connect', resetConnectionAttempts);
    }

    return socket;
  }

  static connect(): Socket {
    if (this.socket === null) {
      throw new Error('Socket not initialized');
    } else if (this.socket.disconnected) {
      this.resetConnectionAttempts?.();
      return this.socket.connect();
    }

    return this.socket;
  }

  static disconnect(): void {
    this.resetConnectionAttempts?.();
    this.socket?.disconnect();
  }

  static onAnyNamespaced(
    namespace: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    listener: (...args: any[]) => void
  ): void {
    if (this.socket === null) {
      throw new Error('Socket not initialized');
    }

    if (!this.anyListeners[namespace]) {
      this.anyListeners[namespace] = [];
    }

    this.socket.onAny(listener);
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
      throw new Error('Socket not initialized');
    }

    this.socket.on(event, listener);

    if (!this.listeners[namespace]) {
      this.listeners[namespace] = {};
    }
    if (!this.listeners[namespace][event]) {
      this.listeners[namespace][event] = [];
    }
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
      if (!namespacedListeners[event]) {
        return;
      }

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

      if (Object.keys(this.listeners[namespace]).length === 0) {
        delete this.listeners[namespace];
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
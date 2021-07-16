import Cookies from 'js-cookie';
import { Socket } from 'socket.io-client';
import { v4 as uuid } from 'uuid';

import { buildSocket } from '../api/client';
import { PLAYER_ID_COOKIE } from '../constants';

interface ConnectionError extends Error {
  message: 'unknown_player_id';
}

export const isConnectionError = (error: Error): error is ConnectionError =>
  error.message === 'unknown_player_id';

class GameSocket {
  private static socket: Socket | null = null;

  private static attachedNamespaces: Set<string> = new Set();

  private static resetConnectionAttempts?: () => void;

  private static anyListeners: { [namespace: string]: (() => void)[] } = {};
  private static listeners: {
    [namespace: string]: {
      [event: string]: (() => void)[];
    };
  } = {};

  static initializeSocket(
    onConnectionError?: (socket: Socket, error: Error) => void,
    resetConnectionAttempts?: () => void
  ): Socket {
    const socket = buildSocket({
      auth: (auth) => auth({ player_id: Cookies.get(PLAYER_ID_COOKIE) }),
      autoConnect: false,
    });
    this.socket = socket;
    this.attachedNamespaces = new Set();

    if (onConnectionError) {
      socket.on('connect_error', (error: Error) => onConnectionError(socket, error));
    }
    if (resetConnectionAttempts) {
      this.resetConnectionAttempts = resetConnectionAttempts;
      socket.on('connect', resetConnectionAttempts);
    }

    return socket;
  }

  private static connect(): Socket {
    if (this.socket === null) {
      throw new Error('Socket not initialized');
    } else if (this.socket.disconnected) {
      this.resetConnectionAttempts?.();
      return this.socket.connect();
    }

    return this.socket;
  }

  private static disconnect(): void {
    this.resetConnectionAttempts?.();
    this.socket?.disconnect();
  }

  static attach(): { socket: Socket; namespace: string } {
    const namespace = uuid();

    this.attachedNamespaces.add(namespace);

    return { socket: this.connect(), namespace };
  }

  static detach(namespace: string): void {
    this.offAnyNamespaced(namespace);
    this.offNamespaced(namespace);
    this.attachedNamespaces.delete(namespace);

    if (
      this.attachedNamespaces.size === 0 &&
      Object.keys(this.anyListeners).length === 0 &&
      Object.keys(this.listeners).length === 0
    ) {
      this.disconnect();
    }
  }

  static onAnyNamespaced(
    namespace: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    listener: (...args: any[]) => void
  ): void {
    if (this.socket === null) {
      throw new Error('Socket not initialized');
    } else if (!this.attachedNamespaces.has(namespace)) {
      console.error(`Unknown namespace ${namespace} - have you called GameSocket.attach()?`);
      return;
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
    } else if (!this.attachedNamespaces.has(namespace)) {
      console.error(`Unknown namespace ${namespace} - have you called GameSocket.attach()?`);
      return;
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
    } else if (!this.attachedNamespaces.has(namespace)) {
      console.error(`Unknown namespace ${namespace} - have you called GameSocket.attach()?`);
      return;
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
    } else if (!this.attachedNamespaces.has(namespace)) {
      console.error(`Unknown namespace ${namespace} - have you called GameSocket.attach()?`);
      return;
    }

    const namespacedListeners = this.listeners[namespace];
    if (!namespacedListeners) {
      return;
    }

    if (!event) {
      for (const eventKey in namespacedListeners) {
        if (Object.prototype.hasOwnProperty.call(namespacedListeners, eventKey)) {
          this.offNamespaced(namespace, eventKey);
        }
      }

      delete this.listeners[namespace];
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

    if (Object.keys(namespacedListeners).length === 0) {
      delete this.listeners[namespace];
    }
  }
}

export default GameSocket;

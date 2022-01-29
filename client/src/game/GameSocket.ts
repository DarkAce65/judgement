import Cookies from 'js-cookie';
import { Socket } from 'socket.io-client';
import { v4 as uuid } from 'uuid';

import { buildSocket } from '../api/client';
import { PLAYER_ID_COOKIE } from '../constants';

class BiMap<K, V> {
  private readonly map: Map<K, V>;
  private readonly reverseMap: Map<V, K>;
  constructor() {
    this.map = new Map();
    this.reverseMap = new Map();
  }

  get size(): number {
    return this.map.size;
  }

  keys(): IterableIterator<K> {
    return this.map.keys();
  }

  has(key: K): boolean {
    return this.map.has(key);
  }

  hasValue(value: V): boolean {
    return this.reverseMap.has(value);
  }

  get(key: K): V | undefined {
    return this.map.get(key);
  }

  getKey(value: V): K | undefined {
    return this.reverseMap.get(value);
  }

  set(key: K, value: V): void {
    this.map.set(key, value);
    this.reverseMap.set(value, key);
  }

  delete(key: K): void {
    if (this.map.has(key)) {
      this.reverseMap.delete(this.map.get(key)!);
    }
    this.map.delete(key);
  }

  deleteByValue(value: V): void {
    if (this.reverseMap.has(value)) {
      this.map.delete(this.reverseMap.get(value)!);
    }
    this.reverseMap.delete(value);
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Listener = (...args: any[]) => void;

interface ConnectionError extends Error {
  message: 'unknown_player_id';
}

export const isConnectionError = (error: Error): error is ConnectionError =>
  error.message === 'unknown_player_id';

class GameSocket {
  private static socket: Socket | null = null;

  private static attachedNamespaces: Set<string> = new Set();

  private static resetConnectionAttempts?: () => void;

  private static anyListeners: { [namespace: string]: Listener[] } = {};
  private static listeners: {
    [namespace: string]: {
      [event: string]: Listener[];
    };
  } = {};
  private static onceListenersMapping: BiMap<Listener, Listener> = new BiMap();

  static initializeSocket(
    onConnectionError?: (socket: Socket, error: Error) => void,
    resetConnectionAttempts?: () => void
  ): Socket {
    const socket = buildSocket({
      auth: (auth) => auth({ player_auth_id: Cookies.get(PLAYER_ID_COOKIE) }),
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

  private static removeListenerAndCleanup(
    namespace: string,
    event: string,
    listener: Listener
  ): Listener | null {
    let removedListener = null;
    for (let i = 0; i < this.listeners[namespace][event].length; i++) {
      if (this.listeners[namespace][event][i] === listener) {
        removedListener = this.listeners[namespace][event].splice(i, 1)[0];
        if (this.listeners[namespace][event].length === 0) {
          delete this.listeners[namespace][event];
        }
        if (Object.keys(this.listeners[namespace]).length === 0) {
          delete this.listeners[namespace];
        }
        break;
      }
    }

    return removedListener;
  }

  static onAnyNamespaced(namespace: string, listener: Listener): void {
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

  static offAnyNamespaced(namespace: string, listener?: Listener): void {
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

  static onNamespaced(namespace: string, event: string, listener: Listener) {
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

  static onceNamespaced(namespace: string, event: string, listener: Listener) {
    if (this.socket === null) {
      throw new Error('Socket not initialized');
    } else if (!this.attachedNamespaces.has(namespace)) {
      console.error(`Unknown namespace ${namespace} - have you called GameSocket.attach()?`);
      return;
    }

    const autoRemovedListener = (...args: unknown[]) => {
      listener(...args);

      const listenerToRemove = this.onceListenersMapping.get(listener)!;
      this.onceListenersMapping.delete(listener);
      this.removeListenerAndCleanup(namespace, event, listenerToRemove);
    };
    this.socket.once(event, autoRemovedListener);

    if (!this.listeners[namespace]) {
      this.listeners[namespace] = {};
    }
    if (!this.listeners[namespace][event]) {
      this.listeners[namespace][event] = [];
    }
    this.listeners[namespace][event].push(autoRemovedListener);
    this.onceListenersMapping.set(listener, autoRemovedListener);
  }

  static offNamespaced(namespace: string, event?: string, listener?: Listener) {
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
      let listenerToRemove = listener;
      if (this.onceListenersMapping.has(listener)) {
        listenerToRemove = this.onceListenersMapping.get(listener)!;
        this.onceListenersMapping.delete(listener);
      }

      const removedListener = this.removeListenerAndCleanup(namespace, event, listenerToRemove);
      if (removedListener !== null) {
        this.socket.off(event, removedListener);
      }
    } else {
      for (const activeListener of namespacedListeners[event]) {
        this.socket.off(event, activeListener);
        if (this.onceListenersMapping.hasValue(activeListener)) {
          this.onceListenersMapping.deleteByValue(activeListener);
        }
      }

      delete this.listeners[namespace][event];
    }

    if (Object.keys(namespacedListeners).length === 0) {
      delete this.listeners[namespace];
    }
  }

  static onReconnect(namespace: string, listener: Listener): void {
    this.onceNamespaced(namespace, 'disconnect', () => {
      this.onNamespaced(namespace, 'connect', listener);
    });
  }
}

export default GameSocket;

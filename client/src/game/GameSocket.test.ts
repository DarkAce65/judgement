import { beforeEach, describe, expect, it, vi } from 'vitest';

import type GameSocketType from './GameSocket';

const mockSocket = {
  connect: vi
    .fn(() => {
      mockSocket.connected = true;
      mockSocket.disconnected = false;
    })
    .mockName('connect'),
  disconnect: vi
    .fn(() => {
      mockSocket.connected = false;
      mockSocket.disconnected = true;
    })
    .mockName('disconnect'),
  on: vi.fn().mockName('on'),
  once: vi.fn().mockName('once'),
  off: vi.fn().mockName('off'),
  onAny: vi.fn().mockName('onAny'),
  offAny: vi.fn().mockName('offAny'),

  connected: false,
  disconnected: true,
};

const onConnectionError = vi.fn();
const resetAttempts = vi.fn();

vi.mock('../api/client', () => ({ buildSocket: vi.fn(() => mockSocket) }));

describe('GameSocket', () => {
  let GameSocket: typeof GameSocketType;

  beforeEach(async () => {
    vi.resetModules();

    GameSocket = (await import('./GameSocket')).default;
    mockSocket.connected = false;
    mockSocket.disconnected = true;
  });

  it('initializes a socket with a reconnect handler', () => {
    expect(GameSocket['socket']).toBe(null);

    expect(GameSocket.initializeSocket(onConnectionError, resetAttempts)).toBe(mockSocket);
    expect(GameSocket['socket']).toBe(mockSocket);
    expect(mockSocket.on).toHaveBeenCalledWith('connect_error', expect.any(Function));
  });

  describe('catch-all listeners', () => {
    it('adds a catch-all listener', () => {
      expect(GameSocket['socket']).toBe(null);

      const listener = vi.fn();

      expect(GameSocket.initializeSocket(onConnectionError, resetAttempts)).toBe(mockSocket);
      const { namespace } = GameSocket.attach();
      GameSocket.onAnyNamespaced(namespace, listener);

      expect(GameSocket['socket']).toBe(mockSocket);
      expect(mockSocket.onAny).toHaveBeenCalledWith(listener);
      expect(GameSocket['anyListeners']).toHaveProperty(namespace);
      expect(GameSocket['anyListeners'][namespace]).toContain(listener);
    });

    it('adds a catch-all listener, throwing an error if the socket is uninitialized', () => {
      expect(GameSocket['socket']).toBe(null);

      expect(() => {
        const listener = vi.fn();
        GameSocket.onAnyNamespaced('test-ns', listener);
      }).toThrowError('Socket not initialized');
    });

    it('fails to add a catch-all listener with an unknown namespace', () => {
      expect(GameSocket.initializeSocket(onConnectionError, resetAttempts)).toBe(mockSocket);

      const consoleErrorSpy = vi.spyOn(console, 'error').mockReturnValue();

      const namespace = 'unknown-namespace';
      const listener = vi.fn();
      GameSocket.onNamespaced(namespace, 'event', listener);

      expect(consoleErrorSpy).toBeCalledWith(
        `Unknown namespace ${namespace} - have you called GameSocket.attach()?`
      );
      consoleErrorSpy.mockRestore();
    });
  });

  describe('standard listeners', () => {
    it('adds an event listener', () => {
      expect(GameSocket.initializeSocket(onConnectionError, resetAttempts)).toBe(mockSocket);

      const { namespace } = GameSocket.attach();
      const listener = vi.fn();
      GameSocket.onNamespaced(namespace, 'test_event', listener);

      expect(GameSocket['socket']).toBe(mockSocket);
      expect(mockSocket.on).toHaveBeenCalledWith('test_event', listener);
      expect(GameSocket['listeners']).toHaveProperty(`${namespace}.test_event`);
      expect(GameSocket['listeners'][namespace]['test_event']).toContain(listener);
    });

    it('adds an event listener, throwing an error if the socket is uninitialized', () => {
      expect(GameSocket['socket']).toBe(null);

      expect(() => {
        const listener = vi.fn();
        GameSocket.onNamespaced('test-ns', 'test_event', listener);
      }).toThrowError('Socket not initialized');
    });

    it('fails to add an event listener with an unknown namespace', () => {
      expect(GameSocket.initializeSocket(onConnectionError, resetAttempts)).toBe(mockSocket);

      const consoleErrorSpy = vi.spyOn(console, 'error').mockReturnValue();

      const namespace = 'unknown-namespace';
      const listener = vi.fn();
      GameSocket.onNamespaced(namespace, 'event', listener);

      expect(consoleErrorSpy).toBeCalledWith(
        `Unknown namespace ${namespace} - have you called GameSocket.attach()?`
      );
      consoleErrorSpy.mockRestore();
    });
  });

  describe('once listeners', () => {
    it('adds a single firing event listener', () => {
      expect(GameSocket.initializeSocket(onConnectionError, resetAttempts)).toBe(mockSocket);

      const { namespace } = GameSocket.attach();
      const listener = vi.fn();
      GameSocket.onceNamespaced(namespace, 'test_event', listener);

      expect(GameSocket['socket']).toBe(mockSocket);
      expect(GameSocket['listeners']).toHaveProperty(`${namespace}.test_event`);
      expect(GameSocket['onceListenersMapping'].has(listener)).toBe(true);
      expect(GameSocket['listeners'][namespace]['test_event']).toContain(
        GameSocket['onceListenersMapping'].get(listener)
      );
      expect(mockSocket.once).toHaveBeenCalledWith(
        'test_event',
        GameSocket['onceListenersMapping'].get(listener)
      );
    });

    it('adds a single firing event listener, throwing an error if the socket is uninitialized', () => {
      expect(GameSocket['socket']).toBe(null);

      expect(() => {
        const listener = vi.fn();
        GameSocket.onceNamespaced('test-ns', 'test_event', listener);
      }).toThrowError('Socket not initialized');
    });

    it('fails to add a single firing event listener with an unknown namespace', () => {
      expect(GameSocket.initializeSocket(onConnectionError, resetAttempts)).toBe(mockSocket);

      const consoleErrorSpy = vi.spyOn(console, 'error').mockReturnValue();

      const namespace = 'unknown-namespace';
      const listener = vi.fn();
      GameSocket.onceNamespaced(namespace, 'event', listener);

      expect(consoleErrorSpy).toBeCalledWith(
        `Unknown namespace ${namespace} - have you called GameSocket.attach()?`
      );
      consoleErrorSpy.mockRestore();
    });
  });

  it('registers multiple event listeners', () => {
    const anyListener1 = vi.fn();
    const anyListener2 = vi.fn();
    const anyListener3 = vi.fn();

    const listener1 = vi.fn();
    const listener2 = vi.fn();
    const listener3 = vi.fn();
    const listener4 = vi.fn();

    const onceListener1 = vi.fn();
    const onceListener2 = vi.fn();
    const onceListener3 = vi.fn();
    const onceListener4 = vi.fn();

    expect(GameSocket.initializeSocket(onConnectionError, resetAttempts)).toBe(mockSocket);
    const { namespace: namespace1 } = GameSocket.attach();
    const { namespace: namespace2 } = GameSocket.attach();

    GameSocket.onAnyNamespaced(namespace1, anyListener1);
    GameSocket.onAnyNamespaced(namespace1, anyListener2);
    GameSocket.onNamespaced(namespace1, 'test_event', listener1);
    GameSocket.onNamespaced(namespace1, 'test_event', listener2);
    GameSocket.onNamespaced(namespace1, 'test_event2', listener3);
    GameSocket.onceNamespaced(namespace1, 'test_event', onceListener1);
    GameSocket.onceNamespaced(namespace1, 'test_event', onceListener2);
    GameSocket.onceNamespaced(namespace1, 'test_event2', onceListener3);
    GameSocket.onAnyNamespaced(namespace2, anyListener3);
    GameSocket.onNamespaced(namespace2, 'test_event', listener4);
    GameSocket.onceNamespaced(namespace2, 'test_event', onceListener4);

    expect(mockSocket.onAny).toHaveBeenCalledWith(anyListener1);
    expect(mockSocket.onAny).toHaveBeenCalledWith(anyListener2);
    expect(mockSocket.onAny).toHaveBeenCalledWith(anyListener3);
    expect(mockSocket.on).toHaveBeenCalledWith('test_event', listener1);
    expect(mockSocket.on).toHaveBeenCalledWith('test_event', listener2);
    expect(mockSocket.on).toHaveBeenCalledWith('test_event2', listener3);
    expect(mockSocket.on).toHaveBeenCalledWith('test_event', listener4);

    expect(GameSocket['anyListeners']).toHaveProperty(namespace1);
    expect(GameSocket['anyListeners'][namespace1]).toContain(anyListener1);
    expect(GameSocket['anyListeners'][namespace1]).toContain(anyListener2);
    expect(GameSocket['listeners']).toHaveProperty(`${namespace1}.test_event`);
    expect(GameSocket['listeners'][namespace1]['test_event']).toContain(listener1);
    expect(GameSocket['listeners'][namespace1]['test_event']).toContain(listener2);
    expect(GameSocket['onceListenersMapping'].has(onceListener1)).toBeTruthy();
    expect(GameSocket['listeners'][namespace1]['test_event']).toContain(
      GameSocket['onceListenersMapping'].get(onceListener1)
    );
    expect(GameSocket['onceListenersMapping'].has(onceListener2)).toBeTruthy();
    expect(GameSocket['listeners'][namespace1]['test_event']).toContain(
      GameSocket['onceListenersMapping'].get(onceListener2)
    );
    expect(GameSocket['listeners']).toHaveProperty(`${namespace1}.test_event2`);
    expect(GameSocket['listeners'][namespace1]['test_event2']).toContain(listener3);
    expect(GameSocket['onceListenersMapping'].has(onceListener3)).toBeTruthy();
    expect(GameSocket['listeners'][namespace1]['test_event2']).toContain(
      GameSocket['onceListenersMapping'].get(onceListener3)
    );

    expect(GameSocket['anyListeners']).toHaveProperty(namespace2);
    expect(GameSocket['anyListeners'][namespace2]).toContain(anyListener3);
    expect(GameSocket['listeners']).toHaveProperty(`${namespace2}.test_event`);
    expect(GameSocket['listeners'][namespace2]['test_event']).toContain(listener4);
    expect(GameSocket['onceListenersMapping'].has(onceListener4)).toBeTruthy();
    expect(GameSocket['listeners'][namespace2]['test_event']).toContain(
      GameSocket['onceListenersMapping'].get(onceListener4)
    );

    expect(mockSocket.once).toHaveBeenCalledWith(
      'test_event',
      GameSocket['onceListenersMapping'].get(onceListener1)
    );
    expect(mockSocket.once).toHaveBeenCalledWith(
      'test_event',
      GameSocket['onceListenersMapping'].get(onceListener2)
    );
    expect(mockSocket.once).toHaveBeenCalledWith(
      'test_event2',
      GameSocket['onceListenersMapping'].get(onceListener3)
    );
    expect(mockSocket.once).toHaveBeenCalledWith(
      'test_event',
      GameSocket['onceListenersMapping'].get(onceListener4)
    );
  });

  describe('removing event listeners', () => {
    let namespace1: string;
    let namespace2: string;

    beforeEach(() => {
      GameSocket.initializeSocket(onConnectionError, resetAttempts);

      const { namespace: ns1 } = GameSocket.attach();
      const { namespace: ns2 } = GameSocket.attach();
      namespace1 = ns1;
      namespace2 = ns2;
    });

    describe('catch-all listeners', () => {
      const anyListener1 = vi.fn();
      const anyListener2 = vi.fn();
      const anyListener3 = vi.fn();

      beforeEach(() => {
        GameSocket.onAnyNamespaced(namespace1, anyListener1);
        GameSocket.onAnyNamespaced(namespace1, anyListener2);
        GameSocket.onAnyNamespaced(namespace2, anyListener3);

        vi.clearAllMocks();
      });

      it('removes a catch-all listener', () => {
        GameSocket.offAnyNamespaced(namespace1, anyListener1);

        expect(mockSocket.offAny).toBeCalledTimes(1);
        expect(mockSocket.offAny).toHaveBeenCalledWith(anyListener1);
        expect(GameSocket['anyListeners']).toHaveProperty(namespace1);
        expect(GameSocket['anyListeners'][namespace1]).not.toContain(anyListener1);
        expect(GameSocket['anyListeners'][namespace1]).toContain(anyListener2);

        expect(GameSocket['anyListeners']).toHaveProperty(namespace2);
        expect(GameSocket['anyListeners'][namespace2]).toContain(anyListener3);
      });

      it('removes all catch-all listeners for a namespace', () => {
        GameSocket.offAnyNamespaced(namespace1);

        expect(mockSocket.offAny).toBeCalledTimes(2);
        expect(mockSocket.offAny).toHaveBeenCalledWith(anyListener1);
        expect(mockSocket.offAny).toHaveBeenCalledWith(anyListener2);
        expect(GameSocket['anyListeners']).not.toHaveProperty(namespace1);

        expect(GameSocket['anyListeners']).toHaveProperty(namespace2);
        expect(GameSocket['anyListeners'][namespace2]).toContain(anyListener3);
      });

      it('removes all catch-all listeners for a namespace (individual removals)', () => {
        GameSocket.offAnyNamespaced(namespace1, anyListener1);
        GameSocket.offAnyNamespaced(namespace1, anyListener2);

        expect(mockSocket.offAny).toBeCalledTimes(2);
        expect(mockSocket.offAny).toHaveBeenCalledWith(anyListener1);
        expect(mockSocket.offAny).toHaveBeenCalledWith(anyListener2);
        expect(GameSocket['anyListeners']).not.toHaveProperty(namespace1);

        expect(GameSocket['anyListeners']).toHaveProperty(namespace2);
        expect(GameSocket['anyListeners'][namespace2]).toContain(anyListener3);
      });
    });

    describe('standard listeners', () => {
      const listener1 = vi.fn();
      const listener2 = vi.fn();
      const listener3 = vi.fn();
      const listener4 = vi.fn();

      beforeEach(() => {
        GameSocket.onNamespaced(namespace1, 'test_event', listener1);
        GameSocket.onNamespaced(namespace1, 'test_event', listener2);
        GameSocket.onNamespaced(namespace1, 'test_event2', listener3);

        GameSocket.onNamespaced(namespace2, 'test_event', listener4);

        vi.clearAllMocks();
      });

      it('removes an event listener', () => {
        GameSocket.offNamespaced(namespace1, 'test_event', listener2);

        expect(mockSocket.off).toBeCalledTimes(1);
        expect(mockSocket.off).toHaveBeenCalledWith('test_event', listener2);
        expect(GameSocket['listeners']).toHaveProperty(`${namespace1}.test_event`);
        expect(GameSocket['listeners'][namespace1]['test_event']).toContain(listener1);
        expect(GameSocket['listeners'][namespace1]['test_event']).not.toContain(listener2);
        expect(GameSocket['listeners']).toHaveProperty(`${namespace1}.test_event2`);
        expect(GameSocket['listeners'][namespace1]['test_event2']).toContain(listener3);

        expect(GameSocket['listeners']).toHaveProperty(`${namespace2}.test_event`);
        expect(GameSocket['listeners'][namespace2]['test_event']).toContain(listener4);
      });

      it('removes all event listeners for a namespace and event', () => {
        GameSocket.offNamespaced(namespace1, 'test_event');

        expect(mockSocket.off).toBeCalledTimes(2);
        expect(mockSocket.off).toHaveBeenCalledWith('test_event', listener1);
        expect(mockSocket.off).toHaveBeenCalledWith('test_event', listener2);
        expect(GameSocket['listeners']).not.toHaveProperty(`${namespace1}.test_event`);
        expect(GameSocket['listeners']).toHaveProperty(`${namespace1}.test_event2`);
        expect(GameSocket['listeners'][namespace1]['test_event2']).toContain(listener3);

        expect(GameSocket['listeners']).toHaveProperty(`${namespace2}.test_event`);
        expect(GameSocket['listeners'][namespace2]['test_event']).toContain(listener4);
      });

      it('removes all event listeners for a namespace and event (individual removals)', () => {
        GameSocket.offNamespaced(namespace1, 'test_event', listener1);
        GameSocket.offNamespaced(namespace1, 'test_event', listener2);

        expect(mockSocket.off).toBeCalledTimes(2);
        expect(mockSocket.off).toHaveBeenCalledWith('test_event', listener1);
        expect(mockSocket.off).toHaveBeenCalledWith('test_event', listener2);
        expect(GameSocket['listeners']).not.toHaveProperty(`${namespace1}.test_event`);
        expect(GameSocket['listeners']).toHaveProperty(`${namespace1}.test_event2`);
        expect(GameSocket['listeners'][namespace1]['test_event2']).toContain(listener3);

        expect(GameSocket['listeners']).toHaveProperty(`${namespace2}.test_event`);
        expect(GameSocket['listeners'][namespace2]['test_event']).toContain(listener4);
      });

      it('removes all event listeners for a namespace', () => {
        GameSocket.offNamespaced(namespace1);

        expect(mockSocket.off).toBeCalledTimes(3);
        expect(mockSocket.off).toHaveBeenCalledWith('test_event', listener1);
        expect(mockSocket.off).toHaveBeenCalledWith('test_event', listener2);
        expect(mockSocket.off).toHaveBeenCalledWith('test_event2', listener3);
        expect(GameSocket['listeners']).not.toHaveProperty(namespace1);

        expect(GameSocket['listeners']).toHaveProperty(`${namespace2}.test_event`);
        expect(GameSocket['listeners'][namespace2]['test_event']).toContain(listener4);
      });

      it('removes all event listeners for a namespace (bulk removals by event)', () => {
        GameSocket.offNamespaced(namespace1, 'test_event');
        GameSocket.offNamespaced(namespace1, 'test_event2');

        expect(mockSocket.off).toBeCalledTimes(3);
        expect(mockSocket.off).toHaveBeenCalledWith('test_event', listener1);
        expect(mockSocket.off).toHaveBeenCalledWith('test_event', listener2);
        expect(mockSocket.off).toHaveBeenCalledWith('test_event2', listener3);
        expect(GameSocket['listeners']).not.toHaveProperty(namespace1);

        expect(GameSocket['listeners']).toHaveProperty(`${namespace2}.test_event`);
        expect(GameSocket['listeners'][namespace2]['test_event']).toContain(listener4);
      });

      it('removes all event listeners for a namespace (individual removals by event and listener)', () => {
        GameSocket.offNamespaced(namespace1, 'test_event', listener1);
        GameSocket.offNamespaced(namespace1, 'test_event', listener2);
        GameSocket.offNamespaced(namespace1, 'test_event2', listener3);

        expect(mockSocket.off).toBeCalledTimes(3);
        expect(mockSocket.off).toHaveBeenCalledWith('test_event', listener1);
        expect(mockSocket.off).toHaveBeenCalledWith('test_event', listener2);
        expect(mockSocket.off).toHaveBeenCalledWith('test_event2', listener3);
        expect(GameSocket['listeners']).not.toHaveProperty(namespace1);

        expect(GameSocket['listeners']).toHaveProperty(`${namespace2}.test_event`);
        expect(GameSocket['listeners'][namespace2]['test_event']).toContain(listener4);
      });
    });

    describe('once listeners', () => {
      const onceListener1 = vi.fn();
      const onceListener2 = vi.fn();
      const onceListener3 = vi.fn();
      const onceListener4 = vi.fn();

      let onceListener1Actual: () => void;
      let onceListener2Actual: () => void;
      let onceListener3Actual: () => void;
      let onceListener4Actual: () => void;

      beforeEach(() => {
        GameSocket.onceNamespaced(namespace1, 'test_event', onceListener1);
        GameSocket.onceNamespaced(namespace1, 'test_event', onceListener2);
        GameSocket.onceNamespaced(namespace1, 'test_event2', onceListener3);

        GameSocket.onceNamespaced(namespace2, 'test_event', onceListener4);

        onceListener1Actual = GameSocket['onceListenersMapping'].get(onceListener1)!;
        onceListener2Actual = GameSocket['onceListenersMapping'].get(onceListener2)!;
        onceListener3Actual = GameSocket['onceListenersMapping'].get(onceListener3)!;
        onceListener4Actual = GameSocket['onceListenersMapping'].get(onceListener4)!;

        vi.clearAllMocks();
      });

      it('removes a single firing event listener', () => {
        GameSocket.offNamespaced(namespace1, 'test_event', onceListener2);

        expect(mockSocket.off).toBeCalledTimes(1);
        expect(mockSocket.off).toHaveBeenCalledWith('test_event', onceListener2Actual);
        expect(GameSocket['listeners']).toHaveProperty(`${namespace1}.test_event`);
        expect(GameSocket['listeners'][namespace1]['test_event']).toContain(onceListener1Actual);
        expect(GameSocket['onceListenersMapping'].has(onceListener1)).toBe(true);
        expect(GameSocket['listeners'][namespace1]['test_event']).not.toContain(
          onceListener2Actual
        );
        expect(GameSocket['onceListenersMapping'].has(onceListener2)).toBe(false);
        expect(GameSocket['listeners']).toHaveProperty(`${namespace1}.test_event2`);
        expect(GameSocket['listeners'][namespace1]['test_event2']).toContain(onceListener3Actual);
        expect(GameSocket['onceListenersMapping'].has(onceListener3)).toBe(true);

        expect(GameSocket['listeners']).toHaveProperty(`${namespace2}.test_event`);
        expect(GameSocket['listeners'][namespace2]['test_event']).toContain(onceListener4Actual);
        expect(GameSocket['onceListenersMapping'].has(onceListener4)).toBe(true);
      });

      it('removes all single firing event listeners for a namespace and event', () => {
        GameSocket.offNamespaced(namespace1, 'test_event');

        expect(mockSocket.off).toBeCalledTimes(2);
        expect(mockSocket.off).toHaveBeenCalledWith('test_event', onceListener1Actual);
        expect(mockSocket.off).toHaveBeenCalledWith('test_event', onceListener2Actual);
        expect(GameSocket['listeners']).not.toHaveProperty(`${namespace1}.test_event`);
        expect(GameSocket['onceListenersMapping'].has(onceListener1)).toBe(false);
        expect(GameSocket['onceListenersMapping'].has(onceListener2)).toBe(false);
        expect(GameSocket['listeners']).toHaveProperty(`${namespace1}.test_event2`);
        expect(GameSocket['listeners'][namespace1]['test_event2']).toContain(onceListener3Actual);
        expect(GameSocket['onceListenersMapping'].has(onceListener3)).toBe(true);

        expect(GameSocket['listeners']).toHaveProperty(`${namespace2}.test_event`);
        expect(GameSocket['listeners'][namespace2]['test_event']).toContain(onceListener4Actual);
        expect(GameSocket['onceListenersMapping'].has(onceListener4)).toBe(true);
      });

      it('removes all single firing event listeners for a namespace and event (individual removals)', () => {
        GameSocket.offNamespaced(namespace1, 'test_event', onceListener1);
        GameSocket.offNamespaced(namespace1, 'test_event', onceListener2);

        expect(mockSocket.off).toBeCalledTimes(2);
        expect(mockSocket.off).toHaveBeenCalledWith('test_event', onceListener1Actual);
        expect(mockSocket.off).toHaveBeenCalledWith('test_event', onceListener2Actual);
        expect(GameSocket['listeners']).not.toHaveProperty(`${namespace1}.test_event`);
        expect(GameSocket['onceListenersMapping'].has(onceListener1)).toBe(false);
        expect(GameSocket['onceListenersMapping'].has(onceListener2)).toBe(false);
        expect(GameSocket['listeners']).toHaveProperty(`${namespace1}.test_event2`);
        expect(GameSocket['listeners'][namespace1]['test_event2']).toContain(onceListener3Actual);
        expect(GameSocket['onceListenersMapping'].has(onceListener3)).toBe(true);

        expect(GameSocket['listeners']).toHaveProperty(`${namespace2}.test_event`);
        expect(GameSocket['listeners'][namespace2]['test_event']).toContain(onceListener4Actual);
        expect(GameSocket['onceListenersMapping'].has(onceListener4)).toBe(true);
      });

      it('removes all single firing event listeners for a namespace', () => {
        GameSocket.offNamespaced(namespace1);

        expect(mockSocket.off).toBeCalledTimes(3);
        expect(mockSocket.off).toHaveBeenCalledWith('test_event', onceListener1Actual);
        expect(mockSocket.off).toHaveBeenCalledWith('test_event', onceListener2Actual);
        expect(mockSocket.off).toHaveBeenCalledWith('test_event2', onceListener3Actual);
        expect(GameSocket['listeners']).not.toHaveProperty(namespace1);
        expect(GameSocket['onceListenersMapping'].has(onceListener1)).toBe(false);
        expect(GameSocket['onceListenersMapping'].has(onceListener2)).toBe(false);
        expect(GameSocket['onceListenersMapping'].has(onceListener3)).toBe(false);

        expect(GameSocket['listeners']).toHaveProperty(`${namespace2}.test_event`);
        expect(GameSocket['listeners'][namespace2]['test_event']).toContain(onceListener4Actual);
        expect(GameSocket['onceListenersMapping'].has(onceListener4)).toBe(true);
      });

      it('removes all single firing event listeners for a namespace (bulk removals by event)', () => {
        GameSocket.offNamespaced(namespace1, 'test_event');
        GameSocket.offNamespaced(namespace1, 'test_event2');

        expect(mockSocket.off).toBeCalledTimes(3);
        expect(mockSocket.off).toHaveBeenCalledWith('test_event', onceListener1Actual);
        expect(mockSocket.off).toHaveBeenCalledWith('test_event', onceListener2Actual);
        expect(mockSocket.off).toHaveBeenCalledWith('test_event2', onceListener3Actual);
        expect(GameSocket['listeners']).not.toHaveProperty(namespace1);
        expect(GameSocket['onceListenersMapping'].has(onceListener1)).toBe(false);
        expect(GameSocket['onceListenersMapping'].has(onceListener2)).toBe(false);
        expect(GameSocket['onceListenersMapping'].has(onceListener3)).toBe(false);

        expect(GameSocket['listeners']).toHaveProperty(`${namespace2}.test_event`);
        expect(GameSocket['listeners'][namespace2]['test_event']).toContain(onceListener4Actual);
        expect(GameSocket['onceListenersMapping'].has(onceListener4)).toBe(true);
      });

      it('removes all single firing event listeners for a namespace (individual removals by event and listener)', () => {
        GameSocket.offNamespaced(namespace1, 'test_event', onceListener1);
        GameSocket.offNamespaced(namespace1, 'test_event', onceListener2);
        GameSocket.offNamespaced(namespace1, 'test_event2', onceListener3);

        expect(mockSocket.off).toBeCalledTimes(3);
        expect(mockSocket.off).toHaveBeenCalledWith('test_event', onceListener1Actual);
        expect(mockSocket.off).toHaveBeenCalledWith('test_event', onceListener2Actual);
        expect(mockSocket.off).toHaveBeenCalledWith('test_event2', onceListener3Actual);
        expect(GameSocket['listeners']).not.toHaveProperty(namespace1);
        expect(GameSocket['onceListenersMapping'].has(onceListener1)).toBe(false);
        expect(GameSocket['onceListenersMapping'].has(onceListener2)).toBe(false);
        expect(GameSocket['onceListenersMapping'].has(onceListener3)).toBe(false);

        expect(GameSocket['listeners']).toHaveProperty(`${namespace2}.test_event`);
        expect(GameSocket['listeners'][namespace2]['test_event']).toContain(onceListener4Actual);
        expect(GameSocket['onceListenersMapping'].has(onceListener4)).toBe(true);
      });
    });
  });

  describe('attach', () => {
    beforeEach(() => {
      GameSocket.initializeSocket(onConnectionError, resetAttempts);

      vi.clearAllMocks();
    });

    it('attaches, connecting the socket if not already connected', () => {
      const { namespace } = GameSocket.attach();
      expect(mockSocket.connect).toBeCalledTimes(1);
      expect(GameSocket['attachedNamespaces']).toContain(namespace);
    });

    it('attaches to a connected socket', () => {
      GameSocket['connect']();
      vi.clearAllMocks();

      const { namespace } = GameSocket.attach();
      expect(mockSocket.connect).toBeCalledTimes(0);
      expect(GameSocket['attachedNamespaces']).toContain(namespace);
    });
  });

  describe('detach', () => {
    const anyListener1 = vi.fn();
    const anyListener2 = vi.fn();
    const anyListener3 = vi.fn();

    const listener1 = vi.fn();
    const listener2 = vi.fn();
    const listener3 = vi.fn();
    const listener4 = vi.fn();

    const onceListener1 = vi.fn();
    const onceListener2 = vi.fn();
    const onceListener3 = vi.fn();
    const onceListener4 = vi.fn();

    beforeEach(() => {
      GameSocket.initializeSocket(onConnectionError, resetAttempts);

      vi.clearAllMocks();
    });

    it('detaches and disconnects from a socket with nothing attached and no listeners', () => {
      const { namespace: namespace1 } = GameSocket.attach();

      vi.clearAllMocks();

      GameSocket.detach(namespace1);

      expect(GameSocket['attachedNamespaces']).toEqual(new Set());
      expect(GameSocket['anyListeners']).toEqual({});
      expect(GameSocket['listeners']).toEqual({});
      expect(GameSocket['onceListenersMapping'].size).toEqual(0);

      expect(mockSocket.disconnect).toBeCalledTimes(1);
    });

    it('detaches from a socket with multiple attachers and no listeners', () => {
      const { namespace: namespace1 } = GameSocket.attach();
      const { namespace: namespace2 } = GameSocket.attach();

      vi.clearAllMocks();

      GameSocket.detach(namespace1);

      expect(GameSocket['attachedNamespaces']).toEqual(new Set([namespace2]));
      expect(GameSocket['anyListeners']).toEqual({});
      expect(GameSocket['listeners']).toEqual({});
      expect(GameSocket['onceListenersMapping'].size).toEqual(0);

      expect(mockSocket.disconnect).toBeCalledTimes(0);
    });

    it('detaches from a socket with listeners from other namespaces', () => {
      const { namespace: namespace1 } = GameSocket.attach();
      const { namespace: namespace2 } = GameSocket.attach();
      GameSocket.onAnyNamespaced(namespace2, anyListener3);
      GameSocket.onNamespaced(namespace2, 'test_event', listener4);
      GameSocket.onceNamespaced(namespace2, 'test_event', onceListener4);

      vi.clearAllMocks();

      GameSocket.detach(namespace1);

      expect(GameSocket['attachedNamespaces']).toEqual(new Set([namespace2]));
      expect(GameSocket['anyListeners']).toHaveProperty(namespace2);
      expect(GameSocket['anyListeners'][namespace2]).toContain(anyListener3);
      expect(GameSocket['listeners']).toHaveProperty(`${namespace2}.test_event`);
      expect(GameSocket['listeners'][namespace2]['test_event']).toContain(listener4);
      expect(GameSocket['onceListenersMapping'].has(onceListener4)).toBe(true);
      expect(GameSocket['listeners'][namespace2]['test_event']).toContain(
        GameSocket['onceListenersMapping'].get(onceListener4)
      );

      expect(mockSocket.disconnect).toBeCalledTimes(0);
    });

    it('detaches and removes listeners from a socket with listeners from the detaching namespace and other namespaces', () => {
      const { namespace: namespace1 } = GameSocket.attach();
      GameSocket.onAnyNamespaced(namespace1, anyListener1);
      GameSocket.onAnyNamespaced(namespace1, anyListener2);
      GameSocket.onNamespaced(namespace1, 'test_event', listener1);
      GameSocket.onNamespaced(namespace1, 'test_event', listener2);
      GameSocket.onNamespaced(namespace1, 'test_event2', listener3);
      GameSocket.onceNamespaced(namespace1, 'test_event', onceListener1);
      GameSocket.onceNamespaced(namespace1, 'test_event', onceListener2);
      GameSocket.onceNamespaced(namespace1, 'test_event2', onceListener3);

      const { namespace: namespace2 } = GameSocket.attach();
      GameSocket.onAnyNamespaced(namespace2, anyListener3);
      GameSocket.onNamespaced(namespace2, 'test_event', listener4);
      GameSocket.onceNamespaced(namespace2, 'test_event', onceListener4);

      vi.clearAllMocks();

      GameSocket.detach(namespace1);

      expect(GameSocket['attachedNamespaces']).toEqual(new Set([namespace2]));
      expect(GameSocket['anyListeners']).not.toHaveProperty(namespace1);
      expect(GameSocket['listeners']).not.toHaveProperty(namespace1);
      expect(GameSocket['onceListenersMapping'].has(onceListener1)).toBe(false);
      expect(GameSocket['onceListenersMapping'].has(onceListener2)).toBe(false);
      expect(GameSocket['onceListenersMapping'].has(onceListener3)).toBe(false);

      expect(GameSocket['anyListeners']).toHaveProperty(namespace2);
      expect(GameSocket['anyListeners'][namespace2]).toContain(anyListener3);
      expect(GameSocket['listeners']).toHaveProperty(`${namespace2}.test_event`);
      expect(GameSocket['listeners'][namespace2]['test_event']).toContain(listener4);
      expect(GameSocket['onceListenersMapping'].has(onceListener4)).toBe(true);
      expect(GameSocket['listeners'][namespace2]['test_event']).toContain(
        GameSocket['onceListenersMapping'].get(onceListener4)
      );

      expect(mockSocket.disconnect).toBeCalledTimes(0);
    });

    it('detaches, removes listeners, and disconnects from a socket with only listeners from the detaching namespace', () => {
      const { namespace: namespace1 } = GameSocket.attach();
      GameSocket.onAnyNamespaced(namespace1, anyListener1);
      GameSocket.onAnyNamespaced(namespace1, anyListener2);
      GameSocket.onNamespaced(namespace1, 'test_event', listener1);
      GameSocket.onNamespaced(namespace1, 'test_event', listener2);
      GameSocket.onNamespaced(namespace1, 'test_event2', listener3);
      GameSocket.onceNamespaced(namespace1, 'test_event', onceListener1);
      GameSocket.onceNamespaced(namespace1, 'test_event', onceListener2);
      GameSocket.onceNamespaced(namespace1, 'test_event2', onceListener3);

      vi.clearAllMocks();

      GameSocket.detach(namespace1);

      expect(GameSocket['attachedNamespaces']).toEqual(new Set());
      expect(GameSocket['anyListeners']).toEqual({});
      expect(GameSocket['listeners']).toEqual({});
      expect(GameSocket['onceListenersMapping'].size).toEqual(0);

      expect(mockSocket.disconnect).toBeCalledTimes(1);
    });
  });
});

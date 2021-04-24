import type GameSocketType from './GameSocket';

const mockSocket = {
  connect: jest
    .fn(() => {
      mockSocket.connected = true;
      mockSocket.disconnected = false;
    })
    .mockName('connect'),
  disconnect: jest
    .fn(() => {
      mockSocket.connected = false;
      mockSocket.disconnected = true;
    })
    .mockName('disconnect'),
  on: jest.fn().mockName('on'),
  off: jest.fn().mockName('off'),
  onAny: jest.fn().mockName('onAny'),
  offAny: jest.fn().mockName('offAny'),

  connected: false,
  disconnected: true,
};

const onConnectionError = jest.fn();
const resetAttempts = jest.fn();

jest.mock('../api/client', () => ({
  __esModule: true,
  buildSocket: jest.fn(() => mockSocket),
}));

describe('GameSocket', () => {
  let GameSocket: typeof GameSocketType;

  beforeEach(() => {
    jest.resetModules();

    GameSocket = require('./GameSocket').default;
    mockSocket.connected = false;
    mockSocket.disconnected = true;
  });

  it('initializes a socket with a reconnect handler', () => {
    expect(GameSocket.socket).toBe(null);

    expect(GameSocket.initializeSocket(onConnectionError, resetAttempts)).toBe(mockSocket);
    expect(GameSocket.socket).toBe(mockSocket);
    expect(mockSocket.on).toHaveBeenCalledWith('connect_error', expect.any(Function));
  });

  it('adds a catch-all listener', () => {
    expect(GameSocket.socket).toBe(null);

    const listener = jest.fn();

    expect(GameSocket.initializeSocket(onConnectionError, resetAttempts)).toBe(mockSocket);
    GameSocket.onAnyNamespaced('test-ns', listener);

    expect(GameSocket.socket).toBe(mockSocket);
    expect(mockSocket.onAny).toHaveBeenCalledWith(listener);
    expect(GameSocket['anyListeners']).toHaveProperty('test-ns');
    expect(GameSocket['anyListeners']['test-ns']).toContain(listener);
  });

  it('adds a catch-all listener, throwing an error if the socket is uninitialized', () => {
    expect(GameSocket.socket).toBe(null);

    const listener = jest.fn();

    expect(() => {
      GameSocket.onAnyNamespaced('test-ns', listener);
    }).toThrow();
  });

  it('adds an event listener', () => {
    expect(GameSocket.socket).toBe(null);

    const listener = jest.fn();

    expect(GameSocket.initializeSocket(onConnectionError, resetAttempts)).toBe(mockSocket);
    GameSocket.onNamespaced('test-ns', 'test_event', listener);

    expect(GameSocket.socket).toBe(mockSocket);
    expect(mockSocket.on).toHaveBeenCalledWith('test_event', listener);
    expect(GameSocket['listeners']).toHaveProperty('test-ns.test_event');
    expect(GameSocket['listeners']['test-ns']['test_event']).toContain(listener);
  });

  it('adds an event listener, throwing an error if the socket is uninitialized', () => {
    expect(GameSocket.socket).toBe(null);

    const listener = jest.fn();

    expect(() => {
      GameSocket.onNamespaced('test-ns', 'test_event', listener);
    }).toThrow();
  });

  it('registers multiple event listeners', () => {
    const anyListener1 = jest.fn();
    const anyListener2 = jest.fn();
    const anyListener3 = jest.fn();

    const listener1 = jest.fn();
    const listener2 = jest.fn();
    const listener3 = jest.fn();
    const listener4 = jest.fn();

    GameSocket.initializeSocket(onConnectionError, resetAttempts);

    GameSocket.onAnyNamespaced('test-ns', anyListener1);
    GameSocket.onAnyNamespaced('test-ns', anyListener2);
    GameSocket.onNamespaced('test-ns', 'test_event', listener1);
    GameSocket.onNamespaced('test-ns', 'test_event', listener2);
    GameSocket.onNamespaced('test-ns', 'test_event2', listener3);
    GameSocket.onAnyNamespaced('test-ns2', anyListener3);
    GameSocket.onNamespaced('test-ns2', 'test_event', listener4);

    expect(mockSocket.onAny).toHaveBeenCalledWith(anyListener1);
    expect(mockSocket.onAny).toHaveBeenCalledWith(anyListener2);
    expect(mockSocket.onAny).toHaveBeenCalledWith(anyListener3);
    expect(mockSocket.on).toHaveBeenCalledWith('test_event', listener1);
    expect(mockSocket.on).toHaveBeenCalledWith('test_event', listener2);
    expect(mockSocket.on).toHaveBeenCalledWith('test_event2', listener3);
    expect(mockSocket.on).toHaveBeenCalledWith('test_event', listener4);

    expect(GameSocket['anyListeners']).toHaveProperty('test-ns');
    expect(GameSocket['anyListeners']['test-ns']).toContain(anyListener1);
    expect(GameSocket['anyListeners']['test-ns']).toContain(anyListener2);
    expect(GameSocket['listeners']).toHaveProperty('test-ns.test_event');
    expect(GameSocket['listeners']['test-ns']['test_event']).toContain(listener1);
    expect(GameSocket['listeners']['test-ns']['test_event']).toContain(listener2);
    expect(GameSocket['listeners']).toHaveProperty('test-ns.test_event2');
    expect(GameSocket['listeners']['test-ns']['test_event2']).toContain(listener3);

    expect(GameSocket['anyListeners']).toHaveProperty('test-ns2');
    expect(GameSocket['anyListeners']['test-ns2']).toContain(anyListener3);
    expect(GameSocket['listeners']).toHaveProperty('test-ns2.test_event');
    expect(GameSocket['listeners']['test-ns2']['test_event']).toContain(listener4);
  });

  describe('removing event listeners', () => {
    const anyListener1 = jest.fn();
    const anyListener2 = jest.fn();
    const anyListener3 = jest.fn();

    const listener1 = jest.fn();
    const listener2 = jest.fn();
    const listener3 = jest.fn();
    const listener4 = jest.fn();

    beforeEach(() => {
      GameSocket.initializeSocket(onConnectionError, resetAttempts);

      GameSocket.onAnyNamespaced('test-ns', anyListener1);
      GameSocket.onAnyNamespaced('test-ns', anyListener2);
      GameSocket.onNamespaced('test-ns', 'test_event', listener1);
      GameSocket.onNamespaced('test-ns', 'test_event', listener2);
      GameSocket.onNamespaced('test-ns', 'test_event2', listener3);

      GameSocket.onAnyNamespaced('test-ns2', anyListener3);
      GameSocket.onNamespaced('test-ns2', 'test_event', listener4);

      jest.clearAllMocks();
    });

    it('removes a catch-all listener', () => {
      GameSocket.offAnyNamespaced('test-ns', anyListener1);

      expect(mockSocket.offAny).toBeCalledTimes(1);
      expect(mockSocket.offAny).toHaveBeenCalledWith(anyListener1);
      expect(GameSocket['anyListeners']).toHaveProperty('test-ns');
      expect(GameSocket['anyListeners']['test-ns']).not.toContain(anyListener1);
      expect(GameSocket['anyListeners']['test-ns']).toContain(anyListener2);

      expect(GameSocket['anyListeners']).toHaveProperty('test-ns2');
      expect(GameSocket['anyListeners']['test-ns2']).toContain(anyListener3);
    });

    it('removes all catch-all listeners for a namespace', () => {
      GameSocket.offAnyNamespaced('test-ns');

      expect(mockSocket.offAny).toBeCalledTimes(2);
      expect(mockSocket.offAny).toHaveBeenCalledWith(anyListener1);
      expect(mockSocket.offAny).toHaveBeenCalledWith(anyListener2);
      expect(GameSocket['anyListeners']).not.toHaveProperty('test-ns');

      expect(GameSocket['anyListeners']).toHaveProperty('test-ns2');
      expect(GameSocket['anyListeners']['test-ns2']).toContain(anyListener3);
    });

    it('removes all catch-all listeners for a namespace (individual removals)', () => {
      GameSocket.offAnyNamespaced('test-ns', anyListener1);
      GameSocket.offAnyNamespaced('test-ns', anyListener2);

      expect(mockSocket.offAny).toBeCalledTimes(2);
      expect(mockSocket.offAny).toHaveBeenCalledWith(anyListener1);
      expect(mockSocket.offAny).toHaveBeenCalledWith(anyListener2);
      expect(GameSocket['anyListeners']).not.toHaveProperty('test-ns');

      expect(GameSocket['anyListeners']).toHaveProperty('test-ns2');
      expect(GameSocket['anyListeners']['test-ns2']).toContain(anyListener3);
    });

    it('removes an event listener', () => {
      GameSocket.offNamespaced('test-ns', 'test_event', listener2);

      expect(mockSocket.off).toBeCalledTimes(1);
      expect(mockSocket.off).toHaveBeenCalledWith('test_event', listener2);
      expect(GameSocket['listeners']).toHaveProperty('test-ns.test_event');
      expect(GameSocket['listeners']['test-ns']['test_event']).toContain(listener1);
      expect(GameSocket['listeners']['test-ns']['test_event']).not.toContain(listener2);
      expect(GameSocket['listeners']).toHaveProperty('test-ns.test_event2');
      expect(GameSocket['listeners']['test-ns']['test_event2']).toContain(listener3);

      expect(GameSocket['listeners']).toHaveProperty('test-ns2.test_event');
      expect(GameSocket['listeners']['test-ns2']['test_event']).toContain(listener4);
    });

    it('removes all event listeners for a namespace and event', () => {
      GameSocket.offNamespaced('test-ns', 'test_event');

      expect(mockSocket.off).toBeCalledTimes(2);
      expect(mockSocket.off).toHaveBeenCalledWith('test_event', listener1);
      expect(mockSocket.off).toHaveBeenCalledWith('test_event', listener2);
      expect(GameSocket['listeners']).not.toHaveProperty('test-ns.test_event');
      expect(GameSocket['listeners']).toHaveProperty('test-ns.test_event2');
      expect(GameSocket['listeners']['test-ns']['test_event2']).toContain(listener3);

      expect(GameSocket['listeners']).toHaveProperty('test-ns2.test_event');
      expect(GameSocket['listeners']['test-ns2']['test_event']).toContain(listener4);
    });

    it('removes all event listeners for a namespace and event (individual removals)', () => {
      GameSocket.offNamespaced('test-ns', 'test_event', listener1);
      GameSocket.offNamespaced('test-ns', 'test_event', listener2);

      expect(mockSocket.off).toBeCalledTimes(2);
      expect(mockSocket.off).toHaveBeenCalledWith('test_event', listener1);
      expect(mockSocket.off).toHaveBeenCalledWith('test_event', listener2);
      expect(GameSocket['listeners']).not.toHaveProperty('test-ns.test_event');
      expect(GameSocket['listeners']).toHaveProperty('test-ns.test_event2');
      expect(GameSocket['listeners']['test-ns']['test_event2']).toContain(listener3);

      expect(GameSocket['listeners']).toHaveProperty('test-ns2.test_event');
      expect(GameSocket['listeners']['test-ns2']['test_event']).toContain(listener4);
    });

    it('removes all event listeners for a namespace', () => {
      GameSocket.offNamespaced('test-ns');

      expect(mockSocket.off).toBeCalledTimes(3);
      expect(mockSocket.off).toHaveBeenCalledWith('test_event', listener1);
      expect(mockSocket.off).toHaveBeenCalledWith('test_event', listener2);
      expect(mockSocket.off).toHaveBeenCalledWith('test_event2', listener3);
      expect(GameSocket['listeners']).not.toHaveProperty('test-ns');

      expect(GameSocket['listeners']).toHaveProperty('test-ns2.test_event');
      expect(GameSocket['listeners']['test-ns2']['test_event']).toContain(listener4);
    });

    it('removes all event listeners for a namespace (bulk removals by event)', () => {
      GameSocket.offNamespaced('test-ns', 'test_event');
      GameSocket.offNamespaced('test-ns', 'test_event2');

      expect(mockSocket.off).toBeCalledTimes(3);
      expect(mockSocket.off).toHaveBeenCalledWith('test_event', listener1);
      expect(mockSocket.off).toHaveBeenCalledWith('test_event', listener2);
      expect(mockSocket.off).toHaveBeenCalledWith('test_event2', listener3);
      expect(GameSocket['listeners']).not.toHaveProperty('test-ns');

      expect(GameSocket['listeners']).toHaveProperty('test-ns2.test_event');
      expect(GameSocket['listeners']['test-ns2']['test_event']).toContain(listener4);
    });

    it('removes all event listeners for a namespace (individual removals by event and listener)', () => {
      GameSocket.offNamespaced('test-ns', 'test_event', listener1);
      GameSocket.offNamespaced('test-ns', 'test_event', listener2);
      GameSocket.offNamespaced('test-ns', 'test_event2', listener3);

      expect(mockSocket.off).toBeCalledTimes(3);
      expect(mockSocket.off).toHaveBeenCalledWith('test_event', listener1);
      expect(mockSocket.off).toHaveBeenCalledWith('test_event', listener2);
      expect(mockSocket.off).toHaveBeenCalledWith('test_event2', listener3);
      expect(GameSocket['listeners']).not.toHaveProperty('test-ns');

      expect(GameSocket['listeners']).toHaveProperty('test-ns2.test_event');
      expect(GameSocket['listeners']['test-ns2']['test_event']).toContain(listener4);
    });
  });

  describe('attach', () => {
    beforeEach(() => {
      GameSocket.initializeSocket(onConnectionError, resetAttempts);

      jest.clearAllMocks();
    });

    it('attaches, connecting the socket if not already connected', () => {
      GameSocket.attach();
      expect(mockSocket.connect).toBeCalledTimes(1);
    });

    it('attaches to a connected socket', () => {
      GameSocket['connect']();
      jest.clearAllMocks();

      GameSocket.attach();
      expect(mockSocket.connect).toBeCalledTimes(0);
    });
  });

  describe('detach', () => {
    const anyListener1 = jest.fn();
    const anyListener2 = jest.fn();
    const anyListener3 = jest.fn();

    const listener1 = jest.fn();
    const listener2 = jest.fn();
    const listener3 = jest.fn();
    const listener4 = jest.fn();

    beforeEach(() => {
      GameSocket.initializeSocket(onConnectionError, resetAttempts);
      GameSocket['connect']();

      jest.clearAllMocks();
    });

    it('detaches and disconnects from a socket with no listeners', () => {
      GameSocket.detach('test-ns');

      expect(GameSocket['anyListeners']).toEqual({});
      expect(GameSocket['listeners']).toEqual({});

      expect(mockSocket.disconnect).toBeCalledTimes(1);
    });

    it('detaches from a socket with listeners from other namespaces', () => {
      GameSocket.onAnyNamespaced('test-ns2', anyListener3);
      GameSocket.onNamespaced('test-ns2', 'test_event', listener4);

      jest.clearAllMocks();

      GameSocket.detach('test-ns');

      expect(GameSocket['anyListeners']).toHaveProperty('test-ns2');
      expect(GameSocket['anyListeners']['test-ns2']).toContain(anyListener3);
      expect(GameSocket['listeners']).toHaveProperty('test-ns2.test_event');
      expect(GameSocket['listeners']['test-ns2']['test_event']).toContain(listener4);

      expect(mockSocket.disconnect).toBeCalledTimes(0);
    });

    it('detaches and removes listeners from a socket with listeners from the detaching namespace and other namespaces', () => {
      GameSocket.onAnyNamespaced('test-ns', anyListener1);
      GameSocket.onAnyNamespaced('test-ns', anyListener2);
      GameSocket.onNamespaced('test-ns', 'test_event', listener1);
      GameSocket.onNamespaced('test-ns', 'test_event', listener2);
      GameSocket.onNamespaced('test-ns', 'test_event2', listener3);

      GameSocket.onAnyNamespaced('test-ns2', anyListener3);
      GameSocket.onNamespaced('test-ns2', 'test_event', listener4);

      jest.clearAllMocks();

      GameSocket.detach('test-ns');

      expect(GameSocket['anyListeners']).not.toHaveProperty('test-ns');
      expect(GameSocket['listeners']).not.toHaveProperty('test-ns');

      expect(GameSocket['anyListeners']).toHaveProperty('test-ns2');
      expect(GameSocket['anyListeners']['test-ns2']).toContain(anyListener3);
      expect(GameSocket['listeners']).toHaveProperty('test-ns2.test_event');
      expect(GameSocket['listeners']['test-ns2']['test_event']).toContain(listener4);

      expect(mockSocket.disconnect).toBeCalledTimes(0);
    });

    it('detaches, removes listeners, and disconnects from a socket with only listeners from the detaching namespace', () => {
      GameSocket.onAnyNamespaced('test-ns', anyListener1);
      GameSocket.onAnyNamespaced('test-ns', anyListener2);
      GameSocket.onNamespaced('test-ns', 'test_event', listener1);
      GameSocket.onNamespaced('test-ns', 'test_event', listener2);
      GameSocket.onNamespaced('test-ns', 'test_event2', listener3);

      jest.clearAllMocks();

      GameSocket.detach('test-ns');

      expect(GameSocket['anyListeners']).toEqual({});
      expect(GameSocket['listeners']).toEqual({});

      expect(mockSocket.disconnect).toBeCalledTimes(1);
    });
  });
});

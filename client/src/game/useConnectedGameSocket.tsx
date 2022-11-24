import { useState } from 'react';

import { Socket } from 'socket.io-client';

import useMountEffect from '../utils/useMountEffect';

import GameSocket from './GameSocket';

const useConnectedGameSocket = (
  registerListenersHook?: (socketAndNamespace: { socket: Socket; namespace: string }) => void
): Socket | null => {
  const [socket, setSocket] = useState<Socket | null>(null);

  useMountEffect(() => {
    const { socket: s, namespace } = GameSocket.attach();
    setSocket(s);
    if (registerListenersHook) {
      registerListenersHook({ socket: s, namespace });
    }

    return () => {
      GameSocket.detach(namespace);
    };
  });

  return socket;
};

export default useConnectedGameSocket;

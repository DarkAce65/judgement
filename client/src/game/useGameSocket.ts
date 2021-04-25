import { useEffect, useState } from 'react';

import { Socket } from 'socket.io-client';

import GameSocket from './GameSocket';

type SocketAndNamespace = {
  socket: Socket | null;
  namespace: string | null;
};

const useGameSocket = (): SocketAndNamespace => {
  const [socketAndNamespace, setSocketAndNamespace] = useState<SocketAndNamespace>({
    socket: null,
    namespace: null,
  });

  useEffect(() => {
    const { socket, namespace } = GameSocket.attach();
    setSocketAndNamespace({ socket, namespace });

    return () => {
      GameSocket.detach(namespace);
    };
  }, []);

  return { ...socketAndNamespace };
};

export default useGameSocket;
